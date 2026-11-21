# Ellenőrzési napló · 2026-11-07

## Kiindulás

- GitHub: `ngynrbrt-prog/szuper-titkos-szovetseg`, `main`, kiinduló commit: `85fcf6f77094decf45013312db1629c9dd449203`.
- Supabase: `lpjgrmfzteuwjgrcgxqa`, aktív, PostgreSQL 17.11.
- A v0.7 ZIP mind a hat fájljának Git blob-hash-e pontosan egyezett a repó kiinduló fájljaival. A PIN-ek olvasható formában, a játékállapot helyi böngészőtárban tárolódott; az adminműveletekhez nem volt valódi jogosultság-ellenőrzés. Ezeket a megoldásokat a szerveroldali rendszer váltotta fel.
- A multiplayer v1 ZIP nem volt elérhető; a tulajdonos megerősítette, hogy nála sincs meg. A tartalmát nem auditáltuk.
- Az adatbázisban már léteztek a játék táblái és PIN-függvényei, de nem volt játékos vagy játék. A `player-auth` v6 regisztrációja és belépése tiltva volt, és CORS-kezelést sem tartalmazott.

## Telepített változások

- Meghívós regisztráció, egyszer használható, hashként tárolt meghívóval; külön privát adminmeghívó.
- Névnormalizálás és kis/nagybetűtől független egyediség, hatfős tranzakciós korlát, PIN-zárolás.
- Élő Auth- és session-ellenőrzés; közvetlen kliensadatbázis-hozzáférés tiltva.
- Tranzakcióban kezelt tárgyfelvétel, rablás, Mordor, Sauron, visszaszerzés, pontozás, lezárás és archívum.
- Hat gyűrű, negyven drágakő, admin által kijelölt helyszínek és útvonal, teljes mobilos navigáció.
- Hét hiányzó idegenkulcs-index hozzáadva.
- A korábbi kódból örökölt 96 karakteres belső jelszó 64 karakteres kriptográfiai véletlenre javítva; az előbbit az Auth 72 karakteres korlátja elutasította.

## Igazolt adatbázistesztek

A `tests/database.sql` 21 sikeres ellenőrzése, a végén `ROLLBACK`:

1. Adminmeghívó adminjogot ad.
2. A meghívó újrahasználata tiltott.
3. Helyes PIN és kis/nagybetűtől független belépés.
4. Öt hibás PIN után zárolás.
5. Játékos nem készíthet meghívót.
6. Hiányzó/visszavont session tiltása.
7. Pontosan hat gyűrű és negyven drágakő.
8. Már felvett tárgy másodszor nem vehető fel.
9. Rablás átadja a tulajdonjogot.
10. Visszarablási védelem.
11. Mordor-megsemmisítés és pontjóváírás.
12. Távoli tárgyfelvétel tiltása.
13. Elavult GPS tiltása.
14. Leállított helymegosztás elrejtése.
15. Sauron gyűrűlopása az időfeltételek után.
16. Gyűrű visszaszerzése.
17. Lezárás és győztes mentése.
18. Anonim táblaolvasás tiltása.
19. Authenticated szerepkör közvetlen játékműveletének tiltása.
20. Hetedik játékos regisztrációjának tiltása.
21. Nulla hosszúságú Sauron-útvonal tiltása.

A teszt véletlenül kiválasztott távoli tárgyát determinisztikus közeli tárgyra cseréltük; az időteszt a szigorú „30 perc után” feltételhez egy másodpercet hagy rá. Ezek tesztadat-javítások voltak.

## Igazolt éles HTTP-tesztek

- Belépés nélküli `game-api`: HTTP 401.
- Meghívós regisztráció ékezetes karakternévvel: HTTP 200.
- PIN-es belépés és valódi Supabase-munkamenet létrehozása: HTTP 200.
- Bejelentkezett `state`: HTTP 200; helyes karakter és adminjog, üres induló játékállapot.
- A böngésző JavaScript-fájljainak szintaxisa ellenőrizve.
- Két egyidejű éles tárgyfelvételi kérés: pontosan egy HTTP 200 és egy HTTP 400; nem jött létre dupla tulajdon.
- Böngészős belépés és kijelentkezés igazolva; az Auth üres HTTP 204 válaszának kezelése javítva.
- 390 × 844 méretű mobilnézetben a térkép, hátizsák, szövetség, eredmények és adminfelület megvizsgálva. A szerkesztőben helyszín hozzáadása és visszavonása működött. A próba adminból lezárult.
- A térképcsempék sikeresen betöltődtek. A Referer-kezelést és a szolgáltató URL-jét az [OSM szabályzatához](https://operations.osmfoundation.org/policies/tiles/) igazítottuk; verzióztuk a kliensfájlokat, hogy a gyorsítótár ne keverjen régi és új fájlokat.
- A `tests/gps.test.cjs` célzott tesztje igazolta az álló készülék friss GPS-lekérését, a mérési időzítő törlését és a leállítás után érkező késői mérés elutasítását. Ez nem valódi telefonos GPS-próba.
- A próba végén ellenőrzött állapot: 0 játékos, 0 játék, 0 Auth-felhasználó; 1 fel nem használt privát adminmeghívó. A tesztfiók és minden próbajáték-adat eltávolítva.

## Biztonsági tanácsadó

A Supabase security advisor nem jelzett WARN/ERROR szintű hibát. INFO szinten a policy nélküli, RLS-sel védett táblákat jelzi. Ez a választott szerveroldali felépítés szándékos alapértelmezett tiltása; az anon/authenticated táblaengedélyei is vissza vannak vonva. Kapcsolódó magyarázat: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

A teljesítmény-ellenőrzés két új privát idegenkulcs-index hiányát és egy duplikált auth-indexet jelzett; ezeket javítottuk. Az ismételt vizsgálat már csak INFO szintű, még nem használt indexeket jelzett.

## Határok és kézi elfogadás

- Valódi, többtelefonos kültéri GPS-próba szükséges. A szimulált koordináták és az adatbázistesztek ezt nem helyettesítik.
- Az adminnak a kiválasztott város helyszíneit és a teljes útvonalszakaszokat a valóságban ellenőriznie kell. Nem állítjuk, hogy automatikusan biztonságos közterületet választottunk.
- Sauron jóváhagyott útvonalon járőrözik; dinamikus utcahálózati célpontüldözés nincs. Eseményei friss kérésekkor értékelődnek ki; nem háttérben követi a kikapcsolt telefonokat.
- A fantáziaképességek díszítő jellegűek. A hiányzó v1 ZIP-ből származó ismeretlen szabályokat nem állítjuk rekonstruáltnak.
- A böngésző helyadata manipulálható. Nincs operációs rendszer által hitelesített helymeghatározás.
- Az admin a személyes PIN-jét maga választja az első regisztrációnál. A privát adminmeghívó nem került GitHubra.

## 1.2 · Meghívó nélküli regisztráció

A tulajdonos kérésére megszűnt a meghívókövetelmény. A regisztráció továbbra is hat karakterre korlátozott, és kizárólag normál játékost hoz létre. A PIN-zárolás, szerveroldali korlátok és az adminjogok ellenőrzése megmaradt. A helyi fájl az online oldalra irányít. A `tests/open-registration.sql` visszavont tranzakcióban ellenőrizte a meghívó nélküli regisztrációt, a PIN-t, az adminjog megtagadását és a közvetlen kliens-RPC tiltását.

## 1.3 · Világos felület és Sauron észlelései

A tulajdonos kérésére a felület fehér alapot, zöld vezérlőket és arany kiemeléseket kapott. Az eredeti v0.7 fekete sisak SVG-je visszakerült. A játék elindítása előtt – bejelentkezés nélkül és után is – Sauron más kontinensen jelenik meg, és az észlelés közös, kétórás időablakokban változik. A térképen külön Sauron-fókusz gomb és állandó méretű, minden zoomszinten látható sisakjelölő van. Az aktív játék szerver által rejtett pozícióját a felület továbbra sem helyettesíti kitalált hellyel. A `tests/map-model.test.cjs` ellenőrzi az észlelés folytonosságát, a kétórás változást, a más kontinenseket, a játék előkészületét, az élő pozíciót és a rejtőzést.

Az éles 1.3 felületet 1280 × 900 és 390 × 844 nézetben ellenőriztük. A már bejelentkezett karakterrel, valamint egy külön, kijelentkezett böngészőfülön is ugyanaz az ázsiai észlelés jelent meg. Világméretű és közeli nagyításnál a sisak mérete változatlan maradt; a Sauron mutatása gomb működött. Mobilon a dokumentum nem lógott túl vízszintesen. A regisztrációs oldal is világos megjelenést kapott. A fő szövegszínek ellenőrzött kontrasztaránya legalább 4,5:1. A kétórás váltást időparaméteres teszt ellenőrizte, nem kétórás valós idejű várakozás.

További célzott kamerateszt: az előkészített játék a kontinensen kívüli észlelést tartja meg, az aktív állapotba váltás pedig egyszer automatikusan a játékterületre fókuszál. Az ismételt állapotfrissítés nem rántja vissza a játékos által elmozdított térképet.

## 1.4 · Név szerinti gyűrűhelyszínek

A korábbi általános tárgyhelyszínek helyett az új játék tervében a hat gyűrű külön kiválasztható. A régi helyszínek megmaradnak. A futó játékban az admin külön szerkesztheti a még földön lévő gyűrűk helyét; kattintás, húzható jelölő és koordinátás megadás is használható. Az áthelyezéshez külön mentés és biztonságos közterület-jóváhagyás kell. A szerver csak adminnak, 10 km-es körzetben, földön lévő gyűrűre engedi az áthelyezést, és eseménynaplót ír. A tests/ring-placement.sql visszavont tranzakcióban igazolta a sikeres mentést, a terv frissítését, a naplóbejegyzést, valamint a normál játékos, a túl távoli pont, a jóváhagyás nélküli kérés és a már felvett gyűrű tiltását. A tests/placement-model.test.cjs igazolta a sorrendtől független, név szerinti kijelölést és a régi terv megőrzését. A meglévő játék állapotát a teszt nem változtatta meg.

Éles böngészős ellenőrzés: az Admin listájából egy meglévő gyűrű megnyitása, térképes kattintás, a jelölő húzása, másik gyűrű kiválasztása, kézi koordináta alkalmazása és a kijelölés visszavonása sikerült. Az új játék tervében külön a hatodik gyűrűt kiválasztva 1/6 elhelyezés jelent meg, a visszavonás visszaállította az eredeti 0/6 tervet. A futó játék valódi helyszíneire mentést nem küldtünk. A mentést az elkülönített, visszavont adatbázisteszt igazolta.

## 2026-11-20 — Mobilalkalmazás 1.6.0

A [célzott mobilteszt jegyzőkönyve](tesztjegyzokonyvek/2026-11-20-mobil-1.6.0.md) tartalmazza az összes futtatási kísérletet, a javított frissítésjelzést és a fizikai eszközös korlátokat. Első telepítés sikeres: a7ef3242be3225be0185b22e74d7eb5c7763a77f, [Pages futtatás](https://github.com/ngynrbrt-prog/szuper-titkos-szovetseg/actions/runs/44827936959). A térkép és a telepítési segítség élesen megnyílt, 375 px szélességen nem volt túllógás. A modelltesztek átmentek. Fizikai Android/iPhone telepítés és kéttelefonos GPS nem futott.

Az r2 javítás élesítése is igazolt: `1ff23459ad04e8e8d4af44137b4bd978473d02cf`, [sikeres futtatás](https://github.com/ngynrbrt-prog/szuper-titkos-szovetseg/actions/runs/44828274081). Újratöltéskor az éles HTML `pwa.js?v=1.6.0-r2` fájlt hivatkozott; a beragadt frissítésjelzés nem jelent meg. A VM frissítési próba igazolta a megszakítást, jóváhagyást és újratöltést.

## 2026-11-20 — Belépett felület és random pálya 1.7.0

A [jegyzőkönyv](tesztjegyzokonyvek/2026-11-20-felulet-random-1.7.0.md) rögzíti a modelles és SQL-próbákat, az ismétléseket, a blokkolt helyi böngészőkörnyezetet és a telefonos korlátokat. Öt JS-tesztkészlet végső futása sikeres. A random_placement_gem_count migráció sikeres; a tranzakciós próba igazolta a 6+20 tárgyat 26 külön helyen, a korábbi 40-es alapértéket és az admin/safety védelmet. RPC: anon/authenticated tiltott, service_role engedett. Éles frontend igazolása folyamatban.

## 2026-11-20 — Helyszínalapú random pálya 1.7.1

A [részletes jegyzőkönyv](tesztjegyzokonyvek/2026-11-20-helyszin-random-1.7.1.md) rögzíti a hálózati és VM-próbák ismétléseit is. A kiválasztható sugár 1, 3 vagy 5 km. A Private.coffee Overpass-válasz Gárdony 3 km-es körében 56 elemet adott, 46 szűrt POI-val; hét különböző hely kiválasztása és a 6 gyűrű + Mordor pontos POI-koordinátája igazolt. Hét JS-tesztkészlet végső futása sikeres; a teljes generateAt próbában hiba esetén változatlan maradt a terv, a cache és a párhuzamos keresés tiltása működött. Új adatbázismigráció nincs. Fizikai telefonos és valós bejelentkezett böngészős folyamat nem igazolt.

Az 1.7.1 frontend élesítése igazolt: `c161c0019ceff933e83195679eb2582ea5302fe6`, [Pages-futtatás](https://github.com/ngynrbrt-prog/szuper-titkos-szovetseg/actions/runs/44833099950). Éles DOM: script.js?v=1.7.1; a választó 1/3/5 km-es opciókat tartalmaz; vendég admin és beállítások rejtett, belépés látható. Kért 390×844 mobilnézetben a mért szélesség 375 px, scrollWidth is 375 px; error napló üres. A hét helyi tesztkészlet végső ismétlése sikeres. [Képi bizonyíték](kepek/mobil-1.7.1.jpg).

## 2026-11-21 — 1.8.0 szabályok, színek és csapatkiszabadítás

A [részletes jegyzőkönyv](tesztjegyzokonyvek/2026-11-21-regresszio-1.8.0.md) tartalmazza az összes SQL- és kliensoldali kísérletet, a javított tesztelvárást, a hibás tesztszintaxist és a betelt regisztrációs keret korlátját. A két szervermigráció sikeres. A végső tranzakciós próba sikeres, minden fixture visszavonva; az aktuális kör előkészített maradt és nincs éles nyomvonalminta. A tíz kliensoldali tesztkészlet végső futása sikeres. A natív háttérmegosztás nem része az igazolt PWA-működésnek.

## 2026-11-21 — 1.9.0 natív app és tartós rablásjelzés

A [jegyzőkönyv](tesztjegyzokonyvek/2026-11-21-nativ-rablas-1.9.0.md) rögzíti a SQL aliasütközést és javítását, az SDK miatt pontosított PWA-tesztet, a címzetti session-RLS próbát, a natív híd modelltesztjét és a projektfájlok vizsgálatát. A végső SQL-futás visszagörgetett tranzakcióban sikeres. A natív fordítás CI-ben, a fizikai GPS és valódi kétklienses Realtime külön igazolandó.

A natív fejlesztés a felhasználó kérésére elhalasztva, a forrás és eredmények megőrizve. A 44841706324 CI-futás iOS szimulátora sikeres, Android build/lint lépése sikertelen; APK-feltöltés nem futott. A workflow automatikus triggerét kivettük, csak kézzel indítható. Az automatikus PWA-folytatás kérése visszavonva, ilyen változás nincs.

## 2026-11-21 — 1.9.3 popupjavítás és natív build eredmény

A korábbi kör belépéskori összesítője tiltva; csak az aktuálisan követett aktív kör lezárása nyit ablakot. A célzott teszt ismételt futása és a teljes 13 JavaScript-csomag sikeres. [Jegyzőkönyv](tesztjegyzokonyvek/2026-11-21-popup-1.9.3.md). Android 1.9.2 build+lint és iOS unsigned szimulátor build sikeres a 44842967106 futásban. APK-artifact 14681647800. Telefonos telepítés, lezárt képernyős GPS és aláírt iPhone-telepítő nem igazolt. Az 1.9.3 élesítése még ellenőrzendő.

Az 1.9.3 webes élesítés igazolt: commit 6ff24525a3abe2abf0bfb1b00cac8688063d60f4, Pages 44843886034 sikeres. Friss böngészőben a lábléc és a betöltött script 1.9.3; roundDialog.open=false, konzolhiba nincs. Ez vendégnézet, a belépési sorrendeket automatizált függvényteszt igazolja.

## 2026-11-21 — 1.9.4 admin kézi megszakítás

Az abort adminművelet telepítve. Első SQL-próba hibás tesztadatból hiányzó Sauron-útvonal miatt sikertelen, javított fixture-rel második próbálkozás sikeres. A meglévő gyűrű/szín/kiszabadítás/rablás SQL regresszió sikeres, mindkét tranzakció visszagörgetve. Mind a 14 JavaScript-csomag sikeres. A futó Gárdony-játék leállítását nem hajtottuk végre. [Jegyzőkönyv](tesztjegyzokonyvek/2026-11-21-admin-leallitas-1.9.4.md). Webes élesítés ellenőrzése következik.

Az 1.9.4 webes telepítés igazolt: commit 077dcc5989091bd3f70294fa4a912f3b75ad2c86, Pages 44844327823 sikeres. Friss böngészőben az 1.9.4 lábléc és script töltődik, nincs nyitott roundDialog és konzolhiba. DB utóellenőrzés: Gárdony aktív maradt; abort ág telepítve; anon/authenticated közvetlen game_action EXECUTE tiltva. Advisors előtte/utána azonos: 12 szándékos default-deny INFO, a címzettet ellenőrző can_read_game_notice definert jelző WARN és a korábbi leaked-password WARN; új jogosultság nem keletkezett. [Advisors leírás](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

Android artifact letöltési kísérletek: Node hálózati fetch sikertelen; első curl a hiányzó célmappa miatt sikertelen; mappa létrehozása után curl és kicsomagolás sikeres. app-debug.apk 2 518 668 bájt, SHA-256: 13741ab5b94d21c51fb2ec179eb0e474c0fc2094d6499784b9cadaf400baf1f0. ZIP-integritás ellenőrzése sikeres. A fájlt nem telepítettük vagy futtattuk telefonon.

## 2026-11-21 — 1.9.5 Sauron láthatósága

A kérő saját gyűrűje és friss pontos helymegosztása feltétel a sauron válaszhoz; a game.config belső Sauron-mezői nem kerülnek a klienshez. A célzott SQL-teszt és a teljes ring-progress-rescue SQL-regresszió elsőre sikeres, visszagörgetett fixture-tranzakcióban. Mind a 14 JavaScript-csomag sikeres, benne saját/idegen gyűrű, leállított/hiányzó/lejárt/pontatlan GPS, rejtőzés és játék előtti észlelés. Advisors eredmény változatlan (12 INFO, két korábbi WARN), új jogosultság nincs. Az éles kör állapotát nem állítottuk át. Webes telepítés ellenőrzése folyamatban. [Jegyzőkönyv](tesztjegyzokonyvek/2026-11-21-sauron-lathatosag-1.9.5.md).
