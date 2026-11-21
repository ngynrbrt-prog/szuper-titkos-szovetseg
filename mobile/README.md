# A Szövetség · Android és iPhone tesztváltozat

**Állapot: a felhasználó 2026-11-21-én jóváhagyta a folytatást.** Az átmeneti halasztás után a natív fejlesztés és CI-fordítás folytatódik. A böngészős változat önállóan továbbra is használható; a natív híd csak a saját telepített alkalmazásban aktív.

## Tartalomjegyzék

- [Verziókövetés](#verziókövetés)
- [Felépítés](#felépítés)
- [Fordítás](#fordítás)
- [Telefonos használat és korlátok](#telefonos-használat-és-korlátok)

## Verziókövetés

| Verzió | Dátum | Változás |
| --- | --- | --- |
| 1.9.0 | 2026-11-21 | Natív Android és iOS háttérhelymeghatározás, biztonságos tokenkezelés és natív webhíd. |

## Felépítés

- Android: Java, Android SDK, LocationManager és location típusú foreground service. Állandó értesítésből is leállítható. Android Keystore AES-GCM titkosítja a helyi munkamenetet.
- iPhone: Swift, UIKit/WKWebView, Core Location background location mód és Keychain. A tartós indításhoz Mindig helyengedély szükséges; az iOS engedélykérési lépései miatt ezt Beállításokban is szükséges lehet kiválasztani.
- A natív háttérrész önállóan küldi a friss GPS-t és frissíti a hitelesítési tokeneket. A webes felület előtérben ugyanazt a játékot mutatja. A natív híd csak a saját HTTPS-játékoldalon, pontosan megengedett műveletekkel működik. Más oldalak rendszerböngészőben nyílnak meg. Nincs service-role kulcs az appban.
- A natív HTTP-híd a meglévő hitelesített Supabase API-t hívja. A játékosazonosító továbbra is a szerver által ellenőrzött munkamenetből származik. A natív háttérkérés kisméretű választ kér, nem tölti le újra a teljes eredménytérképet.
- Nem használunk fizetős helymeghatározási SDK-t vagy külső analitikát. A két natív projekt a platform beépített keretrendszereire épül.

## Fordítás

A `Native Android and iPhone builds` munkafolyamat natív forrásváltozáskor és kézi indítással fut. Az elhalasztás előtt futott próbán az iOS-szimulátor fordítása sikeres, az Android build/lint lépése sikertelen volt. Nincs közzétett Android APK vagy aláírt iPhone-kiadás. Az új fordítás a hardening-javításokat és az Android visszagesztus javítását is ellenőrzi.

Android helyben: JDK 17, Android SDK 36, Gradle 8.13, majd `gradle :app:assembleDebug :app:lintDebug` a `mobile/android` mappában. Az APK tesztcélú debug aláírást használ; nem Play Store-kiadás.

iOS helyben: Xcode alatt nyisd meg a `mobile/ios/Szovetseg.xcodeproj` projektet. Saját telefonhoz válassz személyes fejlesztői csapatot és aláírást. A szimulátorcsomag nem telepíthető valódi iPhone-ra. TestFlight/App Store terjesztéshez Apple-fejlesztői tagság és aláírás szükséges; nem történt fizetős regisztráció vagy áruházi feltöltés.

## Telefonos használat és korlátok

1. Jelentkezz be a játékba a natív alkalmazásban.
2. Aktív körben nyomd meg a Helymegosztás indítása gombot, és engedélyezd a pontos helyet. Androidon az állandó értesítést is engedélyezd; iPhone-on Mindig helyengedély kell.
3. Lezárhatod a kijelzőt vagy háttérbe teheted az appot. A natív szolgáltatás kísérli meg a friss mérések továbbítását. A szerver kizárólag friss, legfeljebb 50 m pontatlanságú mérést fogad el. Offline vagy mérési szünet alatt nem gyűlik gyűrűidő.
4. A Megosztás leállítása gomb, Androidon az értesítés leállító gombja is kikapcsolja. A kijelentkezés leállítja a megosztást és törli a helyi hitelesítést.

Az operációs rendszer kényszerített leállítása, engedélyvisszavonás, energiatakarékosság, újraindítás vagy hálózati/GPS-hiány megszakíthatja a folyamatot. iOS-en a felhasználó által kényszerítetten bezárt app nem követhet korlátlanul tovább. Az alkalmazásindításkor a korábban bekapcsolt szándék megfelelő engedély mellett helyreállítható. Ez nem állandó működési garancia. A valódi lezárt képernyős működés fizikai Android- és iPhone-teszttel igazolandó; fordítás vagy szimulátorteszt ezt önmagában nem bizonyítja.

Az Android új visszagesztusát az AndroidX Activity 1.12.4 OnBackPressedDispatcher kezeli. Ez szabadon használható Android Jetpack-függőség, nem fizetős helymeghatározási SDK.

Apple-fejlesztői hozzáférés jelenleg nincs. A valódi iPhone-ra szánt aláírt terjesztés blokkolt; a forrás és a szimulátoros fordítás ettől függetlenül ellenőrizhető. Fizetős tagság nem indult.
