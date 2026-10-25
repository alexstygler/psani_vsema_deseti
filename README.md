# Lehce

Klidný, interaktivní trénink psaní všemi deseti pro českou klávesnici QWERTZ. Aplikace pro úplné začátečníky i lidi, kteří se chtějí zbavit starých návyků. Výchozí cíl je 300 znaků za minutu.

## Chci jen otevřít aplikaci

Stáhněte si soubor **[lehce.html](lehce.html)** (na GitHubu tlačítko **Download raw file**, šipka dolů vpravo nad souborem). Potom ho otevřete dvojklikem v aktuálním Chrome, Edge nebo Firefoxu. Není potřeba nic instalovat ani spouštět server. Celá aplikace včetně písem je v tomto jediném souboru a funguje bez internetu.

Pokrok si prohlížeč ukládá lokálně. Soubor si nechávejte na stejném místě; při přesunu nebo změně prohlížeče použijte export/import zálohy v Nastavení. Data z dřívější webové adresy se do místního souboru nepřenesou automaticky. Pokud prohlížeč lokální ukládání blokuje, aplikace zobrazí upozornění.

## Spuštění

Potřebujete Node.js 22.12+ (ověřeno na 24.19) a npm.

```sh
npm ci
npm run dev
```

V cloudovém prostředí s nezapisovatelným domovským adresářem použijte `npm ci --cache /workspace/.npm-cache`. Pracovní adresář: `/workspace/psani_vsema_deseti`. Existující checkout je izolovaný pro úlohu; nevytvářejte další worktree, pokud to uživatel výslovně nepožaduje.

## Co aplikace umí

- 67 lekcí v 11 sekcích: prostřední řada, horní řada, dolní řada, diakritika, velká písmena, velká diakritika, interpunkce, čísla, symboly, Excel a souvislé texty. Každá lekce zavádí nejvýše dva skutečné nové znaky. Zadání obsahuje jen dosud zavedené znaky.
- Před novými hmaty ukáže fyzickou klávesu, příslušný prst, cestu ze základní polohy a potřebné modifikátory. Nové znaky lze vyzkoušet nanečisto. Lekce má tři samostatně ukládané kroky: osahání kláves, slova/krátké celky a souvislosti. V prvních třech lekcích jsou krátké skupiny; skutečná slova se objevují od čtvrté a věty podle dostupných znaků.
- Lekce se uzná po všech třech krocích. Osahání nemá rychlostní limit; oba navazující kroky běžného psaní vyžadují celý text, 150 CPM a nejvýše 3 chybné úseky. Interpunkce, čísla, symboly a Excel rychlost nevyžadují. Po osahání se nové klávesy míchají se všemi dříve naučenými písmeny. Před první samohláskou jsou skupiny kumulativní a uvnitř každé skupiny střídají levou a pravou ruku; od čtvrté lekce tvoří oba navazující kroky skutečná slova a dostupné věty. Opakování mění text a zvýhodňuje obtížné hmaty. Rozpracovaná lekce pokračuje prvním nesplněným krokem.
- Rozřazení do 11 oblastí uzná pouze lekce obsažené v úspěšné části a doporučí, kde pokračovat. Každá sekce má jeden souhrnný závěrečný test, který uzná její lekce i bez absolvování dílčích cvičení. Ke zvládnutým lekcím se lze vrátit. Při neúspěchu se dokončení neodebírá a další pokus vynechá předchozí zadání.
- Režim Na míru: po dokončených cvičeních zvýhodňuje věty obsahující opakovaně chybované klávesy. Seřazení statistik bere v úvahu i latenci; nejde o strojové učení.
- Běžné a akademické české texty, vlastní text a anglické funkce Excelu (SUM, IF, AVERAGE, COUNT).
- Tahák a samostatný výběr znaků `< > & / * ( ) + - "` i dalších kombinací. Nápověda používá levý Ctrl + levý Alt; všechny klávesy jsou v základním bloku české QWERTZ, bez numerické klávesnice a navigačního bloku.
- Cvičení na 1, 2 nebo 5 minut; skončí i dřív při opsání celého textu. Čas se spustí až prvním znakem. Pauza tlačítkem, Escape, ztrátou fokusu a přepnutím karty.
- Nápovědu fyzických kláves a prstů pro standardní českou QWERTZ Windows/Linux. Diakritiku lze zadávat i pomocí mrtvých kláves. Pro macOS upozorňujeme na odlišné kombinace.
- Skutečné CPM, přesnost, historii a chyby podle jednotlivých kláves. Běžné lekce vyžadují alespoň 150 CPM, celý text a nejvýše 3 chybné úseky, s limitem 3 minut. Čísla, znaky, Excel a kombinace kláves nemají časový ani rychlostní limit a neovlivňují průměr rychlosti běžného psaní.
- Rostoucí zahrada, lístky za skutečně opsané znaky a zvládnuté lekce, čtyři odznaky a živé úseky plynulých stisků. Žádné povinné série dní.
- Chyby se píší dál červeně přeškrtnuté a je nutné je smazat Backspacem. Celý nepřerušený chybný úsek do úplného smazání se počítá jako jedna chyba; přesnost stisků je samostatná metrika.
- Ovládání přes Enter: začátek, návrat z pauzy, další lekce po splnění, jinak nový pokus. Po ukázce hmatů se jednotlivé kroky rovnou připraví k psaní.
- Samostatné klávesové dovednosti: Caps Lock s velkou českou diakritikou, skutečné odstavce s Tab a Enter, opravy Backspacem a Deletem v nativním editoru. Tyto úlohy mají vlastní historii, nehodnotí se v nich CPM ani přesnost stisků. Tab se zachytává pouze v odstavcovém cvičení; Shift + Tab nebo Escape dovolují odejít.
- Nastavení cíle a zařízení, omezení animací, režim soustředění, export/import zálohy.
- Volitelné přihlášení přes vlastní Supabase, dostupné přímo v horní liště a jako druhá položka hlavní navigace. Registrace má jedno hlavní tlačítko; opětovné odeslání se ukáže teprve v navazujícím kroku a respektuje minutový odstup. Aplikace rozlišuje chybu odesílatele, omezení odesílání i existující účet a nepovažuje přijetí požadavku za důkaz doručení. Po návratu z e-mailu na úplnou adresu aplikace se automaticky přihlásí. Synchronizace mezi zařízeními řeší souběžné zápisy a zahrnuje i testy a rozřazení. [Postup připojení a publikování](docs/deployment.md).
- Responzivní rozhraní, lokální fonty včetně češtiny. Místní režim funguje bez účtu, externích API a analytiky. Supabase se kontaktuje pouze po připojení projektu. Žádné povinné denní série.

## Ověření

```sh
npm test
npm run build
npm run test:e2e
```

E2E používá systémový Chromium v `/usr/bin/chromium`, je-li dostupný. Jinak nainstalujte browser pomocí `npx playwright install chromium`, případně nastavte `CHROMIUM_PATH` na jeho spustitelný soubor. Testy ověřují skutečné psaní, chybu a opravu, dokončení, historii po obnovení, časový limit, pauzu, složené české znaky, mobilní navigaci, export a přístupnost. Screenshoty se při vizuálním testu zapisují do `/tmp/lehce-desktop.png` a `/tmp/lehce-mobile.png`.

Samostatný soubor má navíc test s vypnutou sítí: načte se jediný HTML dokument, bez dalších souborů projektu, a ověří se české psaní i historie po obnovení. Spravovaný Chromium v tomto cloudu blokuje navigaci `file://` chybou `ERR_BLOCKED_BY_ADMINISTRATOR`, proto test podává totožný dokument z paměti na testovacím HTTPS originu. Otevření dvojklikem a chování úložiště `file://` v konkrétním uživatelském prohlížeči zde přímo ověřeny nebyly.

Pro kontrolu produkčního sestavení: `npm run preview -- --port 4173`. Výstup `dist/` lze publikovat na běžném statickém hostingu. Relativní cesty podporují i umístění pod podadresářem. `npm run build` navíc vytvoří samostatný soubor `lehce.html` v kořeni projektu; při úpravách aplikace jej znovu sestavte a commitněte společně se zdroji. GitHub Actions spouští sestavení a testy; publikování vyžaduje jednorázové povolení GitHub Pages podle přiloženého postupu.

## Soukromí a omezení

Pokrok se ukládá do `localStorage` pod klíčem `lehce.progress.v1`. Historie předchozích verzí zůstává zachovaná. Dokončení z 36lekcového kurzu se automaticky přenese podle skutečně naučených znaků a obsahu opakování, nikoliv podle shodných čísel lekcí. Původní indexy jsou zachovány zvlášť. Z úplně první verze se přenáší historie, nikoliv volné dokončení s jinými podmínkami. Aktuální formát pokroku je 3; SQL schéma se nemění. Po aktualizaci obnovte aplikaci na všech zařízeních, starší klient nový formát bezpečně odmítne místo přepsání dat. Vlastní text se neukládá do historie ani neodesílá. Vymazání dat webu odstraní pokrok; pro přenos do jiného prohlížeče slouží JSON záloha. Pokud prohlížeč zápis odmítne, aplikace zobrazí upozornění. Rozepsané cvičení se při odchodu nebo novém začátku neukládá.

Rychlost se počítá z počtu správně opsaných znaků včetně mezer a aktivního času a zobrazuje se zaokrouhlená dolů. Přesnost je počet přijatých správných stisků / všechny znakové pokusy; Backspace sám není pokus. Limit tří chyb používá souvislé chybné úseky, nikoliv jejich počet písmen. Dokud není chybný úsek úplně smazán, další psaní se přidává do stejného úseku a neposouvá správně opsaný prefix. Starší historie zachovává původní způsob měření. Dovednosti editoru nemají hodnocenou přesnost a nevstupují do jejího průměru. Krátká cvičení dávají jen orientační rychlost. Texty, režimy a zařízení mají rozdílnou obtížnost. Aplikace nedokáže ověřit použitý prst ani to, zda se člověk dívá na klávesnici. Pro cílené přeučování proto doporučujeme začít základní polohou a přechodně snížit rychlost.

Synchronizace účtů je volitelná a vyžaduje vlastní Supabase projekt s přiloženým SQL. Místní režim nemá server. Multiplayer tato verze neobsahuje. Responzivní mobilní rozhraní umožňuje prohlížení; pro skutečný nácvik hmatů potřebujete fyzickou klávesnici. Nápověda nepřepíná systémové rozložení.

Podklady pro nový kurz, konkrétní přečtené materiály a omezení rešerše: [docs/research-course-v3.md](docs/research-course-v3.md). Původní návrh: [docs/research.md](docs/research.md).
