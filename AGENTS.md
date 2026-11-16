# Dokumentáció karbantartása

Minden kért projektmódosítás részeként nézd át és frissítsd az alábbi négy Markdown-dokumentumot. Az érdemi változásokat írd át az érintett fejezetekben, és minden dokumentum verziókövetésébe adj új sort. Ha egy dokumentumban csak az ellenőrzés tényét kell rögzíteni, ezt írd a verziósorba. A tartalomjegyzék igazodjon a fejezetekhez.

- [Igényösszefoglaló](docs/IGENY-OSSZEFOGLALO.md)
- [Tervdokumentum](docs/TERVDOKUMENTUM.md)
- [Felhasználói kézikönyv](docs/FELHASZNALOI-KEZIKONYV.md)
- [Kiadási és élesítési dokumentum](docs/RELEASE-ELESITES.md)

Az élesítési dokumentumban csak igazolt telepítést jelölj élesként. A próbák eredményeit és korlátait az [ellenőrzési naplóban](docs/ELLENORZES.md) is rögzítsd.

## Regressziós tesztjegyzőkönyv

Minden kért regressziós teszthez készíts külön Markdown-jegyzőkönyvet a [docs/tesztjegyzokonyvek](docs/tesztjegyzokonyvek) mappába a sablon alapján. Rögzítsd az összes tervezett tesztesetet és minden futtatási kísérletet, az ismétléseket is. Add meg a teszt hatókörét, a tesztelt verziót, a környezet paramétereit, az alkalmazott technológiát, az eszközt, a kézi vagy automatizált végrehajtást, a lépéseket, az elvárt és tényleges eredményt, valamint a bizonyítékot. A kimaradt és blokkolt esetek külön státuszt kapjanak. A jegyzőkönyvet a dokumentációval együtt tedd a GitHub-repóba.
