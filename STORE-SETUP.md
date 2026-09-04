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
Windows should all succeed. A full Android build also needs Android Studio + JDK 17.

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
  - **Full description** (both stores):
    > Catmint Cove is a calm place. Cats wander in, and you look after them —
    > a warm spot in the sun, a bowl by the door, a scratch behind the ears.
    >
    > There is no timer and no fail state. Time is weather here, not a countdown.
    > Leave for a day and nothing is lost; come back and the cove has carried on
    > without you. Every cat has its own way of being a cat — a lazy one loafs,
    > a bold one gets the zoomies, a shy one watches from the long grass — and
    > the more time you spend together, the more you notice.
    >
    > Slowly you make the place theirs: mend the old dock, plant the catmint,
    > light the little bakery oven. Send a few cats off exploring and read the
    > postcards they send home. Fill the field guide. Sit with one cat a while
    > and just watch it groom.
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
- **IAP $4.99**: add `@capacitor-community/in-app-purchases` (or RevenueCat),
  create the `cozy_supporter_pack` product in both consoles, wire
  `grantSupporter()` to a real purchase + restore. See `showPackOffer()` in
  `index.html` for the integration point.
- **Cloud save**: `@capacitor-firebase/*` is overkill — use Google Play Games
  *Saved Games* + Apple Game Center saved games. The `saveCode()` export in the
  Today sheet is the interim.

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
