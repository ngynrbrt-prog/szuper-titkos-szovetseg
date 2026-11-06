# A Szuper Titkos szövetség — 0.1 térképes prototípus

## Indítás
A mappában futtass `python -m http.server 8000` parancsot, majd nyisd meg a `http://localhost:8000` címet. Internetkapcsolat szükséges az OpenStreetMap csempékhez és a Leaflet könyvtárhoz. Telefonos GPS-hez HTTPS tárhely szükséges.

## Ami működik
- Mobilbarát menü, valós térkép, városok és két vázlatos útvonal, prágai vadászterület.
- Helyi karakterlétrehozás, PIN-alapú visszalépés **csak ugyanabban a böngészőben**, maximum hat karakter.
- Előtérben aktív GPS-megosztás, saját jelölő, helyi gyűrűidő-számláló.
- Útvonalak és városok cseréje a `config.js` fájlban, a megjelenítés automatikusan követi.

## Ami MÉG NEM működik
- Több telefon közötti valós idejű szinkronizáció, biztonságos PIN- és admin-hitelesítés, adminfelület.
- Sauron tényleges üldözése, gyűrűrablás, láthatatlanság, eredményarchívum, popup indítása a szerveres állapotból.
- Utcahálózaton mozgó Sauron, térképforgatás, teljesen egyedi fantasy-térképréteg.
- A vonallal összekötött városok **nem valódi közúti navigációs útvonalak**.

**Biztonsági figyelmeztetés:** A jelenlegi demó PIN-je helyben, titkosítatlanul tárolódik a böngésző localStorage területén. Csak teszt PIN-t használj. Az adminjelszó nincs beépítve, a szerveres megvalósításban kizárólag szerveroldali titokként kezelendő. Ne használd vezetés közben.

## Javasolt következő fejlesztés
Supabase Auth/Edge Functions/Postgres, szerveroldali szerepkör-ellenőrzés, valós idejű pozíciók és játékmenet, MapLibre GL JS egyedi vektoros fantasy-stílussal, utcahálózati útvonaltervezés. A `config.js` helyére később verziózott `game_config` adatbázistábla kerülhet, hogy adminból válthatók legyenek a városok és térképek.


## 0.2 – Gyűrű nélküli helyi demó és európai Sauron-észlelés

- Az Admin (helyi bemutató) fülön a „A játékosok rendelkeznek gyűrűvel” kapcsolóval lehet a gyűrű nélküli módot kipróbálni. A karakter GPS-jelölője megmarad; a gyűrűs időmérés ilyenkor szünetel.
- A „Európa megtekintése” gomb kicsinyít a kontinensre. A térképen 6-os vagy kisebb nagyításnál külön, kérdőjeles Sauron-jelzés látszik: ez **fiktív, bizonytalan utolsó észlelés**, nem a valódi Sauron-jelölő. Háromórás időablakonként új véletlen európai helyre kerül, a böngészőben eltárolva.
- A többjátékos szinkron, hitelesített adminjog, tényleges vadászat és közös szerveroldali 3 órás észlelés **még nincs megvalósítva**. Az adminfelület ezért csak helyi demonstráció.
- A lehetséges észlelési pontok és időzítés a `config.js` `rumor` részében módosíthatók.
