# Kiadási és élesítési dokumentum

## Tartalomjegyzék

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

## Éles kiadás

**Játékverzió:** 1.6.0 (mobilhéj r2). **Forrás:** `1ff23459ad04e8e8d4af44137b4bd978473d02cf`. A Pages-futtatás sikeres; az éles oldalon az r2 belépőfájl, a térkép és a telepítési útmutató ellenőrizve. [Éles oldal](https://ngynrbrt-prog.github.io/szuper-titkos-szovetseg/) · [Telepítési futtatás](https://github.com/ngynrbrt-prog/szuper-titkos-szovetseg/actions/runs/44828274081)

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

A szervermigráció sikeres, az adatbázispróba visszagörgetett tranzakcióban átment. A frontend telepítését ebben a szakaszban még nem jelöljük élesnek; az igazolás az ellenőrzési naplóba kerül.
