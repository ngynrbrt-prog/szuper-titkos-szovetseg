# Felületi és random pálya tesztjegyzőkönyv — 1.7.0

## Tartalomjegyzék

- [Verziókövetés](#verziókövetés)
- [Környezet](#környezet)
- [Esetek és kísérletek](#esetek-és-kísérletek)
- [Korlátok](#korlátok)

## Verziókövetés

| Verzió | Dátum | Változás |
| --- | --- | --- |
| 1.0 | 2026-11-20 | Célzott 1.7.0 változásvizsgálat, minden kísérlettel. |

## Környezet

macOS helyi forrás, Node REPL beépített VM/assert/fs modulokkal, determinisztikus random tesztadatok. Supabase projekt lpjgrmfzteuwjgrcgxqa, meglévő Postgres: tranzakciós SQL teszt, minden fixture és ideiglenes session ROLLBACK alatt. A migráció public.game_action gem_count támogatást ad; meglévő játékadatot nem ír át. Éles frontend böngészős ellenőrzése telepítés után következik. Teljes fizikai telefonos regresszió nem része ennek a célzott futásnak.

## Esetek és kísérletek

| Eset | Kísérlet | Mód / technológia / eszköz | Lépés, elvárt eredmény | Tényleges eredmény és bizonyíték | Státusz |
| --- | --- | --- | --- | --- | --- |
| UI-01 | 01 | Automata / JS / Node VM | GPS teszt | tests/gps.test.cjs PASS | Sikeres |
| UI-02 | 01 | Automata / JS / Node VM | Sauron térképi modell | tests/map-model.test.cjs PASS | Sikeres |
| UI-03 | 01 | Automata / JS / Node VM | Korábbi kézi helyszínmodell | tests/placement-model.test.cjs PASS | Sikeres |
| UI-04 | 01 | Automata / JS / Node VM | PWA cache engedélylista | A teszt még az 1.5.3 script URL-t kereste, amelyet az új cache helyesen nem kezel | Sikertelen tesztillesztés |
| UI-04 | 02 | Automata / JS / Node VM | Ismétlés az 1.7.0 URL-lel | tests/pwa.test.cjs PASS: statikus cache, API/POST kizárás, offline és explicit frissítés | Sikeres |
| UI-05 | 01 | Automata / JS / Node VM | Random 100/1000/5000 m, Gárdony, dátumválasztó és sarkvidéki hely | 26 pont, 20 gem, 9 route pont; minden pont sugáron belül; hibás sugár elutasítva | Sikeres |
| UI-06 | 01 | Automata / JS / Node VM | Téma mentése két karakterrel | Karakterenként külön téma, hibás érték világosra áll, meta szín frissül | Sikeres |
| UI-07 | 01 | Automata / JS / Node VM, production accountView | Vendég → játékos → admin → kilépés | Név látszik; Belépés eltűnik; Beállítások csak belépve; Admin csak adminnak; felfedezéslista rejtett; editor kilépéskor bezárul | Sikeres |
| DB-01 | 01 | Automata / SQL / Supabase | Jelenlegi függvény beolvasása | Hibás paramétersorrenddel nem talált függvényt | Blokkolt |
| DB-01 | 02 | Automata / SQL / Supabase | Helyes uuid,text,jsonb,uuid aláírás | Élő függvénytörzs egyezik a helyi round-rules.sql törzsével; séma átnézve | Sikeres |
| DB-02 | 01 | Automata / SQL / Supabase | tests/random-placement.sql: 6+20, alapértelmezett 40, rossz darabszám, nem admin, safety nélkül | PASS: pontos darabszámok, 26 külön hely, hibás/tiltott kérések elutasítva; ROLLBACK | Sikeres |
| DB-03 | 01 | Automata / SQL / Supabase | RPC jogosultságok | anon=false, authenticated=false, service_role=true | Sikeres |
| DB-04 | 01 | Automata / Supabase advisor | Biztonsági vizsgálat | Korábbi RLS-no-policy INFO-k a szándékosan közvetlen klienshozzáférés nélkül kezelt táblákon; korábbi leaked-password-protection WARN. Új hozzáférési jogot nem adtunk | Ellenőrizve |
| UI-08 | 01 | Automata / Node HTTP fixture | Helyi szimulált admin böngészőteszt előkészítése | A környezet tiltotta a localhost:4177 listen műveletet (EPERM), böngészős fixture nem indult | Blokkolt |
| UI-09 | 01 | Kézi / éles CUA böngésző | 1.7.0 megnyitása | script.js?v=1.7.0, térkép és vendég menü látszik; Admin és Beállítások nem látszik. Mobilméret külön ebben a körben még nem futott | Részben sikeres |
| UI-11 | 01 | Kézi / CUA | Frissítési gomb megnyomása | A kattintás időtúllépést adott; következő állapotban a gomb eltűnt, de az aktiválás pontos menete nem igazolt | Blokkolt |
| UI-10 | — | Kézi / fizikai Android+iPhone | Valódi belépés, téma és admin térképkattintás | Fizikai eszköz és külön tesztfiók nincs | Nem futott |

## Korlátok

A belépett menü produkciós függvényét VM-ben teszteltük, valós admin PIN-nel a böngészőben nem léptünk be. A véletlen pontok geometriailag ellenőrzöttek, közterületi/gyalogos megközelíthetőségüket adminnak kell igazolnia. A téma eszközönként tárolt; nem Supabase-profilmező. A térképcsempék nem kapnak mesterséges színinverziót.

Advisor források: [RLS nélküli policy jelzés](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [jelszóvédelem](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
