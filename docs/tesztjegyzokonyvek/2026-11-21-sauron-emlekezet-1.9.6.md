# Tesztjegyzőkönyv — Sauron emlékezet és közös kiszabadítás, 1.9.6

## Tartalomjegyzék

- [Verziókövetés](#verziókövetés)
- [Környezet és hatókör](#környezet-és-hatókör)
- [Esetek és kísérletek](#esetek-és-kísérletek)
- [Korlátok](#korlátok)

## Verziókövetés

| Verzió | Dátum | Változás |
| --- | --- | --- |
| 1.0 | 2026-11-21 | Utolsó észlelésig tartó üldözés, részletes szabálykönyv, minden földi gyűrű begyűjtése mint közös feltétel. |

## Környezet és hatókör

Web 1.9.6; macOS, Node REPL JavaScript VM / assert, automatizált ellenőrzés. Supabase lpjgrmfzteuwjgrcgxqa, PostgreSQL 17.11; SQL eszköz és PL/pgSQL assert, BEGIN/ROLLBACK. Migrációk: sauron_reaches_last_seen_location, rescue_requires_all_ground_rings_collected. Szimulált szerveridő-lépések a fixture configban, az éles mérési helyeket nem módosítottuk tartósan. Bizonyíték: tests/sauron-last-seen.sql, tests/sauron-visibility.sql, tests/ring-progress-rescue.sql.

## Esetek és kísérletek

| Eset/próba | Lépés, elvárt eredmény | Végrehajtás és tényleges eredmény |
| --- | --- | --- |
| MEM-01 / 1 | Friss gyűrűbirtokos után cél emlékezete; új mérés módosítja. | Automatizált SQL, PASS: legújabb koordináta tárolva. |
| MEM-02 / 1 | stop után 30 másodperces mozgáslépések, utolsó ponthoz közeledés. | Automatizált SQL, PASS: minden lépés közelít, cél elérve 0,5 m-en belül. |
| MEM-03 / 1 | Nem megosztó cél az érkezési pontnál, nincs immunitása. | Automatizált SQL, PASS: gyűrűje megmaradt, nincs offline elfogás. |
| MEM-04 / 1 | Üres cél elérése után újabb lépés. | Automatizált SQL, PASS: célmemória törölve, járőrútvonal felé indul. |
| MEM-05 / 1 | Válasz config vizsgálata stop után. | Automatizált SQL, PASS: utolsó ismert hely és célazonosító nem kerül klienshez. |
| VIS-01 / 1 | Teljes 1.9.5 láthatósági SQL újrafuttatása. | PASS, saját gyűrű és friss GPS feltétel, rejtőzés és pozícióvédelem megmaradt. |
| RING-01 / 1 | Meglévő teljes gyűrű/kiszabadítás SQL az üldözés változtatása után. | PASS, visszagörgetve. |
| RING-02 / 2 | Új feltétellel bővített teljes gyűrűregresszió ismétlése: mindenki megoszt, de egy gyűrű a földön. | PASS: nincs kiszabadítás, korábbi öt perc nullázva, Sauron öt gyűrűt megtart. |
| RING-03 / 2 | Utolsó földi gyűrű felvétele, mindenki továbbra is megoszt. | PASS: új számláló indul; nincs korábbi megosztási előleg. |
| RING-04 / 2 | Minden gyűrű Sauronnál, teljes öt perc és minden megosztás. | PASS: hat gyűrű eredeti helyén, továbbra is aktív játék, újrafelvétel lehetséges. |

## Korlátok

Több valós játékos helymegosztásával játszott élő kör: NEM FUTTATOTT. A tényleges szerverfüggvény kontrollált, visszagörgetett tranzakcióban tesztelt. Az élő webes változat és a szabálykönyv böngészős ellenőrzése az ellenőrzési naplóba kerül. A fizikai háttér-GPS nincs újraellenőrizve.

Automatizált webes regresszió, első futás az 1.9.6 végső forrásán: mind a 14 .test.cjs csomag PASS (admin-manual-stop, appearance-random, gps, map-model, native-bridge, navigation-panel, placement-model, player-rules, poi-generation, poi-model, pwa, robbery-notices, round-summary-gating, summary-map).

Böngészős ellenőrzés, kézi UI-művelet automatizált böngészővezérléssel, első próbálkozás: PASS. Élő 1.9.6, Szabályok menü → 11 fejezet, új feltételek olvashatók; Közös ötperces kiszabadítás link → #rule-kiszabaditas, rulesVisible=true, konzolhiba nincs. Pages 44847861813 sikeres, forrás ed1c5b09eabcd9c5c5253cd38df89b69f3a36412.
