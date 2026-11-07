# Ellenőrzési napló · 2026-11-07

## Kiindulás

- GitHub: `ngynrbrt-prog/szuper-titkos-szovetseg`, `main`, kiinduló commit: `85fcf6f77094decf45013312db1629c9dd449203`.
- Supabase: `lpjgrmfzteuwjgrcgxqa`, aktív, PostgreSQL 17.11.
- A v0.7 ZIP hat forrásfájlt tartalmazott, kizárólag helyi játékállapottal. Az élő repó ugyanezt a demót tartalmazta.
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

A `tests/database.sql` 19 sikeres ellenőrzése, a végén `ROLLBACK`:

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

A teszt véletlenül kiválasztott távoli tárgyát determinisztikus közeli tárgyra cseréltük; az időteszt a szigorú „30 perc után” feltételhez egy másodpercet hagy rá. Ezek tesztadat-javítások voltak.

## Igazolt éles HTTP-tesztek

- Belépés nélküli `game-api`: HTTP 401.
- Meghívós regisztráció ékezetes karakternévvel: HTTP 200.
- PIN-es belépés és valódi Supabase-munkamenet létrehozása: HTTP 200.
- Bejelentkezett `state`: HTTP 200; helyes karakter és adminjog, üres induló játékállapot.
- A böngésző JavaScript-fájljainak szintaxisa ellenőrizve.

## Biztonsági tanácsadó

A Supabase security advisor nem jelzett WARN/ERROR szintű hibát. INFO szinten a policy nélküli, RLS-sel védett táblákat jelzi. Ez a választott szerveroldali felépítés szándékos alapértelmezett tiltása; az anon/authenticated táblaengedélyei is vissza vannak vonva. Kapcsolódó magyarázat: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

## Határok és kézi elfogadás

- Valódi, többtelefonos kültéri GPS-próba szükséges. A szimulált koordináták és az adatbázistesztek ezt nem helyettesítik.
- Az adminnak a kiválasztott város helyszíneit és a teljes útvonalszakaszokat a valóságban ellenőriznie kell. Nem állítjuk, hogy automatikusan biztonságos közterületet választottunk.
- Sauron jóváhagyott útvonalon járőrözik; dinamikus utcahálózati célpontüldözés nincs. Eseményei friss kérésekkor értékelődnek ki; nem háttérben követi a kikapcsolt telefonokat.
- A fantáziaképességek díszítő jellegűek. A hiányzó v1 ZIP-ből származó ismeretlen szabályokat nem állítjuk rekonstruáltnak.
- A böngésző helyadata manipulálható. Nincs operációs rendszer által hitelesített helymeghatározás.
- Az admin a személyes PIN-jét maga választja az első regisztrációnál. A privát adminmeghívó nem került GitHubra.
