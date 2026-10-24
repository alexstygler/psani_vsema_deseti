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

- 36 navazujících lekcí v osmi kapitolách: základní poloha, skutečná slova, české věty, diakritika, interpunkce, čísla, Excel a akademické texty. Další lekce se odemkne až po celém textu, alespoň 150 CPM a nejvýše 3 chybných stiscích. Opakování mění text a zvýhodňuje obtížné hmaty.
- Režim Na míru: po dokončených cvičeních zvýhodňuje věty obsahující opakovaně chybované klávesy. Seřazení statistik bere v úvahu i latenci; nejde o strojové učení.
- Běžné a akademické české texty, čísla a vzorce pro Excel, vlastní vložený text.
- Cvičení na 1, 2 nebo 5 minut; skončí i dřív při opsání celého textu. Čas se spustí až prvním znakem. Pauza tlačítkem, Escape, ztrátou fokusu a přepnutím karty.
- Nápovědu fyzických kláves a prstů pro standardní českou QWERTZ Windows/Linux. Diakritiku lze zadávat i pomocí mrtvých kláves. Pro macOS upozorňujeme na odlišné kombinace.
- Skutečné CPM, přesnost, historii a chyby podle jednotlivých kláves. Lekce je zvládnutá po opsání celého textu s rychlostí alespoň 150 CPM a nejvýše 3 chybnými stisky. Každá lekce má limit 3 minuty; volný trénink zůstává nastavitelný.
- Rostoucí zahrada, lístky za skutečně opsané znaky a zvládnuté lekce, čtyři odznaky a živé úseky plynulých stisků. Žádné povinné série dní.
- Nastavení cíle a zařízení, omezení animací, režim soustředění, export/import zálohy.
- Volitelné přihlášení přes vlastní Supabase a synchronizace mezi zařízeními s řešením souběžných zápisů. [Postup připojení a publikování](docs/deployment.md).
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

Pokrok se ukládá do `localStorage` pod klíčem `lehce.progress.v1`. Historie staré verze se načte také, ale nový 36lekcový kurz má nové podmínky a dřívější volné splnění lekcí ho neodemkne. Vlastní text se neukládá do historie ani neodesílá. Vymazání dat webu odstraní pokrok; pro přenos do jiného prohlížeče slouží JSON záloha. Pokud prohlížeč zápis odmítne, aplikace zobrazí upozornění. Rozepsané cvičení se při odchodu nebo novém začátku neukládá.

Rychlost se počítá z počtu správně opsaných znaků včetně mezer a aktivního času a zobrazuje se zaokrouhlená dolů. Přesnost je počet správných stisků / všechny pokusy; Backspace sám není pokus. Krátká cvičení dávají jen orientační rychlost. Texty, režimy a zařízení mají rozdílnou obtížnost. Aplikace nedokáže ověřit použitý prst ani to, zda se člověk dívá na klávesnici. Pro cílené přeučování proto doporučujeme začít základní polohou a přechodně snížit rychlost.

Synchronizace účtů je volitelná a vyžaduje vlastní Supabase projekt s přiloženým SQL. Místní režim nemá server. Multiplayer tato verze neobsahuje. Responzivní mobilní rozhraní umožňuje prohlížení; pro skutečný nácvik hmatů potřebujete fyzickou klávesnici. Nápověda nepřepíná systémové rozložení.

Návrhová východiska, zdroje a rozsah rešerše: [docs/research.md](docs/research.md).
