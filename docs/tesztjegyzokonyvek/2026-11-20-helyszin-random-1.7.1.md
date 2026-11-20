# Helyszínalapú random pálya tesztjegyzőkönyv — 1.7.1

## Tartalomjegyzék

- [Verziókövetés](#verziókövetés)
- [Környezet és verzió](#környezet-és-verzió)
- [Futtatások](#futtatások)
- [Korlátok](#korlátok)

## Verziókövetés

| Verzió | Dátum | Változás |
| --- | --- | --- |
| 1.0 | 2026-11-20 | 1/3/5 km és POI-helyszínek; minden futtatási kísérlet. |

## Környezet és verzió

Frontend 1.7.1, helyi macOS, Node REPL VM/assert, rögzített Overpass-adat és mesterséges szélsőértékek; hálózati próba curl HTTPS GET/POST, 35 másodperces időkorláttal. A kliens végső szolgáltatója Overpass / Private.coffee, GET, 45 másodperces kliensidőkorlát. A Supabase 1.7.0 gem_count migráció marad, az 1.7.1 nem változtat adatbázist. Éles játékadatot a POI-tesztek nem módosítottak. A bejelentkezett menü VM-próbája az eredeti accountView kódot futtatja vendég/játékos/admin/kilépett állapottal. A valódi gárdonyi válasz helye: tests/fixtures/gardony-pois.json, benne a lekérés ideje, forrás és OSM copyright.

## Futtatások

| Eset | Kísérlet | Technológia / eszköz / mód | Lépés és elvárt | Tényleges / bizonyíték | Státusz |
| --- | --- | --- | --- | --- | --- |
| POI-01 | 01 | JS / Node VM / automata | 1/3/5 km, hibás sugár elutasítás, szűrés | tests/poi-model.test.cjs PASS: típus, way-center, távoli/private/duplikált pontok kizárva; 7 külön hely | Sikeres |
| POI-02 | 01 | JS / Node VM / automata | Meglévő megjelenítés/random teszt ismétlése | Az új placementRequest változó hiányzott a tesztmockból | Sikertelen tesztillesztés |
| POI-02 | 02 | JS / Node VM / automata | Mock kiegészítése és ismétlés | tests/appearance-random.test.cjs PASS: sugárhatárok, sark/dátumválasztó, téma, accountView átmenetek | Sikeres |
| POI-03 | 01 | HTTPS / Node fetch / automata | Valódi Gárdony, 3 km | A környezet hálózati elérése nem működött: fetch failed | Blokkolt |
| POI-03 | 02 | HTTPS POST / curl / automata | Ugyanaz overpass-api.de | HTTP 406, nem JSON | Blokkolt |
| POI-03 | 03 | HTTPS GET / curl / automata | Ugyanaz overpass-api.de | HTTP 200 fejléc, de 35 s után időtúllépés, hiányos JSON | Blokkolt |
| POI-03 | 04 | HTTPS GET / curl / automata | Dokumentált alternatív Overpass / Private.coffee | HTTP 200, teljes JSON: 56 elem, 46 használható hely; hét valós POI kiválasztható | Sikeres |
| POI-04 | 01 | JS / Node VM / automata | Teljes produkciós generateAt kód fixture-adattal | A tartós REPL korábbi require-cache-e régi PlacementModel modult adott | Blokkolt |
| POI-04 | 02 | JS / Node VM / automata | Friss modullal ismétlés | tests/poi-generation.test.cjs PASS: 26 tárgyhely, 7 POI, cache-újrahasználat, safety törlés, hiba esetén régi terv, párhuzamos keresés tiltva | Sikeres |
| POI-05 | 01 | JS / Node VM / automata | GPS, Sauron, korábbi helyszínmodell, PWA újrafuttatás | tests/gps.test.cjs, map-model.test.cjs, placement-model.test.cjs, pwa.test.cjs mind PASS | Sikeres |
| POI-06 | 01 | JS / Node VM / automata | Szintaktikai ellenőrzés | script.js, appearance.js, placement-model.js, poi-model.js, sw.js elemezhető | Sikeres |
| POI-07 | 01 | CUA / éles böngésző / kézi és DOM-mérés | 1.7.1 megnyitás, vendég menü és 390×844 kért mobilnézet | script.js?v=1.7.1; mért clientWidth=scrollWidth=375; sugáropciók 1/3/5 km; vendégként adminHidden=true, settingsHidden=true, loginHidden=false; error napló üres | Sikeres |
| POI-01 | 02 | JS / Node VM / automata | Végső kiadási ismétlés | POI modell + rögzített 56 elemes gárdonyi válasz ismét PASS | Sikeres |
| POI-02 | 03 | JS / Node VM / automata | Végső kiadási ismétlés | Téma, menü és sugárteszt ismét PASS | Sikeres |
| POI-04 | 03 | JS / Node VM / automata | Végső kiadási ismétlés | generateAt ismét PASS: cache, safety, hibakezelés, párhuzamosság | Sikeres |
| POI-05 | 02 | JS / Node VM / automata | Végső kiadási ismétlés | GPS, Sauron, elhelyezés és PWA ismét PASS | Sikeres |
| POI-06 | 02 | JS / Node VM / automata | Végső kiadási ismétlés | Hat kliensszkript szintaxisa ellenőrizve | Sikeres |
| POI-08 | — | Fizikai Android+iPhone / kézi | Bejelentkezett admin kattintás, éles böngészős POI-keresés, sötét UI, GPS | Külön tesztfiók és fizikai telefonok nélkül nem futott | Nem futott |

## Korlátok

A tényleges szolgáltató teljes válasza és a produkciós feldolgozó/generáló kód igazolt. Ez nem egyenértékű a bejelentkezett admin teljes, élő böngészős folyamatával. OSM-adatból nem állapítható meg biztosan, hogy egy hely nyitva van vagy szabályosan megközelíthető; az admin jóváhagyása kötelező. A gyűrűk/Mordor nem kapnak tetszőleges véletlen pontot, ha a keresés sikertelen. A drágakő és Sauron geometrikus útvonala továbbra is admin által átnézendő.

**Végső eredmény:** 8 tervezett esetből az utolsó futás szerint 7 sikeres, 1 nem futott. A korábbi blokkolt és sikertelen kísérletek a táblázatban megmaradtak. Forrás: `c161c0019ceff933e83195679eb2582ea5302fe6`, [sikeres Pages-telepítés](https://github.com/ngynrbrt-prog/szuper-titkos-szovetseg/actions/runs/44833099950). [Éles mobilképernyő bizonyítéka](../kepek/mobil-1.7.1.jpg). A következő dokumentációs commit csak a bizonyítékokat rögzíti.
