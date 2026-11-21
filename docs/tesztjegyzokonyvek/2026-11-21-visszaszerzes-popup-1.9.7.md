# Tesztjegyzőkönyv — közös visszaszerzés popupjai, 1.9.7

## Tartalomjegyzék

- [Verziókövetés](#verziókövetés)
- [Környezet és hatókör](#környezet-és-hatókör)
- [Tesztesetek](#tesztesetek)
- [Korlátok](#korlátok)

## Verziókövetés

| Verzió | Dátum | Változás |
| --- | --- | --- |
| 1.0 | 2026-11-21 | Indulási és sikeres visszaszerzési értesítés. |

## Környezet és hatókör

Web 1.9.7 helyi forrás, macOS Node REPL JavaScript VM, node:assert/strict. Automatizált teszt a tényleges rescue-notices.js modullal, szimulált dialog DOM, localStorage és hitelesített szerverállapot. Forrás/bizonyíték: tests/rescue-notices.test.cjs. Backend és adatbázis változatlan; nincs új SQL-próba.

## Tesztesetek

Minden alábbi eset első futtatása sikeres.

| Eset | Lépések / elvárt | Tényleges és bizonyíték |
| --- | --- | --- |
| POP-01 | Szerver rescue_started_at: minden megosztás elkezdődött, öt perc fut. | PASS: egy folyamatban popup. |
| POP-02 | Azonos állapot ismételt lekérése. | PASS: nincs ismétlés. |
| POP-03 | Befejezés jelzése, miközben az indulási ablak nyitva. | PASS: sorban vár, indulási bezárása után sikerablak nyílik, 3 gyűrű felirattal. |
| POP-04 | Sikerablak bezárása. | PASS: sharing=true, stopCalls=0. Nincs automatikus GPS-leállítás. |
| POP-05 | Nyugtázott esemény újratöltés és ismételt poll után. | PASS: nem nyílik újra ugyanannál a játékosnál. |
| POP-06 | Másik játékos ugyanazt a szervereseményt kapja. | PASS: neki külön popup jelenik meg. |
| POP-07 | Eredményablak nyitva van, majd bezárul. | PASS: visszaszerzési értesítés megvárja. |
| POP-08 | Kijelentkezés/reset. | PASS: ablak zárva, nincs GPS-stop. |
| REG-01 | Összes .test.cjs csomag. | PASS: mind a 15, beleértve az admin, GPS, térkép, PWA és korábbi értesítések tesztjeit. |

## Korlátok

Valódi többtelefonos, ötpereces élő kör: NEM FUTTATOTT. Böngészőteszt az élő verzió/vezérlők ellenőrzésére külön kerül az ellenőrzési naplóba. A popupok böngészőben futó értesítések, nem OS push üzenetek. A nyugták helyiek: másik eszközön vagy törölt helyi adatok után az aktuális kör értesítése újra megjelenhet. Kikapcsolt/bezárt kliens nem jelenít meg azonnal popupot; állapotlekéréskor kapja meg az aktuális kör elérhető jelzését.

Éles böngészős ellenőrzés / 1. kísérlet: PASS. Pages 44848819826 sikeres, a1cdc663e7dfbd290ed989be80980e6670e842c2. Élő vendégnézet 1.9.7; új modul betöltve, dialog nyugalmi állapotban zárva, bezárógomb és megosztási magyarázat jelen van, konzolhiba nincs. Ez a telepített felület ellenőrzése, nem valós ötperces esemény végigjátszása.
