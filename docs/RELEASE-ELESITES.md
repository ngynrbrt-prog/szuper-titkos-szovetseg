# Kiadási és élesítési dokumentum

## Tartalomjegyzék

- [Natív alkalmazás és tartós rablásjelzés](#natív-alkalmazás-és-tartós-rablásjelzés)
- [Az 1.8.0 változásai és telepítése](#az-1.8.0-változásai-és-telepítése)
- [Helyszínalapú random pálya](#helyszínalapú-random-pálya)
- [Az 1.7.0 kiadás előkészítése](#az-1.7.0-kiadás-előkészítése)
- [A mobilváltozat kiadása](#a-mobilváltozat-kiadása)
- [Verziókövetés](#verziókövetés)
- [Éles kiadás](#éles-kiadás)
- [Telepítési sorrend](#telepítési-sorrend)
- [Ellenőrzés és visszaállítás](#ellenőrzés-és-visszaállítás)

## Verziókövetés

| Dokumentum | Játékverzió | Dátum | Változás |
| --- | --- | --- | --- |
| 1.0 | 1.5.3 | 2026-11-16 | Első kiadás a jelenlegi játékhoz. |
| 1.1 | 1.5.3 | 2026-11-16 | Ellenőrizve a mobilos és asztali kézikönyv frissítésekor. |
| 1.2 | 1.5.3 | 2026-11-16 | Áttekintve a technológiai leltár dokumentálásakor. |
| 1.3 | 1.5.3 | 2026-11-16 | Áttekintve a regressziós jegyzőkönyvezés bevezetésekor. |
| 1.4 | 1.6.0 | 2026-11-20 | Telepíthető mobilváltozat, használat, működés és korlátok dokumentálása. |
| 1.5 | 1.7.0 | 2026-11-20 | Belépett menü, világos/sötét megjelenítés és véletlen pályaterv. |
| 1.6 | 1.7.1 | 2026-11-20 | 1/3/5 km választó; gyűrűk és Mordor éttermeknél, kocsmáknál vagy nevezetességeknél. |
| 1.7 | 1.8.0 | 2026-11-21 | Gyűrűnkénti 60 perc, hat gyűrűs lezárás, színek, ikonbeállítás és körkép. |
| 1.8 | 1.8.0 | 2026-11-21 | Közös ötperces helymegosztás kiszabadítja Sauron gyűrűit. |
| 1.9 | 1.8.0 | 2026-11-21 | Telefonos sáv a Beállításokban és a térképoldal alján. |
| 1.10 | 1.8.0 | 2026-11-21 | Teljes szélességű, nagy helymegosztási gombok. |
| 1.11 | 1.8.0 | 2026-11-21 | Android/iPhone natív háttér-GPS igény rögzítve; a PWA korlátja változatlan, külön fejlesztés indul. |
| 1.12 | 1.9.0 | 2026-11-21 | Tartós, nyugtázható piros rablásjelzés és címzettvédett Realtime. |
| 1.13 | 1.9.0 | 2026-11-21 | Android/iPhone natív projektek, háttér-GPS és biztonságos munkamenethíd. |

## Éles kiadás

**Igazolt webes kiadás:** 1.8.0. **Forrás:** `f772089d9e9cac495a24047cc46c68a9cc587de1`. [Sikeres Pages-futtatás](https://github.com/ngynrbrt-prog/szuper-titkos-szovetseg/actions/runs/44838174098). Az 1.9.0 natív és Realtime-bővítés fordítása és frontend-élesítése folyamatban; az eredményét csak ellenőrzés után jelöljük igazoltnak.

## Telepítési sorrend

1. Rögzítsd a forrásverziót, a változó fájlokat és a futtatandó adatbázis-módosításokat.
2. Adatbázis- vagy Edge Function-változásnál ellenőrizd a meglévő sémát, teszteld a migrációt, és telepítsd a kompatibilis kiszolgálóoldali változatot. Ellenőrizd az állapotlekérést és a jogosultságokat.
3. Tedd közzé a frontendet a GitHub `main` ágán. Módosítsd az érintett statikus fájlok verzióparaméterét, majd várd meg a sikeres GitHub Pages-futtatást.
4. Nyisd meg az éles oldalt, ellenőrizd az érintett funkciót, és rögzítsd a forrásazonosítót, a futtatást és az eredményt.

## Ellenőrzés és visszaállítás

- Gyors ellenőrzés: a térkép betöltése, PIN-es belépés, admin városváltás, két játékos ikonja és helymegosztása, időzítő, körlezárás és eredményablak. A GPS- és többtelefonos próbát külön jelöld.
- Hiba esetén ellenőrizd a Pages-futtatást és az érintett backend működését. A frontend egy korábbi működő változatra állítható vissza új javító commitban. Szerver- vagy adatbázis-visszaállítás előtt ellenőrizd a kompatibilitást és az adatok megőrzését.
- Az 1.5.3-as változatnál a város elfogadását automatizált teszt ellenőrizte. A korábbi vizsgálatok és korlátaik az [ellenőrzési naplóban](ELLENORZES.md) találhatók. A teljes, valódi telefonos próba továbbra is nyitott.

A regressziós tesztjegyzőkönyveket a [sablon](tesztjegyzokonyvek/SABLON.md) szerint kell kitölteni és a repóban tárolni.


## A mobilváltozat kiadása

1.6.0 frontend: manifest, PNG ikonok, pwa.js, sw.js, offline.html, mobilos stílusok és telepítési útmutató. Backend- és adatbázis-migráció nincs. A forrásban lévő script.js 1.5.3 marad; a mobilhéj verziója 1.6.0. Kiadás előtt a service worker teljes statikus fájllistáját és a verzióparamétereket együtt kell ellenőrizni. Frissítéskor a CACHE verzióját és minden megváltozott statikus fájl URL-verzióját emelni kell. A worker nem használ automatikus skipWaiting hívást. Visszaállítás új worker-verzióval és korábbi kompatibilis frontenddel történjen, hogy a telepített példányok is frissüljenek.

Az 1.6.0 első telepítése igazolt: a7ef3242be3225be0185b22e74d7eb5c7763a77f, sikeres [Pages-futtatás](https://github.com/ngynrbrt-prog/szuper-titkos-szovetseg/actions/runs/44827936959). Éles böngészőben a mobilútmutató és a térkép megnyílt. Az r2 frissítésjelzés-javítás telepítése is igazolt, a részletes bizonyíték az ellenőrzési naplóban és a mobilteszt-jegyzőkönyvben szerepel. Fizikai Android/iPhone próba még szükséges.


## Az 1.7.0 kiadás előkészítése

Változó fájlok: index.html, script.js, style.css, appearance.js, placement-model.js, sw.js, offline.html; kiegészített tesztek és dokumentáció. Először database/random-placement.sql telepítendő (opcionális 20/40 drágakő), majd a frontend. A backend visszafelé kompatibilis: gem_count nélkül 40 marad. A korábbi játékok, karakterek és jogosultságok nem módosulnak. A mobil service worker és a megváltozott fájlok verziója 1.7.0.

A szervermigráció sikeres, az adatbázispróba visszagörgetett tranzakcióban átment. Az 1.7.0, majd az 1.7.1 frontend telepítése sikeres, az igazolás az ellenőrzési naplóban és a jegyzőkönyvekben szerepel.


## Helyszínalapú random pálya

Az 1.7.1 az 1.7.0 szervermigrációjára épül; új adatbázis-módosítás nincs. Új poi-model.js, 1/3/5 km választó, Overpass CSP-engedély és helyszínalapú generálás. A PWA cache és minden változó kliensfájl verziója 1.7.1. A 1.7.0 Pages-futtatása igazolt: 7547254116498e8a718b0f68b80debc447aab7b4, futtatás 44831618794. Az 1.7.1 élesítése igazolt: c161c0019ceff933e83195679eb2582ea5302fe6, sikeres Pages-futtatás 44833099950; a bizonyíték az ellenőrzési naplóban és a jegyzőkönyvben szerepel. A szolgáltató kiesésekor nincs tetszőleges koordinátára történő fallback; hibaüzenet és változatlan korábbi terv marad.


## Az 1.8.0 változásai és telepítése

Új szerveres mezők és privát tábla: players.color_id, items.ring_share_seconds, game_private.location_samples. Először a six_rings_progress_colors_trails migráció futott le, majd a kiegészítő all_players_five_minute_ring_rescue. Az első migráció kiosztotta a meglévő játékosok egyedi színét. A játék az ellenőrzéskor előkészített volt, saját gyűrűk nélkül; így nem nullázódott futó játékból igazolt új számláló. Az új idejű gyűrűk múltbeli megosztását nem becsüljük vissza.

A tranzakciós tesztek igazolják a gyűrűidőt és átadáskori nullázást, a csak-hat-gyűrűs lezárást, a befagyasztott körszínt, az admin idő előtti lezárásának tiltását és az ötperces közös kiszabadítást. A közvetlen kliens-RPC és privát nyomvonaltábla továbbra is tiltott. A hat játékoshely betelt, új regisztráció végigvitele külön tesztkörnyezet nélkül nem futott.

Frontend: player-rules.js, summary-map.js, ring.svg, módosított menük, Hátizsák, összesítő, nagy GPS-gombok és áthelyezett telepítési sáv. A megváltozott statikus fájlok és a service worker cache verziója 1.8.0. A frontend élesítését csak a sikeres Pages-futás és az éles nézet ellenőrzése után jelöljük igazoltnak. Visszaállításnál az új adatmezőket és privát adatokat ne töröld; kompatibilis javító frontend és új worker-verzió szükséges.

A lezárt képernyős, bezárt oldalas folyamatos GPS Androidon és iPhone-on külön natív alkalmazást igényel. Az 1.8.0 webes változat ezt nem teljesíti, nem címkéz elavult helyadatot frissként. Források: [Android háttérhelymeghatározás](https://developer.android.com/develop/sensors-and-location/location/background), [Apple Core Location](https://developer.apple.com/documentation/corelocation/handling-location-updates-in-the-background).


## Natív alkalmazás és tartós rablásjelzés

A rablásjelzés migrációja: database/robbery-notices.sql, majd a már első változatot telepített környezeten notice-alias-fix.sql javította a tesztben talált SQL-aliasütközést. A végső round-rules.sql és a robbery-notices.sql már a javított függvényt tartalmazza. A native-response-map.sql kisméretű háttérválaszt és külön körképadat-lekérést vezetett be. A kibővített, címzetti RLS-t is próbáló tranzakciós teszt végső futása sikeres.

A natív projektek mobile/android és mobile/ios alatt vannak, a native-build.yml fordítja őket. Az Android debug APK tesztcsomag, nem Play Store-kiadás; az iOS-szimulátorapp nem telepíthető valódi iPhone-ra. iPhone-telepítéshez saját fejlesztői aláírás szükséges. Nem történt áruházi feltöltés, fizetős regisztráció vagy Apple-fiók módosítása. Fordítást, lintet, hardveres GPS-t és aláírt terjesztést külön állapotként kell jelenteni.

Az 1.8.0 webes kiadás már igazolt: f772089d9e9cac495a24047cc46c68a9cc587de1, sikeres Pages-futtatás 44838174098. Mobilon 297×68 px-es gombok, 375 px-es túllógásmentes oldal és alsó telepítési sáv látszik. A böngészős PNG-próba 12/12 térképcsempével sikeres. Az 1.9.0 frontend és natív build eredményét a futtatás után külön rögzítjük.
