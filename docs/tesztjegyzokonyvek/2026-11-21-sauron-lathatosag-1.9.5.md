# Tesztjegyzőkönyv — Sauron láthatósága 1.9.5

## Tartalomjegyzék

- [Verziókövetés](#verziókövetés)
- [Környezet és hatókör](#környezet-és-hatókör)
- [Esetek és futtatások](#esetek-és-futtatások)
- [Korlátok](#korlátok)

## Verziókövetés

| Verzió | Dátum | Változás |
| --- | --- | --- |
| 1.0 | 2026-11-21 | Saját gyűrűhöz és helymegosztáshoz kötött láthatóság. |

## Környezet és hatókör

Web 1.9.5, macOS Node REPL JavaScript VM, node:assert/strict; automatizált tényleges map-model.js teszt. Supabase lpjgrmfzteuwjgrcgxqa PostgreSQL 17.11; PL/pgSQL assert tesztek SQL-eszközzel, BEGIN/ROLLBACK. A játékosokhoz csak ideiglenes fixture session készült; a tesztadatok visszagörgetve. Szerver: sauron_visible_only_to_sharing_ring_owner migráció. Bizonyíték: tests/sauron-visibility.sql, tests/map-model.test.cjs, tests/ring-progress-rescue.sql.

## Esetek és futtatások

Minden alábbi eset első futtatási kísérlete sikeres, kivéve ahol külön ismétlés szerepel.

| Eset | Technológia/végrehajtás | Lépés és elvárt eredmény | Tényleges/bizonyíték |
| --- | --- | --- | --- |
| SAU-01 | SQL + JS, automata | Saját gyűrű és saját friss pontos GPS: Sauron látható. | PASS, sauron koordinátapár. |
| SAU-02 | SQL + JS, automata | Gyűrű nélkül vagy más játékos gyűrűjével, megosztás mellett: rejtve. | PASS, sauron null / visible=false. |
| SAU-03 | SQL + JS, automata | Saját gyűrű, de kikapcsolt/hiányzó saját helymegosztás: rejtve. | PASS, nincs pozíció. |
| SAU-04 | SQL + JS, automata | GPS 30 másodperces vagy 51 m pontatlan: rejtve. | PASS, határérték tiltva. |
| SAU-05 | SQL + JS, automata | Megfelelő feltételek mellett rejtőzési idő: rejtve. | PASS. |
| SAU-06 | SQL, automata | Admin gyűrű vagy saját megosztás nélkül; másik játékos gyűrűje megosztva. | PASS, nincs admin-/közös láthatósági kivétel. |
| SAU-07 | SQL, automata | stop művelet után, illetve utolsó saját gyűrű Sauron általi elvétele után lekérés. | PASS, azonnal null a válaszban. |
| SAU-08 | SQL, automata | Minden vizsgált válasz game.config belső Sauron-mezőinek vizsgálata. | PASS, position/target/tick_at kulcs nincs. |
| SAU-09 | JS, automata | Előkészület és bejelentkezés előtti észlelés; kétórás váltás. | PASS, más kontinenses rumor megmaradt. |
| REG-01 | JS, automata | Mind a 14 meglévő tesztcsomag. | PASS mind a 14. |
| REG-02 | SQL, automata | Teljes gyűrűidő/kiszabadítás/rablás/szín regresszió. | PASS, visszagörgetve. |

## Korlátok

Valódi többtelefonos gyűrűfelvétel és GPS-próba: NEM FUTTATOTT. Éles felhasználóval feltételváltás: NEM FUTTATOTT; a tényleges szerverfüggvényt fixture-tranzakcióban teszteltük. Friss élő webverzió ellenőrizve: 1.9.5 lábléc és map-model.js, konzolhiba nélkül. Pages 44846785987 sikeres, forrás 52051d7d9bff227f0a85aa9902e63cd05374c1d4. A böngészőpróba vendégnézet volt.
