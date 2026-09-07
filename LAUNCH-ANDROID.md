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

## 1. Signing key  **[you]** · ✅ DONE 2026-09-06

Made in Android Studio (Build → Generate Signed App Bundle → Create new keystore).
- File: `catmint-upload.jks` on Google Drive (`G:\My Drive\…\Catmint Cove\keys\`),
  PKCS12 format, **alias `key0`**, store password == key password.
- 4 repo secrets set: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
  `ANDROID_KEY_ALIAS` (=`key0`), `ANDROID_KEY_PASSWORD`.
- ⚠️ **Still owed:** a second offline backup of the `.jks` (password manager) —
  Google Drive is currently the only copy. Lose it = can never update the app.

> Claude never generates or handles this key.

---

## 2. Play Console — create the app + products  **[you]** · ✅ DONE 2026-09-06

App "Catmint Cove" exists (`com.midknightstudiolabs.catmintcove`). Merchant
payments profile submitted (Individual, "Midknight Studio Labs" display name).
Account group "Midknight Studio" created (15% service fee). Android developer
verification: package already auto-registered. 3 one-time products created +
**Active** (`welcome_pack` $0.99 / `sparkle_pack` $2.99 / `founding_covekeeper`
$4.99), each purchase option id `buy`, type Buy. Build `1.0.4` uploaded to
Internal testing → **Play App Signing registered**. `1.0.5` (with billing) is
the next upload.

<details><summary>original checklist</summary>

### ~30 min

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

> Note: Play Console's "Setup → API access" page was **not present** on this
> account — created the service account straight in Google Cloud Console
> (console.cloud.google.com → project `catmint-cove` → enable "Google Play
> Android Developer API" → IAM → Service Accounts → create + JSON key), then
> invited its email in Play Console → Users and permissions with the financial
> permissions.

</details>

---

## 3. RevenueCat  **[you]** · ✅ DONE 2026-09-06

- Project "Catmint Cove"; Google Play app added.
- Service account (`revenuecat@catmint-cove.iam.gserviceaccount.com`, made in
  Google Cloud since Play Console's "API access" page was missing) — granted
  *View financial data* + *Manage orders and subscriptions* in Play → Users and
  permissions → **"Valid credentials"** after ~1h propagation.
- 3 products imported from Play, all **Published**. Entitlements/offerings left
  unattached (code reads `allPurchasedProductIdentifiers`).
- Google developer notifications (Pub/Sub) **skipped** — optional, post-launch.
- **`goog_` public SDK key wired into `scripts/capacitor-bridge.js`** (commit
  `bfc022a`) → real Google Play Billing live in build `1.0.5`.

---

## 4. First build  **[CI]** · ~8 min

> **✅ SIGNED BUILD GREEN — 2026-09-06.** Run `34036136390` →
> **`catmint-cove-1.0.4.aab`** (9.7 MB, signed, uploadable to Play). Everything
> passed: native gen, RevenueCat compile (Capacitor 8 / AGP 8.13 / JDK 21),
> portrait lock, version stamp, signing.
> Gotchas hit along the way (all fixed): (a) workflow pinned Node 20, Capacitor 8
> CLI needs ≥22 — bumped in `1ebaa24`; (b) the Android Studio keystore's alias
> was the default **`key0`**, not `upload` — so the **`ANDROID_KEY_ALIAS` secret
> is `key0`**. Keystore lives on the dev's Google Drive (PKCS12 format, store
> pw == key pw).

Later builds: `git tag android-v1.0.5 && git push --tags` (or Actions → Run
workflow with a track). Version code = the run number (always increases).

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

## 5. Internal testing  **[you]** · ✅ DONE 2026-09-06

Builds `1.0.4` then `1.0.5` (billing) uploaded to Internal testing; tester
opt-in link + license-test Gmail set up (Play → Settings → License testing,
`RESPOND_NORMALLY`). Later builds: `git tag android-v1.0.6 && git push --tags`.

---

## 6. On-device smoke test  **[you]** · ✅ DONE 2026-09-06

Installed on the dev's Android phone. App runs, real Google Play purchase sheet
appears for each pack, purchases complete + unlock the cosmetics + persist
across a restart. RevenueCat billing verified end-to-end.

<details><summary>original checklist</summary>

Install via the internal-testing opt-in link on a real Android phone. Check:

- [ ] Launches, **portrait-locked**, splash disappears on the first frame.
- [ ] Hardware **back** closes an open panel/modal; on the bare cove it
      backgrounds the app (doesn't quit to a black screen).
- [ ] Play ~3 min, force-close, reopen → your cove is exactly as you left it.
- [ ] Shop → each pack's **Get it** opens the real Google Play purchase sheet.
- [ ] Use a **license-test account** (Play Console → Setup → License testing) so
      you're not charged. Buy **Welcome Pack** → amber ribbon appears in the
      dress-up rack, paw-prints by the sign. Buy **Sparkle Pack** → glow/wings/
      rainbow unlock. Buy **Founding Covekeeper** → 2026 plaque by the sign +
      Midknight's amber ribbon + halo & hero mask in the dress-up rack.
- [ ] Kill + reopen → all three still owned.
- [ ] Airplane mode → reopen → still owned (fail-open cache).
- [ ] "Restore purchases" on the offer modal, or reinstall the app → the packs
      come back.
- [ ] Prices in the purchase sheet show your local currency.
- [ ] RevenueCat dashboard → the sandbox purchases show up under Customers.

If a purchase doesn't register: RevenueCat dashboard → the customer → check the
product is listed there; confirm the product id matches exactly in all 3 places
(Play Console / RevenueCat / `COVE_PRODUCTS` in the bridge).

</details>

---

## 7. Store listing + policy declarations  **[you]** · ~1 hr — NEXT

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
| "Digital Purchases, Cash Convertible Rewards, or NFTs" (bundled question — digital goods **that are cash-convertible / tradeable / gift cards / play-to-earn / crypto / NFTs**) | **No.** Cosmetic IAPs can't be resold, refunded to cash, traded, or converted to anything of value. |
| Plain in-app purchases (the separate Monetization question, if asked) | **Yes** — cosmetic-only, $0.99–$4.99. Also declared on the App content page ("In-app purchases: Yes"). |
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
