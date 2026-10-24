import { symbols, symbolPatterns, symbolText } from './symbols';
import {
  assessmentRules,
  stageLessons,
  placementStages,
  courseSections,
  sectionParts,
  sectionLessons,
  type Assessment,
} from './assessment';
import {
  lessons,
  lessonText,
  COURSE_VERSION,
  PASS_CPM,
  MAX_ERRORS,
  lessonRules,
} from './curriculum';
export { lessons, COURSE_VERSION, PASS_CPM, MAX_ERRORS, lessonRules } from './curriculum';
export type Mode = 'adaptive' | 'beginner' | 'text' | 'academic' | 'symbols' | 'custom' | 'skills';
export type KeyStat = { attempts: number; errors: number; ms: number; samples: number };
export type Session = {
  id: string;
  date: string;
  cpm: number;
  accuracy: number;
  seconds: number;
  characters: number;
  mode: Mode;
  lesson: number;
  device: string;
  errors?: number;
  finished?: boolean;
  lessonVersion?: number;
  keyStats?: Record<string, KeyStat>;
  bestCombo?: number;
  skill?: string;
  accuracyMeasured?: boolean;
  assessment?: Assessment;
  textSignature?: string;
};
export type Settings = {
  level: 'retrain' | 'beginner';
  goal: number;
  duration: number;
  device: 'notebook' | 'keyboard';
  hints: boolean;
  os: 'windows' | 'mac';
  reducedMotion: boolean;
};
export type Progress = {
  version: 2;
  baselineKeys: Record<string, KeyStat>;
  settings: Settings;
  keys: Record<string, KeyStat>;
  sessions: Session[];
  completed: number[];
  onboarded: boolean;
};
export const STORAGE_KEY = 'lehce.progress.v1';
export const defaults: Settings = {
  level: 'retrain',
  goal: 300,
  duration: 60,
  device: 'notebook',
  hints: true,
  os: 'windows',
  reducedMotion: false,
};
export const freshProgress = (): Progress => ({
  version: 2,
  baselineKeys: {},
  settings: { ...defaults },
  keys: {},
  sessions: [],
  completed: [],
  onboarded: false,
});
const sentences = {
  text: [
    'Ráno si otevřu okno a na chvíli pustím do pokoje čerstvý vzduch.',
    'Každý malý krok se počítá. Dnes stačí najít vlastní rytmus.',
    'Na stole voní čaj a za oknem tiše šumí stromy.',
    'Člověk se učí nejlépe, když má prostor zkoušet a dělat chyby.',
    'Příběh nemusí být dlouhý, aby v něm bylo něco důležitého.',
    'U řeky jsme našli klidné místo, kam se jednou zase vrátíme.',
    'Psaní všemi deseti dává myšlenkám prostor volně plynout.',
    'Příští týden připravíme společný výlet do jižních Čech.',
  ],
  academic: [
    'Cílem této studie je porovnat výsledky jednotlivých výzkumných metod.',
    'Získaná data naznačují souvislost mezi prostředím a schopností soustředit se.',
    'V následující kapitole se zaměříme na interpretaci pozorovaných jevů.',
    'Při hodnocení výsledků je třeba zohlednit velikost výzkumného souboru.',
    'Závěry práce vycházejí z kritického rozboru dostupných odborných pramenů.',
    'Předpokládaný vztah mezi proměnnými vyžaduje další empirické ověření.',
  ],
};
export function weakestKeys(keys: Record<string, KeyStat>) {
  return Object.entries(keys)
    .filter(([key, s]) => key !== ' ' && s.attempts >= 3)
    .map(([key, s]) => ({
      key,
      ...s,
      score: (s.errors / s.attempts) * 1000 + (s.samples ? s.ms / s.samples : 0) * 0.1,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
export function makeText(
  mode: Mode,
  lesson: number,
  keys: Record<string, KeyStat>,
  seed = 0,
  custom = '',
  symbolFocus = '',
  avoid = '',
) {
  if (mode === 'symbols' && symbolFocus) return symbolText(symbolFocus, seed);
  if (mode === 'custom') return custom.normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 3000);
  if (mode === 'beginner')
    return lessonText(
      lesson,
      seed,
      weakestKeys(keys)
        .filter((k) => k.errors > 0)
        .map((k) => k.key),
      avoid,
    );
  const source = [
    ...(mode === 'symbols' ? symbolPatterns : sentences[mode === 'academic' ? 'academic' : 'text']),
  ];
  const weak = weakestKeys(keys)
    .filter((s) => s.errors > 0)
    .map((s) => s.key);
  if (mode === 'adaptive' && weak.length)
    source.sort(
      (a, b) => weak.filter((k) => b.includes(k)).length - weak.filter((k) => a.includes(k)).length,
    );
  const offset = mode === 'adaptive' && weak.length ? 0 : seed % source.length;
  return [...source.slice(offset), ...source.slice(0, offset)].slice(0, 3).join(' ');
}
export function metrics(characters: number, attempts: number, correct: number, seconds: number) {
  return {
    cpm: seconds > 0 ? Math.floor((characters / seconds) * 60) : 0,
    accuracy: attempts ? Math.round((correct / attempts) * 100) : 100,
  };
}
export function lessonPassed(session: Session) {
  const rules = assessmentRules(session.assessment, session.lesson);
  return (
    session.mode === 'beginner' &&
    session.lessonVersion === COURSE_VERSION &&
    session.finished === true &&
    session.characters >= 100 &&
    session.seconds > 0 &&
    (rules.minCpm === 0 || (session.characters / session.seconds) * 60 >= rules.minCpm) &&
    typeof session.errors === 'number' &&
    session.errors <= MAX_ERRORS
  );
}
export function passedLessons(session: Session) {
  if (!lessonPassed(session)) return [];
  if (session.assessment?.kind === 'section') return [];
  if (session.assessment?.kind !== 'placement') return [session.lesson];
  const stage = placementStages[session.assessment.stage];
  return stage && session.lesson === stage.to ? stageLessons(session.assessment.stage) : [];
}
export function sectionPartPassed(sessions: Session[], section: number, part: number) {
  const sample = sectionParts(section)[part];
  return (
    !!sample &&
    sessions.some(
      (s) =>
        s.assessment?.kind === 'section' &&
        s.assessment.section === section &&
        s.assessment.part === part &&
        s.lesson === sample.lessons.at(-1) &&
        lessonPassed(s),
    )
  );
}
export function isSpeedPractice(session: Pick<Session, 'mode' | 'lesson'>) {
  return (
    session.mode !== 'symbols' &&
    session.mode !== 'skills' &&
    !(session.mode === 'beginner' && lessonRules(session.lesson).minCpm === 0)
  );
}
export function lessonUnlocked(index: number, completed: number[]) {
  return index === 0 || completed.includes(index) || completed.includes(index - 1);
}
export function nextLesson(completed: number[]) {
  // A successful exam establishes a new starting point even when earlier
  // optional lessons were skipped. They remain available in the course list.
  const last = Math.max(
    -1,
    ...completed.filter((i) => Number.isInteger(i) && i >= 0 && i < lessons.length),
  );
  return Math.min(lessons.length - 1, last + 1);
}
export function cleanKeys(value: unknown): Record<string, KeyStat> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, s]) =>
        key.length === 1 &&
        s &&
        [s.attempts, s.errors, s.ms, s.samples].every(
          (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
        ) &&
        s.errors <= s.attempts,
    ),
  );
}
export function mergeProgress(local: Progress, remote: Progress): Progress {
  const sessions = new Map<string, Session>();
  for (const s of [...remote.sessions, ...local.sessions]) {
    const previous = sessions.get(s.id);
    if (!previous || JSON.stringify(s).localeCompare(JSON.stringify(previous)) > 0)
      sessions.set(s.id, s);
  }
  const combined = [...sessions.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );
  const baselineKeys: Record<string, KeyStat> = {};
  for (const source of [remote.baselineKeys ?? {}, local.baselineKeys ?? {}])
    for (const [key, stat] of Object.entries(source)) {
      const old = baselineKeys[key] ?? { attempts: 0, errors: 0, ms: 0, samples: 0 };
      baselineKeys[key] = {
        attempts: Math.max(old.attempts, stat.attempts),
        errors: Math.max(old.errors, stat.errors),
        ms: Math.max(old.ms, stat.ms),
        samples: Math.max(old.samples, stat.samples),
      };
    }
  const keys = { ...baselineKeys };
  for (const s of combined)
    for (const [key, stat] of Object.entries(cleanKeys(s.keyStats))) {
      const old = keys[key] ?? { attempts: 0, errors: 0, ms: 0, samples: 0 };
      keys[key] = {
        attempts: old.attempts + stat.attempts,
        errors: old.errors + stat.errors,
        ms: old.ms + stat.ms,
        samples: old.samples + stat.samples,
      };
    }
  return {
    ...local,
    version: 2,
    baselineKeys,
    keys,
    sessions: combined,
    onboarded: local.onboarded || remote.onboarded,
    completed: [
      ...new Set([
        ...local.completed,
        ...remote.completed,
        ...combined.flatMap(passedLessons),
        ...courseSections.flatMap((_, section) =>
          sectionParts(section).every((_, part) => sectionPartPassed(combined, section, part))
            ? sectionLessons(section)
            : [],
        ),
      ]),
    ].sort((a, b) => a - b),
  };
}
export function addSession(progress: Progress, session: Session) {
  return mergeProgress({ ...progress, sessions: [...progress.sessions, session] }, freshProgress());
}
export function journey(progress: Progress) {
  const xp =
    progress.sessions.reduce((sum, s) => sum + Math.max(5, Math.floor(s.characters / 8)), 0) +
    progress.completed.length * 50;
  const stages = ['Semínko', 'První klíčky', 'Mladý výhonek', 'Rozkvetlá zahrada', 'Strom jistoty'];
  const stage = Math.min(4, Math.floor(Math.sqrt(xp / 100)));
  return {
    xp,
    stage,
    name: stages[stage],
    next: (stage + 1) ** 2 * 100,
    characters: progress.sessions.reduce((n, s) => n + s.characters, 0),
  };
}
export function recordKey(
  keys: Record<string, KeyStat>,
  key: string,
  correct: boolean,
  latency: number,
) {
  const prev = keys[key] ?? { attempts: 0, errors: 0, ms: 0, samples: 0 };
  const sample = correct && latency >= 30 && latency <= 3000;
  return {
    ...keys,
    [key]: {
      attempts: prev.attempts + 1,
      errors: prev.errors + Number(!correct),
      ms: prev.ms + (sample ? latency : 0),
      samples: prev.samples + Number(sample),
    },
  };
}
export function parseProgress(raw: string | null): Progress {
  if (!raw) return freshProgress();
  try {
    const p = JSON.parse(raw);
    if (
      ![1, 2].includes(p.version) ||
      !Array.isArray(p.sessions) ||
      !p.keys ||
      typeof p.keys !== 'object'
    )
      return freshProgress();
    const settings = { ...defaults, ...p.settings };
    settings.goal = Math.max(100, Math.min(600, Number(settings.goal) || 300));
    settings.duration = [60, 120, 300].includes(settings.duration) ? settings.duration : 60;
    settings.level = settings.level === 'beginner' ? 'beginner' : 'retrain';
    settings.device = settings.device === 'keyboard' ? 'keyboard' : 'notebook';
    settings.os = settings.os === 'mac' ? 'mac' : 'windows';
    const keys = Object.fromEntries(
      Object.entries(p.keys).filter(([k, value]) => {
        const s = value as KeyStat;
        return (
          k.length === 1 &&
          s &&
          [s.attempts, s.errors, s.ms, s.samples].every(
            (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
          ) &&
          s.errors <= s.attempts
        );
      }),
    ) as Record<string, KeyStat>;
    const sessions = p.sessions
      .filter(
        (s: Session) =>
          s &&
          typeof s.id === 'string' &&
          Number.isFinite(Date.parse(s.date)) &&
          [s.cpm, s.accuracy, s.seconds, s.characters].every((v) => Number.isFinite(v) && v >= 0) &&
          s.accuracy <= 100 &&
          s.seconds > 0,
      )
      .map((s: Session) => ({
        ...s,
        keyStats: cleanKeys(s.keyStats),
        errors: Number.isInteger(s.errors) && s.errors! >= 0 ? s.errors : undefined,
        finished: s.finished === true,
        lessonVersion: s.lessonVersion === COURSE_VERSION ? COURSE_VERSION : 1,
      }));
    return {
      version: 2,
      baselineKeys: p.version === 1 ? keys : cleanKeys(p.baselineKeys),
      settings,
      keys,
      sessions,
      completed:
        p.version === 2 && Array.isArray(p.completed)
          ? p.completed.filter((v: number) => Number.isInteger(v) && v >= 0 && v < lessons.length)
          : [],
      onboarded: !!p.onboarded,
    };
  } catch {
    return freshProgress();
  }
}
export type KeyInfo = {
  label: string;
  code: string;
  finger: number;
  shift?: boolean;
  alt?: boolean;
  caps?: boolean;
  dead?: 'caron' | 'acute';
};
export const rows: KeyInfo[][] = [
  [
    ';|Backquote|0',
    '+|Digit1|0',
    'ě|Digit2|0',
    'š|Digit3|1',
    'č|Digit4|2',
    'ř|Digit5|3',
    'ž|Digit6|3',
    'ý|Digit7|4',
    'á|Digit8|4',
    'í|Digit9|5',
    'é|Digit0|6',
    '=|Minus|7',
    '´|Equal|7',
  ].map(parseKey),
  [
    'Q|KeyQ|0',
    'W|KeyW|1',
    'E|KeyE|2',
    'R|KeyR|3',
    'T|KeyT|3',
    'Z|KeyY|4',
    'U|KeyU|4',
    'I|KeyI|5',
    'O|KeyO|6',
    'P|KeyP|7',
    'ú|BracketLeft|7',
    ')|BracketRight|7',
  ].map(parseKey),
  [
    'A|KeyA|0',
    'S|KeyS|1',
    'D|KeyD|2',
    'F|KeyF|3',
    'G|KeyG|3',
    'H|KeyH|4',
    'J|KeyJ|4',
    'K|KeyK|5',
    'L|KeyL|6',
    'ů|Semicolon|7',
    '§|Quote|7',
  ].map(parseKey),
  [
    'Y|KeyZ|0',
    'X|KeyX|1',
    'C|KeyC|2',
    'V|KeyV|3',
    'B|KeyB|3',
    'N|KeyN|4',
    'M|KeyM|4',
    ',|Comma|5',
    '.|Period|6',
    '-|Slash|7',
  ].map(parseKey),
];
function parseKey(s: string): KeyInfo {
  const [label, code, finger] = s.split('|');
  return { label, code, finger: Number(finger) };
}
export function keyInfo(char: string): KeyInfo | undefined {
  if (!char) return undefined;
  if (char === ' ') return { label: 'mezerník', code: 'Space', finger: 8 };
  const digit = '1234567890'.indexOf(char);
  if (digit >= 0) return { ...rows[0][digit + 1], shift: true };
  const altCodes = Object.fromEntries(
    symbols.filter((s) => s.combo.startsWith('Ctrl + Alt')).map((s) => [s.char, s.code]),
  );
  if (altCodes[char]) return { ...rows.flat().find((k) => k.code === altCodes[char])!, alt: true };
  if ('ĚŠČŘŽÝÁÍÉÚŮ'.includes(char)) {
    const key = rows.flat().find((k) => k.label.toLowerCase() === char.toLowerCase());
    if (key) return { ...key, caps: true };
  }
  if ('ďťňóĎŤŇÓĚŠČŘŽÝÁÍÉÚ'.includes(char) && char) {
    const base = char.normalize('NFD')[0];
    const found = rows.flat().find((k) => k.label.toLowerCase() === base.toLowerCase());
    if (found)
      return {
        ...found,
        shift: base === base.toUpperCase(),
        dead: char.normalize('NFD').includes('\u030c') ? 'caron' : 'acute',
      };
  }
  const shifted: Record<string, string> = {
    _: 'Slash',
    '/': 'BracketLeft',
    '(': 'BracketRight',
    '%': 'Minus',
    ':': 'Period',
    '?': 'Comma',
    '!': 'Quote',
    '"': 'Semicolon',
  };
  const found = rows
    .flat()
    .find((k) =>
      shifted[char] ? k.code === shifted[char] : k.label.toLowerCase() === char.toLowerCase(),
    );
  if (!found) return undefined;
  return {
    ...found,
    shift: !!shifted[char] || (char.toUpperCase() === char && char.toLowerCase() !== char),
  };
}
export const fingerNames = [
  'levý malíček',
  'levý prsteníček',
  'levý prostředníček',
  'levý ukazováček',
  'pravý ukazováček',
  'pravý prostředníček',
  'pravý prsteníček',
  'pravý malíček',
  'palec',
];
