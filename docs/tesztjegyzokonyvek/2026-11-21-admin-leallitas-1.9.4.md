# Tesztjegyzőkönyv — admin kézi leállítás, 1.9.4

## Tartalomjegyzék

- [Verziókövetés](#verziókövetés)
- [Környezet és hatókör](#környezet-és-hatókör)
- [Futtatások](#futtatások)
- [Korlátok](#korlátok)

## Verziókövetés

| Verzió | Dátum | Változás |
| --- | --- | --- |
| 1.0 | 2026-11-21 | Kézi adminmegszakítás, SQL és UI ellenőrzés. |

## Környezet és hatókör

Web 1.9.4 helyi forrás, macOS Node REPL / JavaScript VM és node:assert/strict. Automatizált UI-függvényteszt szimulált DOM-mal. Supabase lpjgrmfzteuwjgrcgxqa, PostgreSQL 17.11, SQL eszköz, automatizált PL/pgSQL assert ellenőrzés BEGIN/ROLLBACK fixture-ben. Migráció: restore_explicit_admin_manual_stop. A valódi futó Gárdony-kört nem állítottuk le. Forrás/bizonyíték: tests/admin-manual-stop.sql, tests/admin-manual-stop.test.cjs, tests/ring-progress-rescue.sql.

## Futtatások

| Eset/próba | Lépések, elvárt eredmény | Tényleges eredmény és bizonyíték |
| --- | --- | --- |
| SQL-00 / 1 | Teljes adminfixture teszt. | SIKERTELEN: a tesztpálya configjából hiányzott a route; Sauron függvény null ciklushatár. Tranzakció visszagörgetve; fixture javítva. Nem jogosultsági vagy leállítási hiba. |
| SQL-01 / 2 | Nem admin, majd hamis session abortot kér. Mindkettő tiltva. | SIKERES: kivételek, nincs leállítás. |
| SQL-02 / 2 | Admin confirm nélkül, illetve eltérő game azonosítóval kér. Tiltva. | SIKERES: kivételek. |
| SQL-03 / 2 | Admin érvényes session/game/confirm mellett aktív kört leállít. | SIKERES: finished, cancelled, finished_at beállítva, winner_id null. |
| SQL-04 / 2 | Leállítás után helymegosztás, rescue számláló és audit vizsgálata. | SIKERES: sharing=false, rescue null, admin_cancel esemény. |
| SQL-05 / 2 | Megszakított kör last_round és archive vizsgálata. | SIKERES: nincs győzelmi összesítőben. |
| SQL-06 / 2 | Ismételt abort és preparation abort tiltása; finish preparation elvetése. | SIKERES: tiltás, majd előkészület elvetése működik. |
| UI-01 / 1 | Admin active/preparation/finished és nem admin gombállapot. | SIKERES: aktívban Játék kézi leállítása, előkészületben Előkészület elvetése; máskor tiltva. |
| UI-02 / 1 | Megerősített aktív kattintás, mégse, majd előkészület elvetése. | SIKERES: abort+game+confirm; mégse nem küld; preparation finish hívás, GPS leállítás. |
| REG-SQL / 1 | Meglévő ring-progress-rescue.sql teljes futtatása. | SIKERES: hatgyűrűs rendes befejezés, gyűrűidő, szín, rablás, ötperces kiszabadítás. ROLLBACK. |
| REG-JS / 1 | Összes .test.cjs futtatása. | SIKERES: mind a 14 csomag, az admin teszt is. |

## Korlátok

Éles adminfelületi valódi leállítás: NEM FUTTATOTT, mert megszakítaná a felhasználó játékát. Helyette produkciós függvényteszt és szerveroldali visszagörgetett fixture. Fizikai telefonos GPS nincs újratesztelve. Webes telepítés igazolt: Pages 44844327823 sikeres (077dcc5989091bd3f70294fa4a912f3b75ad2c86). Friss élő vendégnézet lábléce és scriptje 1.9.4, konzolhiba nélkül. Az admin jogosultsági felület működése automatizált függvényteszt, nem élő felhasználói gombnyomás.
