# Web na více zařízeních

Zvolené řešení: statický web na GitHub Pages a soukromý pokrok v Supabase. Obě služby mají bezplatnou variantu; jejich limity, podmínky a dostupnost určuje poskytovatel. GitHub Pages je zdarma pro veřejné repozitáře; u soukromého repozitáře ověřte svůj GitHub tarif. Free projekt Supabase může být při neaktivitě pozastaven. Offline lokální režim zůstává funkční.

Web lze zveřejnit hned bez Supabase. Pro první publikování stačí krok 2: povolte GitHub Pages a spusťte workflow. Bez proměnných Supabase poběží plnohodnotně místní režim; synchronizaci připojíte později.

## 1. Připravte svůj Supabase projekt

1. V Supabase otevřete **SQL Editor → New query**, vložte celý obsah [supabase/schema.sql](../supabase/schema.sql) a spusťte **Run**. SQL je opakovatelné a nepřepisuje existující výsledky.
2. V **Authentication → Providers** povolte přihlášení e-mailem a heslem. Při zapnutém potvrzování e-mailu uživatel nejprve potvrdí registrační zprávu; návrat na aplikaci načte přihlášení. Existující účet může použít rovnou.
3. Z **Settings → API / API Keys** vezměte **Project URL** a **Publishable key**, případně starší klíč **anon/public**. To jsou veřejné údaje určené do prohlížeče. **Nikdy nepoužívejte service_role, sb_secret ani databázové heslo.**
4. V **Authentication → URL Configuration** nastavte **Site URL** na `https://alexstygler.github.io/psani_vsema_deseti/` a stejnou úplnou adresu přidejte do **Redirect URLs**. Pokud hostujete jinde, nahraďte ji skutečnou adresou aplikace. Samotné `https://alexstygler.github.io/` je jiný web a vrací 404. Aplikace při registraci i opětovném odeslání potvrzení předává adresu aktuálního dokumentu a po návratu načte přihlášení z odkazu.
5. Pokud jste měnili šablonu **Confirm signup**, ponechte odkaz `{{ .ConfirmationURL }}`. Ten nejprve ověří e-mail u Supabase a pak vrátí uživatele do aplikace. Vlastní cestu typu `/auth/confirm` tato statická aplikace nepotřebuje. Po opravě adresy použijte nový ověřovací e-mail. Odesílání pro veřejné registrace vyžaduje vlastní SMTP, výchozí odesílání Supabase má omezení.

## Když ověřovací zpráva nepřichází

Registrace a přihlášení mají vždy jen jedno hlavní tlačítko. Přepnutí mezi nimi je textový odkaz pod formulářem. Po přijetí registračního požadavku se ukáže samostatný krok s adresou a tlačítkem **Nic mi nepřišlo, poslat ještě jednou**, dostupným po minutě. Odkaz, který vypršel, nebo přihlášení nepotvrzeného účtu otevře tento krok s prvním tlačítkem **Poslat ověřovací e-mail**. Nezobrazují se současně další dvě alternativní akce ve stejném formuláři.

- Účet ručně založený a potvrzený v Supabase další ověřovací zprávu nepotřebuje. Použijte **Přihlásit a synchronizovat** a heslo tohoto účtu. Opakovaná registrace stejné potvrzené adresy může vrátit úspěšnou odpověď bez odeslání zprávy. Pokud Supabase vrátí obfuskovaného uživatele s prázdnými identitami, aplikace nabídne přihlášení a nehlásí odeslání.
- Přijetí požadavku službou není důkaz doručení do schránky. Zkontrolujte adresu, spam a nastavení odesílatele. Prázdné chybové záznamy samy o sobě neprokazují doručení.
- Výchozí odesílatel Supabase je omezený na testování a autorizované adresy. Pro registraci veřejnosti připojte vlastní odesílání v **Authentication → Email → SMTP Settings**. Vlastní doména webu není podmínkou; ověření odesílatele se řídí pravidly zvolené e-mailové služby.
- Pokud služba odmítne požadavek, aplikace zobrazí český důvod a pod **Podrobnosti pro správce** pouze kód a HTTP stav. `over_email_send_rate_limit` / HTTP 429 znamená limit odesílání; chyba SMTP nebo `Error sending confirmation email` vyžaduje kontrolu odesílatele. Záznamy hledejte v Supabase **Authentication → Logs** a případně v záznamech použité e-mailové služby. Automatické testy používají simulované odpovědi a neověřují skutečné doručení z konkrétního projektu.

## 2. Zapněte GitHub Pages

1. V repozitáři `alexstygler/psani_vsema_deseti` otevřete **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. V **Settings → Secrets and variables → Actions → Variables** pro synchronizaci volitelně přidejte veřejné proměnné `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` z předchozího kroku. Nejsou to tajné serverové klíče; výsledný web je bude obsahovat.
3. Otevřete **Actions → Publikovat Lehce na GitHub Pages → Run workflow**. Další změny na `main` se publikují automaticky. Úloha `deploy` po publikování provede skutečné HTTP požadavky na veřejnou stránku, JavaScript a CSS a ověří verzi aplikace. Výsledek i adresa jsou v souhrnu běhu pod „Veřejný web ověřen“. Samotný commit nedokazuje úspěšné nasazení.

Pokud nebyl změněn název repozitáře ani vlastní doména, očekávaná adresa je `https://alexstygler.github.io/psani_vsema_deseti/`. **Toto je očekávaná adresa, nikoliv potvrzení dostupnosti.** V tomto cloudovém prostředí je GitHub REST API blokováno síťovou politikou, takže zapnutí Pages a stav nasazení musí potvrdit nastavení repozitáře a úspěšný běh Actions.

## 3. Připojte zařízení

Otevřete stejnou veřejnou adresu na obou zařízeních. Přes výrazné tlačítko **Přihlásit / Vytvořit účet** v horní liště otevřete stránku účtu (po přihlášení **Můj účet**). Přihlaste se ke stejnému e-mailu. Při prvním přihlášení můžete výslovně přenést aktuální místní pokrok do účtu. Při registraci se tato volba zachová i do potvrzení e-mailu ve stejném prohlížeči. Účty mají oddělené místní cache a databáze povoluje přístup jen k řádku přihlášeného uživatele. Účet je také druhou položkou levé navigace, přímo pod Procvičováním, a zůstává dostupný v Nastavení.

Pokud jste veřejné údaje nenastavili při sestavení, můžete je zadat v Nastavení na každém zařízení ručně. To funguje také v samostatném `lehce.html`; pro synchronizaci samozřejmě potřebujete připojení k internetu. Web na jedné adrese je praktičtější kvůli stálému úložišti a aktualizacím.

Po dokončení cvičení proběhne synchronizace, dále při návratu do okna a každých 20 sekund. Přenášejí se také závěrečné testy a rozřazení včetně uznaných lekcí. Při výpadku se cvičí lokálně. Po připojení se nové výsledky sloučí podle jedinečných ID; kontrola revize řeší souběžné zápisy bez přepsání druhého zařízení. Klávesnice a ostatní nastavení zůstávají místní pro každé zařízení. Rozepsané cvičení se nepřenáší.

## Aktualizace kurzu 0.6

Kurz má nyní 67 lekcí v 11 sekcích a každá lekce tři ukládané kroky. Formát pokroku se automaticky převádí z verze 2 na verzi 3. Historie zůstává a dokončení se mapuje podle naučených znaků, protože pořadí lekcí se změnilo. Není potřeba spouštět nové SQL ani měnit přihlášení či nastavení Supabase.

Po vydání obnovte stránku na všech zařízeních. Starý klient formát 3 odmítne a nepřepíše ho; synchronizace se obnoví po načtení nové aplikace. Pro jistotu lze před aktualizací exportovat JSON zálohu v Nastavení. Nový klient umí načíst i starší zálohy.

## Data a údržba

- Na server se ukládají výsledky, statistiky kláves a postup, nikoliv opisovaný vlastní text. Heslo spravuje Supabase Auth; není součástí exportu pokroku.
- Přenos používá HTTPS. Databáze má Row Level Security a anonymní čtení je zakázané. Správce vašeho Supabase projektu má k uloženým datům přístup; nejde o koncové šifrování.
- Odhlášení odpojí jen dané zařízení. Cloudový účet a jeho data zůstanou zachované.
- Místní reset při připojeném účtu nemůže vymazat cloudovou historii: při dalším načtení se výsledky vrátí. Pro úplné smazání nejprve odhlaste všechna zařízení, potom v Supabase Auth smažte daného uživatele; řádek pokroku se smaže přes `on delete cascade`. Odstraňte také místní cache/zálohy na vlastních zařízeních.
- Pravidelně používejte JSON zálohu v Nastavení. Synchronizace zachovává pokusy, není to archivace proti smazání celého projektu.
- Pro heslo použijte stávající Supabase účet, nebo registraci v aplikaci. Samoobslužné zapomenuté heslo tato verze neobsahuje; obnovu musí vyřešit správce projektu.

## Co je otestováno

PostgreSQL pravidla jsou vykonána v lokálním PGlite testu s anonymní rolí a dvěma odlišnými uživateli. Slučování a konflikty jsou pokryté testy. Dva prohlížeče se v integračním testu přihlásí přes simulované Supabase HTTP odpovědi, uloží různá cvičení a přečtou sjednocenou historii. To nenahrazuje ověření vašeho živého projektu. To vyžaduje jeho veřejnou URL/klíč a skutečně spuštěné SQL. Přihlášení a produkční přenos se proto mají ověřit na obou vašich zařízeních po připojení projektu.
