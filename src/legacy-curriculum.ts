export const COURSE_VERSION = 2;
export const PASS_CPM = 150;
export const MAX_ERRORS = 3;
// These lessons teach combinations and precision, not prose typing speed.
const precisionLessons = new Set([26, 27, 28, 29, 30, 31, 33]);
export function lessonRules(index: number) {
  return {
    minCpm: precisionLessons.has(index) ? 0 : PASS_CPM,
    maxErrors: MAX_ERRORS,
    timeLimit: precisionLessons.has(index) ? null : 180,
  };
}
type Lesson = {
  title: string;
  subtitle: string;
  chapter: string;
  keys: string;
  tip: string;
  words: string[];
  sentences: string[];
};
function lesson(
  chapter: string,
  title: string,
  keys: string,
  words: string,
  sentences: string[],
  tip: string,
): Lesson {
  return {
    chapter,
    title,
    subtitle: `${chapter} · ${keys}`,
    keys,
    words: words.split('|'),
    sentences,
    tip,
  };
}
export const lessons: Lesson[] = [
  lesson(
    '01 · Ruce doma',
    'Najděte svůj domov',
    'fj',
    'ff|jj|fj|jf|fjf|jfj|ffjj|jjff|fjj|jff|fjfj|jfjf',
    [],
    'Ukazováčky položte na výstupky F a J. První dva hmaty ještě nemohou tvořit skutečná slova.',
  ),
  lesson(
    '01 · Ruce doma',
    'Prostředníčky v rytmu',
    'dk',
    'dk|kd|df|jk|fd|kj|dfjk|kjfd|dkjf|fjdk|ddkk|kkdd',
    [],
    'D a K ovládají prostředníčky. Po stisku se vraťte do základní polohy.',
  ),
  lesson(
    '01 · Ruce doma',
    'Prsteníčky se přidávají',
    'sl',
    'sl|ls|sd|lk|sdf|jkl|sldk|fl|ds|kl|skl|fjs',
    [],
    'S a L patří prsteníčkům. Plynulost je důležitější než síla stisku.',
  ),
  lesson(
    '01 · Ruce doma',
    'První skutečná slova',
    'aů',
    'sad|dal|jak|klad|sklad|klas|skla|klasů|skladů|dala|laď|sada',
    [],
    'A a Ů ovládají malíčky. Mezeru pište palcem. Poprvé skládáme opravdová slova.',
  ),
  lesson(
    '01 · Ruce doma',
    'Hlasy základní řady',
    'gh',
    'had|hlad|hala|hlas|hlasů|hladů|dala|klad|sklad|sada|hlahol|hladká',
    [],
    'G stiskne levý ukazováček, H pravý. Celá ruka nemusí cestovat.',
  ),
  lesson(
    '01 · Ruce doma',
    'Jak se jde dál',
    'ei',
    'jde|kde|je|si|se|dala|jedl|les|sedl|jiskra|hlad|dali',
    ['jak se jde', 'kde je les', 'dala si', 'jde se', 'kde je sad', 'jak se dala'],
    'E ovládá levý prostředníček, I pravý. Krátké smysluplné obraty střídají samostatná slova.',
  ),
  lesson(
    '02 · Slova rostou',
    'Ruce mají svůj směr',
    'ru',
    'ruka|ruce|jaro|jede|hraje|hraj|kruh|druh|sirka|radar|rusalka|udělil',
    ['jak se hraje', 'kde je ruka', 'jede se', 'jak jde hra', 'jirka si hraje', 'kde je druh'],
    'R patří levému ukazováčku, U pravému. Po každém výletu se vracejte domů.',
  ),
  lesson(
    '02 · Slova rostou',
    'Ticho a klid',
    'to',
    'roste|strom|teta|radost|klid|jako|tohle|hotel|kolo|letadlo|trasa|ticho',
    [
      'tohle je les',
      'teta jde do lesa',
      'tohle je hra',
      'kde je to kolo',
      'jede se do hotelu',
      'roste tu les',
    ],
    'T a O rozšiřují horní řadu. Text už může vyprávět krátké situace.',
  ),
  lesson(
    '02 · Slova rostou',
    'Pravý okraj',
    'pú',
    'pes|pole|potok|pusa|pila|papír|úhel|úloha|ústa|úrok|úpal|úskalí',
    [
      'pes jde do lesa',
      'u lesa je potok',
      'teta jde pro psa',
      'tohle je úloha',
      'ústa jsou jako úkryt',
      'pole je u lesa',
    ],
    'P a Ú ovládá pravý malíček. Nezvedejte přitom rameno.',
  ),
  lesson(
    '02 · Slova rostou',
    'České Z nahoře',
    'wz',
    'zde|zase|ze|zdaleka|zato|zlatá|zrak|zisk|zápis|zkratka|web|zahrada',
    [
      'zde je les',
      'pes jde zase do lesa',
      'tohle je úrok ze zisku',
      'zahrada je u lesa',
      'zde se jede do hotelu',
      'zase jde o tu hru',
    ],
    'Na QWERTZ je Z nahoře. W patří levému prsteníčku.',
  ),
  lesson(
    '02 · Slova rostou',
    'Neobvyklé Q',
    'q',
    'quasi|quark|quip|q|qw|qu|qj|fq|quark|quasi|qu|qf',
    [],
    'Q je vzácné, ale má své místo pod levým malíčkem. Tady je hmatový nácvik přirozeně užitečnější než české věty.',
  ),
  lesson(
    '02 · Slova rostou',
    'Jdeme ven',
    'vn',
    'ven|voda|novina|vlna|vila|novela|nese|pavel|jana|ivan|vrata|les',
    [
      'jana nese vodu',
      'pavel jde ven',
      'iva jde do lesa',
      'venku roste les',
      'jana jde do kina',
      'u lesa stojí vila',
    ],
    'V ovládá levý ukazováček, N pravý. Základní řadu nepouštějte z paměti.',
  ),
  lesson(
    '03 · Celá klávesnice',
    'Domov pro myšlenky',
    'cm',
    'cesta|milan|moc|ovoce|strom|místo|cíl|mrak|kometa|cement|molo|cela',
    [
      'doma je klid',
      'neseme ovoce',
      'cesta vede do lesa',
      'venku roste strom',
      'milan nese ovoce',
      'marcela jde do lesa',
    ],
    'C patří levému prostředníčku, M pravému ukazováčku.',
  ),
  lesson(
    '03 · Celá klávesnice',
    'Mezi nebem a zemí',
    'xb',
    'box|bez|bota|branka|buben|text|taxi|banka|balkon|bobr|beton|bus',
    [
      'text je vedle okna',
      'bobr nese klacek',
      'banka je vedle kina',
      'bus jede do lesa',
      'venku je beton',
      'branka vede do zahrady',
    ],
    'X ovládá levý prsteníček, B levý ukazováček. Každá klávesa má svého průvodce.',
  ),
  lesson(
    '03 · Celá klávesnice',
    'Y má své místo dole',
    'y',
    'ryba|byl|my|vy|bydlo|rybník|ryby|texty|boty|mraky|domy|stromy',
    [
      'ryby jsou ve vodě',
      'mraky jsou nad lesem',
      'boty jsou u vrat',
      'texty jsou na stole',
      'stromy rostou kolem vody',
      'domy stojí vedle parku',
    ],
    'Y najdete vlevo dole pod malíčkem. V další části přidáme českou diakritiku.',
  ),
  lesson(
    '03 · Celá klávesnice',
    'Vlastní rytmus',
    '',
    '',
    [
      'doma je klid a venku roste strom',
      'cesta vede kolem lesa do parku',
      'pavel nese ovoce a jana jde ven',
      'milan jde do kina a marcela nese vodu',
      'text je na stole vedle okna',
      'zahrada je plná stromů a kolem vede cesta',
    ],
    'Spojte naučené hmaty. V této přechodové lekci už používáme běžné české věty bez velkých písmen.',
  ),
  lesson(
    '04 · Opravdu česky',
    'Měkké přistání',
    'ěš',
    'město|ještě|pěšky|věta|šum|šeptat|svět|větev|koště|těsto|běh|šest',
    [
      've městě je dnes klid',
      'pěšina vede do lesa',
      'šest stromů roste u lesa',
      've větvi se schoval kos',
      'koště je u vrat',
      'ještě jsme tu',
    ],
    'Ě a Š jsou přímo na horní číselné řadě. Nemusíte je skládat přes háček.',
  ),
  lesson(
    '04 · Opravdu česky',
    'Čerstvý příběh',
    'čř',
    'čaj|řeka|večer|příběh|člověk|přesto|křeslo|řeč|klíč|příroda|čtení|peří',
    [
      'čaj se nese ke stolu',
      'řeka teče kolem lesa',
      'přes cestu vede pěšina',
      'večer sejdeme k řece',
      'člověk jde přes most',
      'čeho se člověk lekne',
    ],
    'Č a Ř mají vlastní klávesy. Hledejte je prsty a oči nechte na textu.',
  ),
  lesson(
    '04 · Opravdu česky',
    'Život v pohybu',
    'žý',
    'život|žlutý|živý|každý|nový|malý|velký|židle|zážitek|důležitý|žák|ryzí',
    [
      'každý nový den je dar',
      'malý krok je velký dar',
      'židle je vedle stolu',
      'důležitý je klidný rytmus',
      'život kolem řeky je klidný',
      'žlutý květ je u židle',
    ],
    'Ž a Ý rozdělte mezi ukazováčky. Zkuste mezi slovy nezrychlovat skokově.',
  ),
  lesson(
    '04 · Opravdu česky',
    'Dlouhé samohlásky',
    'áíé',
    'ráno|psaní|malé|krásná|vítá|píše|práce|místo|tiché|dává|získá|nápad',
    [
      'ráno nás vítá krásná obloha',
      'psaní dává myšlenkám nové místo',
      'malé změny mohou přinést velký výsledek',
      'v tiché místnosti se lépe přemýšlí',
      'nový nápad přichází během práce',
      'krátká procházka nám dodá sílu',
    ],
    'Á, Í a É najdete vpravo na číselné řadě. Neposouvejte kvůli nim obě ruce.',
  ),
  lesson(
    '04 · Opravdu česky',
    'Úkol bez kroužení',
    'úů',
    'úkol|dům|úsměv|stůl|úterý|růst|úspěch|půda|úhel|průvodce|úvaha|původ',
    [
      'v úterý nás čeká nový úkol',
      'u domu roste několik starých stromů',
      'úsměv dokáže změnit celý den',
      'stůl je připravený pro další práci',
      'růst vyžaduje čas a trpělivost',
      'průvodce nám ukáže správný směr',
    ],
    'Ú je vedle P, Ů vedle L. Obě klávesy ovládá pravý malíček.',
  ),
  lesson(
    '04 · Opravdu česky',
    'Háček navíc',
    'ďťňó',
    'loď|chuť|kůň|síň|teď|óda|vůň|dlaň|labuť|lať|tóny|pouť',
    [
      'teď máme chuť vydat se na cestu',
      'malá loď tiše pluje po řece',
      'kůň se pase vedle staré jabloně',
      'dlaň se lehce dotkne klávesnice',
      'tiché tóny naplní prázdnou síň',
      'chuť učit se roste s každým úspěchem',
    ],
    'Pro Ď, Ť a Ň použijte háček přes Shift + klávesu s čárkou, potom základní písmeno.',
  ),
  lesson(
    '05 · Věty ožívají',
    'Čeština plyne',
    '',
    '',
    [
      'každý člověk může najít vlastní způsob učení',
      'příliš žluťoučký kůň přeběhl přes mokrou louku',
      'čerstvý vzduch přináší do místnosti novou energii',
      'příběh o přátelství začíná u řeky',
      'v zahradě se právě otevírají první květy',
      'jemný déšť smývá prach z listů staré lípy',
    ],
    'Celá čeština už je vaše. Hledejte plynulost a pohodlí, ne dokonalost na první pokus.',
  ),
  lesson(
    '05 · Věty ožívají',
    'Začátek s velkým písmenem',
    'Shift',
    '',
    [
      'Dnes začíná nový příběh',
      'Jana píše dopis svému příteli',
      'Pavel se učí psát bez koukání na ruce',
      'Česká krajina nabízí mnoho krásných míst',
      'Malé kroky vedou k velkým změnám',
      'Úterý je příjemný den pro nový začátek',
    ],
    'Velké písmeno pište se Shiftem opačné ruky. Ruka na písmenu tak zůstane volná.',
  ),
  lesson(
    '05 · Věty ožívají',
    'Tečka a čárka',
    '.,',
    '',
    [
      'Ráno voní čaj, za oknem zpívají ptáci.',
      'Psaní se zlepšuje, když mají prsty čas.',
      'Na stole leží kniha, zápisník a tužka.',
      'Cesta byla dlouhá, ale výhled stál za to.',
      'Každá věta má začátek, prostředek a konec.',
      'Uvolněte ramena, nadechněte se a pokračujte.',
    ],
    'Tečku ovládá pravý prsteníček, čárku pravý prostředníček. Po znaménku patří mezera.',
  ),
  lesson(
    '05 · Věty ožívají',
    'Otázky a odpovědi',
    '?!',
    '',
    [
      'Jak se vám dnes píše? Každý pokus se počítá!',
      'Máte chuť pokračovat? Zkuste ještě jednu větu.',
      'Kde končí cesta? Možná začíná další příběh!',
      'Co vám pomáhá soustředit se? Mně ticho a čaj.',
      'Už to jde lehčeji? Prsty si pomalu zvykají.',
      'Dokážete psát bez koukání? Dejte si čas!',
    ],
    'Otazník a vykřičník potřebují Shift. Udržte klidný rytmus i přes kombinace.',
  ),
  lesson(
    '06 · Čísla v životě',
    'Deset číslic',
    '1234567890',
    '12|34|56|78|90|2026|150|300|1250|48|365|100',
    [
      'Máme 12 knih a 34 zápisníků.',
      'V roce 2026 začínáme nový projekt.',
      'Cílem je 150 správných znaků za minutu.',
      'Na výlet se přihlásilo 28 lidí.',
      'První sada obsahuje 50 pracovních listů.',
      'V knihovně je více než 900 titulů.',
    ],
    'Číslice pište se Shiftem na horní řadě. Numerický blok není nutný.',
  ),
  lesson(
    '06 · Čísla v životě',
    'Čas, datum a procenta',
    ':%',
    '',
    [
      'Schůzka začíná v 10:30 dne 24. 10. 2026.',
      'Dnes jsme dokončili 75 % plánované práce.',
      'Vlak odjíždí v 8:15 a přijíždí v 9:40.',
      'Cena se snížila o 20 % na 480 Kč.',
      'Výsledky byly zveřejněny 15. 6. 2026.',
      'V dotazníku odpovědělo 92 % účastníků.',
    ],
    'Dvojtečku píšeme přes Shift + tečku. U procent nezapomínejte na mezeru.',
  ),
  lesson(
    '06 · Čísla v životě',
    'Počítání bez hledání',
    '<>&/*()+-\"=',
    'A1<10|B1>5|A1<=B1|A1>=0|A1<>B1|=A1*B1|=(A1+B1)/2|=A1-B1|="A"&"B"|3+4=7|12/3=4|"text"',
    [],
    'Hvězdička na českém Windows/Linux: Ctrl + Alt + pomlčka. Použijte základní blok, nikoliv numerickou klávesnici.',
  ),
  lesson(
    '06 · Čísla v životě',
    'Závorky drží myšlenku',
    '()[]',
    '',
    [
      'Výsledek (po úpravě) odpovídá původnímu odhadu.',
      'Průměrná hodnota (n = 24) činila 18 bodů.',
      'Seznam [A, B, C] obsahuje tři položky.',
      'Vzorec =(A1+B1)/2 vypočítá průměr dvou buněk.',
      'Poznámka (viz kapitola 3) doplňuje celý výklad.',
      'Závěr [1] navazuje na předchozí studii.',
    ],
    'Kulaté závorky jsou u P, hranaté na Ctrl + Alt + F a Ctrl + Alt + G ve standardní české QWERTZ.',
  ),
  lesson(
    '07 · Psaní pro práci',
    'Excel pod prsty',
    '=SUM',
    '=SUM(A1:A5)|=AVERAGE(B1:B5)|=IF(A1>10,"yes","no")|=COUNT(C1:C9)|=IF(A1<>"",A1,"empty")|="A"&"B"|=(A1+B1)/2|=A1*B1',
    [],
    'Vzorce jsou smysluplné celky, i když nejsou větami. Trénujte jejich rytmus jako známou frázi.',
  ),
  lesson(
    '07 · Psaní pro práci',
    'Adresa a kontakt',
    '@_',
    '',
    [
      'Kontakt: jana.novakova@example.com',
      'Soubor se jmenuje vysledky_studie_2026.',
      'Adresa projektu: info@example.org',
      'Otevřete dokument poznamky_k_praci.',
      'Nové dotazy posílejte na podpora@example.com',
      'Záloha dat má název data_pro_analyzu.',
    ],
    'Zavináč na české QWERTZ Windows/Linux: Ctrl + Alt + V. Podtržítko: Shift + pomlčka.',
  ),
  lesson(
    '07 · Psaní pro práci',
    'Akademický odstavec',
    '',
    '',
    [
      'Cílem této studie je porovnat výsledky jednotlivých výzkumných metod.',
      'Získaná data naznačují souvislost mezi prostředím a schopností soustředit se.',
      'V následující kapitole se zaměříme na interpretaci pozorovaných jevů.',
      'Výsledky je třeba hodnotit s ohledem na velikost výzkumného souboru.',
      'Závěry práce vycházejí z kritického rozboru odborných pramenů.',
      'Předpokládaný vztah mezi proměnnými vyžaduje další empirické ověření.',
    ],
    'Pište po významových celcích. Oči mohou číst o několik znaků napřed.',
  ),
  lesson(
    '07 · Psaní pro práci',
    'Citace a poznámky',
    '";',
    '',
    [
      'Autor uvádí: "Výsledky vyžadují další ověření."',
      'Vzorek tvořilo 48 osob; 25 žen a 23 mužů.',
      'Srovnání vychází ze studie (Novák, 2024).',
      'Pojem "pracovní paměť" používáme v obvyklém významu.',
      'Data pocházejí ze dvou zdrojů; oba byly ověřeny.',
      'Podrobnosti uvádí kapitola 3 (s. 24-28).',
    ],
    'Znaménka si zaslouží stejný klid jako písmena. Uvozovky zde trénujeme v jednoduchém rovném tvaru.',
  ),
  lesson(
    '08 · Vlastní lehkost',
    'Dlouhá myšlenka',
    '',
    '',
    [
      'Když si člověk osvojí správné návyky, může se při psaní více soustředit na obsah a méně na hledání jednotlivých kláves.',
      'Pravidelné krátké pokusy dávají větší smysl než dlouhé cvičení, které končí únavou a zbytečnou frustrací.',
      'Pokrok někdy znamená vyšší rychlost a jindy jen příjemnější pocit z toho, že ruce našly správné místo.',
      'Vědecká práce vyžaduje soustředění, ale také schopnost odpočívat a vracet se k textu s čerstvým pohledem.',
      'Při učení nových dovedností je užitečné rozdělit velký cíl na malé části, které lze postupně zvládnout.',
      'Klidné prostředí pomáhá vnímat vlastní rytmus a zachovat přesnost i v okamžiku, kdy text obsahuje obtížnější slova.',
    ],
    'Dlouhou větu rozdělte v hlavě na kratší celky. Nezadržujte při psaní dech.',
  ),
  lesson(
    '08 · Vlastní lehkost',
    'Lehkost do každého dne',
    '',
    '',
    [
      'Dobrý den, posílám vám upravený text a děkuji za všechny připomínky.',
      'Rozpočet zahrnuje 3 položky: dopravu, ubytování a společný program.',
      'Výsledek součtu ještě porovnáme s původním odhadem.',
      'Až bude práce hotová, dopřejeme si chvíli odpočinku a šálek čaje.',
      'Zvládnuté hmaty vám uvolní pozornost pro nápady, otázky i vlastní příběhy.',
      'Nejdůležitější není dokonalý den, ale chuť se po nějaké době zase vrátit.',
    ],
    'Závěrečná zastávka spojuje češtinu, čísla a znaménka. Dál můžete zvyšovat svůj osobní cíl.',
  ),
];

// Keep the first lessons strictly within the keys taught so far. Later lessons
// deliberately switch to natural Czech rather than pretending restricted keys
// can form every grammatically correct sentence.
const controlledCount = 22;
export function lessonPool(index: number) {
  const l = lessons[index] ?? lessons[0];
  const learned =
    lessons
      .slice(0, index + 1)
      .map((v) => v.keys)
      .join('') + ' ';
  const filter = (v: string) =>
    index >= controlledCount || [...v].every((c) => learned.includes(c));
  let pool = l.sentences.filter(filter).filter(Boolean);
  if (pool.length > 0 && pool.length < 3)
    pool = [...pool, ...l.words.filter(filter).filter(Boolean)];
  if (!pool.length) pool = l.words.filter(filter).filter(Boolean);
  if (!pool.length) throw new Error(`Lesson ${index + 1} has no text within its taught keys`);
  return [...new Set(pool)];
}

export function textSignature(text: string) {
  let hash = 2166136261;
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
}

export function lessonText(index: number, variant: number, weak: string[] = [], avoid = '') {
  let pool = lessonPool(index);
  variant = Math.abs(Math.floor(variant));
  if (weak.length) {
    // Stable prioritization retains variation among equally relevant phrases.
    const offset = Math.abs(variant) % pool.length;
    pool = [...pool.slice(offset), ...pool.slice(0, offset)];
    pool.sort(
      (a, b) => weak.filter((k) => b.includes(k)).length - weak.filter((k) => a.includes(k)).length,
    );
    const best = pool.slice(0, Math.min(4, pool.length));
    pool = [
      ...best.slice(variant % best.length),
      ...best.slice(0, variant % best.length),
      ...pool.slice(best.length),
    ];
  } else {
    const offset = Math.abs(variant) % pool.length;
    pool = [...pool.slice(offset), ...pool.slice(0, offset)];
  }
  // Try each rotation, including when weak-key priority changes between attempts.
  // Comparing the previous text prevents a retry from cycling back to the same task.
  for (let rotation = 0; rotation < pool.length; rotation++) {
    const parts: string[] = [];
    let length = 0;
    for (let i = 0; length < 115 && i < 100; i++) {
      const part = pool[(i + rotation) % pool.length];
      parts.push(part);
      length += part.length + 1;
    }
    const text = parts.join(' ').trim();
    if (textSignature(text) !== avoid || rotation === pool.length - 1) return text;
  }
  return '';
}
