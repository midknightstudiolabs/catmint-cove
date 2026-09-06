# Catmint Cove — Google Play launch runbook

The one ordered checklist to get **Catmint Cove v1.0.0** onto Google Play.
Deep detail on the CI / keystore lives in **`STORE-SETUP.md`**; store copy in
**`STORE-SETUP.md` §2**; the privacy policy text in **`PRIVACY.md`**.

Each step is tagged:
**[you]** = a person in a console · **[CI]** = a GitHub Actions run · **[done]** = already in the repo

Legend for IDs used throughout:
- package / application id: `com.midknightstudiolabs.catmintcove`
- in-app product ids (must match everywhere): `welcome_pack` · `sparkle_pack` · `founding_covekeeper`

---

## 0. Prerequisites — already true

- [done] Capacitor 8 wrapper, `capacitor.config.json`, `scripts/`, `assets/`.
- [done] `.github/workflows/android.yml` — builds → signs → optional Play upload.
- [done] RevenueCat billing wired in `index.html` + `scripts/capacitor-bridge.js`
  (falls back to a simulated purchase until the SDK key is pasted — step 3).
- [done] Version = **1.0.0** (`package.json`); first tag will be `android-v1.0.0`.
- [you, have it] Google Play Console developer account, verified.
- [you, done] RevenueCat account.

---

## 1. Signing key  **[you]** · ~10 min

Follow **`STORE-SETUP.md` §3**:
1. `keytool -genkey -v -keystore catmint-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000`
2. **Back the `.jks` up somewhere offline.** Losing it = you can never update the app.
3. Repo → Settings → Secrets and variables → Actions → add:
   `ANDROID_KEYSTORE_BASE64` (=`base64 -w0 catmint-upload.jks`),
   `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (=`upload`), `ANDROID_KEY_PASSWORD`.

> Claude never generates or handles this key.

---

## 2. Play Console — create the app + products  **[you]** · ~30 min

1. **Create app** → name `Catmint Cove`, game, free, default language en-US.
   Accept the developer program policies + US export laws declaration.
2. **Monetize → Products → In-app products → Create product** ×3.
   Type is **managed product** (one-time, non-consumable). Use these exact ids:

   | Product ID | Name | Price (base, USD) |
   |---|---|---|
   | `welcome_pack` | Welcome Pack | 0.99 |
   | `sparkle_pack` | Sparkle Pack | 2.99 |
   | `founding_covekeeper` | Founding Covekeeper | 4.99 |

   Set each to **Active**. (Play auto-fills local prices; adjust later if wanted.)
3. **Setup → API access** → link a Google Cloud project → create a **service
   account**. You will use this JSON for **two** things:
   - RevenueCat (step 3) — needs it to verify purchases.
   - Optional CI auto-upload — the `PLAY_SERVICE_ACCOUNT_JSON` repo secret
     (`STORE-SETUP.md` §3). *You can skip auto-upload and upload the `.aab` by
     hand; the first upload must be manual anyway.*
   Grant the service account (in Play Console → Users & permissions) at least:
   **View app information**, **View financial data**, and **Manage orders and
   subscriptions** — RevenueCat's minimum.

---

## 3. RevenueCat  **[you]** · ~20 min

1. **Create a Project** (e.g. "Catmint Cove").
2. **Add an app** → platform **Google Play** → package
   `com.midknightstudiolabs.catmintcove`.
3. Upload the **Play service-account JSON** from step 2.3 (Project settings →
   your Play app → Service Account credentials). Wait for it to say connected.
4. **Products** → add the 3 product ids exactly: `welcome_pack`, `sparkle_pack`,
   `founding_covekeeper`. *(Entitlements and Offerings are optional — the game
   reads `customerInfo.allPurchasedProductIdentifiers` directly — but adding an
   "Offering" with all 3 is good practice.)*
5. **Project settings → API keys** → copy the **public Google API key** (starts
   with `goog_`).
6. **[you, in the repo]** open `scripts/capacitor-bridge.js`, set
   `var REVENUECAT_ANDROID_KEY = "goog_..."`, commit + push. *(It's a client key —
   safe in a public repo.)*
   Until this is done, the app builds and runs but uses the simulated purchase
   flow — it cannot take real money.

---

## 4. First build  **[CI]** · ~8 min

You can run this **before** step 1 to check the app compiles (RevenueCat +
Capacitor 8) — with no keystore it emits an **unsigned** `.aab` you can't upload,
but a green run confirms the pipeline. Do it again after step 1 for the real one.

1. GitHub → Actions → **Android build** → *Run workflow* → `track = none` → Run.
2. When it's green, download the artifact:
   - keystore set → **`catmint-cove-1.0.<run>.aab`** (signed, uploadable)
   - no keystore yet → **`catmint-cove-1.0.<run>-UNSIGNED.aab`** (compile check only)
   - If it fails at *"Stamp the version"* with a `versionCode`/`versionName`
     error, the Capacitor 8 template changed `build.gradle` — fix the two `sed`
     lines in `android.yml` and re-run (a guard catches it).
3. This proves the whole pipeline: native gen, portrait lock, version stamp,
   the RevenueCat plugin build, and (with the keystore) signing.

---

## 5. Internal testing — upload by hand  **[you]** · ~15 min

1. Play Console → **Testing → Internal testing → Create new release**.
2. **Upload** `catmint-cove-1.0.0.aab`. Accept **Play App Signing** (the default).
   *(Play requires the very first bundle by hand so it can register the signing
   key. After this, `git tag android-v1.0.1 && git push --tags` — or the workflow
   with a track picked — does it.)*
3. Add yourself (and a second Google account / a friend) as an internal tester.
   Save + roll out to Internal testing.

---

## 6. On-device smoke test  **[you]** · ~20 min

Install via the internal-testing opt-in link on a real Android phone. Check:

- [ ] Launches, **portrait-locked**, splash disappears on the first frame.
- [ ] Hardware **back** closes an open panel/modal; on the bare cove it
      backgrounds the app (doesn't quit to a black screen).
- [ ] Play ~3 min, force-close, reopen → your cove is exactly as you left it.
- [ ] Shop → each pack's **Get it** opens the real Google Play purchase sheet.
- [ ] Use a **license-test account** (Play Console → Setup → License testing) so
      you're not charged. Buy **Welcome Pack** → amber ribbon appears in the
      dress-up rack, paw-prints by the sign. Buy **Sparkle Pack** → glow/wings/
      rainbow unlock. Buy **Founding Covekeeper** → plaque + Midknight's amber
      ribbon by the sign.
- [ ] Kill + reopen → all three still owned.
- [ ] Airplane mode → reopen → still owned (fail-open cache).
- [ ] "Restore purchases" on the offer modal, or reinstall the app → the packs
      come back.
- [ ] Prices in the purchase sheet show your local currency.
- [ ] RevenueCat dashboard → the sandbox purchases show up under Customers.

If a purchase doesn't register: RevenueCat dashboard → the customer → check the
product is listed there; confirm the product id matches exactly in all 3 places
(Play Console / RevenueCat / `COVE_PRODUCTS` in the bridge).

---

## 7. Store listing + policy declarations  **[you]** · ~1 hr

In Play Console → **Grow → Store presence → Main store listing**:

- **App name:** `Catmint Cove`
- **Short description / Full description:** from `STORE-SETUP.md` §2 (already
  V3-accurate). **Do not** mention "Labubu" anywhere in copy, keywords, or
  screenshots — it's an in-game easter-egg character only.
- **App icon:** `assets/logo.png` (512×512 in Play; `@capacitor/assets`
  generated the density variants in the build).
- **Feature graphic (1024×500, required):** `assets/store/feature-graphic.png`
  (generated from `assets/_feature-graphic.html` — regenerate/replace freely).
- **Phone screenshots (2–8, portrait):** `assets/store/*.png`. Swap in real
  device captures if you prefer.
- **Category:** Simulation. **Tags:** cats, casual, relaxing, idle.
- **Contact email:** `carlosgotiong@gmail.com`.

**App content** section:

- **Privacy policy URL:** publish `privacy.html` as a page on
  midknightstudiolabs.com (Blogspot), paste that URL here.
- **Ads:** *No* — the app contains no ads.
- **App access:** *All functionality is available without special access* (no login).
- **Content rating:** run the IARC questionnaire — answers in **Appendix A**.
- **Target audience:** ages **13+**. Not "designed for families". *(Keeps the
  stricter Families / Ads-SDK rules off the table for a later AdMob phase.)*
- **Data safety:** answers in **Appendix B**.
- **Government app / financial features / health:** No to all.

**In-app products** on the listing: Play auto-lists them once active — confirm
the price band shows `$0.99 – $4.99`.

---

## 8. Closed testing → Production  **[you]**

- Move the build from Internal to **Closed testing**.
- **New personal developer accounts must run 12 testers for 14 continuous days**
  before the Production track unlocks. Recruit 12 real Google accounts (friends,
  a testing group, Discord) and get them installed early — the 14-day clock only
  counts days with ≥12 opted-in testers.
- After 14 days: **Production → Create release** → promote the same `.aab` →
  submit for review (a first app review is often 3–7 days).

---

## 9. Later (not blocking launch)

- **AdMob** — can't be approved until the app is *published*; then add
  `@capacitor-community/admob`, flip `ADS_ENABLED`, re-submit is not needed
  (it's a runtime flag). See `STORE-SETUP.md` §5.
- **iOS / TestFlight** — `ios.yml` workflow + the Apple secrets. RevenueCat is
  already multi-platform; add an iOS app in the same RC project + the
  `REVENUECAT_IOS_KEY`.
- **Cloud save** — Play Games Saved Games; fold the `iapStore` blob in.

---

## Appendix A — IARC content-rating questionnaire

Expected outcome: **ESRB Everyone / PEGI 3 / USK 0** (all-ages).

| Question area | Answer |
|---|---|
| Violence (realistic / cartoon / fantasy) | **None** |
| Blood / gore | **None** |
| Sexual content / nudity / suggestive themes | **None** |
| Profanity / crude humour | **None** |
| Controlled substances (alcohol / tobacco / drugs) | **None** — reference or use |
| **Gambling** — simulated or real | **No.** The "Cove Festival" is a race with no wager, no stake, no loss; every entrant is rewarded and it is always skippable. Nothing of value is risked. |
| Digital purchases | **Yes** — the app offers in-app purchases (cosmetic only). |
| User interaction / user-generated content / shares location / personal info | **No** — no chat, no social features, no UGC sharing, no location. |
| Unrestricted internet access / opens web browser | **No** |
| In-game currency purchasable with real money | **No** — no currency is sold; purchases are one-time cosmetic unlocks. |
| Miscellaneous (horror, fear, discrimination themes) | **None** |

---

## Appendix B — Play Data Safety form answers

The app itself collects **nothing** and has no backend. The only data leaving the
device is what **Google Play Billing + RevenueCat** need to deliver purchases.
(RevenueCat's own guidance:
<https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety>)

**Does your app collect or share any of the required user data types?** → **Yes**

**Data collected:**

| Data type | Collected | Shared | Purpose | Optional? |
|---|---|---|---|---|
| **Financial info → Purchase history** | Yes | **No** | App functionality; Analytics | Users can play without purchasing, so *"Users can choose whether this data is collected"* |

Everything else → **Not collected**: no name, email, user IDs (the RevenueCat
app-user id is a random anonymous string, not tied to an account), location,
contacts, messages, photos, files, browsing history, device or advertising IDs,
app activity, crash logs, or diagnostics.

**Security practices:**
- **Is data encrypted in transit?** → **Yes** (RevenueCat uses TLS).
- **Can users request data deletion?** → **Yes.** Provide the support email
  `carlosgotiong@gmail.com`; deletions are actioned via the RevenueCat dashboard.
- **Committed to Play Families Policy?** → target audience is 13+, so this
  section is not required; answer honestly if prompted (no ads, no tracking).
- **Independent security review?** → No.

**Data types processed ephemerally only?** → No (purchase history is retained).
