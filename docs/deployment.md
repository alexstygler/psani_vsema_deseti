# Web na více zařízeních

Zvolené řešení: statický web na GitHub Pages a soukromý pokrok v Supabase. Obě služby mají bezplatnou variantu; jejich limity, podmínky a dostupnost určuje poskytovatel. GitHub Pages je zdarma pro veřejné repozitáře; u soukromého repozitáře ověřte svůj GitHub tarif. Free projekt Supabase může být při neaktivitě pozastaven. Offline lokální režim zůstává funkční.

Web lze zveřejnit hned bez Supabase. Pro první publikování stačí krok 2: povolte GitHub Pages a spusťte workflow. Bez proměnných Supabase poběží plnohodnotně místní režim; synchronizaci připojíte později.

## 1. Připravte svůj Supabase projekt

1. V Supabase otevřete **SQL Editor → New query**, vložte celý obsah [supabase/schema.sql](../supabase/schema.sql) a spusťte **Run**. SQL je opakovatelné a nepřepisuje existující výsledky.
2. V **Authentication → Providers** povolte přihlášení e-mailem a heslem. Při zapnutém potvrzování e-mailu uživatel nejprve potvrdí registrační zprávu a potom se v aplikaci přihlásí. Existující účet může použít rovnou.
3. Z **Settings → API / API Keys** vezměte **Project URL** a **Publishable key**, případně starší klíč **anon/public**. To jsou veřejné údaje určené do prohlížeče. **Nikdy nepoužívejte service_role, sb_secret ani databázové heslo.**
4. Pro veřejný web nastavte v **Authentication → URL Configuration** svou skutečnou adresu webu jako Site URL. Aplikace používá e-mail a heslo, nikoliv OAuth přesměrování.

## 2. Zapněte GitHub Pages

1. V repozitáři `alexstygler/psani_vsema_deseti` otevřete **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. V **Settings → Secrets and variables → Actions → Variables** pro synchronizaci volitelně přidejte veřejné proměnné `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` z předchozího kroku. Nejsou to tajné serverové klíče; výsledný web je bude obsahovat.
3. Otevřete **Actions → Publikovat Lehce na GitHub Pages → Run workflow**. Další změny na `main` se publikují automaticky. Výslednou veřejnou adresu vypíše úspěšná úloha `deploy`; samotný commit nedokazuje úspěšné nasazení.

Pokud nebyl změněn název repozitáře ani vlastní doména, očekávaná adresa je `https://alexstygler.github.io/psani_vsema_deseti/`. **Toto je očekávaná adresa, nikoliv potvrzení dostupnosti.** V tomto cloudovém prostředí je GitHub REST API blokováno síťovou politikou, takže zapnutí Pages a stav nasazení musí potvrdit nastavení repozitáře a úspěšný běh Actions.

## 3. Připojte zařízení

Otevřete stejnou veřejnou adresu na obou zařízeních. V **Nastavení → Stejná zahrada. Na každém zařízení.** se přihlaste ke stejnému e-mailu. Při prvním přihlášení můžete výslovně přenést aktuální místní pokrok do účtu. Účty mají oddělené místní cache a databáze povoluje přístup jen k řádku přihlášeného uživatele.

Pokud jste veřejné údaje nenastavili při sestavení, můžete je zadat v Nastavení na každém zařízení ručně. To funguje také v samostatném `lehce.html`; pro synchronizaci samozřejmě potřebujete připojení k internetu. Web na jedné adrese je praktičtější kvůli stálému úložišti a aktualizacím.

Po dokončení cvičení proběhne synchronizace, dále při návratu do okna a každých 20 sekund. Při výpadku se cvičí lokálně. Po připojení se nové výsledky sloučí podle jedinečných ID; kontrola revize řeší souběžné zápisy bez přepsání druhého zařízení. Klávesnice a ostatní nastavení zůstávají místní pro každé zařízení. Rozepsané cvičení se nepřenáší.

## Data a údržba

- Na server se ukládají výsledky, statistiky kláves a postup, nikoliv opisovaný vlastní text. Heslo spravuje Supabase Auth; není součástí exportu pokroku.
- Přenos používá HTTPS. Databáze má Row Level Security a anonymní čtení je zakázané. Správce vašeho Supabase projektu má k uloženým datům přístup; nejde o koncové šifrování.
- Odhlášení odpojí jen dané zařízení. Cloudový účet a jeho data zůstanou zachované.
- Místní reset při připojeném účtu nemůže vymazat cloudovou historii: při dalším načtení se výsledky vrátí. Pro úplné smazání nejprve odhlaste všechna zařízení, potom v Supabase Auth smažte daného uživatele; řádek pokroku se smaže přes `on delete cascade`. Odstraňte také místní cache/zálohy na vlastních zařízeních.
- Pravidelně používejte JSON zálohu v Nastavení. Synchronizace zachovává pokusy, není to archivace proti smazání celého projektu.
- Pro heslo použijte stávající Supabase účet, nebo registraci v aplikaci. Samoobslužné zapomenuté heslo tato verze neobsahuje; obnovu musí vyřešit správce projektu.

## Co je otestováno

PostgreSQL pravidla jsou vykonána v lokálním PGlite testu s anonymní rolí a dvěma odlišnými uživateli. Slučování a konflikty jsou pokryté testy. Dva prohlížeče se v integračním testu přihlásí přes simulované Supabase HTTP odpovědi, uloží různá cvičení a přečtou sjednocenou historii. To nenahrazuje ověření vašeho živého projektu. To vyžaduje jeho veřejnou URL/klíč a skutečně spuštěné SQL. Přihlášení a produkční přenos se proto mají ověřit na obou vašich zařízeních po připojení projektu.
