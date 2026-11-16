# Regressziós tesztjegyzőkönyv — 1.5.3

## Tartalomjegyzék

- [Verziókövetés](#verziókövetés)
- [Környezet és hatókör](#környezet-és-hatókör)
- [Tesztesetek és futtatások](#tesztesetek-és-futtatások)
- [Összesítés](#összesítés)

## Verziókövetés

| Dokumentum | Dátum | Játékverzió | Változás |
| --- | --- | --- | --- |
| 1.0 | 2026-11-16 | 1.5.3 | A REG-2026-11-16-01 futtatás eredményei. |

## Környezet és hatókör

- Futás: 2026-11-16, 23:22 után, CET (Europe/Budapest).
- Éles web: GitHub Pages, `?v=1.5.3`. A böngészőben megfigyelt belépőszkript `script.js?v=1.5.3`. A dokumentált játékkiadás commitja `48947ff7f4a6386e3c70c71c793b5c296657a8ba`; a teszt előtti repó csúcsa `cdebb27c2766032221b6a8f3755a43cce49d3fb7`. Nem készült fájlonkénti azonosságvizsgálat az éles oldal és a helyi forrás között.
- Frontend: helyi fájlok Node REPL-ben, Node beépített VM- és assert-moduljaival. GPS és idő tesztadatokkal.
- Böngésző: ChatGPT beépített böngésző, kijelentkezett nézet, élő hálózat, GPS-hozzáférés nélkül. Kért keskeny nézet 390 × 844, mért dokumentumszélesség 375 CSS px. A böngésző szűkített értékelési környezetéből a pontos motorverzió nem volt olvasható.
- Adatbázis: éles Supabase PostgreSQL 17.11, olvasási jogosultságvizsgálat. Hat meglévő karakter. Bejelentkezett tesztfiók és elkülönített, üres adatbázis nem állt rendelkezésre.

## Tesztesetek és futtatások

| Eset | Futás | Funkció | Technológia / eszköz | Mód | Lépés | Elvárt | Tényleges / bizonyíték | Státusz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| REG-001 | 01 | GPS | JS / Node REPL | Automata | `tests/gps.test.cjs` | Friss GPS álló helyzetben, leállításkor időzítő törlése, késői callback figyelmen kívül marad | PASS: stationary GPS refresh, timer cleanup, late callback rejection | Sikeres |
| REG-002 | 01 | Sauron térképi modell | JS / Node REPL | Automata | `tests/map-model.test.cjs` | Kétórás észlelés, élő pozíció és rejtőzés az állapot szerint | PASS: pre-game visibility, login continuity, shared rumor, preparation, live position, cooldown hiding | Sikeres |
| REG-003 | 01 | Helyszínmodell | JS / Node REPL | Automata | `tests/placement-model.test.cjs` | Név szerinti kijelölés, régi terv megőrzése, érvénytelen koordináta elutasítása | PASS: named ring positions, old draft preservation, unordered selection, gem separation, coordinate validation | Sikeres |
| REG-004 | 01 | Szintaxis | JS / Node VM | Automata | Négy kliensszkript elemzése | Nincs szintaktikai hiba | PASS: 4 JavaScript files parse | Sikeres |
| REG-005 | 01 | Adatbázis-hozzáférés | SQL / Supabase | Automata | `has_function_privilege` az anonim játék- és kliensregisztrációs RPC-re | Mindkét közvetlen jogosultság tiltott | `anon_game=false`, `client_register=false` | Sikeres |
| REG-006 | 01 | Éles lap megnyitása | HTTPS / webolvasó | Automata | Megnyitás | Az oldal olvasható | A webolvasó számára a cím nem volt elérhető | Blokkolt |
| REG-006 | 02 | Éles lap megnyitása | Böngésző / CUA | Kézi vezérlés | Megnyitás új fülön | Térkép és navigáció látható | A térkép és a Sauron-jelölő megjelent, szkript 1.5.3 | Sikeres |
| REG-007 | 01 | Sauron fókusz és vendég GPS | Leaflet / CUA Playwright | Automata | Sauron mutatása, GPS gomb állapota | Felugró térképablak, GPS tiltva | `popup=true`, `gpsEnabled=false` | Sikeres |
| REG-008 | 01 | Karakterválasztó | HTML / CUA Playwright | Automata | Belépés menü, Hobbit kiválasztása | Hat opció, a Hobbit kiválasztható | `count=6`, `value=Hobbit`; az űrlap elküldése kívül esett ezen az eseten | Sikeres |
| REG-009 | 01 | Keskeny űrlapnézet | CSS / CUA Playwright | Automata | 390 × 844 beállítása és szélességmérés | Nincs vízszintes túllógás | `clientWidth=375`, `scrollWidth=375` | Sikeres |
| REG-010 | 01 | Böngészőverzió rögzítése | CUA Playwright | Automata | User-agent lekérése | Verzióadat elérhető | Az értékelési környezet nem adta át a navigator objektumot | Blokkolt |
| REG-011 | — | Adatbázis játékmenet és lezárás | PostgreSQL / SQL tesztek | Automata | `tests/database.sql` | Felvétel, rablás, lezárás ellenőrzése | Az örökölt forgatókönyv üres környezetet és korábbi meghívós mechanikát feltételez | Nem futott |
| REG-012 | — | Új fiók és admin gyűrűmozgatás | PostgreSQL / SQL tesztek | Automata | `tests/open-registration.sql`, `tests/ring-placement.sql` | Regisztráció és jogosultságok a mentésben | Az éles hat játékoshely betelt. Üres tesztkörnyezet szükséges | Nem futott |
| REG-013 | — | Bejelentkezett böngészős kör | Web / két szerepkör | Kézi | Belépés, Gárdony elfogadása, indítás, gyűrű, eredmény | A teljes játékfolyamat végigvihető | Bejelentkezett tesztfiókok és elkülönített kör szükséges | Nem futott |
| REG-014 | — | Kéttelefonos GPS | Mobilböngésző / két fizikai telefon | Kézi | Megosztás, kölcsönös ikonok, megosztás leállítása | Jelölők megjelennek és eltűnnek | Fizikai telefonos próba szükséges | Nem futott |

## Összesítés

**14 eset**. Az utolsó futtatás szerint 9 sikeres, 0 sikertelen, 1 blokkolt és 4 nem futott. A nyilvános felület, a helyi frontend regressziós készlet és a vizsgált adatbázis-jogosultságok átmentek. A teljes bejelentkezett többjátékos kör igazolásához elkülönített tesztadatbázis, két tesztfiók és két helymegosztásra képes telefon szükséges.
