# Felhasználói kézikönyv

## Tartalomjegyzék

- [Helyszínalapú random pálya](#helyszínalapú-random-pálya)
- [Megjelenítés, menü és random elhelyezés](#megjelenítés,-menü-és-random-elhelyezés)
- [Telepítés Androidra és iPhone-ra](#telepítés-androidra-és-iphone-ra)
- [Verziókövetés](#verziókövetés)
- [Mobilos és asztali webes nézet](#mobilos-és-asztali-webes-nézet)
- [Belépés és karakter](#belépés-és-karakter)
- [Játékos lépései](#játékos-lépései)
- [Admin lépései](#admin-lépései)
- [Hibaelhárítás](#hibaelhárítás)

## Verziókövetés

| Dokumentum | Játékverzió | Dátum | Változás |
| --- | --- | --- | --- |
| 1.0 | 1.5.3 | 2026-11-16 | Első kiadás a jelenlegi játékhoz. |
| 1.1 | 1.5.3 | 2026-11-16 | Mobilos és asztali webes útmutató képi illusztrációval. |
| 1.2 | 1.5.3 | 2026-11-16 | Áttekintve a technológiai leltár dokumentálásakor. |
| 1.3 | 1.5.3 | 2026-11-16 | Áttekintve a regressziós jegyzőkönyvezés bevezetésekor. |
| 1.4 | 1.6.0 | 2026-11-20 | Telepíthető mobilváltozat, használat, működés és korlátok dokumentálása. |
| 1.5 | 1.7.0 | 2026-11-20 | Belépett menü, világos/sötét megjelenítés és véletlen pályaterv. |
| 1.6 | 1.7.1 | 2026-11-20 | 1/3/5 km választó; gyűrűk és Mordor éttermeknél, kocsmáknál vagy nevezetességeknél. |

## Mobilos és asztali webes nézet

![Hat sematikus ábra. Felül mobilon, alul asztali böngészőben látható a belépés, a térképes játék és az admin városbeállítás.](kepek/mobil-es-web.jpg)

Az ábra felső sora a mobilos, az alsó az asztali webes használatot szemlélteti. Balról jobbra a belépés, a térképes játék és a városbeállítás látható. A gombok helye az ábrán és a tényleges felületen eltérhet.

| Művelet | Mobilböngésző | Asztali böngésző |
| --- | --- | --- |
| Belépés | Nyisd meg a **Belépés** menüt, majd görgess a megfelelő űrlaphoz. | Nyisd meg a **Belépés** menüt, és válaszd a visszatérő vagy az új karakter űrlapját. |
| Térkép | Húzd ujjal a térképet, nagyíts két ujjal vagy a + gombbal. A térkép alá görgetve éred el a helymegosztást és a kincsek listáját. | Húzd egérrel a térképet, használj görgőt vagy +/− gombot. A helymegosztás széles nézetben a térkép mellett található. |
| Helymegosztás | Aktív körben indítsd el a megosztást, és engedélyezd a helyhozzáférést a böngészőben. Terepen a telefont használd a gyűrű felvételéhez. | Ugyanazzal a gombbal indítható. A helymeghatározás pontossága az eszköztől függ, ezért a térkép és a kezelőfelület asztalon akkor is használható áttekintésre, ha a GPS pontatlan. |
| Adminisztráció | Ha az **Admin** menü kívül esik a képernyőn, görgesd oldalra a menüsort. A helyszínt érintéssel jelöld ki. | Az **Admin** menüben fogadd el a várost, majd a szerkesztőben egérkattintással helyezd el a pontokat. |

## Belépés és karakter

Nyisd meg a [játékot](https://ngynrbrt-prog.github.io/szuper-titkos-szovetseg/?v=1.7.1). Az **Új karakter** űrlapon válassz nevet, 6–12 számjegyes PIN-t, fajt és fegyvert. A **Visszatérő vándor** űrlapon lépsz be. A térképes ikont a **Szövetség → Térképes karakterikon → Ikon mentése** útvonalon állíthatod át.

## Játékos lépései

1. Aktív körben nyisd meg a **Térkép** oldalt, és indítsd el a helymegosztást. A friss, megosztott helyeket karakterikonok jelölik.
2. Az arany keresőkör segít megtalálni a gyűrűt. Saját gyűrűvel és aktív megosztással megjelenik a pontos jelölő.
3. Menj a tárgy tényleges helyétől 50 méteren belülre, majd válaszd a **Felveszem · 50 m** gombot. A műveletet a térképi jelölő felugró ablakából indítsd; belépett nézetben nincs külön kincslista.
4. A **Szövetség** oldalon választhatsz rablást, ha mindkét játékos megosztja friss helyét és 100 méteren belül vannak egymáshoz. A páros rablási védelem 15 perc.
5. A **Hátizsákban** Mordor 50 méteres körzetében megsemmisítheted a saját gyűrűdet. Több gyűrűnél elérhető az együttes megsemmisítés is. A kör véget ér, és megjelenik az eredményablak. Az **Eredmények** oldalon a pontok és a korábbi körök is láthatók.

## Admin lépései

1. **Admin → Új városi kaland** alatt írd be a települést, például Gárdonyt, majd nyomd meg a **Város elfogadása** gombot. Több találat esetén válassz a listából. Korábbi helyszínek esetén a váltás megerősítést kér.
2. **Helyszínek kijelölése a térképen** alatt válaszd ki a hat gyűrű helyét név szerint, Mordort és Sauron útvonalát. A pontok a központ 10 km-es körzetébe kerüljenek. Külön drágakőhelyeket is megadhatsz.
3. Ellenőrizd a helyek és az útvonal gyalogos megközelíthetőségét, jelöld be a jóváhagyást, majd válaszd az **Előkészített játék létrehozása** és a **Játék indítása** gombot.
4. Az aktuális kör még földön lévő gyűrűit a **Gyűrűk helyének módosítása** gombbal mozgathatod. Jelölj ki új pontot, hagyd jóvá és mentsd. Új körhöz térj vissza az új játék űrlapjához.

## Hibaelhárítás

Ha a gyűrűfelvétel sikertelen, ellenőrizd, hogy aktív-e a kör, engedélyezett-e a helymegosztás, elég friss-e a GPS és a gyűrű még a földön van-e. Ha az új funkció hiányzik, frissítsd az oldalt a kiadási hivatkozásról. Az éles változat azonosítója a [kiadási dokumentumban](RELEASE-ELESITES.md) található.


## Telepítés Androidra és iPhone-ra

1. Nyisd meg a játékot a telefon böngészőjében, majd válaszd a **Telepítés a telefonra** gombot.
2. **Android / Chrome:** ha megjelenik, fogadd el a telepítést; egyébként a böngésző menüjében válaszd az **Alkalmazás telepítése** vagy **Hozzáadás a kezdőképernyőhöz** pontot.
3. **iPhone / Safari:** **Megosztás → Főképernyőhöz adás → Hozzáadás**. Ha megjelenik a **Megnyitás webalkalmazásként**, legyen bekapcsolva.
4. Indítsd a zöld, arany gyűrűs ikonról. A telepített alkalmazás külön bejelentkezést és helyengedélyt kérhet. A helymegosztást indítsd újra.
5. Az **Új verzió elérhető** gombbal frissíthetsz. Ez újratölti a felületet és megszakítja a helymegosztást, ezért utána ellenőrizd és indítsd újra.

![A telefonra telepített alkalmazás ikonja](../assets/app-192.png)

A játékhoz internet szükséges. Kapcsolatvesztéskor figyelmeztetés jelenik meg, offline indításkor pedig újrapróbálási oldal. Tartsd az alkalmazást előtérben és a kijelzőt bekapcsolva a helymegosztáshoz. Törlés: a telefonon hosszan nyomd az ikont, majd válaszd az eltávolítást. A böngésző és az alkalmazás adatai külön is megmaradhatnak.

![Az éles telepítési segítség telefonméretű böngészőben](kepek/pwa-telepites-mobil.jpg)


## Megjelenítés, menü és random elhelyezés

Belépés után a fejlécben **Belépve: karakternév** látszik a **Kilépés** előtt. A Belépés gomb eltűnik. A **Beállítások → Megjelenítés** alatt válassz **Világos** vagy **Sötét** módot, majd **Beállítás mentése**. A választás ezen az eszközön, karakterenként mentődik; másik telefonon külön állítható. Az **Admin** menüpont kizárólag a belépett admin számára látszik.

A térképi tárgyjelölőre vagy gyűrű-keresési jelölőre bökve nyisd meg a felvételi műveletet. Belépve nincs külön „A következő felfedezés” tárgylista. A szükséges távolság, friss GPS és aktív játék továbbra is feltétel.

**Véletlen pálya:**

1. Admin → Új városi kaland: fogadd el a várost, majd nyisd meg a térképes szerkesztőt.
2. Válassz **1 km**, **3 km** vagy **5 km** sugarat a listából; alapérték 1 km.
3. Nyomd meg a **Random elhelyezés** gombot, majd bökj a kívánt középpontra. A gomb ismételt megnyomásával megszakíthatod a módot. A teljes kör maradjon a városközpont 10 km-es körzetében.
4. Korábbi tervnél erősítsd meg a lecserélést. 6 gyűrű, 20 drágakő, Mordor és Sauron útvonala jelenik meg. A jelenlegi játékot ez még nem változtatja meg.
5. Vizsgáld át az összes pontot és útvonalszakaszt. Húzással módosíthatod a jelölőket; a véletlen útvonal nem követi automatikusan az utcákat. Vízre, magánterületre vagy veszélyes helyre eső pontot helyezz át.
6. Jóváhagyás után hozd létre az előkészített játékot, és csak ellenőrzés után indítsd el. Kézi tervnél a korábbi 40 drágakő az alapérték; generált tervnél 20.


## Helyszínalapú random pálya

A **Random elhelyezés** mellett a lenyíló listában **1 km**, **3 km** vagy **5 km** választható. Térképkattintás után várd meg az éttermek, kocsmák és nevezetességek keresését. A hat gyűrű és Mordor az ilyen helyekre kerül; a nevük megjelenik a szerkesztőben. Kevés találatnál válassz nagyobb sugarat vagy másik középpontot. Hálózati hibánál próbáld később: a korábbi terv nem vész el.

A generált gyűrűt és Mordort ismert helyszín közelébe húzva vagy kattintva a jelölő a helyszín koordinátájára illeszkedik. 150 méteren belüli megfelelő hely hiányában az áthelyezés elutasított. Újratöltés után a hét kiválasztott hely marad ismert; más helyekhez új generálást indíthatsz. A térképes adatok lehetnek elavultak, a hely nyitvatartását, megközelíthetőségét és a teljes útvonalat indulás előtt ellenőrizd. A véletlenül generált drágakő és útvonalpont továbbra is kézzel áthelyezhető.
