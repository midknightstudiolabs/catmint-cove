# Shipping Catmint Cove to the app stores

The game is a single `index.html`. **Capacitor** wraps it in a native app; **GitHub
Actions** builds and signs it so you never need a Mac. This doc is the one-time
setup — after it, every release is a git tag.

```
index.html ──► scripts/build-www.mjs ──► www/ ──► Capacitor ──► .aab / .ipa
                                                     │
                                          .github/workflows/{android,ios}.yml
```

Everything that shapes the build is committed: `package.json`,
`capacitor.config.json`, `scripts/`, `assets/`, `ci/`, `.github/`. The native
`android/` and `ios/` folders are **generated fresh in CI** so they never drift.

---

## 0. Accounts & tools (do these first)

| what | where | cost | notes |
|---|---|---|---|
| Google Play Console | play.google.com/console | **$25 once** | can be done entirely on Windows |
| Apple Developer Program | developer.apple.com | **$99/yr** | web signup; **approval takes 1–3 days** — start now |
| Node 22+ | nodejs.org | free | Capacitor 8 CLI needs ≥22; only for local build/preview |

Local sanity check (optional): `npm ci && npm run build && npx cap sync` on
Windows should all succeed. A full Android build also needs Android Studio + JDK 21.

**Toolchain (as of the Capacitor 8 upgrade):** Capacitor 8 · targets Android
API 36 / min 24 · Gradle 8.14 · AGP 8.13 · **JDK 21** (the CI workflow pins it).
API 36 clears Google Play's "must target a recent Android" gate.

---

## 1. App identity

- **Bundle / package id:** `com.midknightstudiolabs.catmintcove` (already set in
  `capacitor.config.json` and both workflows — change it in all three if needed).
- **App name:** `Catmint Cove`
- **Icon / splash:** `assets/icon.png` (1024², flat) + `assets/icon-foreground.png`
  + `assets/icon-background.png` (Android adaptive layers) + `assets/splash.png`
  (2732²) — Midknight's in-game silhouette sitting in front of a large gold disc,
  on Catmint Cove green (`#356b4c` + `#e8b45a`). Rendered from the real cat art
  via `__cove.portrait()` (a `window.__cove` debug helper) then flattened to a
  clean silhouette. `@capacitor/assets` regenerates every density in CI. To
  revise, keep the filename `assets/icon.png`. **Never add `assets/logo.png`** —
  `@capacitor/assets` prefers `logo.png` over `icon.png`, so a stray one silently
  ships instead (this happened once — old "concept 1" logo.png shipped through
  build ~13; removed 2026-09-09, CI now hard-fails if it reappears).
- **Orientation:** iPhone portrait-locked; **iPad auto-rotates** (all 4
  orientations, stays full-screen). Both build workflows patch the generated
  `AndroidManifest.xml` / `Info.plist` after `cap sync`. The web build's runtime
  `screen.orientation.lock("portrait")` only fires on phone-sized viewports.

---

## 2. Store listing assets you need to prepare

Both stores need these before you can submit — none of it is code:

- App icon (1024×1024 PNG, no transparency for iOS)
- Screenshots: phone (a few), 7" tablet, 10" tablet. iOS also wants 6.7" and 6.5".
  All **portrait** (the app is portrait-locked).
- Store copy — drafts below, tweak freely:
  - **App Store subtitle** (30 char max): `A cozy cat sanctuary`
  - **Play short description** (80 char max):
    `A cozy corner where cats come to be looked after — and you make it theirs.`
  - **Full description** (both stores) — FINAL, approved by the dev 2026-09-07.
    Positioning: a warmer *Neko Atsume × a light touch of Tamagotchi ×
    decorate-your-space*. Calm register: a telegraphed warning every time, no
    timer on the screen, no punishment for a day away.
    > Catmint Cove is a quiet place.
    >
    > Cats wander in needing someone — a warm spot in the sun, a full bowl,
    > fresh water, a scratch behind the ears — and you look after them.
    >
    > Keep them fed and comfortable and they'll settle in and make the Cove
    > home. Let things slide for too long and a cat might pad off down the
    > shore — but you'll always get a clear warning first. And if one does
    > wander off, it'll still be waiting in your field guide whenever you're
    > ready to coax it back.
    >
    > A day away costs you nothing. The Cove carries on without you and tells
    > you what happened when you return.
    >
    > Every cat has its own way of being a cat. A lazy one loafs. A bold one
    > gets the zoomies. A shy one watches from the long grass. Spend enough
    > time together and you'll start noticing the little things that make each
    > one different.
    >
    > Slowly, you make the place theirs. Mend the old dock. Plant the catmint.
    > Light the little bakery oven. Find just the right spot for a bed. Send a
    > few cats off exploring and read the postcards they send home.
    >
    > Fill the field guide. Frame a photo. Or sit with one cat for a while and
    > just watch it groom.
    >
    > A cozy corner of the world where cats come to be looked after — and you
    > slowly make it theirs.
    >
    > No pressure to constantly check in. No punishment for taking a day away.
    >
    > The Cove will be here when you get back.
  - **App Store promo text** (170 char, editable without review):
    `A quiet place where cats wander in needing someone. Feed them, learn their ways, make the cove home — no timers, no way to lose. Somewhere calm to check in on.`
  - **Keywords** (App Store, 100 char): `cat,cats,cozy,idle,relax,calm,pet,animal,sanctuary,kitten,chill,wholesome,collector,cute`
  - **Copyright:** `2026 Midknight Studio Labs`
  - **Category:** Games ▸ Simulation (or Casual)
- **Privacy policy URL** — required. Publish `privacy.html` (repo root) as a
  Blogspot page on `midknightstudiolabs.com`; text of record is `PRIVACY.md`.
- Content rating questionnaire (IARC for Play, Apple's own for the App Store) —
  Play answers drafted in **`LAUNCH-ANDROID.md` Appendix A** (expected: all-ages).
- Data safety form (Play) / privacy nutrition labels (App Store) — Play answers
  in **`LAUNCH-ANDROID.md` Appendix B**. The app itself stores everything
  **locally on device** and collects nothing; **Google Play Billing + RevenueCat**
  process purchase history to deliver the cosmetic IAPs — that's the only
  declaration. Revisit when AdMob goes in.

### Google Play — the specific fields

| field | value |
|---|---|
| App name | `Catmint Cove` (≤30) |
| Short description | *(the ≤80-char line above)* |
| Full description | *(the block above — already V3-accurate, ≤4000)* |
| App category | Simulation |
| Tags | pick up to 5 from Google's **fixed list** (Store listing ▸ Manage tags — you search, you can't invent them). Ranked choice: **Pet Simulation · Life Simulation · Idle · Relaxing · Creature Collector** (fallbacks if any aren't offered: Sandbox, Casual, Tycoon). Google also auto-suggests some from your description — accept the ones that fit. |
| Contact email | `carlosgotiong@gmail.com` |
| App icon | 512×512 listing icon set in Play Console; the app-bundle icon is generated from `assets/icon.png` |
| Feature graphic | **1024×500** — `assets/store/feature-graphic.png` (from `assets/_feature-graphic.html`) |
| Phone screenshots | 2–8 portrait — `assets/store/*.png` |
| Contains ads | **No** |
| In-app purchases | **Yes**, `$0.99–$4.99` |
| App access | All functionality available without login |
| Target audience | **13+**, not "designed for families" |

> **Labubu stays out of every store surface.** The visitor cat named "Labubu" is
> an in-game easter-egg only — never in the title, short/full description,
> keywords, feature graphic, screenshots, or promo text. (It's the developer's
> real cat's name; the name also belongs to a Pop Mart trademark, so it must not
> appear in anything marketing-facing.)

---

## 3. Android — GitHub secrets

Generate an upload keystore **once** (needs `keytool` from any JDK):

```bash
keytool -genkey -v -keystore catmint-upload.jks -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Back up `catmint-upload.jks` somewhere safe — losing it means you can never
update the app. Then in the repo: **Settings ▸ Secrets and variables ▸ Actions**:

| secret | value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 catmint-upload.jks` (one line) |
| `ANDROID_KEYSTORE_PASSWORD` | the store password you chose |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | the key password (often same as store) |
| `PLAY_SERVICE_ACCOUNT_JSON` | *(only needed to auto-upload — see below)* |

**Auto-upload to Play** (optional, do it after the first manual upload): in Play
Console create an app, then **Setup ▸ API access**, link a Google Cloud project,
create a service account with the *Release Manager* role, download its JSON key,
and paste the whole file into `PLAY_SERVICE_ACCOUNT_JSON`.

### First Android release

1. In Play Console: create the app, fill the listing, complete every "Set up your
   app" task, and do **one manual upload** of an `.aab` to the *Internal testing*
   track (Play requires the first bundle by hand so it can register the signing
   key — use Play App Signing, it's the default).
   - Get that first `.aab`: run the **Android build** workflow (Actions tab ▸
     *Run workflow*, track = `none`), download the artifact, upload it manually.
2. After that, every release is: `git tag android-v2.0.1 && git push --tags`
   (or run the workflow with a track picked). New Play requirement: a new
   personal developer account must run **12 testers × 14 days** of closed
   testing before Production unlocks — start that clock early.

---

## 4. iOS — GitHub secrets  *(no Mac needed)*

`ios.yml` uses an **App Store Connect API key** for both code signing
(`xcodebuild -allowProvisioningUpdates` — Apple's servers create + manage the
distribution cert and provisioning profile) and the TestFlight upload. No `.p12`,
no Keychain, no manual profile. All setup is in the browser.

1. **appstoreconnect.apple.com ▸ Users and Access ▸ Integrations ▸ App Store
   Connect API ▸ Team Keys ▸ +**. Name it `ci`, access **App Manager**, Generate.
   - Download the **`AuthKey_XXXXXXXXXX.p8`** (one time only — save it).
   - Note the **Key ID** (the `XXXXXXXXXX`) and the **Issuer ID** (top of the page).
2. **developer.apple.com ▸ Certificates, IDs & Profiles ▸ Identifiers ▸ +** →
   App ID, bundle id `com.midknightstudiolabs.catmintcove`, enable **In-App
   Purchase**. *(That's the only portal step — no cert, no profile.)*
3. **appstoreconnect.apple.com ▸ Apps ▸ +** → create the app record (same bundle
   id, primary language, SKU e.g. `catmintcove`).
4. **Team ID:** developer.apple.com ▸ Membership details → the 10-char Team ID.

Repo secrets (**Settings ▸ Secrets and variables ▸ Actions**):

| secret | value |
|---|---|
| `ASC_KEY_ID` | the API key's Key ID (10 chars) |
| `ASC_ISSUER_ID` | the API key's Issuer ID (a UUID) |
| `ASC_KEY_P8_BASE64` | `base64 -w0 AuthKey_XXXX.p8` (macOS: `base64 -i`) — one line |
| `IOS_TEAM_ID` | 10-char Apple Developer Team ID |

Until these exist the workflow still runs a **simulator compile check** and stops
before signing.

### First iOS release

`git tag ios-v2.0.1 && git push --tags` (or run the **iOS build** workflow).
It archives on a GitHub macOS runner and uploads to **TestFlight**. From TestFlight
you add testers (your own iPhone/iPad works), then submit for App Store review
(1–3 days; first apps sometimes
longer). If you'd rather avoid the cert dance, `fastlane match` automates it —
add a `Matchfile` and swap the cert/profile steps for `fastlane match appstore`.

---

## 5. IAP + ads status

The launch build ships **ad-free** (`ADS_ENABLED = false`).

- **IAP — WIRED** (`@revenuecat/purchases-capacitor`, commit `7ac5329`).
  `scripts/capacitor-bridge.js` exposes `window.CoveNative.iap`; the game's three
  buy handlers call it on device and fall back to the simulated `confirm()` on
  web. Products `welcome_pack` ($0.99) / `sparkle_pack` ($2.99) /
  `founding_covekeeper` ($4.99) — **all non-consumable**. **To go live:** create
  the products in Play Console + RevenueCat and paste the public `goog_` SDK key
  into `REVENUECAT_ANDROID_KEY` in the bridge — full steps in **`LAUNCH-ANDROID.md`
  §2–3**. Until the key is set the app uses the simulated flow (no real charges).
- **AdMob — later**: create the account (needs the app published first), add
  `@capacitor-community/admob`, put the app IDs in the native config, add the
  UMP consent SDK. Flip `ADS_ENABLED` (make it a remote-config flag).

  **The purchase-persistence contract (scaffolded + tested in `index.html`)** —
  a store purchase lives on the player's Apple/Google account, so an app
  update, a reinstall, or a new device must never lose it:
  - **Entitlements live in their own store** (`iapStore`, key
    `catmintCove.iap.v1`) — **not** the game save. `loadEntitlements()` runs
    it on boot *unconditionally*, so a rejected or future-version game save
    (which makes `load()` bail to `newGame()`) can't drop a purchase. A
    redundant copy also rides in the game save and is folded back on load.
    **NATIVE: swap `iapStore`'s two `localStorage` lines for
    `@capacitor/preferences`** (an iOS App Group) — WKWebView `localStorage`
    can be evicted under storage pressure.
  - `G.iap.owned` is a **cache**. On every launch and every resume, and on the
    "Restore purchases" tap, run a billing query and pass the owned product
    ids to **`reconcileEntitlements(ids, authoritative)`**. It **only ever
    adds** — a slow / offline / failed query never revokes a cached perk
    (fail-open: a wrongly-revoked perk is a support ticket; a wrongly-kept
    cosmetic flag costs nothing).
  - `applyEntitlements()` re-derives every perk (ads-off, Midknight's founder
    ribbon, the sign plaque, the founder halo + hero mask, the welcome
    paw-prints + amber ribbon, the Sparkle effect cosmetics) from `owned`.
    Idempotent. `G.ads.supporter` is the ad-free mirror it writes. **No
    gameplay perks** — see `MONETIZATION.md`.
  - After a confirmed purchase call `completePurchase(productId)` **and
    acknowledge/finish the transaction in the same callback** — Google Play
    auto-refunds an unacknowledged purchase after 3 days.
  - `grantOnce(key, fn)` (ledgered in `iapStore`) is there for any future
    one-time reward. NATIVE: key it off the store **transaction id**, and
    cloud-back the ledger so a fresh reinstall neither re-grants nor loses it.
    Both current packs are pure entitlement (no consumable rewards) so nothing
    routes through it yet.
  - `restorePurchases()` (fail-open, `try/catch`) + the "Restore purchases"
    button now call `window.CoveNative.iap.restore()` (RevenueCat) on device.
  - **Acknowledgement is handled by RevenueCat** (default `configure()` — it
    acknowledges every purchase server-side), so `completePurchase()` doesn't
    need to.

  **Pre-launch IAP test matrix** (`__cove.iap(...)` simulates most; do the
  real ones on a device with a sandbox / license-test account):

  | scenario | expected | sim command |
  |---|---|---|
  | buy → force-close → reopen | perk holds | buy, reload |
  | buy → **app update** (new binary, data kept) | perk holds | buy, reload |
  | buy → **save format bumps** (`save.vN` rejected) | perk holds | set save `v` to a bad number, reload |
  | buy → airplane mode → reopen | perk holds (from cache) | — device only |
  | buy → uninstall → reinstall → tap **Restore** | perk returns | `wipestore` then `reconcile ["founding_covekeeper"]` |
  | buy → **new device**, same store account → Restore | perk returns | as above |
  | own perk → launch with billing **offline/erroring** | perk **not** revoked | `reconcile []` → still owned |
  | buy on Android, open on iOS | perk does **not** cross (separate stores — expected) | — |
  | double-tap Restore / buy | no double-grant, no crash | `buy` twice |
  | refund a non-consumable | perk may linger until next authoritative reconcile — acceptable | — |
- **Cloud save**: `@capacitor-firebase/*` is overkill — use Google Play Games
  *Saved Games* + Apple Game Center saved games. The `saveCode()` export in the
  Today sheet is the interim. When it lands, put the `iapStore` blob
  (`{owned, grants}`) in it too so the one-time-reward ledger survives a
  reinstall — the entitlements themselves still come from the store.

> **Store copy in §2 is V3-accurate** (care loop, cats can leave with a warning).
> Full Google Play launch sequence: **`LAUNCH-ANDROID.md`**.

---

## Release cheat-sheet

```bash
# Android
git tag android-v2.0.1 && git push origin android-v2.0.1

# iOS
git tag ios-v2.0.1 && git push origin ios-v2.0.1

# or: Actions tab ▸ pick the workflow ▸ Run workflow
```

`versionCode` / build number = the GitHub run number (always increases).
`versionName` = the bit after `-v` in the tag.
