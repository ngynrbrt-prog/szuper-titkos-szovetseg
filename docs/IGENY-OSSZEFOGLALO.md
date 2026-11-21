# Igényösszefoglaló

## Tartalomjegyzék

- [Sauron aktuális helyének láthatósága](#sauron-aktuális-helyének-láthatósága)

- [Adminisztrátori kézi leállítás](#adminisztrátori-kézi-leállítás)

- [Aktuális webes és natív állapot](#aktuális-webes-és-natív-állapot)
- [Belépés utáni összesítő javítása](#belépés-utáni-összesítő-javítása)
- [Natív alkalmazás és tartós rablásjelzés](#natív-alkalmazás-és-tartós-rablásjelzés)
- [Gyűrűidő, játékosszín és közös kiszabadítás](#gyűrűidő,-játékosszín-és-közös-kiszabadítás)
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
| 1.7 | 1.8.0 | 2026-11-21 | Gyűrűnkénti 60 perc, hat gyűrűs lezárás, színek, ikonbeállítás és körkép. |
| 1.8 | 1.8.0 | 2026-11-21 | Közös ötperces helymegosztás kiszabadítja Sauron gyűrűit. |
| 1.9 | 1.8.0 | 2026-11-21 | Telefonos sáv a Beállításokban és a térképoldal alján. |
| 1.10 | 1.8.0 | 2026-11-21 | Teljes szélességű, nagy helymegosztási gombok. |
| 1.11 | 1.8.0 | 2026-11-21 | Android/iPhone natív háttér-GPS igény rögzítve; a PWA korlátja változatlan, külön fejlesztés indul. |
| 1.12 | 1.9.0 | 2026-11-21 | Tartós, nyugtázható piros rablásjelzés és címzettvédett Realtime. |
| 1.13 | 1.9.0 | 2026-11-21 | Android/iPhone natív projektek, háttér-GPS és biztonságos munkamenethíd. |
| 1.14 | 1.9.1 | 2026-11-21 | Natív appkészítés elhalasztva, kód és eredmények megőrizve; automatikus fordítás kikapcsolva. |
| 1.15 | 1.9.1 | 2026-11-21 | Böngészős automatikus megosztásfolytatás kérése visszavonva; marad a kézi újraindítás. |
| 1.16 | 1.9.2 | 2026-11-21 | A felhasználó jóváhagyta a natív app folytatását; böngészős kézi GPS működés megmarad. |
| 1.17 | 1.9.3 | 2026-11-21 | Történeti popup tiltása belépéskor, körhöz kötött térkép; natív sikeres build és korlátok ellenőrizve. |
| 1.18 | 1.9.4 | 2026-11-21 | Admin kézi megszakítás visszaállítva, jogosultság és megerősítés tesztelve; az 1.9.3 élesítése igazolt. |
| 1.19 | 1.9.5 | 2026-11-21 | Sauron élő helye csak saját gyűrűvel és friss saját helymegosztással látható; szerverválasz és kliens ellenőrizve. |

## Cél és szerepkörök

A Szuper Titkos szövetség egy városi, közös GPS-játék legfeljebb hat karakterrel. A játékos regisztrál, játszik és eredményt néz. Az admin elfogadja a várost, kijelöli a helyszíneket, előkészíti, indítja és lezárhatja a kört. Az adminjogot külön kell beállítani.

## Elfogadási feltételek

- A belépés karakternévvel és 6–12 számjegyes PIN-nel történik. A regisztráció meghívó nélkül elérhető.
- A város elfogadásakor a szerkesztő a város központjára áll. Az admin kijelöli a hat gyűrűt, Mordort és Sauron útvonalát. Egy körben hat gyűrű és kézi tervnél negyven, generált tervnél húsz drágakő van.
- Helymegosztáskor a térkép a játékosok választott karakterikonját mutatja. A saját ikon arany keretet kap. A földön lévő gyűrűk közelítő keresőköre GPS nélkül is látható. A pontos jelölőhöz saját gyűrű és aktív helymegosztás kell.
- Tárgyfelvételhez friss GPS és legfeljebb 50 méter, rabláshoz két megosztott, friss hely és legfeljebb 100 méter kell. A szerver dönt a műveletekről.
- Sauron friss helyzetet megosztó gyűrűbirtokost üldöz. Több alkalmas célpont közül a hozzá legközelebbit választja.
- A kör csak mind a hat gyűrű megsemmisülésekor zárul le, a győztest a pontszámrangsor adja. Saját gyűrű 60 perc igazolt megosztás után semmisíthető meg, több gyűrűnél mindegyikre teljesülnie kell. Sauron összes gyűrűjének megszerzése nem zárja le a játékot. Az eredményablak a győztest és az adott kör játékosonkénti eredményeit mutatja. A játékidő lezáráskor megáll. Új körhöz új játékot kell konfigurálni.

## Hatókör és korlátok

A gárdonyi pergamentérkép önálló koncepció. A jelenlegi játék az utcai térképet használja. A böngészős GPS pontossága készülékfüggő. A pontos tárgykoordináták megjelenítését a kliens szabályozza, és a szerverválasz tartalmazhatja ezeket az adatokat. A kéttelefonos kültéri ellenőrzés nyitott.


## Telefonra telepíthető alkalmazás

A játék Androidon és iPhone-on kezdőképernyőről indítható PWA-változatot kap. Követelmény a saját ikon, önálló ablak, telepítési segítség, kapcsolatvesztés jelzése és felhasználó által indított verzióváltás. A többjátékos működés online; háttérbeli és lezárt képernyős GPS nincs vállalva. Fizikai telefonos elfogadás még szükséges.


## Belépett felület és pályagenerálás

A fejléc a Kilépés előtt minden képernyőméreten mutatja a belépett karakter nevét. Belépés után a Belépés gombok és a következő felfedezés tárgylistája eltűnnek; a felvétel a térképi jelölőből indítható. A Beállítások minden belépett karakternek elérhető, az Admin csak belépett adminnak. A világos/sötét választás eszközönként és karakterenként mentett.

Új játék tervénél a Random elhelyezés 1, 3 vagy 5 km sugarú körben 6 gyűrűt, 20 drágakövet, Mordort és Sauron útvonalát helyezi el. A kör teljes egészében a város 10 km-es korlátján belül marad. A generálás meglévő tervnél megerősítést kér, ellenőrzést nem helyettesít; mentés előtt kötelező a helyszínek és útszakaszok ellenőrzése. A már futó játék automatikus újraszórása nem része ennek a funkciónak.


## Helyszínalapú random pálya

A sugár kizárólag 1, 3 vagy 5 km lehet. A hat gyűrű és Mordor hét különböző étterem, kocsma/bár vagy nevezetesség OSM-koordinátájára kerül. Legalább hét különböző hely szükséges; hiányos vagy sikertelen lekérdezéskor a régi terv változatlan marad. A 20 drágakő és Sauron geometrikus útvonala továbbra is véletlen. A teljes kör a városközpont 10 km-es körzetében marad.


## Gyűrűidő, játékosszín és közös kiszabadítás

A Szövetség névsorában a karakter neve mellett a választott faj ikonja jelenik meg. A Hátizsákban a gyűrű kis képe és az adott gyűrű aktuális birtoklása alatt igazolt helymegosztási idő látható. Egy gyűrű csak legalább 3600 összegyűjtött másodperc után semmisíthető meg, friss GPS-szel, Mordor 50 m-es körzetében. Elvesztés, rablás, visszaszerzés és új felvétel nullázza az adott birtoklási szakasz számlálóját. Megszakítás önmagában nem törli a gyűrű addigi idejét, de a szünet nem számít bele. Az összes gyűrű együttes megsemmisítése csak akkor engedett, ha mindegyik saját gyűrű külön jogosult.

Az aktív kör kizárólag a hatodik gyűrű megsemmisülésekor ér véget. Sauron gyűrűinek száma és az admin lezáró művelete nem fejezhet be aktív kört. Az el nem indított előkészület elvethető. A nyertes a szerver pontszám szerinti rangsorának első játékosa, holtversenyben megsemmisített gyűrűk, gyűrűidő, majd stabil játékosazonosító szerint.

Minden játékos automatikusan véletlen, egyedi színt kap nyolc alapszínből. Színt csak két kör között vagy az indítás előtt válthat, foglalt színre nem. A karakterikon a Beállításokban módosítható. A kör végén letölthető térképkép mutatja a várost és a bekapcsolt helymegosztások színes nyomvonalait, a kör végén rögzített színekkel.

Ha a Sauronnál lévő gyűrűk mellett minden regisztrált játékos egyszerre legalább 300 másodpercig friss helyet oszt meg, új elfogás nélkül, minden Sauronnál lévő gyűrű visszatér az eredeti felvételi koordinátájára. Leállítás, 30 másodperces GPS-elavulás, új elfogás vagy legalább 30 másodperces ellenőrzési hiány újrakezdi a közös időt. A kiszabadított gyűrűk újból felvehetők, saját egyórás idejük nulláról indul.

A telefonos telepítési sáv a Beállításokban és a kezdő térképoldal legalján látszik. A helymegosztás két gombja teljes kártyaszélességű, legalább 64 px magas; mobilon 68 px magas és a térkép alatt kap helyet.

A lezárt képernyős, bezárt oldalas folyamatos GPS Androidon és iPhone-on külön natív alkalmazást igényel. Az 1.8.0 webes változat ezt nem teljesíti, nem címkéz elavult helyadatot frissként. Források: [Android háttérhelymeghatározás](https://developer.android.com/develop/sensors-and-location/location/background), [Apple Core Location](https://developer.apple.com/documentation/corelocation/handling-location-updates-in-the-background).


## Natív alkalmazás és tartós rablásjelzés

Rabláskor a kifosztott játékos a kezdő térképoldalon piros, tartós „Rablás történt” dobozt kap az elrabolt tárgy nevével. Csak a Rendben nyugtázás tünteti el, másik játékos nem nyugtázhatja; újranyitás és új játék sem törli a nyugtázatlan jelzést. Kapcsolatban Realtime jelzi a változást, kimaradásnál a tízmásodperces lekérés hozza vissza a tartós állapotot.

Androidon és iPhone-on natív alkalmazás ad háttérbeli, lezárt képernyős helymeghatározást. Külön telefonos engedély szükséges. A natív rész a böngésző szünetelésétől függetlenül küldi a friss méréseket, tokenfrissítéssel. A felhasználói Leállítás és kijelentkezés megszakítja; rendszerkényszer, engedélyvisszavonás, GPS- és hálózathiány továbbra is megszakíthatja. iOS kényszerített bezárás után korlátlan folytatást nem ígérünk. A fizikai működés külön elfogadási próba.


## Aktuális webes és natív állapot

Az Android/iPhone fejlesztés a felhasználó jóváhagyása alapján folytatódott. A korábbi halasztás történeti döntés, nem jelenlegi korlátozás. Az Android 1.9.2 teszt-APK és az aláírás nélküli iOS-szimulátor build sikeres a [44842967106 futásban](https://github.com/ngynrbrt-prog/szuper-titkos-szovetseg/actions/runs/44842967106), forrás: `2dded917eb8561da9c27195eb1c7cbda439c2fdc`. Android build és lint sikeres; az első futás hibáját az AndroidX OnBackPressedDispatcher javította. [Android ZIP](https://github.com/ngynrbrt-prog/szuper-titkos-szovetseg/actions/runs/44842967106/artifacts/14681647800): kicsomagolás után az app-debug.apk telepíthető tesztelésre. Fizikai telefonos háttér-GPS még nem igazolt. Az iPhone valódi készülékes telepítéséhez aláírás szükséges; a felhasználónak nincs Apple-fejlesztői hozzáférése, aláírt iPhone-telepítő nincs.

A böngésző/PWA továbbra is használható; a natív híd normál böngészőben nem aktiválódik. Böngészős szünet után kézi helymegosztás-indítás szükséges, automatikus újraindítást a felhasználó nem kért. A szünet alatt nincs gyűrűidő-jóváírás.

## Belépés utáni összesítő javítása

Az 1.9.3 nem nyitja meg belépéskor egy korábban befejezett játék eredményablakát és térképét. Az aktív Gárdony-játék mellé így nem kerül a régi prágai kör képe. Az összesítő csak a bejelentkezve megfigyelt aktív kör befejezésekor jelenik meg, ugyanannak a körnek az azonosítójával és térképével. Ismételt állapotlekérés nem nyitja újra. Kijelentkezés törli a kliens körfigyelését; az adatbázis és a régi eredmények megmaradnak.

Automatizált ellenőrzés: 13 sikeres JavaScript-tesztcsomag, köztük a belépés, Gárdony/Prága eltérés, ismétlés, kijelentkezés és gyors új játék esetei. [Jegyzőkönyv](tesztjegyzokonyvek/2026-11-21-popup-1.9.3.md).

## Adminisztrátori kézi leállítás

Aktív játékban az Admin → Aktuális játék résznél a **Játék kézi leállítása** gomb jelenik meg. Megerősítés után megszakítja a futó kört: nincs győzteshirdetés vagy kör végi győzelmi térkép, a szerver kikapcsolja a kör helymegosztásait és az ötperces közös számlálót. Az adatokat megőrzi, admin_cancel eseményt naplóz. Az admin ezután új játékot konfigurálhat. Előkészített játékban ugyanitt **Előkészület elvetése** látható. Lezárt körnél a gomb inaktív. A rendes győzelmi feltétel továbbra is mind a hat gyűrű megsemmisítése.

A game_action új abort művelete élő munkamenetet és adminjogot ellenőriz, valamint confirm=true és az aktuális game azonosítóját kéri. Másik körre elavult gombnyomás nem állíthat le játékot. A frontend megerősítés elutasításakor nem küld kérést. A korábbi finish művelet továbbra is csak előkészületet vet el. A restore_explicit_admin_manual_stop migráció csak a függvényt bővíti, a futó éles kört nem állítja le. [Tesztjegyzőkönyv](tesztjegyzokonyvek/2026-11-21-admin-leallitas-1.9.4.md).

## Sauron aktuális helyének láthatósága

Az 1.9.5-ben aktív játék alatt minden játékos csak akkor láthatja Sauron aktuális helyét, ha **saját birtokában van legalább egy gyűrű**, és **a saját helymegosztása aktív, 30 másodpercnél frissebb, legfeljebb 50 m pontatlanságú**. Más játékos gyűrűje vagy megosztása nem elegendő; adminjog nem ad kivételt. A feltételek megszűnésekor a következő állapotfrissítés elrejti Sauront. A rablás utáni rejtőzési időben jogosult játékosnak sem látható. A játék előtti, kétóránként váltakozó más kontinenses észlelés változatlan.

A game_action a válasz sauron mezőjét az adott kérőre ellenőrzi. A game.config válaszából mindenkinél kihagyja a sauron_position, sauron_tick_at és sauron_target belső mezőket; a szerveroldali üldözéshez az adatbázisban megmaradnak. A kliens nem következtet helyre a járőrútvonalból, rejtett állapotban nincs jelölő és a Sauron mutatása gomb tiltott. Az üldözési szabály továbbra is csak friss helyet megosztó gyűrűbirtokost céloz.

Migráció: sauron_visible_only_to_sharing_ring_owner; forrás: database/sauron-visibility.sql. [Tesztjegyzőkönyv](tesztjegyzokonyvek/2026-11-21-sauron-lathatosag-1.9.5.md).
