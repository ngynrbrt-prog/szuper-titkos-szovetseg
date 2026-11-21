# Igényösszefoglaló

## Tartalomjegyzék

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
