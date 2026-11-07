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
