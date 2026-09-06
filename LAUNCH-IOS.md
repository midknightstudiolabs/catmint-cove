# Catmint Cove — App Store launch runbook

The one ordered checklist to get **Catmint Cove** onto the App Store, from a
Windows PC + an iPad/iPhone — **no Mac needed**. CI does the macOS build.

Deep detail on the CI lives in **`STORE-SETUP.md` §4**; store copy in
**`STORE-SETUP.md` §2**; privacy policy text in **`PRIVACY.md`**.

Each step is tagged:
**[you]** = a person in a console · **[CI]** = a GitHub Actions run · **[me]** = a code change · **[done]** = already in the repo

Legend for IDs used throughout:
- bundle id: `com.midknightstudiolabs.catmintcove` (same as Android's application id)
- in-app product ids (must match Android + RevenueCat exactly): `welcome_pack` · `sparkle_pack` · `founding_covekeeper`
- all three products are **non-consumable**

---

## 0. Prerequisites

- [done] Capacitor 8 wrapper, `capacitor.config.json` (`ios` block present), `assets/` (icon + splash source art).
- [done] `.github/workflows/ios.yml` — archives on a GitHub macOS runner with an App Store Connect API key (automatic signing), uploads to TestFlight. Runs a simulator compile-check until the key secrets exist.
- [done] `scripts/capacitor-bridge.js` — `REVENUECAT_IOS_KEY` slot (empty ⇒ iOS falls back to the simulated purchase flow, app still runs). `COVE_PRODUCTS` already lists the 3 ids; the platform switch picks the iOS key on iOS.
- [you, have it] **Apple Developer Program** membership — enrolled + active (confirmed 2026-09-07).
- [you, done] RevenueCat account + project "Catmint Cove" (already has the Google Play app + 3 products).

### Progress (2026-09-07)

- [x] 1. Paid Apps agreement accepted (bank + W-8BEN submitted — may show "Pending" briefly)
- [x] 2. App ID `com.midknightstudiolabs.catmintcove` + In-App Purchase capability
- [x] 3. App record created (SKU `catmintcove`)
- [x] 4. 3 non-consumable IAPs created in App Store Connect (Missing Metadata — screenshots deferred to submission)
- [x] 5. ASC API **Team key** `ci`/`L88KLJJN5M` (App Manager) + `.p8` saved
- [x] 6. Team ID noted
- [x] 7. RevenueCat App Store app: In-App Purchase Key (`SubscriptionKey_4ZU6CPFPL4`) wired; 3 products created (`welcome_pack`/`sparkle_pack`/`founding_covekeeper`). "Could not check" store status = the optional ASC-API connection, non-blocking.
- [x] 8. `REVENUECAT_IOS_KEY = appl_NOnpzwbRdsrmoSDdowFOZQntdxp` in the bridge (commit `0b9b122`); 4 GitHub secrets set (`ASC_KEY_ID` `ASC_ISSUER_ID` `ASC_KEY_P8_BASE64` `IOS_TEAM_ID`).
- [ ] `ios.yml` signing run — in progress (run 3)
- [ ] 9. TestFlight smoke test
- [ ] 10. Store listing + App Privacy + rating
- [ ] 11. Submit

---

## 1. Paid Applications Agreement + bank/tax  **[you]** · ~15 min · ⬜

**IAP does nothing until this is signed.**

1. **appstoreconnect.apple.com → Business** (formerly "Agreements, Tax, and Banking").
2. **Paid Apps** schedule → **Accept / Set Up**.
3. Add a **bank account** (for payouts) and complete **tax forms** (W-8BEN for a non-US individual; W-9 for US). Philippines-based individual → W-8BEN.
4. Wait until Paid Apps shows **Active** (usually minutes, sometimes a day).

---

## 2. App ID with In-App Purchase  **[you]** · ~5 min · ⬜

1. **developer.apple.com → Certificates, Identifiers & Profiles → Identifiers → +**
2. **App IDs → App** → Description `Catmint Cove`, Bundle ID **Explicit** = `com.midknightstudiolabs.catmintcove`.
3. Capabilities: tick **In-App Purchase** (on by default). Nothing else needed — the game has no push, no sign-in, no iCloud yet.
4. Register. *(No certificate, no provisioning profile — `xcodebuild -allowProvisioningUpdates` in CI creates + manages those with the API key.)*

---

## 3. App record in App Store Connect  **[you]** · ~5 min · ⬜

1. **appstoreconnect.apple.com → Apps → + → New App**.
2. Platform **iOS**, Name `Catmint Cove`, Primary language **English (U.S.)**,
   Bundle ID `com.midknightstudiolabs.catmintcove` (pick from the list),
   SKU `catmintcove`, Full access.
3. Leave the listing blank for now — filled in step 9.

> Name check: "Catmint Cove" must be free on the App Store. If taken, the app
> name can differ from the bundle id — decide a fallback (e.g. "Catmint Cove:
> Cat Sanctuary"). Keep "Labubu" out of the name, subtitle, and keywords.

---

## 4. The 3 in-app purchases in App Store Connect  **[you]** · ~15 min · ⬜

**Apps → Catmint Cove → (left nav) In-App Purchases → +** ×3. Type **Non-Consumable**.

| Product ID (exact) | Reference Name | Price |
|---|---|---|
| `welcome_pack` | Welcome Pack | Tier for $0.99 |
| `sparkle_pack` | Sparkle Pack | Tier for $2.99 |
| `founding_covekeeper` | Founding Covekeeper | Tier for $4.99 |

For each: one **localization** (English U.S.) with a display name + description
(reuse the in-game copy), one **review screenshot** (any 1284×2778 grab of the
offer modal — capture from the TestFlight build in step 8, or the web preview),
and **Review notes**: *"Cosmetic only — no gameplay effect. Unlocks decorative
items for the cats. Sandbox tester: no special steps."*

Products can sit in **"Ready to Submit"** — they're submitted **with the app's
first version**, not before.

> Don't prefix the IDs. `welcome_pack` (not `com.…​.welcome_pack`) keeps them
> identical to Android so RevenueCat + `COVE_PRODUCTS` need zero changes.
> ⚠️ A product ID, once created, can never be reused — type them carefully.

---

## 5. App Store Connect API key — for CI signing  **[you]** · ~3 min · ⬜

1. **appstoreconnect.apple.com → Users and Access → Integrations → App Store Connect API → Team Keys → +**
2. Name `ci`, Access **App Manager**, Generate.
3. **Download `AuthKey_XXXXXXXXXX.p8`** — one time only, save it somewhere safe.
4. Note the **Key ID** (the `XXXXXXXXXX`) and the **Issuer ID** (UUID at the top of the page).

---

## 6. Team ID  **[you]** · 1 min · ⬜

**developer.apple.com → Account → Membership details** → the **Team ID** (10 chars, e.g. `AB12CD34EF`).

---

## 7. RevenueCat — add the App Store side  **[you]** · ~15 min · ⬜

RevenueCat project **Catmint Cove** already exists with the Google Play app.

1. **Project settings → Apps → + New → App Store**.
   - App name `Catmint Cove`, bundle ID `com.midknightstudiolabs.catmintcove`.
2. **App Store Connect API** (for RevenueCat to validate purchases + get product
   info + receive Apple's server notifications):
   - RevenueCat's Apple app config will ask for an **In-App Purchase Key**
     (App Store Connect → Users and Access → Integrations → **In-App Purchase** →
     generate). Give RevenueCat its **Key ID**, **Issuer ID**, and the **`.p8`**.
     *(This is a different key from the `ci` Team Key in step 5 — it's the
     purchase-validation key. Follow whatever RevenueCat's wizard currently asks
     for; it changed to the In-App Purchase Key type in 2024.)*
   - Also paste the **App-Specific Shared Secret** if RevenueCat asks (ASC → app
     → App Information → "App-Specific Shared Secret" → generate).
3. **Products** (RevenueCat left nav) → **+ New** ×3, Store = App Store, exact
   identifiers `welcome_pack` / `sparkle_pack` / `founding_covekeeper`. Or use
   **Import** once the ASC products exist.
4. If you set up **Entitlements/Offerings** for Android, attach the 3 App Store
   products to the same entitlement + offering. *(The game reads
   `allPurchasedProductIdentifiers` directly, so this is optional for the game
   to work — but keep it tidy for the dashboard.)*
5. **Project settings → API keys** → copy the **App Store public SDK key**
   (starts **`appl_`**). This is a client key — safe to commit.

---

## 8. Wire the key + secrets, then build  **[me] + [you] + [CI]**

- [me] Paste the `appl_` key into `REVENUECAT_IOS_KEY` in
  `scripts/capacitor-bridge.js`, commit, push. *(Send me the key — it's a public
  client key, fine to share.)*
- [you] Repo **Settings → Secrets and variables → Actions → New repository secret** ×4:

  | secret | value |
  |---|---|
  | `ASC_KEY_ID` | the step-5 Key ID (10 chars) |
  | `ASC_ISSUER_ID` | the step-5 Issuer ID (UUID) |
  | `ASC_KEY_P8_BASE64` | the `.p8` as one base64 line — see below |
  | `IOS_TEAM_ID` | the step-6 Team ID |

  base64 the `.p8` on Windows (PowerShell):
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("$HOME\Downloads\AuthKey_XXXXXXXXXX.p8")) | Set-Clipboard
  ```
  Paste straight into the secret. **Never paste the `.p8` or its base64 into chat.**

- [CI] **Actions → iOS build (TestFlight) → Run workflow** (branch `main`).
  ~15–20 min. It archives with automatic signing, exports the `.ipa`, and
  uploads to TestFlight. First run also has Apple create the distribution cert +
  profile server-side.
  - Version = `1.0.<run number>` unless you push a tag `ios-vX.Y.Z`.
  - Build number = the run number (must always increase for TestFlight).

<details><summary>if the run fails</summary>

- **`No profiles for '…' were found` / signing** — the App ID (step 2) or Paid
  Apps agreement (step 1) isn't ready, or `IOS_TEAM_ID` is wrong.
- **`altool … Unable to authenticate`** — `ASC_KEY_ID` / `ASC_ISSUER_ID`
  mismatch, or the `ci` key lacks App Manager.
- **Swift Package resolution** — Capacitor 8 uses SPM (no CocoaPods). A
  transient network failure resolving packages → just re-run.
- **asset generation** — `@capacitor/assets` flattens `assets/icon-foreground.png`
  over `assets/icon-background.png` for the iOS icon (no alpha). If it complains,
  add a flat `assets/icon.png` (1024×1024, opaque).
- **`Invalid bundle. Missing Info.plist … UILaunchStoryboardName`** — Capacitor's
  template includes it; only happens if the template shifted. Ping me.
</details>

---

## 9. TestFlight + on-device smoke test  **[you]** · ~30 min · ⬜

1. **ASC → Catmint Cove → TestFlight**. The build appears after ~10 min of
   processing. Answer the **export-compliance** prompt: *uses only standard
   HTTPS → "No" to custom/proprietary encryption* (add
   `ITSAppUsesNonExemptEncryption = NO` to Info.plist later to skip it — ask me).
2. **Internal Testing** group → add your Apple Account → install **TestFlight**
   from the App Store on your iPhone/iPad → install Catmint Cove.
3. Smoke test:
   - [ ] Launches, **portrait-locked**, splash gone on first frame.
   - [ ] Swipe-up / background / relaunch → cove is exactly as left.
   - [ ] Rain/Rest mode: a tap on the dimmed cabin wakes it; "Back to the cove" returns.
   - [ ] Shop → each pack's **Get it** opens the real **[Sandbox]** purchase sheet.
   - [ ] **Sandbox account**: Settings → Developer → Sandbox Apple Account (or
     sign in when the sheet prompts). Buy each pack →
     - Welcome → amber ribbon in the dress-up rack, paw-prints by the sign
     - Sparkle → glow / wings / rainbow unlock
     - Founding Covekeeper → 2026 plaque by the sign, Midknight's ribbon, halo + hero mask
   - [ ] Force-quit + reopen → still owned. Airplane mode + reopen → still owned.
   - [ ] Delete + reinstall → **Restore purchases** (in any offer modal) re-grants.
   - [ ] Prices show in your App Store region's currency.

---

## 10. Store listing + App Privacy + age rating  **[you]** · ~1 hr · ⬜

**ASC → Catmint Cove → (version) 1.0**

- **Screenshots** (from the TestFlight build, portrait):
  - 6.9"/6.7" iPhone (1290×2796 or 1320×2868) — required, ~3–5
  - 13" iPad (2064×2752) — required if "iPad" is a supported device
  - one 6.9" set can auto-scale down; iPad needs its own
- **Description / subtitle / keywords / promo text** — reuse `STORE-SETUP.md §2`
  (V3-accurate). Subtitle ≤30 chars. **No "Labubu"** anywhere.
- **Support URL** — the Blogspot site (or a simple contact page).
- **Marketing URL** (optional) — the Midknight Studio blog.
- **App Privacy** ("nutrition labels") — mirror the Play Data Safety answers
  (`LAUNCH-ANDROID.md` Appendix B): **Purchases** — collected, linked to the
  user (via RevenueCat's random app-user id + Apple's transaction), for App
  Functionality; **no tracking**; nothing else collected. Privacy policy URL =
  the Blogspot `privacy.html`.
- **Age Rating** — Apple's own questionnaire → expect **4+**. No violence,
  no simulated gambling (the festival is a race with no wager), no user content,
  no unrestricted web.
- **In-App Purchases** — attach all 3 to this version (scroll to the IAP section
  on the version page and tick them, or they won't be reviewed).
- **App Review Information** — contact details, and **notes**: *"Free-to-play,
  ad-free. The 3 in-app purchases are cosmetic only and grant no gameplay
  advantage. No account or login. Sandbox testing needs no special steps."*
- **Version release** — "Manually release" so you control the go-live moment.

---

## 11. Submit for review  **[you]** · review 1–3 days (first app can be longer) · ⬜

Submit. Common first-app rejections to pre-empt:
- **3.1.1** — every purchasable thing must go through IAP (it does).
- **2.1** — reviewer couldn't test a purchase → the sandbox note in step 10 covers it.
- **5.1.1** — asking for data without need (we ask for nothing → fine).
- **4.2** minimum functionality — a full idle game, not a web-view shell → fine,
  but the review notes should say it's an original game.

On approval → **Release** (manual) → live on the App Store.

---

## Later (not blocking launch)

- `ITSAppUsesNonExemptEncryption = NO` in Info.plist (CI `plutil` step) to kill
  the per-build export-compliance prompt.
- Game Center saved games for cross-device / cross-platform cloud save.
- AdMob (only ever if `ADS_ENABLED` flips) — separate SDK, separate consent.

---

## Release cheat-sheet

```bash
# tag a specific version
git tag ios-v1.0.1 && git push origin ios-v1.0.1

# or: Actions ▸ iOS build (TestFlight) ▸ Run workflow
```

Build number = GitHub run number (always increases). `versionName` = the bit
after `ios-v` in the tag, else `1.0.<run>`.
