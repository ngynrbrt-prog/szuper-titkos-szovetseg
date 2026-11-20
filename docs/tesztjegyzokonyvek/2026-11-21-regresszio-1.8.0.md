# Tesztjegyzőkönyv — 1.8.0

## Tartalomjegyzék

- [Verziókövetés](#verziókövetés)
- [Környezet és hatókör](#környezet-és-hatókör)
- [Tesztesetek és kísérletek](#tesztesetek-és-kísérletek)
- [Korlátok](#korlátok)

## Verziókövetés

| Verzió | Dátum | Változás |
| --- | --- | --- |
| 1.0 | 2026-11-21 | Gyűrűidő, hatgyűrűs vég, színek, térképkép, csapatkiszabadítás és mobilvezérlők. |

## Környezet és hatókör

Helyi macOS, Node REPL VM/assert/fs, mesterséges szereplők és helyzetek, valamint korábban rögzített nyilvános OSM-fixture. Supabase lpjgrmfzteuwjgrcgxqa, valódi adatbázisban BEGIN/ROLLBACK fixture-próbák; a teszt ideiglenes auth.sessions rekordjai és az összes játék-, hely- és nyomvonalváltoztatás visszavonva. A migráció előtt az aktuális kör preparation állapotú volt, senkinél nem volt gyűrű. A meglévő hat karakter színt kapott; ez a kért tartós migráció része. A nyomvonaltábla éles mintaszáma a próbák után 0, a meglévő kör továbbra is preparation.

A kliensoldali térképkép próba Mock Canvas/Image modell, a színek és pontok szintetikusak. Éles böngészős képpróba külön eset. A natív Android/iPhone háttérhelymeghatározás külön fejlesztés; ezt az 1.8.0 PWA nem igazolja.

## Tesztesetek és kísérletek

| Eset | Kísérlet | Technológia / eszköz / mód | Lépés és elvárt | Tényleges és bizonyíték | Státusz |
| --- | --- | --- | --- | --- | --- |
| R18-01 | 01 | JS / Node VM / automata | Korábbi GPS, Sauron, elhelyezés, megjelenítés, POI és PWA készletek | Hét készlet PASS | Sikeres |
| R18-02 | 01 | JS / Node VM / automata | tests/player-rules.test.cjs | 8 szín; 3599 tiltott, 3600 engedett; aktív színzár; gyűrűnkénti kijelzés; tényleges bag render gombállapotai és roster ikon PASS | Sikeres |
| R18-03 | 01 | JS / Node VM, Mock Canvas/Image / automata | tests/summary-map.test.cjs | Vetítés, szünetek szegmentálása, pillanatkép színe, legfeljebb 16 látható csempe, PNG-adat URL, csempehiba kezelése PASS | Sikeres |
| R18-04 | 01 | JS / Node VM + HTML / automata | tests/navigation-panel.test.cjs | Egy telepítési panel; map alja/settings áthelyezés, más oldalon rejtés; ikonform a settings szakaszban PASS | Sikeres |
| R18-05 | 01 | SQL / Supabase / automata | tests/ring-progress-rescue.sql | A teszt két szegmenst várt, de egy korábbi stale-gap már helyesen új szegmenst kezdett | Sikertelen tesztelvárás |
| R18-05 | 02 | SQL / Supabase / automata | Szünet előtti szegmensszámhoz viszonyított ismétlés | PASS: gyűrűnkénti idő, felvétel előtti kizárás, stale/stop, küszöb, atomic all, hatodik gyűrű, rablás, snapshot, színek, rescue all/stop/stale/capture/eredeti koordináta/új felvétel | Sikeres |
| R18-05 | 03 | SQL / Supabase / automata | Visszaszerzés és új színtrigger bővített próbája | Tesztgenerálási dollárjel-hiba: do $ helyett do $$ kellett | Sikertelen tesztszintaxis |
| R18-05 | 04 | SQL / Supabase / automata | Javított tesztszintaxis | A hatfős limit helyesen megakadályozta a 7. fixture-karaktert | Blokkolt |
| R18-05 | 05 | SQL / Supabase / automata | Regisztrációs fixture nélkül újra, recovery-próbával | Végső PASS; minden fixture ROLLBACK | Sikeres |
| R18-06 | 01 | SQL / Supabase / automata | RPC és private trails SELECT jog | anon_rpc=false, client_rpc=false, anon_trails=false, client_trails=false; unique_colors=true; real_trail_samples=0 | Sikeres |
| R18-07 | 01 | Supabase advisor / automata | Biztonsági vizsgálat | Szándékos RLS-no-policy INFO-k (új privát táblával 12), korábbi leaked-password-protection WARN. Nincs új nyilvános hozzáférés | Ellenőrizve |
| R18-08 | 01 | JS / Node VM / automata | Végső ismétlés a menü- és gombmódosítások után | Mind a tíz kliensoldali tesztkészlet és a szintaktikai vizsgálat PASS | Sikeres |
| R18-09 | — | CUA / éles böngésző / kézi | Mobilméret: teljes szélességű GPS-gombok és telepítési panel helye | Élesítés után rögzítendő | Tervezett |
| R18-10 | — | CUA / valódi Canvas+OSM / kézi | Szemléltető, nem valódi játékosok PNG-je | Élesítés után rögzítendő | Tervezett |
| R18-11 | — | Fizikai Android+iPhone / kézi | Teljes többtelefonos 60 perces mérés, lezárás és 5 perces rescue | Fizikai telefonos próba nincs | Nem futott |
| R18-12 | — | Új regisztráció / külön üres tesztprojekt | Véletlen szín teljes signup-folyamata | Éles 6 hely betelt; a limitet nem kerültük meg | Nem futott |

## Korlátok

A pontos mérés csak a szerver által elfogadott friss minták közötti egész másodpercekből áll; a hosszabb szünet, az app háttérbe kerülése és az oldal bezárása nem termel időt. A tesztben az 1 órát és az 5 percet kontrollált adatbázis-időpontok modellezték, nem várakoztunk végig fizikai telefonokkal. A natív háttér-GPS igényét külön kell megvalósítani és eszközön igazolni. A színek véletlen kiosztásának triggerkódja telepített, a meglévő kiosztás egyedi, de új signup nem futott a betelt keret miatt. Az OSM csempék hálózati elérhetősége és a nyomvonalak tényleges pontossága eszközfüggő.
