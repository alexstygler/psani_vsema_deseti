# Lehce

Klidný, interaktivní trénink psaní všemi deseti pro českou klávesnici QWERTZ. První verze pro úplné začátečníky i lidi, kteří se chtějí zbavit starých návyků. Výchozí cíl je 300 znaků za minutu.

## Spuštění

Potřebujete Node.js 22.12+ (ověřeno na 24.19) a npm.

```sh
npm ci
npm run dev
```

V cloudovém prostředí s nezapisovatelným domovským adresářem použijte `npm ci --cache /workspace/.npm-cache`. Pracovní adresář: `/workspace/psani_vsema_deseti`. Existující checkout je izolovaný pro úlohu; nevytvářejte další worktree, pokud to uživatel výslovně nepožaduje.

## Co první verze umí

- Deset otevřených lekcí: základní poloha, řady, česká diakritika, velká písmena a znaky.
- Režim Na míru: po dokončených cvičeních zvýhodňuje věty obsahující opakovaně chybované klávesy. Seřazení statistik bere v úvahu i latenci; nejde o strojové učení.
- Běžné a akademické české texty, čísla a vzorce pro Excel, vlastní vložený text.
- Cvičení na 1, 2 nebo 5 minut; skončí i dřív při opsání celého textu. Čas se spustí až prvním znakem. Pauza tlačítkem, Escape, ztrátou fokusu a přepnutím karty.
- Nápovědu fyzických kláves a prstů pro standardní českou QWERTZ Windows/Linux. Diakritiku lze zadávat i pomocí mrtvých kláves. Pro macOS upozorňujeme na odlišné kombinace.
- Skutečné CPM, přesnost, historii a chyby podle jednotlivých kláves. Lekce je zvládnutá po opsání celého textu s přesností alespoň 95 %.
- Nastavení cíle a zařízení, omezení animací, režim soustředění, export/import zálohy.
- Responzivní rozhraní, lokální fonty včetně češtiny. Bez účtu, analytiky, externích API a povinných denních sérií.

## Ověření

```sh
npm test
npm run build
npm run test:e2e
```

E2E používá systémový Chromium v `/usr/bin/chromium`, je-li dostupný. Jinak nainstalujte browser pomocí `npx playwright install chromium`, případně nastavte `CHROMIUM_PATH` na jeho spustitelný soubor. Testy ověřují skutečné psaní, chybu a opravu, dokončení, historii po obnovení, časový limit, pauzu, složené české znaky, mobilní navigaci, export a přístupnost. Screenshoty se při vizuálním testu zapisují do `/tmp/lehce-desktop.png` a `/tmp/lehce-mobile.png`.

Pro kontrolu produkčního sestavení: `npm run preview -- --port 4173`. Výstup `dist/` lze publikovat na běžném statickém hostingu. Relativní cesty podporují i umístění pod podadresářem. GitHub Actions spouští sestavení a testy; samotný push nezveřejňuje web.

## Soukromí a omezení

Pokrok se ukládá do `localStorage` pod klíčem `lehce.progress.v1`, maximálně posledních 500 cvičení. Vlastní text se neukládá do historie ani neodesílá. Vymazání dat webu odstraní pokrok; pro přenos do jiného prohlížeče slouží JSON záloha. Pokud prohlížeč zápis odmítne, aplikace zobrazí upozornění. Rozepsané cvičení se při odchodu nebo novém začátku neukládá.

Rychlost se počítá z počtu správně opsaných znaků včetně mezer a aktivního času. Přesnost je počet správných stisků / všechny pokusy; Backspace sám není pokus. Krátká cvičení dávají jen orientační rychlost. Texty, režimy a zařízení mají rozdílnou obtížnost. Aplikace nedokáže ověřit použitý prst ani to, zda se člověk dívá na klávesnici. Pro cílené přeučování proto doporučujeme začít základní polohou a přechodně snížit rychlost.

První verze nemá synchronizaci účtů, server, multiplayer ani herní svět. Responzivní mobilní rozhraní umožňuje prohlížení; pro skutečný nácvik hmatů potřebujete fyzickou klávesnici. Nápověda nepřepíná systémové rozložení.

Návrhová východiska, zdroje a rozsah rešerše: [docs/research.md](docs/research.md).
