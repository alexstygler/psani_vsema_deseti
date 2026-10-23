import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Coffee,
  Command,
  Flower2,
  Focus,
  GraduationCap,
  Keyboard,
  Leaf,
  LineChart,
  Menu,
  Monitor,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  defaults,
  fingerNames,
  freshProgress,
  keyInfo,
  lessons,
  makeText,
  metrics,
  parseProgress,
  recordKey,
  rows,
  STORAGE_KEY,
  weakestKeys,
  type KeyStat,
  type Mode,
  type Progress,
  type Session,
  type Settings,
} from './engine';

type Page = 'practice' | 'lessons' | 'progress' | 'settings';
const modeNames: Record<Mode, string> = {
  adaptive: 'Na míru',
  beginner: 'Základy',
  text: 'Běžný text',
  academic: 'Akademické texty',
  symbols: 'Čísla a znaky',
  custom: 'Vlastní text',
};
function load() {
  try {
    return parseProgress(localStorage.getItem(STORAGE_KEY));
  } catch {
    return freshProgress();
  }
}
function durationLabel(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(load);
  const [page, setPage] = useState<Page>('practice');
  const [mode, setMode] = useState<Mode>(() =>
    progress.settings.level === 'beginner' ? 'beginner' : 'adaptive',
  );
  const [lesson, setLesson] = useState(0);
  const [seed, setSeed] = useState(0);
  const [modal, setModal] = useState<'intro' | 'help' | 'custom' | 'reset' | null>(null);
  const [custom, setCustom] = useState('');
  const [customDraft, setCustomDraft] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [progress]);
  useEffect(() => {
    document.documentElement.dataset.motion = progress.settings.reducedMotion ? 'reduced' : 'full';
  }, [progress.settings.reducedMotion]);
  function settings(patch: Partial<Settings>) {
    setProgress((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  }
  function navigate(p: Page) {
    setPage(p);
    setMobileNav(false);
    window.scrollTo({ top: 0 });
  }
  function start(m: Mode, l = 0) {
    setMode(m);
    setLesson(l);
    setSeed((v) => v + 1);
    navigate('practice');
  }
  function saveSession(session: Session, keys: Record<string, KeyStat>, complete: boolean) {
    setProgress((p) => {
      const combined = { ...p.keys };
      for (const [key, stat] of Object.entries(keys)) {
        const previous = combined[key] ?? { attempts: 0, errors: 0, ms: 0, samples: 0 };
        combined[key] = {
          attempts: previous.attempts + stat.attempts,
          errors: previous.errors + stat.errors,
          ms: previous.ms + stat.ms,
          samples: previous.samples + stat.samples,
        };
      }
      return {
        ...p,
        keys: combined,
        sessions: [...p.sessions, session].slice(-500),
        completed:
          complete && session.mode === 'beginner' && session.accuracy >= 95
            ? [...new Set([...p.completed, session.lesson])]
            : p.completed,
      };
    });
  }
  const last = progress.sessions.at(-1);
  const weak = weakestKeys(progress.keys).filter((k) => k.errors > 0);
  const nav = [
    { id: 'practice' as Page, label: 'Procvičování', icon: Keyboard },
    { id: 'lessons' as Page, label: 'Cesta od základů', icon: BookOpen },
    { id: 'progress' as Page, label: 'Můj pokrok', icon: LineChart },
  ];
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('practice');
          }}
          aria-label="Lehce, úvod"
        >
          <span className="brand-icon">
            <Leaf size={22} strokeWidth={1.7} />
          </span>
          lehce<span className="brand-dot">.</span>
        </a>
        <div className="brand-caption">PSANÍ, KTERÉ PLYNE</div>
        <nav aria-label="Hlavní navigace">
          {nav.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? 'selected' : ''}`}
              onClick={() => navigate(n.id)}
              aria-current={page === n.id ? 'page' : undefined}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {page === n.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <div className="little-sun">
            <Flower2 size={26} strokeWidth={1.4} />
          </div>
          <p>Každý svým tempem.</p>
          <span>
            Žádné série. Žádné výčitky.
            <br />
            Jen vy a o trochu lehčí psaní.
          </span>
        </div>
        <div className="sidebar-bottom">
          <button
            className={`nav-item ${page === 'settings' ? 'selected' : ''}`}
            onClick={() => navigate('settings')}
          >
            <Settings2 size={18} />
            Nastavení
          </button>
          <button className="nav-item" onClick={() => setModal('help')}>
            <CircleHelp size={18} />
            Jak to funguje
          </button>
          <div className="local-note">
            <span className="status-dot" />
            Váš pokrok zůstává u vás
          </div>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="nav-backdrop"
          onClick={() => setMobileNav(false)}
          aria-label="Zavřít navigaci"
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Otevřít navigaci"
              onClick={() => setMobileNav((v) => !v)}
            >
              <Menu size={20} />
            </button>
            <span>Váš prostor pro soustředění</span>
          </div>
          <div className="topbar-right">
            <span className="layout-pill">
              <span className="status-dot" />
              Čeština · QWERTZ
            </span>
            <button
              className="avatar"
              aria-label="Otevřít nastavení profilu"
              onClick={() => navigate('settings')}
            >
              VY
            </button>
          </div>
        </header>
        <main>
          {storageError && (
            <p className="warning" role="alert">
              Prohlížeč nedovoluje uložit pokrok. Než odejdete, stáhněte si jej v Nastavení.
            </p>
          )}
          {page === 'practice' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    <span />
                    MALÝ KROK, VELKÝ ROZDÍL
                  </div>
                  <h1>
                    Psaní může jít <em>lehce.</em>
                  </h1>
                  <p>Uvolněte ramena. Najděte svůj rytmus. O zbytek se postaráme.</p>
                </div>
                <button className="quiet-button" onClick={() => setModal('intro')}>
                  <SlidersHorizontal size={16} />
                  Přizpůsobit trénink
                </button>
              </div>
              {!progress.onboarded && (
                <div className="welcome-strip">
                  <span className="welcome-icon">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <strong>Jste tu poprvé? Začněme podle vás.</strong>
                    <span>Úplné základy, nebo přeučení starých návyků. Obojí má svou cestu.</span>
                  </div>
                  <button onClick={() => setModal('intro')}>
                    Vybrat svou cestu <ArrowRight size={16} />
                  </button>
                  <button
                    className="icon-button dismiss"
                    aria-label="Skrýt uvítání"
                    onClick={() => setProgress((p) => ({ ...p, onboarded: true }))}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="workspace-grid">
                <div className="practice-column">
                  <div className="mode-tabs" role="group" aria-label="Druh cvičení">
                    {(['adaptive', 'beginner', 'text', 'symbols'] as Mode[]).map((m) => (
                      <button
                        key={m}
                        className={mode === m ? 'active' : ''}
                        onClick={() => start(m)}
                      >
                        {m === 'adaptive' && <Sparkles size={15} />}
                        {modeNames[m]}
                      </button>
                    ))}
                    <div className="more-modes">
                      <label className="sr-only" htmlFor="more-mode">
                        Další druhy textů
                      </label>
                      <select
                        id="more-mode"
                        value={['academic', 'custom'].includes(mode) ? mode : ''}
                        onChange={(e) =>
                          e.target.value === 'custom'
                            ? setModal('custom')
                            : start(e.target.value as Mode)
                        }
                      >
                        <option value="" disabled>
                          Další texty
                        </option>
                        <option value="academic">Akademické texty</option>
                        <option value="custom">Vlastní text</option>
                      </select>
                      <ChevronDown size={13} />
                    </div>
                  </div>
                  <Practice
                    key={`${mode}-${lesson}-${seed}-${progress.settings.duration}`}
                    mode={mode}
                    lesson={lesson}
                    seed={seed}
                    custom={custom}
                    progress={progress}
                    onFinish={saveSession}
                    onRestart={() => setSeed((v) => v + 1)}
                    onNext={() => start('beginner', Math.min(lessons.length - 1, lesson + 1))}
                    onSettings={settings}
                  />
                  <div className="under-practice">
                    <span>
                      <ShieldCheck size={15} />
                      Chyby jsou součást učení. Tady za ně nikdo netrestá.
                    </span>
                    <span>F + J = doma</span>
                  </div>
                  <section className="explore-section">
                    <div className="section-heading">
                      <h2>Kam vás to dnes táhne?</h2>
                      <span>Trochu jiný rytmus</span>
                    </div>
                    <div className="explore-grid">
                      <Explore
                        icon={<BookOpen />}
                        tag="OD PRVNÍHO HMATU"
                        title="Pevné základy"
                        description="Dejte každému prstu jeho místo."
                        color="peach"
                        onClick={() => navigate('lessons')}
                      />
                      <Explore
                        icon={<GraduationCap />}
                        tag="MYŠLENKY BEZ PŘEKÁŽEK"
                        title="Akademické texty"
                        description="Čeština, která se hodí do práce."
                        color="lavender"
                        onClick={() => start('academic')}
                      />
                      <Explore
                        icon={<Command />}
                        tag="VÍC NEŽ PÍSMENA"
                        title="Znaky pod kontrolou"
                        description="Čísla, závorky i vzorce do Excelu."
                        color="mint"
                        onClick={() => start('symbols')}
                      />
                    </div>
                  </section>
                </div>
                <aside className="right-column">
                  <section className="goal-card">
                    <div className="card-heading">
                      <span>VAŠE MALÉ VELKÉ CÍLE</span>
                      <Target size={18} />
                    </div>
                    <h2>
                      Od jistoty
                      <br />k lehkosti.
                    </h2>
                    <div className="goal-number">
                      {progress.settings.goal}
                      <span>znaků / min</span>
                    </div>
                    <div className="goal-track">
                      <span
                        style={{
                          width: `${Math.min(100, ((last?.cpm ?? 0) / progress.settings.goal) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="goal-track-label">
                      <span>{last ? `Naposledy ${last.cpm} CPM` : 'Váš příběh právě začíná'}</span>
                      <span>
                        {last
                          ? Math.min(100, Math.round((last.cpm / progress.settings.goal) * 100))
                          : 0}{' '}
                        %
                      </span>
                    </div>
                    <div className="goal-divider" />
                    <p>
                      <Leaf size={16} />
                      Nejdřív přesně. Rychlost přijde s jistotou.
                    </p>
                    <button onClick={() => navigate('progress')}>
                      Podívat se na můj pokrok <ArrowRight size={15} />
                    </button>
                    <span className="decor-leaf one" />
                    <span className="decor-leaf two" />
                  </section>
                  <section className="insight-card">
                    <div className="small-icon">
                      <Focus size={19} />
                    </div>
                    <h3>{weak.length ? 'Tady je prostor vyrůst' : 'Trénink, který vás pozná'}</h3>
                    <p>
                      {weak.length
                        ? 'Tyto klávesy vám zatím dávají zabrat. V režimu Na míru je potkáte častěji.'
                        : 'S každým cvičením zjistíme, které klávesy si zaslouží trochu víc pozornosti.'}
                    </p>
                    <div className="weak-keys">
                      {weak.length ? (
                        weak.slice(0, 4).map((k) => <span key={k.key}>{k.key}</span>)
                      ) : (
                        <>
                          <span>ě</span>
                          <span>š</span>
                          <span>ř</span>
                          <span className="key-ellipsis">…</span>
                        </>
                      )}
                    </div>
                    {!weak.length && <small>První doporučení po vašem cvičení</small>}
                  </section>
                  <div className="rest-note">
                    <Coffee size={21} strokeWidth={1.5} />
                    <p>
                      I minuta se počítá.
                      <br />
                      <span>A pauza taky.</span>
                    </p>
                  </div>
                </aside>
              </div>
            </>
          )}
          {page === 'lessons' && (
            <>
              <PageHeading
                eyebrow="KAŽDÝ PRST MÁ SVÉ MÍSTO"
                title="Začněte od základů."
                description="Malé lekce pro velkou změnu. Postupujte v klidu, nebo se vraťte tam, kde potřebujete."
              />
              <div className="lesson-intro">
                <span className="big-icon">
                  <Keyboard />
                </span>
                <div>
                  <h2>Vaše ruce už vědí, kde začít.</h2>
                  <p>
                    Levou ruku položte na A S D F, pravou na J K L Ů. Ukazováčky najdou výstupky na
                    F a J. Dívejte se na text, ne na ruce.
                  </p>
                </div>
                <span className="completion-pill">
                  {progress.completed.length} / {lessons.length} lekcí
                </span>
              </div>
              <div className="lesson-grid">
                {lessons.map((l, i) => (
                  <button
                    className={`lesson-card ${progress.completed.includes(i) ? 'complete' : ''}`}
                    key={l.title}
                    onClick={() => start('beginner', i)}
                  >
                    <div className="lesson-number">
                      {progress.completed.includes(i) ? (
                        <Check size={20} />
                      ) : (
                        String(i + 1).padStart(2, '0')
                      )}
                    </div>
                    <div>
                      <span>{l.subtitle}</span>
                      <h3>{l.title}</h3>
                      <p>{l.keys.split('').slice(0, 10).join(' ')}</p>
                    </div>
                    <ArrowRight size={18} />
                  </button>
                ))}
              </div>
              <p className="footnote">
                Všechny lekce jsou otevřené. Pro označení lekce jako zvládnuté opište celý text s
                přesností alespoň 95 %.
              </p>
            </>
          )}
          {page === 'progress' && (
            <ProgressPage progress={progress} onPractice={() => navigate('practice')} />
          )}
          {page === 'settings' && (
            <>
              <PageHeading
                eyebrow="PŘESNĚ PODLE VÁS"
                title="Váš rytmus. Vaše pravidla."
                description="Pár drobností, díky kterým se vám bude psát příjemněji."
              />
              <div className="settings-grid">
                <section className="settings-card">
                  <h2>Trénink</h2>
                  <label className="field-label">
                    Vaše výchozí úroveň
                    <select
                      value={progress.settings.level}
                      onChange={(e) => {
                        const level = e.target.value as Settings['level'];
                        settings({ level });
                        setMode(level === 'beginner' ? 'beginner' : 'adaptive');
                      }}
                    >
                      <option value="retrain">Už píšu, chci se přeučit</option>
                      <option value="beginner">Začínám úplně od začátku</option>
                    </select>
                  </label>
                  <label className="field-label">
                    Cílová rychlost
                    <span className="input-suffix">
                      <input
                        type="number"
                        min="100"
                        max="600"
                        step="10"
                        value={progress.settings.goal}
                        onChange={(e) =>
                          settings({
                            goal: Math.max(100, Math.min(600, Number(e.target.value) || 100)),
                          })
                        }
                      />
                      <span>znaků / min</span>
                    </span>
                  </label>
                  <label className="field-label">
                    Délka jednoho cvičení
                    <select
                      value={progress.settings.duration}
                      onChange={(e) => settings({ duration: Number(e.target.value) })}
                    >
                      <option value="60">1 minuta · malý krok</option>
                      <option value="120">2 minuty · příjemný rytmus</option>
                      <option value="300">5 minut · chvíle soustředění</option>
                    </select>
                  </label>
                </section>
                <section className="settings-card">
                  <h2>Klávesnice a pohodlí</h2>
                  <label className="field-label">
                    Právě píšu na
                    <select
                      value={progress.settings.device}
                      onChange={(e) => settings({ device: e.target.value as Settings['device'] })}
                    >
                      <option value="notebook">Notebooku</option>
                      <option value="keyboard">Samostatné klávesnici</option>
                    </select>
                  </label>
                  <label className="field-label">
                    Operační systém
                    <select
                      value={progress.settings.os}
                      onChange={(e) => settings({ os: e.target.value as Settings['os'] })}
                    >
                      <option value="windows">Windows / Linux</option>
                      <option value="mac">macOS</option>
                    </select>
                  </label>
                  <Toggle
                    checked={progress.settings.hints}
                    onChange={(v) => settings({ hints: v })}
                    label="Nápověda prstů a kláves"
                    description="Ukáže, kam sáhnout pro další znak."
                  />
                  <Toggle
                    checked={progress.settings.reducedMotion}
                    onChange={(v) => settings({ reducedMotion: v })}
                    label="Omezit animace"
                    description="Ještě klidnější prostředí pro soustředění."
                  />
                </section>
                <section className="settings-card data-card">
                  <div>
                    <h2>Váš pokrok je váš.</h2>
                    <p>
                      Ukládá se jen v tomto prohlížeči. Bez účtu a sledování. Mezi notebookem a
                      jiným počítačem se zatím nepřenáší automaticky; na stejné zařízení můžete
                      připojit libovolnou klávesnici.
                    </p>
                  </div>
                  <div className="data-actions">
                    <button
                      className="quiet-button"
                      onClick={() => {
                        const a = document.createElement('a');
                        const url = URL.createObjectURL(
                          new Blob([JSON.stringify(progress, null, 2)], {
                            type: 'application/json',
                          }),
                        );
                        a.href = url;
                        a.download = `lehce-pokrok-${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}
                    >
                      <ArrowDownToLine size={17} />
                      Stáhnout zálohu
                    </button>
                    <label className="quiet-button import-button">
                      Nahrát zálohu
                      <input
                        type="file"
                        accept="application/json,.json"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const raw = await file.text();
                            const p = JSON.parse(raw);
                            if (p.version !== 1 || !Array.isArray(p.sessions) || !p.keys)
                              throw Error();
                            const parsed = parseProgress(raw);
                            if (!window.confirm('Nahradit současný pokrok touto zálohou?')) return;
                            setProgress(parsed);
                            setMode(parsed.settings.level === 'beginner' ? 'beginner' : 'adaptive');
                            setSeed((v) => v + 1);
                          } catch {
                            window.alert(
                              'Tuto zálohu se nepodařilo přečíst. Vyberte JSON soubor stažený z Lehce.',
                            );
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button className="text-button danger" onClick={() => setModal('reset')}>
                      Smazat pokrok
                    </button>
                  </div>
                </section>
              </div>
              <p className="footnote">
                Nastavení se ukládá automaticky. Rozložení cvičení: česká QWERTZ. Nastavení fyzické
                klávesnice změňte v operačním systému.
              </p>
            </>
          )}
          <footer>
            <span>
              lehce<span className="brand-dot">.</span>
              <span className="footer-tag">Méně hledání. Více plynutí.</span>
            </span>
            <span>
              Vytvořeno pro české prsty <span className="tiny-flower">✳</span>
            </span>
          </footer>
        </main>
      </div>
      {modal && (
        <Modal
          title={
            modal === 'intro'
              ? 'Každá cesta začíná jinak.'
              : modal === 'help'
                ? 'Malý průvodce lehkým psaním'
                : modal === 'reset'
                  ? 'Opravdu začít znovu?'
                  : 'Váš text, váš trénink'
          }
          onClose={() => setModal(null)}
        >
          {modal === 'intro' && (
            <>
              <p className="modal-description">
                Vyberte si, co je vám bližší. Kdykoliv to můžete změnit.
              </p>
              <div className="path-choices">
                {(
                  [
                    {
                      value: 'beginner',
                      title: 'Začínám od nuly',
                      text: 'Prst po prstu. Od F a J k prvním větám.',
                      icon: BookOpen,
                    },
                    {
                      value: 'retrain',
                      title: 'Chci přepsat staré návyky',
                      text: 'Už píšu, ale chci jistotu bez koukání na ruce.',
                      icon: Sparkles,
                    },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.value}
                    className={progress.settings.level === v.value ? 'chosen' : ''}
                    onClick={() => settings({ level: v.value })}
                  >
                    <v.icon size={24} />
                    <strong>{v.title}</strong>
                    <span>{v.text}</span>
                    {progress.settings.level === v.value && (
                      <Check className="choice-check" size={18} />
                    )}
                  </button>
                ))}
              </div>
              <p className="gentle-tip">
                <Leaf size={18} />
                Při přeučování je dočasné zpomalení v pořádku. Začněte základní polohou, ne závodem.
              </p>
              <button
                className="primary-button full-width"
                onClick={() => {
                  setProgress((p) => ({ ...p, onboarded: true }));
                  start('beginner', 0);
                  setModal(null);
                }}
              >
                Najít základní polohu <ArrowRight size={17} />
              </button>
              <button
                className="text-button full-width"
                onClick={() => {
                  setProgress((p) => ({ ...p, onboarded: true }));
                  start(progress.settings.level === 'beginner' ? 'beginner' : 'adaptive');
                  setModal(null);
                }}
              >
                Rovnou si zkusit cvičení
              </button>
            </>
          )}
          {modal === 'help' && (
            <div className="help-content">
              <p>
                <strong>1. Najděte domov pro ruce.</strong>
                <br />
                Levý ukazováček na F, pravý na J. Ostatní prsty na A S D a K L Ů. Mezerník ovládá
                palec. Dívejte se na obrazovku.
              </p>
              <p>
                <strong>2. Začněte psát zobrazený text.</strong>
                <br />
                Čas se rozběhne prvním znakem. Při chybě zůstane kurzor na místě: jednoduše
                stiskněte správnou klávesu. Backspace vrátí předchozí znak. Vkládání textu je
                vypnuté.
              </p>
              <p>
                <strong>3. Klidně se zastavte.</strong>
                <br />
                Escape nebo tlačítko pozastaví čas. Odchod z okna nebo z psacího pole jej také
                zastaví. Pro návrat klikněte na Pokračovat a pište. Při změně druhu cvičení se
                rozepsaný pokus neuloží.
              </p>
              <p>
                <strong>4. Nechte chyby pracovat pro vás.</strong>
                <br />
                Po dokončení uložíme rychlost, přesnost a obtížné klávesy. Na míru upřednostňuje
                věty obsahující vaše chybové znaky. Dokud nemáme data, nabízí běžné české věty.
                Aplikace neumí zjistit, kterým prstem píšete nebo zda se díváte na ruce.
              </p>
              <p>
                <strong>Co znamená CPM?</strong>
                <br />
                Počet správně opsaných znaků za minutu včetně mezer. Přesnost je podíl správných
                stisků ze všech pokusů. Cvičení skončí uplynutím zvoleného času nebo opsáním celého
                textu. Krátké výsledky berte orientačně.
              </p>
              <p>
                <strong>Znaky na české klávesnici.</strong>
                <br />
                Nápověda odpovídá standardní české QWERTZ pro Windows/Linux. Na macOS a při
                vlastních rozloženích se kombinace mohou lišit; použijte Prohlížeč klávesnice
                systému. Dlouhá a měkká písmena lze zadat i přes mrtvé klávesy.
              </p>
            </div>
          )}
          {modal === 'custom' && (
            <>
              <p className="modal-description">
                Odstavec ze seminárky nebo oblíbené knihy. Text zůstane jen ve vašem prohlížeči, v
                historii se neukládá.
              </p>
              <textarea
                className="custom-textarea"
                aria-label="Vlastní text k procvičení"
                placeholder="Sem vložte svůj text…"
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                maxLength={3000}
              />
              <small>{customDraft.length} / 3 000 znaků · bílé znaky se sjednotí na mezery</small>
              <button
                className="primary-button full-width"
                disabled={customDraft.trim().length < 10}
                onClick={() => {
                  setCustom(customDraft);
                  start('custom');
                  setModal(null);
                }}
              >
                Procvičit můj text <ArrowRight size={16} />
              </button>
            </>
          )}
          {modal === 'reset' && (
            <>
              <p className="modal-description">
                Smaže se historie cvičení, statistiky kláves i nastavení z tohoto prohlížeče.
                Předtím si můžete v Nastavení stáhnout zálohu.
              </p>
              <div className="modal-actions">
                <button className="quiet-button" onClick={() => setModal(null)}>
                  Nechat si pokrok
                </button>
                <button
                  className="primary-button danger-button"
                  onClick={() => {
                    setProgress(freshProgress());
                    setMode('adaptive');
                    setSeed((v) => v + 1);
                    setModal(null);
                  }}
                >
                  Smazat a začít znovu
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <span />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
function Explore({
  icon,
  tag,
  title,
  description,
  color,
  onClick,
}: {
  icon: ReactNode;
  tag: string;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button className="explore-card" onClick={onClick}>
      <span className={`explore-icon ${color}`}>{icon}</span>
      <span className="explore-tag">{tag}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <ArrowRight className="explore-arrow" size={18} />
    </button>
  );
}
function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="toggle-label">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" />
    </label>
  );
}

type Run = {
  index: number;
  attempts: number;
  correct: number;
  keys: Record<string, KeyStat>;
  elapsed: number;
  started: number | null;
  lastAt: number | null;
  error: string;
  done: boolean;
  paused: boolean;
};
function Practice({
  mode,
  lesson,
  seed,
  custom,
  progress,
  onFinish,
  onRestart,
  onNext,
  onSettings,
}: {
  mode: Mode;
  lesson: number;
  seed: number;
  custom: string;
  progress: Progress;
  onFinish: (s: Session, keys: Record<string, KeyStat>, complete: boolean) => void;
  onRestart: () => void;
  onNext: () => void;
  onSettings: (s: Partial<Settings>) => void;
}) {
  const [target] = useState(() => makeText(mode, lesson, progress.keys, seed, custom));
  const run = useRef<Run>({
    index: 0,
    attempts: 0,
    correct: 0,
    keys: {},
    elapsed: 0,
    started: null,
    lastAt: null,
    error: '',
    done: false,
    paused: false,
  });
  const [, render] = useState(0);
  const [focused, setFocused] = useState(false);
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState<Session | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const textViewport = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const e = run.current;
  const elapsed = () =>
    e.elapsed + (e.started !== null ? (performance.now() - e.started) / 1000 : 0);
  const update = () => render((v) => v + 1);
  function pause() {
    if (e.done) return;
    if (e.started !== null) {
      e.elapsed = elapsed();
      e.started = null;
    }
    if (e.attempts) e.paused = true;
    e.lastAt = null;
    update();
  }
  function finish() {
    if (e.done || !e.attempts) return;
    const seconds = Math.min(progress.settings.duration, Math.max(elapsed(), 0.1));
    e.elapsed = seconds;
    e.started = null;
    e.done = true;
    const calculated = metrics(e.index, e.attempts, e.correct, seconds);
    const session: Session = {
      ...calculated,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      seconds,
      characters: e.index,
      mode,
      lesson,
      device: progress.settings.device,
    };
    onFinish(session, e.keys, e.index >= target.length);
    setResult(session);
    update();
  }
  const finishRef = useRef(finish);
  finishRef.current = finish;
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (run.current.started !== null) {
        if (
          run.current.elapsed + (performance.now() - run.current.started) / 1000 >=
          progress.settings.duration
        )
          finishRef.current();
        else render((v) => v + 1);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [progress.settings.duration]);
  useEffect(() => {
    function hide() {
      if (document.hidden) pause();
    }
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);
  useEffect(() => {
    const viewport = textViewport.current;
    const caret = cursor.current;
    if (viewport && caret)
      viewport.scrollTop = Math.max(0, caret.offsetTop - viewport.offsetTop - 35);
  });
  function type(value: string) {
    if (e.done || document.hidden) return;
    const chars = Array.from(value.normalize('NFC'));
    if (chars.length > 1) {
      setNotice('Pište prosím po jednom znaku. Vložení textu se nepočítá.');
      return;
    }
    if (!chars.length || !target.length) return;
    if (elapsed() >= progress.settings.duration) {
      finish();
      return;
    }
    const now = performance.now();
    if (e.started === null) e.started = now;
    e.paused = false;
    const expected = target[e.index];
    const correct = chars[0] === expected;
    e.keys = recordKey(e.keys, expected, correct, e.lastAt === null ? 0 : now - e.lastAt);
    e.lastAt = now;
    e.attempts++;
    if (correct) {
      e.index++;
      e.correct++;
      e.error = '';
      setNotice('');
    } else {
      e.error = chars[0];
    }
    if (e.index >= target.length) finish();
    update();
  }
  const stat = metrics(e.index, e.attempts, e.correct, elapsed());
  const info = keyInfo(target[e.index] ?? '');
  const remaining = Math.max(0, Math.ceil(progress.settings.duration - elapsed()));
  const completion = (e.index / Math.max(1, target.length)) * 100;
  let hint = info
    ? `${info.label === 'mezerník' ? 'Mezerník' : info.label} · ${fingerNames[info.finger]}`
    : 'Klidně a po jednom znaku';
  if (info?.shift) hint += ' + Shift opačné ruky';
  if (info?.dead)
    hint = `${info.dead === 'caron' ? 'Shift + ´ (háček)' : '´ (čárka)'}, potom ${info.shift ? 'Shift + ' : ''}${info.label} · ${fingerNames[info.finger]}`;
  if (info?.caps) hint = 'Caps Lock, potom ů, potom znovu Caps Lock';
  if (info?.alt)
    hint =
      progress.settings.os === 'mac'
        ? '* · kombinaci ověřte v Prohlížeči klávesnice macOS'
        : '* · AltGr + pomlčka (Ctrl + Alt + pomlčka)';
  return (
    <section
      className={`practice-card ${focusMode ? 'focus-mode' : ''}`}
      aria-label="Psaní na klávesnici"
    >
      <div className="practice-toolbar">
        <div className="session-label">
          <span className="session-dot" />
          {mode === 'beginner'
            ? `Lekce ${lesson + 1} · ${lessons[lesson].title}`
            : mode === 'adaptive'
              ? 'Vaše chvilka soustředění'
              : modeNames[mode]}
        </div>
        <div className="session-actions">
          <label className="duration-select">
            <Timer size={14} />
            <select
              aria-label="Délka cvičení"
              value={progress.settings.duration}
              disabled={e.attempts > 0 && !e.done}
              onChange={(ev) => onSettings({ duration: Number(ev.target.value) })}
            >
              <option value="60">1 min</option>
              <option value="120">2 min</option>
              <option value="300">5 min</option>
            </select>
          </label>
          <button
            className={`icon-button ${focusMode ? 'selected' : ''}`}
            title="Režim soustředění"
            aria-label={focusMode ? 'Ukončit režim soustředění' : 'Režim soustředění'}
            aria-pressed={focusMode}
            onClick={() => setFocusMode((v) => !v)}
          >
            <Focus size={17} />
          </button>
        </div>
      </div>
      {!result ? (
        <>
          <div className="live-stats">
            <div>
              <strong>{e.attempts ? stat.cpm : '—'}</strong>
              <span>znaků / min</span>
            </div>
            <div>
              <strong>
                {e.attempts ? stat.accuracy : '—'}
                <small>{e.attempts ? '%' : ''}</small>
              </strong>
              <span>přesnost</span>
            </div>
            <div className="time-stat">
              <strong>{durationLabel(remaining)}</strong>
              <span>zbývá času</span>
            </div>
          </div>
          <div
            className={`typing-area ${focused ? 'focused' : ''} ${e.error ? 'has-error' : ''}`}
            onClick={() => input.current?.focus()}
          >
            <span className="sr-only" id="typing-target">
              Text k opsání: {target}
            </span>
            <div className="text-scroll" ref={textViewport} aria-hidden="true">
              <div className="typing-text">
                {Array.from(target).map((char, i) => (
                  <span
                    key={i}
                    ref={i === e.index ? cursor : undefined}
                    className={`${i < e.index ? 'typed' : ''} ${i === e.index ? 'current' : ''} ${i === e.index && e.error ? 'wrong' : ''}`}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
            <textarea
              ref={input}
              className="typing-input"
              aria-label="Psací pole — opisujte zobrazený text"
              aria-describedby="typing-target typing-instructions"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                pause();
              }}
              onPaste={(ev) => {
                ev.preventDefault();
                setNotice('Vkládání je vypnuté. Každý znak si zaslouží vlastní stisk.');
              }}
              onDrop={(ev) => ev.preventDefault()}
              onInput={(ev) => {
                if ((ev.nativeEvent as InputEvent).isComposing) return;
                const text = ev.currentTarget.value;
                ev.currentTarget.value = '';
                type(text);
              }}
              onCompositionEnd={(ev) => {
                const text = ev.currentTarget.value;
                ev.currentTarget.value = '';
                type(text);
              }}
              onKeyDown={(ev) => {
                if (ev.key === 'Escape') {
                  ev.preventDefault();
                  pause();
                  input.current?.blur();
                }
                if (ev.key === 'Backspace') {
                  ev.preventDefault();
                  if (e.error) e.error = '';
                  else if (e.index > 0) e.index--;
                  e.lastAt = null;
                  update();
                }
                if (ev.key === 'Enter') ev.preventDefault();
              }}
            />
            {!focused && (
              <button className="start-writing" onClick={() => input.current?.focus()}>
                <Play size={15} fill="currentColor" />
                {e.attempts ? 'Pokračovat v psaní' : 'Klikněte sem a začněte psát'}
              </button>
            )}
          </div>
          <div className="typing-feedback" id="typing-instructions" aria-live="polite">
            <span>
              {notice ||
                (e.error
                  ? `To se stává. Zkuste ${target[e.index] === ' ' ? 'mezerník' : `„${target[e.index]}“`} ještě jednou.`
                  : e.paused
                    ? 'Čas stojí. Pokračujte, až budete chtít.'
                    : focused
                      ? 'Oči na textu. Ruce si cestu najdou.'
                      : 'Čas začne běžet až s prvním znakem.')}
            </span>
            <span className="text-count">
              {e.index} / {target.length}
            </span>
          </div>
          <div className="text-progress">
            <span style={{ width: `${completion}%` }} />
          </div>
          <div className="keyboard-section">
            <div className="keyboard-heading">
              <span>
                {progress.settings.hints ? (
                  <>
                    <span
                      className="hint-dot"
                      style={{ background: info ? `var(--finger-${info.finger})` : undefined }}
                    />
                    {hint}
                  </>
                ) : (
                  'Česká QWERTZ · v klidu a bez koukání'
                )}
              </span>
              <button
                className="text-button"
                onClick={() => onSettings({ hints: !progress.settings.hints })}
              >
                {progress.settings.hints ? 'Skrýt nápovědu' : 'Ukázat nápovědu'}
              </button>
            </div>
            <div
              className={`keyboard ${progress.settings.hints ? 'show-hints' : ''}`}
              aria-hidden="true"
            >
              {rows.map((row, ri) => (
                <div className={`keyboard-row row-${ri}`} key={ri}>
                  {ri === 1 && <span className="key modifier tab-key">tab</span>}
                  {ri === 2 && <span className="key modifier caps-key">caps</span>}
                  {ri === 3 && (
                    <span
                      className={`key modifier shift-key ${info?.shift && info.finger >= 4 ? 'needed' : ''}`}
                    >
                      shift
                    </span>
                  )}
                  {row.map((k) => (
                    <span
                      key={k.code}
                      className={`key finger-${k.finger} ${info?.code === k.code ? 'needed' : ''} ${['KeyF', 'KeyJ'].includes(k.code) ? 'home-key' : ''}`}
                    >
                      <span>{k.label}</span>
                    </span>
                  ))}
                  {ri === 0 && <span className="key modifier backspace-key">←</span>}
                  {ri === 2 && <span className="key modifier enter-key">enter ↵</span>}
                  {ri === 3 && (
                    <span
                      className={`key modifier shift-key ${info?.shift && info.finger < 4 ? 'needed' : ''}`}
                    >
                      shift
                    </span>
                  )}
                </div>
              ))}
              <div className="keyboard-row bottom-row">
                <span className="key modifier">ctrl</span>
                <span className="key modifier">{progress.settings.os === 'mac' ? '⌥' : 'alt'}</span>
                <span className={`key space-key ${info?.code === 'Space' ? 'needed' : ''}`}>
                  mezerník
                </span>
                <span
                  className={`key modifier ${info?.alt && progress.settings.os !== 'mac' ? 'needed' : ''}`}
                >
                  {progress.settings.os === 'mac' ? '⌥' : 'alt gr'}
                </span>
                <span className="key modifier">ctrl</span>
              </div>
            </div>
            {mode === 'beginner' ? (
              <div className="finger-legend lesson-tip">
                <Leaf size={14} />
                {lessons[lesson].tip}
              </div>
            ) : (
              <div className="finger-legend">
                <span>
                  <i className="pink" />
                  malíček
                </span>
                <span>
                  <i className="yellow" />
                  prsteníček
                </span>
                <span>
                  <i className="blue" />
                  prostředníček
                </span>
                <span>
                  <i className="green" />
                  ukazováček
                </span>
              </div>
            )}
          </div>
          <div className="practice-bottom">
            <span>
              <span className="keyboard-shortcut">esc</span> pauza je v pořádku
            </span>
            <div>
              {e.attempts > 0 && (
                <button
                  className="icon-button"
                  title="Pozastavit cvičení"
                  aria-label="Pozastavit cvičení"
                  onClick={() => {
                    pause();
                    input.current?.blur();
                  }}
                >
                  <Pause size={16} />
                </button>
              )}
              <button className="restart-button" onClick={onRestart}>
                <RotateCcw size={15} />
                Nový začátek
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="result-panel" role="status">
          <span className="result-icon">
            <Leaf size={34} strokeWidth={1.5} />
          </span>
          <div className="eyebrow">DALŠÍ MALÝ KROK JE ZA VÁMI</div>
          <h2>{result.accuracy >= 95 ? 'Tohle byl dobrý rytmus.' : 'Každý pokus vás něco učí.'}</h2>
          <p>
            {result.accuracy >= 95
              ? 'Jistota roste s každým správným stiskem. Klidně to pro dnešek stačí.'
              : 'Příště zkuste trochu zpomalit. Dopřejte prstům čas najít správné místo.'}
          </p>
          <div className="result-stats">
            <div>
              <strong>{result.cpm}</strong>
              <span>znaků / min</span>
            </div>
            <div>
              <strong>{result.accuracy} %</strong>
              <span>přesnost</span>
            </div>
            <div>
              <strong>{durationLabel(Math.round(result.seconds))}</strong>
              <span>čistý čas</span>
            </div>
          </div>
          {result.seconds < 15 && (
            <small className="short-result-note">
              Krátké cvičení: údaj o rychlosti je zatím orientační.
            </small>
          )}
          {mode === 'beginner' && e.index >= target.length && result.accuracy >= 95 && (
            <p className="lesson-completed">
              <Check size={17} />
              Lekce zvládnutá. Můžete se k ní kdykoliv vrátit.
            </p>
          )}
          <div className="result-actions">
            <button className="quiet-button" onClick={onRestart}>
              <RotateCcw size={16} />
              Ještě jeden malý krok
            </button>
            {mode === 'beginner' && lesson < lessons.length - 1 && (
              <button className="primary-button" onClick={onNext}>
                Další lekce <ArrowRight size={16} />
              </button>
            )}
          </div>
          <span className="saved-note">
            <Check size={14} />
            Pokrok se uložil do tohoto prohlížeče
          </span>
        </div>
      )}
    </section>
  );
}

function ProgressPage({ progress, onPractice }: { progress: Progress; onPractice: () => void }) {
  const sessions = progress.sessions;
  const recent = sessions.slice(-12);
  const avg = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.cpm, 0) / sessions.length)
    : 0;
  const accuracy = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
    : 0;
  const seconds = sessions.reduce((sum, s) => sum + s.seconds, 0);
  const weak = weakestKeys(progress.keys);
  return (
    <>
      <PageHeading
        eyebrow="POKROK MÁ SPOUSTU PODOB"
        title="Každý stisk je krok dopředu."
        description="Vaše vlastní cesta. Bez žebříčků a bez srovnávání s ostatními."
      />
      {!sessions.length ? (
        <div className="empty-state">
          <span className="big-icon">
            <TrendingUp size={30} />
          </span>
          <h2>Tady vyroste váš příběh.</h2>
          <p>
            Po prvním dokončeném cvičení uvidíte rychlost, přesnost a klávesy, kterým se můžete
            věnovat. Začněte jednou klidnou minutou.
          </p>
          <button className="primary-button" onClick={onPractice}>
            Zkusit první cvičení <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <>
          <div className="stat-card-grid">
            {[
              { label: 'Průměrná rychlost', value: `${avg}`, unit: 'CPM', icon: TrendingUp },
              { label: 'Průměrná přesnost', value: `${accuracy}`, unit: '%', icon: Target },
              {
                label: 'Čas pro sebe',
                value: `${Math.round(seconds / 60)}`,
                unit: 'min',
                icon: Timer,
              },
              {
                label: 'Malé kroky za vámi',
                value: `${sessions.length}`,
                unit: 'cvičení',
                icon: Leaf,
              },
            ].map((s) => (
              <section key={s.label} className="summary-stat">
                <s.icon size={19} />
                <span>{s.label}</span>
                <strong>
                  {s.value} <small>{s.unit}</small>
                </strong>
              </section>
            ))}
          </div>
          <div className="progress-grid">
            <section className="settings-card chart-card">
              <div className="section-heading">
                <h2>Váš rytmus v čase</h2>
                <span>Posledních {recent.length} cvičení</span>
              </div>
              <div className="chart">
                <div
                  className="chart-goal"
                  style={{
                    bottom: `${(progress.settings.goal / Math.max(progress.settings.goal, ...recent.map((s) => s.cpm), 1)) * 85}%`,
                  }}
                >
                  <span>Cíl {progress.settings.goal}</span>
                </div>
                {recent.map((s, i) => (
                  <div className="chart-column" key={s.id}>
                    <span className="bar-value">{s.cpm}</span>
                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.max(2, (s.cpm / Math.max(progress.settings.goal, ...recent.map((s) => s.cpm), 1)) * 85)}%`,
                      }}
                    />
                    <span className="chart-label">{i + 1}</span>
                  </div>
                ))}
              </div>
              <p className="footnote">
                CPM jednotlivých cvičení. Různé texty i délky se liší obtížností; důležitá je také
                přesnost.
              </p>
            </section>
            <section className="settings-card">
              <h2>Klávesy pod lupou</h2>
              <p className="muted">
                Nejvíc chyb nebo delší hledání. Zobrazují se klávesy s alespoň třemi pokusy.
              </p>
              {weak.length ? (
                weak.map((k) => (
                  <div className="key-stat-row" key={k.key}>
                    <kbd>{k.key}</kbd>
                    <span>
                      {k.errors} chyb z {k.attempts} pokusů
                    </span>
                    <strong>{Math.round((1 - k.errors / k.attempts) * 100)} %</strong>
                  </div>
                ))
              ) : (
                <p className="gentle-tip">Ještě pár stisků a budeme mít dost dat pro doporučení.</p>
              )}
            </section>
          </div>
          <section className="settings-card history-card">
            <h2>Vaše poslední cvičení</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Kdy</th>
                    <th>Cvičení</th>
                    <th>Rychlost</th>
                    <th>Přesnost</th>
                    <th>Klávesnice</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions
                    .slice(-15)
                    .reverse()
                    .map((s) => (
                      <tr key={s.id}>
                        <td>
                          {new Date(s.date).toLocaleString('cs-CZ', {
                            day: 'numeric',
                            month: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>{modeNames[s.mode] ?? 'Cvičení'}</td>
                        <td>{s.cpm} CPM</td>
                        <td>
                          <span className={`accuracy-badge ${s.accuracy < 90 ? 'needs-care' : ''}`}>
                            {s.accuracy} %
                          </span>
                        </td>
                        <td>{s.device === 'keyboard' ? 'Samostatná' : 'Notebook'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-inner">
        <button className="icon-button modal-close" aria-label="Zavřít dialog" onClick={onClose}>
          <X size={20} />
        </button>
        <span className="modal-leaf">
          <Leaf size={25} />
        </span>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
