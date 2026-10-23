export type Mode = 'adaptive' | 'beginner' | 'text' | 'academic' | 'symbols' | 'custom';
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
  version: 1;
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
  version: 1,
  settings: { ...defaults },
  keys: {},
  sessions: [],
  completed: [],
  onboarded: false,
});
export const lessons = [
  {
    title: 'Najděte svůj domov',
    subtitle: 'Základní poloha · F a J',
    keys: 'fj',
    text: 'fff jjj fjf jfj ff jj fj jf fjfj jfjf ffjj jjff fj jf',
    tip: 'Ukazováčky položte na F a J. Malé výstupky najdete i bez pohledu na klávesnici.',
  },
  {
    title: 'První souhra',
    subtitle: 'Základní řada · D a K',
    keys: 'dfjk',
    text: 'dd kk dk kd df jk fd kj dkjf fjdk df jk fd kj ddk fjj dk',
    tip: 'Prostředníčky patří na D a K. Po každém stisku se vraťte do základní polohy.',
  },
  {
    title: 'Zapojte prsteníčky',
    subtitle: 'Základní řada · S a L',
    keys: 'sdfjkl',
    text: 'ss ll sl ls sd fl jk ls dl sf skl fjs sdf jkl sl ds kl fj',
    tip: 'Prsteníčky ovládají S a L. Klidně zpomalte, důležitější je správný prst.',
  },
  {
    title: 'Každý prst má své místo',
    subtitle: 'Základní řada · A a Ů',
    keys: 'asdfjklů',
    text: 'aa ůů aů ůa sad dal jak klad sklad klas skla klasů skladů',
    tip: 'Malíčky položte na A a Ů. Mezerník stiskněte palcem, který je vám příjemnější.',
  },
  {
    title: 'Malý krok doprostřed',
    subtitle: 'Základní řada · G a H',
    keys: 'asdfghjklů',
    text: 'had hlad hala hlas hlasů hladů dala hlas a dal sklad klad',
    tip: 'G ovládá levý ukazováček a H pravý. Ostatní prsty zůstávají u základní řady.',
  },
  {
    title: 'O řadu výš',
    subtitle: 'Horní řada · E, R, T, U, I, O',
    keys: 'ertuio',
    text: 'ruka roste jako les teta jede daleko radost a klid',
    tip: 'Při cestě k horní řadě nepřesouvejte celou ruku. Po stisku se prst vrací domů.',
  },
  {
    title: 'Celá abeceda',
    subtitle: 'Horní a dolní řada · QWERTZ',
    keys: 'qwertzuiopzxcvbnmy',
    text: 'v malem domku bydlel vesely pes a jeho novy kamarad',
    tip: 'Na české QWERTZ je Z nahoře a Y vlevo dole. Hledejte klávesy prsty, ne očima.',
  },
  {
    title: 'Čeština se vším všudy',
    subtitle: 'Diakritika · ěščřžýáíéúů',
    keys: 'ěščřžýáíéúů',
    text: 'příliš žluťoučký kůň úpěl ďábelské ódy český příběh začíná právě teď',
    tip: 'Česká písmena jsou i na horní číselné řadě. Dlouhé ú najdete vedle P, ů vedle L.',
  },
  {
    title: 'Věty mají rytmus',
    subtitle: 'Velká písmena a interpunkce',
    keys: '.,!?',
    text: 'Dnes je příjemný den. Jak se máte? Psaní může být radost, stačí začít pomalu.',
    tip: 'Pro velké písmeno použijte Shift opačné ruky. Netlačte do kláves a nezvedejte ramena.',
  },
  {
    title: 'Čísla, vzorce a nápady',
    subtitle: 'Čísla a znaky pro každodenní práci',
    keys: '1234567890=*()+-:',
    text: '=A1*B1 =SUMA(A1:A5) =(12+8)/2 25 % 3*4=12 2026',
    tip: 'V českém rozložení Windows/Linux bývá * na AltGr + klávese s pomlčkou (vedle pravého Shiftu). Ctrl + Alt může fungovat jako AltGr.',
  },
];
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
  symbols: [
    '=A1*B1 =SUMA(A1:A5) =(12+8)/2 3*4=12',
    '25 % + 15 % = 40 %; 1 250 Kč; 2026',
    '=A1+B1 =C2/100 =SUMA(B2:B8) 5*6=30',
    '(2024–2026) 3,14; 12:30; 50 %; 2+2=4',
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
) {
  if (mode === 'custom') return custom.normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 3000);
  if (mode === 'beginner') return lessons[Math.max(0, Math.min(lesson, lessons.length - 1))].text;
  const source = [
    ...sentences[mode === 'academic' ? 'academic' : mode === 'symbols' ? 'symbols' : 'text'],
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
    cpm: seconds > 0 ? Math.round((characters / seconds) * 60) : 0,
    accuracy: attempts ? Math.round((correct / attempts) * 100) : 100,
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
    if (p.version !== 1 || !Array.isArray(p.sessions) || !p.keys || typeof p.keys !== 'object')
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
      .slice(-500);
    return {
      version: 1,
      settings,
      keys,
      sessions,
      completed: Array.isArray(p.completed)
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
  if (char === ' ') return { label: 'mezerník', code: 'Space', finger: 8 };
  const digit = '1234567890'.indexOf(char);
  if (digit >= 0) return { ...rows[0][digit + 1], shift: true };
  if (char === '*') return { ...rows[3][9], alt: true };
  if (char === 'Ů') return { ...rows[2][9], caps: true };
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
