# Felhasználói kézikönyv

## Tartalomjegyzék

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

Nyisd meg a [játékot](https://ngynrbrt-prog.github.io/szuper-titkos-szovetseg/?v=1.5.3). Az **Új karakter** űrlapon válassz nevet, 6–12 számjegyes PIN-t, fajt és fegyvert. A **Visszatérő vándor** űrlapon lépsz be. A térképes ikont a **Szövetség → Térképes karakterikon → Ikon mentése** útvonalon állíthatod át.

## Játékos lépései

1. Aktív körben nyisd meg a **Térkép** oldalt, és indítsd el a helymegosztást. A friss, megosztott helyeket karakterikonok jelölik.
2. Az arany keresőkör segít megtalálni a gyűrűt. Saját gyűrűvel és aktív megosztással megjelenik a pontos jelölő.
3. Menj a tárgy tényleges helyétől 50 méteren belülre, majd válaszd a **Felveszem · 50 m** gombot. A gomb a térképen és a kincsek listájában is elérhető.
4. A **Szövetség** oldalon választhatsz rablást, ha mindkét játékos megosztja friss helyét és 100 méteren belül vannak egymáshoz. A páros rablási védelem 15 perc.
5. A **Hátizsákban** Mordor 50 méteres körzetében megsemmisítheted a saját gyűrűdet. Több gyűrűnél elérhető az együttes megsemmisítés is. A kör véget ér, és megjelenik az eredményablak. Az **Eredmények** oldalon a pontok és a korábbi körök is láthatók.

## Admin lépései

1. **Admin → Új városi kaland** alatt írd be a települést, például Gárdonyt, majd nyomd meg a **Város elfogadása** gombot. Több találat esetén válassz a listából. Korábbi helyszínek esetén a váltás megerősítést kér.
2. **Helyszínek kijelölése a térképen** alatt válaszd ki a hat gyűrű helyét név szerint, Mordort és Sauron útvonalát. A pontok a központ 10 km-es körzetébe kerüljenek. Külön drágakőhelyeket is megadhatsz.
3. Ellenőrizd a helyek és az útvonal gyalogos megközelíthetőségét, jelöld be a jóváhagyást, majd válaszd az **Előkészített játék létrehozása** és a **Játék indítása** gombot.
4. Az aktuális kör még földön lévő gyűrűit a **Gyűrűk helyének módosítása** gombbal mozgathatod. Jelölj ki új pontot, hagyd jóvá és mentsd. Új körhöz térj vissza az új játék űrlapjához.

## Hibaelhárítás

Ha a gyűrűfelvétel sikertelen, ellenőrizd, hogy aktív-e a kör, engedélyezett-e a helymegosztás, elég friss-e a GPS és a gyűrű még a földön van-e. Ha az új funkció hiányzik, frissítsd az oldalt a kiadási hivatkozásról. Az éles változat azonosítója a [kiadási dokumentumban](RELEASE-ELESITES.md) található.
