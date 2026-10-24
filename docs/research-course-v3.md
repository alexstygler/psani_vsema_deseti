# Podklady pro nový kurz podle řad

Rešerše k úpravě kurzu v říjnu 2026. Cíl: přeučení i úplný začátečník na české QWERTZ, nejvýše dva nové znaky v lekci, názorné hmaty a přenos do slov a souvislostí.

## Co bylo přečteno

- **[Oficiální manuál KTouch](https://github.com/KDE/ktouch/blob/master/doc/index.docbook)**, zejména vytváření kurzů a lekcí. Doporučuje začít základní polohou, přidávat dvě nové klávesy, často jim věnovat text a přibližovat se ke skutečným slovům. Popisuje také zobrazení klávesnice a přiřazeného prstu. Manuál je produktové doporučení, nikoli experimentální důkaz univerzálně nejlepšího kurzu. Četl jsem zdroj manuálu; aktuální grafické rozhraní programu jsem nespouštěl.
- **[Oficiální README Keybr](https://github.com/aradzie/keybr.com/blob/master/README.md)**. Postupné zavádění písmen, statistiky po klávesách, zaměření na slabé znaky a vlastní cílová rychlost. Převzata je myšlenka dílčích dovedností a cíleného procvičování, nikoliv zdrojový kód či texty lekcí.
- **Choffin, Popineau, Bourda a Vie (EDM 2019): [DAS3H: Modeling Student Learning and Forgetting for Optimally Scheduling Distributed Practice of Skills](https://arxiv.org/abs/1905.06873)**. Přečetl jsem [autorskou konferenční prezentaci](https://github.com/BenoitChoffin/das3h/blob/master/slides/presentation.md), metodiku a výsledkové tabulky v [autorském repozitáři](https://github.com/BenoitChoffin/das3h). Autoři porovnávají predikci správných odpovědí na třech vzdělávacích datasetech a modelují jednotlivé dovednosti i časový průběh procvičování. Jde o matematické výukové systémy, nikoliv pokus s českým psaním. Lepší predikce není důkazem, že konkrétní rozvrh zvýší rychlost psaní. Inspirací je ukládání jednotlivých kroků a rozlišení nácviku od přenosu; aplikace DAS3H neimplementuje a netvrdí, že je učeným modelem.
- **Feit et al. (CHI 2016), How We Type**: přečetl jsem [veřejné analytické podklady studentské replikace z roku 2020](https://github.com/clara-maria-barth/P02-Quanitative), zejména R Markdown pro nové experimentální výsledky a reanalýzu původních dat. Rozlišují opis vět, náhodné znaky a smíšenou podmínku a sledují rychlost, intervaly mezi stisky, chyby a efektivitu kláves. Nejde o recenzovaný důkaz účinnosti našeho kurzu. Pro aplikaci z toho plyne obezřetnost při srovnávání rychlosti krátkých hmatů s rychlostí souvislých vět.
- **Dhakal et al. (CHI 2018), Observations on Typing from 136 Million Keystrokes**: ověřen byl [oficiální výzkumný repozitář Aalto](https://github.com/aalto-ui/136m-keystrokes), jeho README a měřicí část experimentu. Tento zdroj dokládá původ experimentálního nástroje; neuvádíme ho jako experimentální ověření našeho tréninku.

Přímé načtení časopisů/PMC a webu TypingClub odmítla zdejší síťová politika chybou CONNECT 403. Plné znění uvedených recenzovaných článků jsem z těchto stránek nestáhl. Vycházím z výše přesně uvedených dostupných materiálů; nejde o prohlídku všech současných aplikací ani o systematický přehled literatury.

## Jak se to promítá do aplikace

1. Prostřední řada → horní řada → dolní řada → diakritika. Ú a Ů se objeví už ve svých fyzických řadách. Následují velké podoby písmen, interpunkce, čísla, kombinace a práce s textem.
2. Nejvýše dva nové **skutečné znaky** v každé lekci; pravidlo platí i pro velká písmena, číslice a symboly. Každý text je omezen na už zavedené znaky, nikoli pouze na formální seznam nových kláves.
3. Ukázka fyzické klávesy, prstu, cesty ze základní polohy a potřebného Shiftu, Caps Locku, háčku či Ctrl + Alt. Nanečisto lze nový znak vyzkoušet bez měření.
4. Tři ukládané kroky: krátké osahání, slova/krátké celky a souvislosti. Osahání nemá rychlostní podmínku. V prvních třech lekcích jsou místo neexistujících českých slov přiznané krátké skupiny; od čtvrté přicházejí slova a podle známých znaků i věty.
5. Dva navazující kroky běžného psaní vyžadují celý text, 150 CPM a nejvýše tři chybné úseky. Znaménka, čísla, symboly a Excel nemají požadavek na rychlost. Tyto hranice jsou pravidla produktu zvolená s uživatelem, nikoliv prahy prokázané studií.
6. Nová varianta při opakování, krátké úlohy a návraty ke známým hmatům. Žádné sankce za vynechaný den. Souhrnným testem lze prokázat zvládnutí sekce bez všech jejích dílčích kroků.
7. Historie předchozí verze zůstává. Splnění se přenáší podle naučených znaků a významu opakování, nikoliv podle shodného čísla nově přeuspořádané lekce.

Skutečný přínos je potřeba sledovat na uživateli: přesnost, pohodlí, omezení pohledu na klávesnici a výkon na novém textu po odstupu. Tři kroky samy o sobě nezaručují naučení ani dosažení 300 CPM.
