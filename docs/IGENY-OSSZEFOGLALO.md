# Igényösszefoglaló

## Tartalomjegyzék

- [Helyszínalapú random pálya](#helyszínalapú-random-pálya)
- [Belépett felület és pályagenerálás](#belépett-felület-és-pályagenerálás)
- [Telefonra telepíthető alkalmazás](#telefonra-telepíthető-alkalmazás)
- [Verziókövetés](#verziókövetés)
- [Cél és szerepkörök](#cél-és-szerepkörök)
- [Elfogadási feltételek](#elfogadási-feltételek)
- [Hatókör és korlátok](#hatókör-és-korlátok)

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

## Cél és szerepkörök

A Szuper Titkos szövetség egy városi, közös GPS-játék legfeljebb hat karakterrel. A játékos regisztrál, játszik és eredményt néz. Az admin elfogadja a várost, kijelöli a helyszíneket, előkészíti, indítja és lezárhatja a kört. Az adminjogot külön kell beállítani.

## Elfogadási feltételek

- A belépés karakternévvel és 6–12 számjegyes PIN-nel történik. A regisztráció meghívó nélkül elérhető.
- A város elfogadásakor a szerkesztő a város központjára áll. Az admin kijelöli a hat gyűrűt, Mordort és Sauron útvonalát. Egy körben hat gyűrű és kézi tervnél negyven, generált tervnél húsz drágakő van.
- Helymegosztáskor a térkép a játékosok választott karakterikonját mutatja. A saját ikon arany keretet kap. A földön lévő gyűrűk közelítő keresőköre GPS nélkül is látható. A pontos jelölőhöz saját gyűrű és aktív helymegosztás kell.
- Tárgyfelvételhez friss GPS és legfeljebb 50 méter, rabláshoz két megosztott, friss hely és legfeljebb 100 méter kell. A szerver dönt a műveletekről.
- Sauron friss helyzetet megosztó gyűrűbirtokost üldöz. Több alkalmas célpont közül a hozzá legközelebbit választja.
- Az első sikeres mordori megsemmisítés lezárja a kört, és a megsemmisítő nyer. Több saját gyűrű egy művelettel is megsemmisíthető. Mind a hat gyűrű megszerzésekor Sauron nyer. Az eredményablak a győztest és az adott kör játékosonkénti eredményeit mutatja. A játékidő lezáráskor megáll. Új körhöz új játékot kell konfigurálni.

## Hatókör és korlátok

A gárdonyi pergamentérkép önálló koncepció. A jelenlegi játék az utcai térképet használja. A böngészős GPS pontossága készülékfüggő. A pontos tárgykoordináták megjelenítését a kliens szabályozza, és a szerverválasz tartalmazhatja ezeket az adatokat. A kéttelefonos kültéri ellenőrzés nyitott.


## Telefonra telepíthető alkalmazás

A játék Androidon és iPhone-on kezdőképernyőről indítható PWA-változatot kap. Követelmény a saját ikon, önálló ablak, telepítési segítség, kapcsolatvesztés jelzése és felhasználó által indított verzióváltás. A többjátékos működés online; háttérbeli és lezárt képernyős GPS nincs vállalva. Fizikai telefonos elfogadás még szükséges.


## Belépett felület és pályagenerálás

A fejléc a Kilépés előtt minden képernyőméreten mutatja a belépett karakter nevét. Belépés után a Belépés gombok és a következő felfedezés tárgylistája eltűnnek; a felvétel a térképi jelölőből indítható. A Beállítások minden belépett karakternek elérhető, az Admin csak belépett adminnak. A világos/sötét választás eszközönként és karakterenként mentett.

Új játék tervénél a Random elhelyezés 1, 3 vagy 5 kmes sugarú körben 6 gyűrűt, 20 drágakövet, Mordort és Sauron útvonalát helyezi el. A kör teljes egészében a város 10 km-es korlátján belül marad. A generálás meglévő tervnél megerősítést kér, ellenőrzést nem helyettesít; mentés előtt kötelező a helyszínek és útszakaszok ellenőrzése. A már futó játék automatikus újraszórása nem része ennek a funkciónak.


## Helyszínalapú random pálya

A sugár kizárólag 1, 3 vagy 5 km lehet. A hat gyűrű és Mordor hét különböző étterem, kocsma/bár vagy nevezetesség OSM-koordinátájára kerül. Legalább hét különböző hely szükséges; hiányos vagy sikertelen lekérdezéskor a régi terv változatlan marad. A 20 drágakő és Sauron geometrikus útvonala továbbra is véletlen. A teljes kör a városközpont 10 km-es körzetében marad.
