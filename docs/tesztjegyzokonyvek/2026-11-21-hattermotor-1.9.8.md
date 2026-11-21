# Tesztjegyzőkönyv — önálló háttérmotor, 1.9.8

## Tartalomjegyzék

- [Verziókövetés](#verziókövetés)
- [Környezet](#környezet)
- [Esetek és futtatások](#esetek-és-futtatások)
- [Korlátok](#korlátok)

## Verziókövetés

| Verzió | Dátum | Változás |
| --- | --- | --- |
| 1.0 | 2026-11-21 | Háttérmozgás, 15 km/h, Cron és regresszió. |

## Környezet

Web 1.9.8, Supabase lpjgrmfzteuwjgrcgxqa PostgreSQL 17.11, pg_cron. SQL eszköz / PL/pgSQL assert automatikus fixture BEGIN/ROLLBACK-kal. Forrás: tests/background-game-engine.sql, tests/sauron-last-seen.sql, tests/sauron-visibility.sql, tests/ring-progress-rescue.sql. A cron aktív éles játékot normál működésként léptet; nincs kézi pozíciómódosítás az éles játékban. Migráció background_game_engine_15kmh.

## Esetek és futtatások

Minden alábbi első kísérlete sikeres.

| Eset | Lépés és elvárt eredmény | Végrehajtás, tényleges eredmény |
| --- | --- | --- |
| ENG-01 | Privát helper hívása játékos GPS/auth nélkül, 30 s időlépés. | Automata SQL PASS: 125 m, 15 km/h. |
| ENG-02 | Azonos időbélyeggel helper ismétlése. | Automata SQL PASS: nincs kettős mozgás. |
| ENG-03 | Előkészületi, majd megszakított lezárt kör helperhívása. | Automata SQL PASS: hely változatlan. |
| ENG-04 | anon/authenticated futtatási jogosultság ellenőrzése. | Automata SQL PASS: privát. |
| ENG-05 | Aktív cron job és futási napló olvasása, két időpontban pozíció megfigyelése. | SQL megfigyelés PASS: 10 seconds aktív; 2026-11-21 09:14:20/30/40 UTC succeeded, tick idő és pozíció változik. Nem fixture-mozgatás vagy böngészős GPS okozta a cronhívást. |
| ENG-06 | Járőrfüggvényben -1800 eltolás keresése. | SQL PASS: nincs régi félórás késleltetés. |
| REG-01 | Utolsó ismert cél / offline elfogás tiltás regressziója. | Automata SQL PASS. |
| REG-02 | Saját gyűrű + friss megosztás láthatósági regresszió. | Automata SQL PASS. |
| REG-03 | Teljes gyűrűidő, közös gyűrűfeltétel, kiszabadítás, rablás és szín regresszió. | Automata SQL PASS, ROLLBACK. |

## Korlátok

Fizikai többtelefonos sétateszt: NEM FUTTATOTT. Hét napos napi cron-naplótakarítás: NEM FUTTATOTT, csak ütemezése ellenőrizve. A scheduler Supabase-adatbázis elérhetőségét igényli; üzemszünetre nincs korlátlan utólagos mozgásgarancia. A felület polling miatt nem folyamatos animáció, de a szerver állapota kliens nélkül is továbbhalad.

REG-JS / 1: az 1.9.8 végső forrásán mind a 15 JavaScript-csomag PASS. Élő kiegészítő SQL-megfigyelés: fresh_sharing_players=0, a cron ettől függetlenül továbbra is succeeded állapotban léptet. A megfigyelés olvasás, nem játékosnak álcázott kérés.

Éles böngészőpróba / 1: PASS. 1.9.8 lábléc, Szabályok megnyitva; 15 km/h és háttérmotor látható, régi 6 km/h nincs, konzolhiba nincs. Pages 44888800746 sikeres, forrás c09d9159b4b2084287373ecc452c33a0c363d838.
