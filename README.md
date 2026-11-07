# A Szuper Titkos szövetség · Multiplayer 1.4

Hat regisztrált játékos közös, egyvárosos GPS-játéka. A felület GitHub Pages-en, a hitelesítés és minden játékállapot-változás Supabase-ben fut.

Élő oldal: https://ngynrbrt-prog.github.io/szuper-titkos-szovetseg/

## Első használat

1. Nyisd meg az élő oldalt. Az Új karakter űrlapon adj meg nevet, 6–12 számjegyes PIN-t, fajt és fegyvert. Meghívó nem kell; legfeljebb hat karakter hozható létre.
2. Regisztráció után a Visszatérő vándor űrlapon lépj be a választott névvel és PIN-nel.
3. Az adminjog továbbra is külön tulajdonosi beállítás; nyilvános regisztrációval senki nem kap automatikusan adminjogot.
4. A helyi index.html megnyitása az élő HTTPS-oldalra irányít, mert a helyi fájlból a szerverkapcsolat és a GPS nem megbízható.
5. Az admin a térképszerkesztőben kijelöli a helyszíneket, Mordort és Sauron útvonalát, majd létrehozza és elindítja a játékot.

## Megvalósított játékszabályok

- A játék elindítása előtt Sauron eredeti fekete sisakja más kontinensen látszik. A bizonytalan észlelés kétóránként változik, és regisztráció előtt és után is megjelenik. A Sauron mutatása gomb az észlelésre fókuszál.

- Tárgyfelvétel 50 méteren belül, legfeljebb 50 m pontatlanságú és 30 másodpercnél frissebb GPS-szel.
- Rablás két látható játékos között 100 méteren belül; a párra 15 perces védelem vonatkozik.
- Saját gyűrű megsemmisítése Mordor 50 méteres körzetében, 1000 pontért.
- A drágakövek egyszeri felvételi értéke 1000–40000 sestertius. A rablás az eszköz tulajdonát adja át; korábban szerzett pontot nem von vissza.
- Sauron 30 perc után 6 km/h-val járőrözik az admin útvonalán oda-vissza. 15 perc aktív GPS-idő után, 50 méteren belül egy gyűrűt elvesz. Utána 60 percig rejtett és nem támad. A korábbi tulajdonos 1 km-en belül visszaszerezheti; utána 15 perc védettséget kap.
- Sauron eseményeit kérésekkor értékeli ki a szerver, csak friss helyadatokra. Nincs folyamatos háttérfolyamat vagy utcahálózaton célpontot üldöző útvonaltervező.
- Gyűrűvel töltött idő csak friss GPS-mérések közötti, legfeljebb 30 másodperces időablakokban számít. Háttérbe kerüléskor a megosztás leáll; újraindítása kézi.
- Automatikus lezárás, ha minden gyűrű megsemmisült vagy Sauronnál van. Admin is lezárhatja a játékot. A rangsor: sestertius, megsemmisített gyűrűk, gyűrűidő. Az archívum megmarad.

## Biztonsági felépítés

A böngésző csak publikus API-kulcsot kap. A PIN bcrypt-hashként, privát sémában tárolódik; öt hibás belépés után 15 perces zárolás következik. A korábbi meghívók már nem használhatók regisztrációra. Az adminjogot a felhasználó által nem módosítható adatbázisrekord adja. A regisztráció hat fős korlátja és a játékműveletek tranzakciószintű zárolással védettek.

A `player-auth` a belépést és a meghívó nélküli regisztrációt kezeli. A `game-api` minden kérést a Supabase Auth `/user` végpontján ellenőriz, majd a szerver az élő `auth.sessions` rekord meglétét is megköveteli. Az ügyfél nem választhatja meg a cselekvő játékos azonosítóját. A kliensszerepköröknek nincs közvetlen tábla- vagy játék-RPC-hozzáférésük. Minden tábla RLS-sel védett; a policy nélküli, alapértelmezett tiltás szándékos, az összes adatforgalom a szerverfüggvényeken halad át.

A kliens munkamenete a lap `sessionStorage` tárhelyén marad. Nincs szolgáltatási kulcs a forrásban. A HTML szigorú tartalombiztonsági szabályt használ, a felhasználói szövegeket a felület szövegként kezeli. A Leaflet 1.9.4 helyben csomagolt; a térképcsempék az OpenStreetMaptől érkeznek.

## Telepítés és karbantartás

- A `database/schema.sql` a teljes, adatokat és meghívókat nem tartalmazó séma új Supabase-projekthez. Az exportot önálló új projektben nem teszteltük.
- A `database/multiplayer.sql` a 2026-11-07-én meglévő sémához készült, egyszer alkalmazható frissítés. Már telepítve van; ne futtasd újra.
- A `supabase/functions/` forrásfájljai a telepített végpontok forrásai. A `verify_jwt=false` szükséges a nyilvános belépéshez, illetve a `game-api` saját, élő felhasználó- és session-ellenőrzést végez.
- A szerverkulcs csak Supabase-környezetben található: `GAME_SERVER_KEY`, `SUPABASE_SECRET_KEYS.default`, vagy a beépített `SUPABASE_SERVICE_ROLE_KEY`.
- A végső indexjavítás a `database/final-indexes.sql` fájlban szerepel. A GitHub `main` ág statikus fájljait a meglévő Pages-folyamat publikálja. Nincs buildlépés vagy npm-függőség.
- A `tests/database.sql` az élő adatbázisban egyetlen visszavont tranzakcióban tesztel. Csak üres, játékos nélküli környezetben futtasd, mert a hatfős korláttal és a legutóbbi játékkal dolgozik.

## Források és ellenőrzési határok

A v0.7 ZIP elérhető volt, és a GitHub hat fájlos demójával összevetettük. A korábbi multiplayer v1 ZIP nem volt hozzáférhető; a tulajdonos sem rendelkezik vele. Ez a verzió a v0.7 és a meglévő Supabase-séma alapján készült, nem az elveszett ZIP auditált másolata.

A tesztek és ismert korlátok: `docs/ELLENORZES.md`. A több valódi telefonos, kültéri GPS-próba továbbra is külön ellenőrzési lépés. A böngésző által közölt helyzet meghamisítható; ez baráti játék, nem hitelesített helyazonosítás.

## Gyűrűhelyek szerkesztése

Az Admin oldalon a jelenlegi játék hat gyűrűje névvel és koordinátával jelenik meg. A Hely kiválasztása vagy a Gyűrűk helyének módosítása gomb nyitja meg a térképes szerkesztőt. Válassz gyűrűt, kattints a térképre vagy húzd a jelölőt, majd hagyd jóvá a biztonságos közterületi helyet és nyomd meg a Gyűrű helyének mentése gombot. Koordinátákat közvetlenül is megadhatsz. Csak a földön lévő gyűrű mozgatható, a felvett vagy megsemmisített gyűrű védett. Az új játék tervében mind a hat gyűrű külön, név szerint elhelyezhető; a terv helyben automatikusan megmarad. A szerkesztő a térkép fölött található, nem takarja el a kattintási területet.
