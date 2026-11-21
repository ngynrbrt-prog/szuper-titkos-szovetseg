# Natív mobil és rablásjelzés ellenőrzése — 1.9.0

## Tartalomjegyzék

- [Verziókövetés](#verziókövetés)
- [Környezet](#környezet)
- [Tesztesetek és futtatások](#tesztesetek-és-futtatások)
- [Korlátok](#korlátok)

## Verziókövetés

| Verzió | Dátum | Változás |
| --- | --- | --- |
| 1.0 | 2026-11-21 | Natív híd, Android/iOS projektek, tartós rablásjelzés és újrapróbált szerverpróbák. |

## Környezet

Helyi macOS x86_64, Node REPL VM/assert; nincs helyi Node CLI, JDK, Android SDK vagy Xcode SDK. A natív projektfájlok plutil/xmllint vizsgálata helyben; a fordítás GitHub Actions Linux/macOS környezetben indul. Android: AGP 8.13.0, Gradle 8.13, JDK 17, SDK 36, min Android 26. iOS: Swift 5 mód, minimum iOS 16, szimulátoros aláírás nélküli build. Supabase: élő séma, ideiglenes sessionök és fixture-játék minden tesztben ROLLBACK. Nincs valódi felhasználónak küldött teszt-rablásjelzés. A rögzített nyilvános helyszín-fixture nem személyes nyomvonal.

## Tesztesetek és futtatások

| Eset | Futás | Technológia/eszköz/mód | Lépés és elvárt eredmény | Tényleges/bizonyíték | Státusz |
| --- | --- | --- | --- | --- | --- |
| R19-01 | 01 | SQL / Supabase / automata | Rabláskor tartós üzenet és összes korábbi szabály | Az új notices alias n ütközött a PL/pgSQL n változóval | Sikertelen, javított |
| R19-01 | 02 | SQL / Supabase / automata | notice_row alias után újra | PASS: sértett látja a tárgy nevét, más nem olvassa/nyugtázza, visszavont session nem olvassa, nyugtázásig state-ben marad | Sikeres |
| R19-01 | 03 | SQL / Supabase / automata | Kis háttérválasz és külön round_map után újra | Kibővített ring-progress-rescue.sql PASS, a korábbi gyűrű/rescue/szín esetekkel együtt; ROLLBACK | Sikeres |
| R19-02 | 01 | JS / Node VM / automata | Összes kliensoldali teszt | A PWA-teszt minden supabase nevű fájlt kizárt, az új statikus vendor SDK-t is | Sikertelen tesztillesztés |
| R19-02 | 02 | JS / Node VM / automata | Csak távoli API-forgalmat kizáró javított teszt | PWA PASS, a helyi statikus SDK cache-elhető, az API és POST továbbra sem | Sikeres |
| R19-03 | 01 | JS / Node VM / automata | tests/robbery-notices.test.cjs | Piros állapot tartós; pontos tárgynév; Rendben ack_notice; nincs ismételt kényszernavigáció; szervernyugtázás után rejtett | Sikeres |
| R19-04 | 01 | JS / Node VM, fake native host / automata | tests/native-bridge.test.cjs | Natív felismerés, kérés/válasz, auth továbbítás, 204, engedélyhiba, külső fetch változatlan, böngészőben nincs natív híd | Sikeres |
| R19-05 | 01 | plutil, xmllint / automata | iOS plist/privacy/pbxproj és Android XML/scheme | Minden vizsgált projektfájl szintaktikailag helyes | Sikeres |
| R19-06 | 01 | GitHub Actions / Android fordító+lint / automata | Debug APK és lint | A build/lint lépés sikertelen; APK-feltöltés kimaradt. A felhasználó elhalasztotta az appmunkát; további javítás/újrafordítás nem indult | Sikertelen, elhalasztva |
| R19-07 | 01 | GitHub Actions / Xcode / automata | Aláíratlan iOS-szimulátorapp fordítása | Sikeres a beaedd77c5138af82642f86d1c6bebb02838ebd3 forrásnál. Későbbi keményítések fordítása elhalasztva, fizikai háttér-GPS nincs igazolva | Sikeres, prototípus |
| R19-08 | — | Fizikai Android és iPhone / kézi | Lezárt kijelző, háttér, mozgás/álló helyzet, tokenforgatás, offline, kézi/értesítéses stop | Fizikai eszköz nincs | Nem futott |
| R19-09 | — | Két hitelesített böngésző / kézi | Valódi Realtime üzenetkésleltetés és Rendben | Külön tesztfiókok nélkül nem futott; az SQL és render-próba igazolt | Nem futott |
| R19-10 | — | CUA / éles böngésző | Végső, natív híd nélküli 1.9.1 webes változat megnyitása | Élesítés után rögzítendő | Tervezett |

## Korlátok

A natív fordítás nem bizonyít fizikai háttér-GPS-t, és az iOS-szimulátorcsomag nem iPhone-telepítő. A felhasználó általi kényszerített leállítás, engedélymegvonás, GPS/hálózathiány vagy rendszerkorlátozás megszakíthatja a megosztást. A szándék megőrizhető, de elavult koordinátát nem kezelünk frissként. A Realtime-hoz tartós lekéréses tartalék van; valódi kéttelefonos, élő WS-késleltetést nem állítunk igazoltnak. Fizetős fejlesztői tagság, aláírt iOS-terjesztés és áruházi feltöltés nem történt.

A felhasználó későbbre halasztotta az appot és az automatikus böngészős folytatást is visszavonta. A kód megmaradt, automatikus appfordítás letiltva (csak workflow_dispatch). Az 1.9.1 böngészős kiadás nem aktiválja a natív prototípust.
