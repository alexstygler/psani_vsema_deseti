export const COURSE_VERSION = 3;
export const PASS_CPM = 150;
export const MAX_ERRORS = 3;
export const exerciseOrder = ['touch', 'words', 'sentences'] as const;
export type LessonExercise = (typeof exerciseOrder)[number];
export type Lesson = {
  id: string;
  title: string;
  chapter: string;
  subtitle: string;
  keys: string;
  tip: string;
  words: string[];
  sentences: string[];
  precision: boolean;
  legacy?: number[];
};
const course: Lesson[] = [];
function add(
  chapter: string,
  id: string,
  title: string,
  keys: string,
  words: string,
  sentences: string[],
  tip: string,
  precision = false,
  legacy?: number[],
) {
  course.push({
    id,
    chapter,
    title,
    keys,
    words: words.split('|').filter(Boolean),
    sentences,
    tip,
    precision,
    legacy,
    subtitle: `${chapter} · ${keys || 'opakování'}`,
  });
}
const home = '01 · Prostřední řada';
add(
  home,
  'home-fj',
  'Ukazováčky doma',
  'fj',
  '',
  [],
  'Nahmatejte výstupky F a J. Levý ukazováček patří na F, pravý na J. Mezerník ovládá palec.',
);
add(
  home,
  'home-dk',
  'Prostředníčky',
  'dk',
  '',
  [],
  'D stiskne levý prostředníček, K pravý. Ostatní prsty odpočívají na základní řadě.',
);
add(
  home,
  'home-sl',
  'Prsteníčky',
  'sl',
  '',
  [],
  'S ovládá levý prsteníček, L pravý. Ruce zůstávají na místě.',
);
add(
  home,
  'home-au',
  'Malíčky a první slova',
  'aů',
  'sad|dal|jak|klad|sklad|klas|skla|klasů|skladů|dala|sada|fajfka',
  [],
  'A stiskne levý malíček, Ů pravý. Poprvé můžeme tvořit skutečná slova.',
);
add(
  home,
  'home-gh',
  'Krátký výlet ukazováčků',
  'gh',
  'gala|had|hlad|hala|hlas|hlasů|hlahol|hladů',
  [],
  'Na G se natáhne levý ukazováček z F, na H pravý z J. Potom se oba vrátí na výstupky.',
);
add(
  home,
  'home-review',
  'Celá prostřední řada',
  '',
  'sad|had|hlas|sklad|hlad|dala|klasů|gala',
  [],
  'Spojte prostřední řadu. Ještě nepotřebujete žádné písmeno z horní nebo dolní řady.',
  false,
  [0, 1, 2, 3, 4],
);

const top = '02 · Horní řada';
add(
  top,
  'top-ei',
  'Prostředníčky vzhůru',
  'ei',
  'jde|kde|je|si|se|jedl|les|sedl|dali',
  ['jak se jde', 'kde je les', 'kde je sad', 'dala si'],
  'E ovládá levý prostředníček z D, I pravý z K. Po stisku se vraťte dolů.',
);
add(
  top,
  'top-ru',
  'Ukazováčky vzhůru',
  'ru',
  'ruka|ruce|hraje|kruh|druh|sirka|radar',
  ['jak se hraje', 'kde je ruka', 'jede se', 'jak jde hra'],
  'R stiskne levý ukazováček z F, U pravý z J. Pohybuje se prst, nikoli celá ruka.',
);
add(
  top,
  'top-to',
  'Dosah uprostřed a vpravo',
  'to',
  'teta|roste|jako|hotel|kolo|letadlo|trasa|ticho',
  ['teta jde do lesa', 'tohle je hra', 'kde je to kolo', 'roste tu les'],
  'T patří levému ukazováčku, O pravému prsteníčku. Po každém stisku se vraťte domů.',
);
add(
  top,
  'top-pz',
  'Pravý okraj a české Z',
  'pz',
  'pes|pole|potok|pusa|pila|zde|zase|zrak|zisk',
  ['pes jde zase do lesa', 'u lesa je potok', 'zde je les', 'teta jde pro psa'],
  'P ovládá pravý malíček. Z je na české QWERTZ nahoře a patří pravému ukazováčku.',
);
add(
  top,
  'top-qw',
  'Vzácné Q a W',
  'qw',
  'quark|quasi|wall|walk',
  ['quark je zde', 'quasi je jako'],
  'Q ovládá levý malíček, W levý prsteníček. Jsou vzácné; krátce je procvičíme i na cizích slovech.',
);
add(
  top,
  'top-acute-u',
  'Ú vedle P',
  'ú',
  'úhel|úloha|ústa|úrok|úpal|úskalí',
  ['tohle je úloha', 'úrok je zde', 'úloha je jako hra'],
  'Ú je fyzicky v horní řadě hned vpravo od P. Stiskne ho pravý malíček.',
);

const bottom = '03 · Dolní řada';
add(
  bottom,
  'bottom-vn',
  'Ukazováčky dolů',
  'vn',
  'ven|voda|novina|vlna|vila|novela|nese|pavel|jana|ivan',
  ['jana nese vodu', 'pavel jde ven', 'iva jde do lesa', 'jana jde do kina'],
  'V ovládá levý ukazováček z F, N pravý z J. Zbytek ruky zůstává doma.',
);
add(
  bottom,
  'bottom-cm',
  'Cesta k C a M',
  'cm',
  'cesta|milan|moc|ovoce|strom|mrak|kometa|cement|molo|cela',
  ['doma je klid', 'neseme ovoce', 'cesta vede do lesa', 'milan nese ovoce'],
  'C stiskne levý prostředníček z D, M pravý ukazováček z J.',
);
add(
  bottom,
  'bottom-xb',
  'X a B bez přesunu ruky',
  'xb',
  'box|bez|bota|branka|buben|text|taxi|banka|balkon|bobr|beton|bus|web',
  ['text je vedle okna', 'bobr nese klacek', 'banka je vedle kina', 'branka vede do zahrady'],
  'X patří levému prsteníčku, B levému ukazováčku. Po stisku najděte znovu F.',
);
add(
  bottom,
  'bottom-y',
  'České Y dole',
  'y',
  'ryba|byl|my|vy|ryby|texty|boty|mraky|domy|stromy',
  ['mraky jsou nad lesem', 'boty jsou u vrat', 'texty jsou na stole', 'stromy rostou kolem vody'],
  'Y je na české QWERTZ vlevo dole. Stiskne ho levý malíček z A.',
);
add(
  bottom,
  'bottom-review',
  'Tři řady spolu',
  '',
  'web|quark|cesta|stromy|texty|zahrada',
  [
    'doma je klid a venku roste strom',
    'cesta vede kolem lesa do parku',
    'pavel nese ovoce a jana jde ven',
    'text je na stole vedle okna',
  ],
  'Teď znáte všechna základní písmena. Střídejte řady a vracejte prsty do základní polohy.',
  false,
  [15],
);

const czech = '04 · Diakritika';
add(
  czech,
  'czech-es',
  'Ě a Š',
  'ěš',
  'město|ještě|pěšky|věta|šum|šeptat|svět|větev|koště|těsto|běh|šest',
  ['ve městě je dnes klid', 'pěšina vede do lesa', 'šest stromů roste u lesa', 'ještě jsme tu'],
  'Ě a Š mají vlastní klávesy na číselné řadě. Ě stiskne levý malíček, Š levý prsteníček.',
);
add(
  czech,
  'czech-cr',
  'Č a Ř',
  'čř',
  'čaj|řeka|večer|příběh|člověk|přesto|křeslo|řeč|klíč|peří',
  [
    'čaj se nese ke stolu',
    'řeka teče kolem lesa',
    'přes cestu vede pěšina',
    'večer sejdeme k řece',
  ],
  'Č ovládá levý prostředníček, Ř levý ukazováček na číselné řadě.',
);
add(
  czech,
  'czech-zy',
  'Ž a Ý',
  'žý',
  'život|žlutý|živý|každý|nový|malý|velký|židle|žák|ryzí',
  [
    'každý nový den je dar',
    'malý krok je velký dar',
    'židle je vedle stolu',
    'důležitý je klidný rytmus',
  ],
  'Ž stiskne levý ukazováček, Ý pravý ukazováček. Netlačte ramena dopředu.',
);
add(
  czech,
  'czech-ai',
  'Á a Í',
  'áí',
  'ráno|psaní|krásná|vítá|píše|práce|místo|dává|získá|nápad',
  [
    'ráno nás vítá krásná obloha',
    'psaní dává myšlenkám nové místo',
    'nový nápad přichází během práce',
  ],
  'Á ovládá pravý prostředníček, Í pravý prsteníček na číselné řadě.',
);
add(
  czech,
  'czech-e',
  'É a známé Ú',
  'é',
  'malé|tiché|krásné|příjemné|úkol|úsměv|úterý',
  [
    'malé změny mohou přinést velký výsledek',
    'v tiché místnosti se lépe přemýšlí',
    'v úterý nás čeká nový úkol',
  ],
  'É stiskne pravý malíček. Ú už znáte z horní řady a Ů z prostřední.',
);
add(
  czech,
  'czech-dt',
  'Ď a Ť přes háček',
  'ďť',
  'loď|chuť|teď|labuť|lať|pouť|zeď|síť',
  [
    'teď máme chuť vydat se na cestu',
    'malá loď tiše pluje po řece',
    'chuť učit se roste s každým úspěchem',
  ],
  'Nejprve stiskněte háček přes Shift + klávesu s čárkou, potom D nebo T. Shift drží opačná ruka.',
);
add(
  czech,
  'czech-no',
  'Ň a Ó',
  'ňó',
  'kůň|síň|dlaň|tóny|óda|píseň|vůně',
  [
    'kůň se pase vedle staré jabloně',
    'dlaň se lehce dotkne klávesnice',
    'tiché tóny naplní prázdnou síň',
  ],
  'Ň vytvoříte háčkem a N. Pro Ó stiskněte nejprve čárku a potom O.',
);
add(
  czech,
  'czech-review',
  'Celá čeština plyne',
  '',
  '',
  [
    'každý člověk může najít vlastní způsob učení',
    'příliš žluťoučký kůň přeběhl přes mokrou louku',
    'čerstvý vzduch přináší do místnosti novou energii',
    'jemný déšť smývá prach z listů staré lípy',
  ],
  'Spojte česká písmena v přirozeném textu. Teprve teď přidáme jejich velké podoby.',
  false,
  [22],
);

const capitals = '05 · Velká písmena';
const capitalSeeds = [
  ['AJ', 'Adam|Jana', 'Adam nese ovoce|Jana píše dopis'],
  ['DK', 'Dnes|Karel', 'Dnes je venku klid|Karel jde do kina'],
  ['SL', 'Soňa|Lada', 'Soňa nese knihu|Lada jde do lesa'],
  ['FH', 'Filip|Hana', 'Filip píše poznámky|Hana vaří čaj'],
  ['GB', 'Gabriela|Brno', 'Gabriela má nový nápad|Brno je krásné město'],
  ['CE', 'Cesta|Eva', 'Cesta vede do parku|Eva čte knihu'],
  ['IM', 'Ivan|Milan', 'Ivan jde k řece|Milan přináší čaj'],
  ['NO', 'Nela|Olga', 'Nela si zapisuje nápady|Olga studuje nové téma'],
  ['PR', 'Pavel|Radka', 'Pavel pracuje na studii|Radka píše vlastní příběh'],
  ['TU', 'Tereza|Ulice', 'Tereza se učí nové věci|Ulice je dnes klidná'],
  ['VY', 'Věra|Yveta', 'Věra si připravuje poznámky|Yveta jde na procházku'],
  ['WZ', 'Wales|Zdeněk', 'Wales má krásnou krajinu|Zdeněk se učí psát'],
  ['QX', 'Quark|Xenie', 'Quark je jméno postavy|Xenie píše dopis'],
];
for (const [keys, words, phrases] of capitalSeeds)
  add(
    capitals,
    `caps-${keys}`,
    `Velká ${keys[0]} a ${keys[1]}`,
    keys,
    words,
    phrases.split('|'),
    'Základní písmeno už znáte. Velké pište se Shiftem opačné ruky. V této lekci přidáváme jen dvě velké podoby.',
  );
const capsCzech = '06 · Velká čeština';
const pairedSentences = [
  'Adam zná Janu',
  'Dnes přijde Karel',
  'Soňa potkala Ladu',
  'Filip přivítal Hanu',
  'Gabriela navštíví Brno',
  'Cesta vede za Evou',
  'Ivan volá Milanovi',
  'Nela pozdraví Olgu',
  'Pavel hledá Radku',
  'Tereza jede do Uher',
  'Věra píše Yvetě',
  'Wales láká Zdeňka',
  'Quark pobavil Xenii',
];
capitalSeeds.forEach(([keys], index) =>
  course.find((l) => l.id === `caps-${keys}`)!.sentences.unshift(pairedSentences[index]),
);
for (const [keys, words, phrases] of [
  ['ČŘ', 'ČAJ|ŘEKA', 'Čaj je připravený|Řeka teče kolem lesa'],
  ['ĚŠ', 'MĚSTO|ŠKOLA', 'MĚSTO A ŠKOLA|Škola je u parku'],
  ['ŽÝ', 'ŽIVOT|MALÝ', 'Život přináší nové příběhy|MALÝ DŮM'],
  ['ÁÍ', 'RÁNO|PÍŠE', 'RÁNO PÍŠE JANA|JANA PÍŠE RÁDA'],
  ['ÉÚ', 'MALÉ|ÚKOL', 'Úkol je hotový|MALÉ MĚSTO'],
  ['ŮĎ', 'DŮM|LOĎ', 'DŮM A LOĎ|PŘÍBĚH O DOMĚ'],
  ['ŤŇ', 'SÍŤ|KŮŇ', 'SÍŤ A KŮŇ|KŮŇ JE U ŘEKY'],
  ['Ó', 'TÓNY|ÓDA', 'TICHÉ TÓNY|ÓDA NA KLID'],
])
  add(
    capsCzech,
    `caps-czech-${keys}`,
    `Velká ${keys.split('').join(' a ')}`,
    keys,
    words,
    phrases.split('|'),
    'Přesný postup je u každého znaku. Přímé klávesy používají Caps Lock; skládané Ď, Ť, Ň a Ó háček nebo čárku a Shift. Před malým písmenem Caps Lock zase vypněte.',
  );

const punctuation = '07 · Věty a znaménka';
add(
  punctuation,
  'punct-dot-comma',
  'Tečka a čárka',
  '.,',
  'čaj,|domů.|věta,|text.',
  [
    'Ráno voní čaj, za oknem zpívají ptáci.',
    'Na stole leží kniha, zápisník a tužka.',
    'Uvolněte ramena, nadechněte se a pokračujte.',
  ],
  'Čárku stiskne pravý prostředníček, tečku pravý prsteníček. Za znaménkem patří mezera.',
  true,
);
add(
  punctuation,
  'punct-question',
  'Otazník a vykřičník',
  '?!',
  'Kde?|Proč?|Ano!|Hotovo!',
  [
    'Jak se vám dnes píše? Každý pokus se počítá!',
    'Máte chuť pokračovat? Zkuste ještě jednu větu.',
    'Už to jde lehčeji? Prsty si pomalu zvykají.',
  ],
  'Otazník a vykřičník potřebují Shift. Kombinaci vám ukáže klávesnice.',
  true,
);
add(
  punctuation,
  'punct-colon',
  'Dvojtečka a středník',
  ':;',
  'Poznámka:|Závěr:|zdroj;|text;',
  [
    'Poznámka: data ověříme později.',
    'Máme dvě možnosti; obě si zaslouží pozornost.',
    'Závěr: pravidelné krátké cvičení dává smysl.',
  ],
  'Dvojtečku vytvoříte přes Shift + tečku. Středník je vlevo od horní řady.',
  true,
);

const numbers = '08 · Čísla bez numerického bloku';
for (const pair of ['12', '34', '56', '78', '90'])
  add(
    numbers,
    `digits-${pair}`,
    `Číslice ${pair[0]} a ${pair[1]}`,
    pair,
    `${pair[0]}|${pair[1]}|${pair}|${pair[1]}${pair[0]}`,
    [`Zde jsou číslice ${pair[0]} a ${pair[1]}.`, `První sada obsahuje ${pair} položek.`],
    'Číslice pište přes Shift na horní číselné řadě. Numerický blok nepoužíváme. Rychlost se nehodnotí.',
    true,
  );

const signs = '09 · Znaky a kombinace';
for (const [keys, title, examples, phrases] of [
  ['+-', 'Plus a minus', '3+4|10-2|25+12|18-6', 'Počítáme 3+4 a 10-2.|Výrazy: 25+12, 18-6.'],
  [
    '*/',
    'Násobení a dělení',
    '2*3|12/3|8*5|40/8',
    'Výrazy: 2*3 a 12/3.|V tabulce použijte A1*B1 a A1/B1.',
  ],
  [
    '()',
    'Kulaté závorky',
    '(A1+B1)/2|(3+4)*2|(12-3)/3',
    'Výsledek (po úpravě) odpovídá odhadu.|Průměr dvou buněk: (A1+B1)/2.',
  ],
  ['<>', 'Menší a větší', 'A1<10|B1>5|3<4|8>2', 'Porovnání: A1<10, B1>5.|Čteme 3<4 a 8>2.'],
  [
    '=&',
    'Rovná se a spojování',
    '=A1+B1|=A1*B1|=A1/B1|=A1&B1',
    'Součet: =A1+B1.|Spojení buněk: =A1&B1.',
  ],
  [
    '"%',
    'Uvozovky a procenta',
    '"text"|20 %|=A1*20%|="A"&"B"',
    'Napište slovo "text".|Cena se snížila o 20 %.',
  ],
  [
    '[]',
    'Hranaté závorky',
    '[A, B]|[1, 2]|[zdroj]|[poznámka]',
    'Seznam [A, B] má dvě položky.|Zdroj [1] doplňuje závěr.',
  ],
  [
    '@_',
    'Zavináč a podtržítko',
    'jana@example.com|data_2026|poznamky_k_praci',
    'Kontakt: jana@example.com.|Soubor se jmenuje poznamky_k_praci.',
  ],
  [
    '\\|',
    'Cesty a oddělovače',
    'C:\\data\\text.txt|A|B|ano|ne',
    'Cesta k souboru: C:\\data\\text.txt.|Oddělovač: A|B.',
  ],
])
  add(
    signs,
    `signs-${title}`,
    title,
    keys,
    examples,
    phrases.split('|').filter(Boolean),
    'Používejte základní blok české klávesnice. Nápověda ukazuje levý Ctrl + levý Alt, nikoli Alt Gr. Rychlost nerozhoduje.',
    true,
  );

const pathLesson = course.find((l) => l.keys === '\\|')!;
pathLesson.words = ['C:\\data\\text.txt', 'D:\\prace\\data.csv', 'A|B', 'ano|ne'];
pathLesson.sentences = [
  'Cesta k souboru: C:\\data\\text.txt.',
  'Oddělovač: A|B. Volba: ano|ne.',
  'Záloha je v D:\\prace\\data.csv.',
];
add(
  '10 · Excel v angličtině',
  'excel-sum',
  'Součty a průměry',
  '',
  '=SUM(A1:A5)|=AVERAGE(B1:B5)|=COUNT(C1:C9)|=(A1+B1)/2',
  ['=SUM(A1:A5) =AVERAGE(B1:B5) =COUNT(C1:C9)', '=A1*B1 =(A1+B1)/2 =SUM(C1:C5)'],
  'Všechny znaky už znáte. Funkce píšeme anglicky: SUM, AVERAGE a COUNT. Bez požadavku na rychlost.',
  true,
  [30],
);
add(
  '10 · Excel v angličtině',
  'excel-if',
  'Podmínky a spojování',
  '',
  '=IF(A1>10,"yes","no")|=IF(A1<>"",A1,"empty")|="A"&"B"|=IF(B1>=0,"ok","check")',
  ['=IF(A1>10,"yes","no") ="A"&"B"', '=IF(A1<>"",A1,"empty") =IF(B1>=0,"ok","check")'],
  'Používáme IF a anglické názvy funkcí. Cílem je jistota ve znacích, ne rychlost.',
  true,
  [30],
);
add(
  '11 · Psaní pro život',
  'academic',
  'Akademický odstavec',
  '',
  '',
  [
    'Cílem této studie je porovnat výsledky jednotlivých výzkumných metod.',
    'Získaná data naznačují souvislost mezi prostředím a schopností soustředit se.',
    'Výsledky je třeba hodnotit s ohledem na velikost výzkumného souboru.',
    'Závěry práce vycházejí z kritického rozboru odborných pramenů.',
  ],
  'Oči mohou číst několik znaků napřed. Soustřeďte se na obsah a klidný rytmus.',
  false,
  [32],
);
add(
  '11 · Psaní pro život',
  'everyday',
  'Lehkost do každého dne',
  '',
  '',
  [
    'Dobrý den, posílám vám upravený text a děkuji za všechny připomínky.',
    'Rozpočet zahrnuje 3 položky: dopravu, ubytování a společný program.',
    'Až bude práce hotová, dopřejeme si chvíli odpočinku a šálek čaje.',
    'Zvládnuté hmaty vám uvolní pozornost pro nápady, otázky i vlastní příběhy.',
  ],
  'Všechny hmaty spojíme v přirozené češtině. K předchozím lekcím se můžete kdykoliv vrátit.',
  false,
  [35],
);

export const lessons = course;
export function learnedChars(index: number) {
  return (
    ' ' +
    lessons
      .slice(0, index + 1)
      .map((l) => l.keys)
      .join('')
  );
}
export function lessonRules(index: number, exercise?: LessonExercise) {
  const untimed = lessons[index]?.precision || exercise === 'touch';
  return { minCpm: untimed ? 0 : PASS_CPM, maxErrors: MAX_ERRORS, timeLimit: untimed ? null : 180 };
}
const reviewSentences = [
  'Fajfka a sad',
  'Klasů a skladů',
  'Hlad a hlas',
  'Hala je sklad',
  'Fajfka je u lesa',
  'U lesa se hraje golf',
  'U lesa je sklad klasů',
  'Filip jde do lesa',
  'Web je plný nápadů',
  'Quark je pojem z fyziky',
];
const dictionary = [
  ...new Set(
    [
      ...lessons.flatMap((l) => [...l.words, ...l.sentences.flatMap((s) => s.split(/\s+/))]),
      ...reviewSentences.flatMap((s) => s.split(/\s+/)),
    ]
      .flatMap((word) => [word, word.toLocaleLowerCase('cs')])
      .flatMap((w) => [w, w.replace(/^[.,?!:;"()[\]]+|[.,?!:;"()[\]]+$/g, '')])
      .filter(Boolean),
  ),
];
function allowed(text: string, index: number) {
  const known = learnedChars(index);
  return [...text].every((c) => known.includes(c));
}
function sentenceFor(text: string, index: number) {
  const known = learnedChars(index);
  return text
    .split(' ')
    .map((word) => {
      // Lower a whole word when its capitals have not been introduced. Keeping
      // only some capitals would turn normal words into fragments like DůM.
      const form = [...word].some((c) => c.toLocaleLowerCase('cs') !== c && !known.includes(c))
        ? word.toLocaleLowerCase('cs')
        : word;
      return [...form].filter((c) => known.includes(c) || !/[.,?!:;]/.test(c)).join('');
    })
    .join(' ');
}
function drillPool(index: number) {
  const lesson = lessons[index];
  if (!lesson.keys) {
    const review = (
      lesson.words.length
        ? lesson.words
        : lesson.sentences.map((s) => sentenceFor(s, index).split(' ').slice(0, 2).join(' '))
    ).filter((s) => allowed(s, index));
    if (review.length) return review;
  }
  const chars =
    lessons[index].keys ||
    lessons
      .slice(0, index + 1)
      .map((l) => l.keys)
      .join('')
      .slice(-2) ||
    'fj';
  const a = chars[0],
    b = chars[1] || chars[0];
  return [
    ...new Set([a + a, b + b, a + b, b + a, a + a + b + b, a + b + a, b + a + b, a + b + a + b]),
  ];
}
// Before vowels are available, connect the new pair to every earlier key.
// This pool is never used for the initial, isolated touch exercise.
function cumulativeDrillPool(index: number) {
  const fresh = lessons[index].keys || 'fj';
  const previous = [...learnedChars(index)].filter((c) => c !== ' ' && !fresh.includes(c));
  return [
    ...new Set([
      ...drillPool(index),
      ...previous.flatMap((c, i) => [
        c + fresh[i % fresh.length],
        fresh[i % fresh.length] + c,
        c + c,
      ]),
    ]),
  ];
}
const poolCache = new Map<string, string[]>();
export function lessonPool(index: number, exercise: LessonExercise = 'sentences') {
  const cacheKey = `${index}:${exercise}`;
  let pool = poolCache.get(cacheKey);
  if (!pool) {
    pool = buildLessonPool(index, exercise);
    poolCache.set(cacheKey, pool);
  }
  // Callers may sort or rotate a pool; keep the cached vocabulary immutable.
  return [...pool];
}
function buildLessonPool(index: number, exercise: LessonExercise) {
  const lesson = lessons[index] ?? lessons[0];
  if (exercise === 'touch') return drillPool(index);
  if (!lesson.keys && ![home, top, bottom, czech].includes(lesson.chapter)) {
    const own =
      exercise === 'sentences' && lesson.sentences.length
        ? lesson.sentences
        : lesson.words.length
          ? lesson.words
          : lesson.sentences.flatMap((s) => s.split(' '));
    const filtered = own
      .map((s) => sentenceFor(s, index))
      .filter((s) => s.length > 1 && allowed(s, index));
    if (filtered.length) return filtered;
  }
  const words = [
    ...new Set([...lesson.words, ...dictionary].filter((w) => w.length > 1 && allowed(w, index))),
  ];
  const sentences = [
    ...new Set(
      [...lesson.sentences, ...lessons.flatMap((l) => l.sentences), ...reviewSentences]
        .map((s) => sentenceFor(s, index))
        .filter((s) => allowed(s, index)),
    ),
  ];
  const pool = exercise === 'words' ? words : sentences.length ? sentences : words;
  return pool.length ? pool : cumulativeDrillPool(index);
}
export function exerciseLabel(index: number, exercise: LessonExercise) {
  if (exercise === 'touch') return 'Osahání kláves';
  const wordsAvailable = dictionary.some((w) => w.length > 1 && allowed(w, index));
  if (exercise === 'words')
    return wordsAvailable
      ? lessons[index].precision
        ? 'Krátké celky'
        : 'Slova'
      : 'Krátké skupiny';
  return wordsAvailable ? 'Slova a souvislosti' : 'Spojování do rytmu';
}
export function textSignature(text: string) {
  let hash = 2166136261;
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
}
// Case variants share a physical letter key. Keep current new characters exact,
// but review earlier letters naturally in words instead of forcing every capital.
const coverageCache = new Map<string, ReadonlySet<string>>();
function coverageChars(text: string) {
  let chars = coverageCache.get(text);
  if (!chars) {
    chars = new Set([...text.toLocaleLowerCase('cs')].filter((c) => c !== ' '));
    coverageCache.set(text, chars);
  }
  return chars;
}
function cumulativeText(
  index: number,
  variant: number,
  weak: string[],
  exercise: LessonExercise,
  avoid: string,
) {
  const l = lessons[index];
  const primary = lessonPool(index, exercise);
  // A missing rare letter can be reviewed in a real word, never a random suffix.
  // Topic reviews (e.g. Excel) stay within their own vocabulary.
  const general = !!l.keys || [home, top, bottom, czech].includes(l.chapter);
  const extra = exercise === 'sentences' && general ? lessonPool(index, 'words') : [];
  const pool = [...new Set([...primary, ...extra])];
  const offset = Math.abs(Math.floor(variant)) % pool.length;
  const ordered = [...pool.slice(offset), ...pool.slice(0, offset)];
  const coverage = new Map(pool.map((p) => [p, coverageChars(p)]));
  const available = new Set([...coverage.values()].flatMap((chars) => [...chars]));
  const missing = new Set([...coverageChars(learnedChars(index))].filter((c) => available.has(c)));
  const fresh = new Set([...l.keys]);
  const parts: string[] = [];
  const used = new Set<string>();
  const length = () => parts.join(' ').length;
  function append(part: string) {
    parts.push(part);
    used.add(part);
    for (const c of coverage.get(part)!) missing.delete(c);
    for (const c of part) fresh.delete(c);
  }
  function best(candidates: string[], required: Set<string>, exact = false) {
    return candidates
      .filter((p) => !used.has(p) && length() + p.length + 1 <= 380)
      .map((p, order) => ({
        p,
        order,
        score:
          [...required].filter((c) => (exact ? p.includes(c) : coverage.get(p)!.has(c))).length /
          Math.sqrt(p.length),
      }))
      .filter((v) => v.score > 0)
      .sort((a, b) => b.score - a.score || a.order - b.order)[0]?.p;
  }
  const preferred = ordered.filter((p) => primary.includes(p));
  while (fresh.size) {
    const part = best(preferred, fresh, true) ?? best(ordered, fresh, true);
    if (!part) break;
    append(part);
  }
  while (missing.size) {
    const part = best(preferred, missing) ?? best(ordered, missing);
    if (!part) break;
    append(part);
  }
  // Alternate focused practice with unrestricted review; old-only words remain
  // eligible even when a new pair or weak key is receiving extra attention.
  const focus = [...l.keys, ...weak];
  const focused = preferred.filter((p) => focus.some((c) => p.includes(c)));
  let filler = 0;
  while (length() < 115) {
    const choices = filler % 2 === 0 && focused.length ? focused : preferred;
    const part = choices[(offset + filler) % choices.length];
    if (parts.at(-1) !== part || choices.length === 1) append(part);
    filler++;
  }
  // Rotating complete words/phrases preserves meaning and varies repeat attempts.
  for (let retry = 0; retry < parts.length; retry++) {
    const start = (Math.abs(Math.floor(variant)) + retry) % parts.length;
    const text = [...parts.slice(start), ...parts.slice(0, start)].join(' ');
    if (textSignature(text) !== avoid) return text;
  }
  return `${parts.join(' ')} ${ordered[0]}`;
}
export function lessonText(
  index: number,
  variant: number,
  weak: string[] = [],
  avoid = '',
  exercise: LessonExercise = 'sentences',
): string {
  const l = lessons[index] ?? lessons[0];
  if (exercise !== 'touch') return cumulativeText(index, variant, weak, exercise, avoid);
  let pool = lessonPool(index, exercise);
  const focus = [...l.keys, ...weak];
  const relevant = pool.filter((p) => [...l.keys].some((k) => p.includes(k)));
  if (relevant.length) pool = relevant;
  pool.sort(
    (a, b) => focus.filter((k) => b.includes(k)).length - focus.filter((k) => a.includes(k)).length,
  );
  const offset = Math.abs(Math.floor(variant)) % pool.length;
  pool = [...pool.slice(offset), ...pool.slice(0, offset)];
  for (let rotation = 0; rotation < Math.max(pool.length, 2); rotation++) {
    const parts: string[] = [];
    for (let i = 0; parts.join(' ').length < (exercise === 'touch' ? 44 : 115); i++)
      parts.push(pool[(i + rotation) % pool.length]);
    for (const key of l.keys)
      if (!parts.join(' ').includes(key)) {
        const sample = [...lessonPool(index, exercise), ...lessonPool(index, 'words')].find((p) =>
          p.includes(key),
        );
        parts.unshift(sample ?? key);
      }
    const text = parts.join(' ');
    if (textSignature(text) !== avoid) return text;
  }
  return `${pool[0]} ${lessonText(index, variant + 1, weak, '', exercise)}`;
}
