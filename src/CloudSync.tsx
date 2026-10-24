import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { createClient, type User } from '@supabase/supabase-js';
import { Cloud, RefreshCw, LogOut, Check, AlertCircle } from 'lucide-react';
import { freshProgress, mergeProgress, parseProgress, type Progress } from './engine';
import { publicCloudConfig, validPublicConfig } from './cloud-config';
import { supabaseTransport, synchronize } from './sync';

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
export default function CloudSync({
  progress,
  setProgress,
  visible,
}: {
  progress: Progress;
  setProgress: Dispatch<SetStateAction<Progress>>;
  visible: boolean;
}) {
  const [config, setConfig] = useState<{ url: string; key: string }>(readConfig);
  const [url, setUrl] = useState(config.url);
  const [key, setKey] = useState(config.key);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attach, setAttach] = useState(true);
  const [status, setStatus] = useState('Místní režim');
  const [error, setError] = useState('');
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
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
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
  useEffect(() => {
    if (!client) return;
    client.auth.startAutoRefresh();
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      const incoming = session?.user ?? null;
      if (incoming?.id === active.current) {
        setUser(incoming);
        return;
      }
      const oldId = active.current;
      if (oldId) save(`lehce.account.${oldId}`, latest.current);
      active.current = incoming?.id ?? null;
      if (incoming) {
        const stored = cached(`lehce.account.${incoming.id}`);
        const next = attaching.current
          ? mergeProgress(latest.current, stored ?? freshProgress())
          : (stored ?? freshProgress());
        attaching.current = false;
        setProgress(next);
        latest.current = next;
        setStatus('Připraveno k synchronizaci');
      } else if (oldId) {
        const guest = cached('lehce.guest.progress') ?? freshProgress();
        setProgress(guest);
        latest.current = guest;
        setStatus('Místní režim');
      }
      setUser(incoming);
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
    if (!client) return;
    setBusy(true);
    setError('');
    attaching.current = attach;
    save('lehce.guest.progress', latest.current);
    try {
      const result =
        kind === 'login'
          ? await client.auth.signInWithPassword({ email, password })
          : await client.auth.signUp({ email, password });
      if (result.error) throw result.error;
      setPassword('');
      if (!result.data.session) {
        attaching.current = false;
        setStatus('Potvrďte registrační e-mail a potom se přihlaste.');
      }
    } catch (e) {
      attaching.current = false;
      setError(e instanceof Error ? e.message : 'Přihlášení se nepodařilo.');
    } finally {
      setBusy(false);
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
      {error && (
        <p className="warning" role="alert">
          {error} Vaše místní výsledky zůstaly uložené.
        </p>
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
      ) : (
        <form
          className="cloud-form"
          onSubmit={(e) => {
            e.preventDefault();
            void auth('login');
          }}
        >
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <label className="cloud-attach">
            <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
            Přenést aktuální místní pokrok do tohoto účtu
          </label>
          <div className="cloud-buttons">
            <button className="primary-button" disabled={busy}>
              Přihlásit a synchronizovat
            </button>
            <button
              type="button"
              className="quiet-button"
              disabled={busy || !email || password.length < 8}
              onClick={() => void auth('signup')}
            >
              Vytvořit účet
            </button>
          </div>
          <p>
            Heslo se odesílá přes HTTPS přímo do vašeho Supabase projektu. V kódu ani v záloze
            pokroku ho neukládáme.
          </p>
        </form>
      )}
    </section>
  );
}
