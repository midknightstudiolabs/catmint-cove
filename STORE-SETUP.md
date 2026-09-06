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
| Node 20+ | nodejs.org | free | only needed if you want to build/preview locally |

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
- **Icon / splash:** `assets/logo.png` (1024²), `assets/icon-foreground.png` +
  `assets/icon-background.png` (Android adaptive layers), `assets/splash.png`
  (2732²) — Midknight peeking over the cove wall, rendered from the game's own
  drawCat art (see `_iconforge.html`, gitignored). `@capacitor/assets`
  regenerates every density in CI. To revise, keep the same filenames.
- **Orientation:** portrait-locked. Both build workflows patch the generated
  `AndroidManifest.xml` / `Info.plist` after `cap sync` (see the "Lock the app to
  portrait" steps). The web build enforces it too (`#rotate` overlay +
  `screen.orientation.lock`).

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
  - **Full description** (both stores) — V3 draft, tweak freely. Positioning:
    a warmer *Neko Atsume × a light touch of Tamagotchi × decorate-your-space*.
    Cats need looking after and a badly-neglected one *can* wander off (it stays
    in your field guide — nothing is ever lost for good), but the register is
    still calm: a telegraphed warning every time, no timer on the screen, no
    punishment for a day away.
    > Catmint Cove is a quiet place. Cats wander in needing someone — a warm
    > spot in the sun, a full bowl, fresh water, a scratch behind the ears — and
    > you look after them.
    >
    > Keep them fed and comfortable and they settle in and make the cove home.
    > Let things slide too long and a cat might pad off down the shore — you'll
    > always get a clear warning first, and it's still waiting in your field
    > guide if you want to coax it back. A day away costs you nothing: the cove
    > carries on without you and tells you what happened when you return.
    >
    > Every cat has its own way of being a cat — a lazy one loafs, a bold one
    > gets the zoomies, a shy one watches from the long grass — and the more
    > time you spend together, the more you notice.
    >
    > Slowly you make the place theirs: mend the old dock, plant the catmint,
    > light the little bakery oven, nudge a bed into the corner it wants to be
    > in. Send a few cats off exploring and read the postcards they send home.
    > Fill the field guide. Frame a photo. Sit with one cat a while and just
    > watch it groom.
    >
    > A cozy corner of the world where cats come to be looked after — and you
    > slowly make it theirs.
  - **Keywords** (App Store, 100 char): `cat,cats,cozy,idle,relax,calm,pet,animal,collector,sanctuary,kitten,chill,wholesome`
  - **Category:** Games ▸ Simulation (or Casual)
- **Privacy policy URL** — required. Put a page on `midknightstudiolabs.com`.
- Content rating questionnaire (IARC for Play, Apple's own for the App Store)
- Data safety form (Play) / privacy nutrition labels (App Store). This build
  stores everything **locally on device** and (with ads off) collects nothing —
  keep it that way until AdMob goes in, then revisit.

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

## 4. iOS — GitHub secrets

More moving parts. On developer.apple.com and App Store Connect:

1. **Certificates ▸ +** → *Apple Distribution* certificate. Download it, open it
   (adds to Keychain on a Mac) — or create it with Fastlane `match`. Export as
   `.p12` **with a password**.
2. **Identifiers ▸ +** → App ID `com.midknightstudiolabs.catmintcove`.
3. **Profiles ▸ +** → *App Store* provisioning profile for that App ID + the
   distribution cert. Note its exact **name**. Download the `.mobileprovision`.
4. App Store Connect ▸ **My Apps ▸ +** → create the app record (same bundle id).
5. Apple ID ▸ **App-Specific Passwords** → generate one for uploads.

Repo secrets:

| secret | value |
|---|---|
| `IOS_DIST_CERT_P12` | `base64 -i dist.p12` |
| `IOS_DIST_CERT_PASSWORD` | the `.p12` password |
| `IOS_PROVISIONING_PROFILE` | `base64 -i profile.mobileprovision` |
| `IOS_PROFILE_NAME` | the profile's exact name |
| `IOS_TEAM_ID` | 10-char Team ID (top-right of the Apple dev site) |
| `APPLE_ID` | your Apple account email |
| `APPLE_APP_SPECIFIC_PASSWORD` | from step 5 |

### First iOS release

`git tag ios-v2.0.1 && git push --tags` (or run the **iOS build** workflow).
It archives on a macOS runner and uploads to **TestFlight**. From TestFlight you
add testers, then submit for App Store review (1–3 days; first apps sometimes
longer). If you'd rather avoid the cert dance, `fastlane match` automates it —
add a `Matchfile` and swap the cert/profile steps for `fastlane match appstore`.

---

## 5. Still to wire before these earn money

The launch build ships **ad-free** (`ADS_ENABLED = false`) with the Supporter
Pack IAP **simulated**. Before turning either on:

- **AdMob**: create the account (needs the app published first), add
  `@capacitor-community/admob`, put the app IDs in the native config, add the
  UMP consent SDK + iOS ATT. Flip `ADS_ENABLED` (make it a remote-config flag).
- **IAP**: add `@revenuecat/purchases-capacitor` (recommended — it handles
  receipt validation, the entitlement layer, restore, and cross-platform "does
  this user own X" as one call; free under ~$2.5k/mo) or
  `@capacitor-community/in-app-purchases`. Products: `welcome_pack` ($0.99),
  `founding_covekeeper` ($4.99) and `sparkle_pack` ($2.99) — **all
  non-consumable**, created in both consoles.

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
    ribbon, the sign plaque, the welcome paw-prints + amber ribbon, the Sparkle effect
    cosmetics) from `owned`.
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
    button (pack modal *and* the Back-up sheet — Apple requires a
    no-purchase-needed path) already exist; fill in the one billing call.

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

> ⚠️ **Before submitting:** the store description + keywords in §2 are a
> pre-V3 draft (flagged there too) — reposition around the care loop, not
> "absence is neutral", once it's playtested. See `V3-RETHINK.md`.

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
