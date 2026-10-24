import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { createClient, type User } from '@supabase/supabase-js';
import { Cloud, RefreshCw, LogOut, Check, AlertCircle } from 'lucide-react';
import { freshProgress, mergeProgress, parseProgress, type Progress } from './engine';
import { publicCloudConfig, validPublicConfig } from './cloud-config';
import { supabaseTransport, synchronize } from './sync';
import { authReturnUrl, authLinkError, authFailure } from './auth';

const CONFIG_KEY = 'lehce.cloud.config';
function readConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null') || publicCloudConfig;
  } catch {
    return publicCloudConfig;
  }
}
function cached(key: string) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? parseProgress(raw) : null;
  } catch {
    return null;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* The root app reports persistence failures. */
  }
}
function pendingSignup(): { email?: string; attach?: boolean } {
  try {
    return JSON.parse(localStorage.getItem('lehce.pendingSignup') || '{}');
  } catch {
    return {};
  }
}
export default function CloudSync({
  progress,
  setProgress,
  visible,
  onAccountChange,
}: {
  progress: Progress;
  setProgress: Dispatch<SetStateAction<Progress>>;
  visible: boolean;
  onAccountChange: (email: string | null) => void;
}) {
  const [config, setConfig] = useState<{ url: string; key: string }>(readConfig);
  const [url, setUrl] = useState(config.url);
  const [key, setKey] = useState(config.key);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attach, setAttach] = useState(true);
  const [status, setStatus] = useState('Místní režim');
  const [error, setError] = useState(() => authLinkError(window.location.href));
  const [authNotice, setAuthNotice] = useState('');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(() =>
    authLinkError(window.location.href) ? '' : null,
  );
  const [mailSentAt, setMailSentAt] = useState<number | null>(null);
  const [mailWait, setMailWait] = useState(0);
  const [authDiagnostic, setAuthDiagnostic] = useState('');
  const mailBusy = useRef(false);
  const [busy, setBusy] = useState(false);
  const latest = useRef(progress);
  latest.current = progress;
  const active = useRef<string | null>(null);
  const attaching = useRef(false);
  const running = useRef(false);
  const resync = useRef(false);
  const synchronizeRef = useRef<() => Promise<void>>(async () => {});
  const client = useMemo(() => {
    try {
      return validPublicConfig(config.url, config.key)
        ? createClient(config.url, config.key, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
            global: {
              fetch: (input, init) =>
                fetch(input, {
                  ...init,
                  signal: init?.signal
                    ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
                    : AbortSignal.timeout(15000),
                }),
            },
          })
        : null;
    } catch {
      return null;
    }
  }, [config.url, config.key]);
  useEffect(() => onAccountChange(user?.email ?? null), [user?.email, onAccountChange]);
  useEffect(() => {
    if (mailSentAt === null) {
      setMailWait(0);
      return;
    }
    const update = () =>
      setMailWait(Math.max(0, Math.ceil((mailSentAt + 60000 - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [mailSentAt]);
  useEffect(() => {
    if (!client) return;
    client.auth.startAutoRefresh();
    const { data } = client.auth.onAuthStateChange((event, session) => {
      const incoming = session?.user ?? null;
      if (incoming?.id === active.current) {
        setUser(incoming);
        return;
      }
      const oldId = active.current;
      if (oldId) save(`lehce.account.${oldId}`, latest.current);
      active.current = incoming?.id ?? null;
      if (incoming) {
        const pending = pendingSignup();
        const ownSignup = pending.email === incoming.email?.toLowerCase();
        const stored = cached(`lehce.account.${incoming.id}`);
        const next =
          attaching.current || (ownSignup && pending.attach)
            ? mergeProgress(latest.current, stored ?? freshProgress())
            : (stored ?? freshProgress());
        if (ownSignup) save('lehce.pendingSignup', {});
        attaching.current = false;
        setProgress(next);
        latest.current = next;
        setStatus('Připraveno k synchronizaci');
        setConfirmationEmail(null);
        setMailSentAt(null);
        if (event === 'SIGNED_IN') setAuthNotice('Jste přihlášeni. Váš pokrok se synchronizuje.');
      } else if (oldId) {
        const guest = cached('lehce.guest.progress') ?? freshProgress();
        setProgress(guest);
        latest.current = guest;
        setStatus('Místní režim');
        setAuthNotice('');
      }
      setUser(incoming);
    });
    // Surface callback failures that would otherwise only appear in the console.
    void client.auth.getSession().then(({ error: sessionError }) => {
      if (sessionError)
        setError(
          'Přihlášení z odkazu se nepodařilo. Zkuste e-mail a heslo nebo nový potvrzovací odkaz.',
        );
    });
    return () => {
      data.subscription.unsubscribe();
      client.auth.stopAutoRefresh();
    };
  }, [client, setProgress]);
  async function sync() {
    if (!client || !user || active.current !== user.id) return;
    if (running.current) {
      resync.current = true;
      return;
    }
    running.current = true;
    setBusy(true);
    setError('');
    setStatus('Synchronizuji…');
    const id = user.id;
    try {
      const merged = await synchronize(latest.current, supabaseTransport(client, id));
      if (active.current !== id) return;
      setProgress((p) => {
        const next = mergeProgress(p, merged);
        return JSON.stringify(p) === JSON.stringify(next) ? p : next;
      });
      setStatus(
        `Synchronizováno v ${new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}`,
      );
    } catch (e) {
      if (active.current === id) {
        setError(e instanceof Error ? e.message : 'Synchronizace selhala.');
        setStatus('Místní pokrok čeká na odeslání');
      }
    } finally {
      running.current = false;
      setBusy(false);
      if (resync.current) {
        resync.current = false;
        window.setTimeout(() => void synchronizeRef.current(), 200);
      }
    }
  }
  synchronizeRef.current = sync;
  useEffect(() => {
    if (!user) return;
    save(`lehce.account.${user.id}`, progress);
    const timer = window.setTimeout(() => void synchronizeRef.current(), 800);
    return () => window.clearTimeout(timer);
  }, [progress, user?.id]);
  useEffect(() => {
    if (!user) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) void synchronizeRef.current();
    }, 20000);
    const refresh = () => {
      if (!document.hidden) void synchronizeRef.current();
    };
    window.addEventListener('online', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('online', refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [user?.id]);
  async function auth(kind: 'login' | 'signup') {
    if (!client || mailBusy.current) return;
    mailBusy.current = true;
    setBusy(true);
    setError('');
    setAuthNotice('');
    setAuthDiagnostic('');
    attaching.current = attach;
    save('lehce.guest.progress', latest.current);
    try {
      if (kind === 'signup')
        save('lehce.pendingSignup', { email: email.trim().toLowerCase(), attach });
      const result =
        kind === 'login'
          ? await client.auth.signInWithPassword({ email, password })
          : await client.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: authReturnUrl(window.location.href) },
            });
      if (result.error) throw result.error;
      setPassword('');
      if (!result.data.session && kind === 'signup') {
        attaching.current = false;
        if (!result.data.user) throw new Error('Invalid signup response');
        if (result.data.user.identities?.length === 0) {
          save('lehce.pendingSignup', {});
          setAuthView('login');
          setAuthNotice(
            'Pro tento e-mail už může existovat účet. Zkuste se přihlásit svým heslem; opakovaná registrace nemusí poslat další e-mail.',
          );
        } else {
          setConfirmationEmail(email.trim().toLowerCase());
          setMailSentAt(Date.now());
          setAuthNotice(
            'Požadavek na ověřovací e-mail byl přijat. Zkontrolujte doručenou poštu i spam. Doručení zprávy aplikace neumí ověřit.',
          );
        }
      }
    } catch (e) {
      attaching.current = false;
      if (kind === 'signup') save('lehce.pendingSignup', {});
      const failure = authFailure(e);
      setError(failure.message);
      setAuthDiagnostic(
        [failure.code, failure.status ? `HTTP ${failure.status}` : ''].filter(Boolean).join(' · '),
      );
      if (failure.code === 'email_not_confirmed') setConfirmationEmail(email.trim().toLowerCase());
    } finally {
      setBusy(false);
      mailBusy.current = false;
    }
  }
  async function resendConfirmation() {
    if (!client || !confirmationEmail?.trim() || mailBusy.current || mailWait > 0) return;
    mailBusy.current = true;
    setBusy(true);
    setError('');
    setAuthNotice('');
    setAuthDiagnostic('');
    try {
      const { error: resendError } = await client.auth.resend({
        type: 'signup',
        email: confirmationEmail.trim().toLowerCase(),
        options: { emailRedirectTo: authReturnUrl(window.location.href) },
      });
      if (resendError) throw resendError;
      setAuthNotice(
        'Požadavek na nový ověřovací e-mail byl přijat. Pokud účet čeká na potvrzení, zkontrolujte poštu i spam a použijte nejnovější zprávu. Již potvrzený účet další ověřovací zprávu nedostane.',
      );
      setMailSentAt(Date.now());
    } catch (e) {
      const failure = authFailure(e);
      setError(failure.message);
      setAuthDiagnostic(
        [failure.code, failure.status ? `HTTP ${failure.status}` : ''].filter(Boolean).join(' · '),
      );
      if (failure.status === 429 || failure.code.startsWith('over_')) setMailSentAt(Date.now());
    } finally {
      setBusy(false);
      mailBusy.current = false;
    }
  }
  if (!visible) return null;
  return (
    <section className="settings-card cloud-card">
      <div className="cloud-title">
        <Cloud size={25} />
        <div>
          <h2>Stejná zahrada. Na každém zařízení.</h2>
          <p>
            Přihlaste se ke stejnému účtu. Pokusy se bezpečně slučují, i když trénujete na dvou
            zařízeních současně.
          </p>
        </div>
      </div>
      <p className={`cloud-status ${error ? 'cloud-error' : ''}`} role="status">
        {error ? <AlertCircle size={16} /> : <Check size={16} />}
        {status}
      </p>
      {authNotice && (
        <p className="auth-notice" role="status">
          {authNotice}
        </p>
      )}
      {error && (
        <p className="warning" role="alert">
          {error} Vaše místní výsledky zůstaly uložené.
        </p>
      )}
      {error && authDiagnostic && (
        <details className="auth-diagnostic">
          <summary>Podrobnosti pro správce</summary>
          <code>{authDiagnostic}</code>
        </details>
      )}
      {!client ? (
        <form
          className="cloud-form"
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            if (!validPublicConfig(url.trim(), key.trim())) {
              setError(
                'Použijte HTTPS adresu projektu Supabase a veřejný publishable/anon klíč, nikoliv secret nebo service_role.',
              );
              return;
            }
            const next = { url: url.trim().replace(/\/$/, ''), key: key.trim() };
            save(CONFIG_KEY, next);
            setConfig(next);
          }}
        >
          <p>
            Jednou připojte svůj projekt Supabase a spusťte v něm přiložený soubor{' '}
            <code>supabase/schema.sql</code>. Veřejné údaje projektu pak zadejte na každém zařízení,
            nebo je nastavte pro celý web při sestavení.
          </p>
          <label className="field-label">
            Supabase Project URL
            <input
              type="url"
              required
              value={url}
              placeholder="https://vas-projekt.supabase.co"
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <label className="field-label">
            Veřejný Publishable / anon klíč
            <input
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="off"
            />
          </label>
          <button className="primary-button">Připojit projekt</button>
        </form>
      ) : user ? (
        <div className="cloud-account">
          <span>
            Přihlášeno: <strong>{user.email}</strong>
          </span>
          <div>
            <button className="quiet-button" disabled={busy} onClick={() => void sync()}>
              <RefreshCw size={16} />
              Synchronizovat teď
            </button>
            <button
              className="quiet-button"
              disabled={busy}
              onClick={async () => {
                const result = await client.auth.signOut({ scope: 'local' });
                if (result.error) setError(result.error.message);
              }}
            >
              <LogOut size={16} />
              Odhlásit toto zařízení
            </button>
          </div>
          <p>
            Synchronizace probíhá po cvičení, po návratu k oknu a každých 20 sekund. Bez internetu
            můžete pokračovat; výsledky odešleme po obnovení spojení. Nastavení klávesnice zůstává
            pro každé zařízení vlastní.
          </p>
          <p>
            Pro smazání dat účtu kontaktujte správce projektu; místní tlačítko Smazat pokrok nemaže
            cloudovou historii.
          </p>
        </div>
      ) : confirmationEmail !== null ? (
        <form
          className="cloud-form confirmation-form"
          onSubmit={(e) => {
            e.preventDefault();
            void resendConfirmation();
          }}
        >
          <h3>{mailSentAt === null ? 'Potvrzení e-mailu' : 'Teď zkontrolujte e-mail'}</h3>
          <p>
            Ověřovací odkaz vás vrátí sem a přihlásí. Účet, který už je potvrzený, můžete rovnou
            použít k přihlášení.
          </p>
          <label className="field-label">
            E-mail
            <input
              type="email"
              required
              value={confirmationEmail}
              onChange={(e) => {
                setConfirmationEmail(e.target.value);
                setMailSentAt(null);
              }}
              autoComplete="email"
            />
          </label>
          <button className="primary-button" disabled={busy || mailWait > 0}>
            {busy
              ? 'Odesílám…'
              : mailSentAt === null
                ? 'Poslat ověřovací e-mail'
                : 'Nic mi nepřišlo, poslat ještě jednou'}
          </button>
          {mailWait > 0 && (
            <p className="mail-wait" role="status">
              Znovu můžete požádat za {mailWait} s.
            </p>
          )}
          <button
            className="auth-switch text-button"
            type="button"
            onClick={() => {
              setEmail(confirmationEmail);
              setConfirmationEmail(null);
              setAuthView('login');
              setAuthNotice('');
              setError('');
            }}
          >
            Zpět na přihlášení
          </button>
        </form>
      ) : (
        <form
          className="cloud-form"
          onSubmit={(e) => {
            e.preventDefault();
            void auth(authView);
          }}
        >
          <h3>{authView === 'signup' ? 'Vytvořit účet' : 'Přihlásit se'}</h3>
          <label className="field-label">
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="field-label">
            Heslo
            <input
              type="password"
              required
              minLength={authView === 'signup' ? 8 : 6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={authView === 'signup' ? 'new-password' : 'current-password'}
            />
          </label>
          {authView === 'signup' && <small>Heslo musí mít alespoň 8 znaků.</small>}
          <label className="cloud-attach">
            <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
            Přenést aktuální místní pokrok do tohoto účtu
          </label>
          <div className="cloud-buttons">
            <button className="primary-button" disabled={busy}>
              {busy
                ? 'Chvilku prosím…'
                : authView === 'signup'
                  ? 'Vytvořit účet'
                  : 'Přihlásit a synchronizovat'}
            </button>
          </div>
          <button
            className="text-button auth-switch"
            type="button"
            disabled={busy}
            onClick={() => {
              setAuthView(authView === 'login' ? 'signup' : 'login');
              setAuthNotice('');
              setError('');
              setAuthDiagnostic('');
            }}
          >
            {authView === 'login'
              ? 'Ještě nemám účet → Vytvořit účet'
              : 'Už mám účet → Přihlásit se'}
          </button>
          <p>Po přihlášení budete mít dokončené lekce i výsledky na všech svých zařízeních.</p>
        </form>
      )}
    </section>
  );
}
