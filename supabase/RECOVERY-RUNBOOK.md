# Player recovery — support boundaries

## Current deliverable
Anonymous onboarding remains disabled publicly. Recovery-case intake, private purchase-event ledger and owner-only cloud-backup migrations were applied September 19, 2026. Intake creates a private case and audit record; it does not restore an account. The existing Restore Purchases path uses RevenueCat. A versioned manual cloud-backup UI is implemented behind the disabled Friends gate. Verified purchase-to-Supabase binding, protected account sign-in and account transfer are NOT implemented.

## September 19 setup checkpoint
- RevenueCat project `6b482bbe` / API project `proj6b482bbe`; iOS app `app12b6a84e70`, Android app `app515504ac46`.
- Existing restore behavior is `Transfer to new App User ID`; unchanged. Native SDK still uses its original anonymous identity. Do not log in to arbitrary IDs to infer proof of ownership.
- `revenuecat-events` deployed to the existing Supabase project. Legacy gateway JWT verification is OFF; the handler requires the dedicated `REVENUECAT_WEBHOOK_TOKEN` header. User configured the secret in both services; never store its value in source or chat.
- RevenueCat webhook `whintgr1492cbbd1d` saved: name `Catmint Cove recovery evidence`, URL `https://gbkkiejmqocbijhnzoxg.supabase.co/functions/v1/revenuecat-events`, all apps/events, both environments.
- September 19 at 13:52 UTC: RevenueCat TEST event `5515B970-980C-4909-972E-E7E7C64D7E36` returned HTTP 200. Authentication and connectivity passed. TEST intentionally bypasses purchase persistence: this does not verify a real purchase, ledger write, entitlement restoration or lost-account recovery. No production/store rollout authorized by this checkpoint.
- Ledger retains minimal event identifiers, timestamps, product/store and transfer/alias IDs; not customer email, subscriber attributes, receipt bodies or full payloads. It is evidence only, never a grant or account-access decision.
- Cloud backups keep the latest five versions, max 1.4 MB each, one new version per five minutes. Upload is explicit. Restore requires review and preserves `catmintCove.neo.before-cloud-restore` locally before replacement. A backup is accessible only to its signed-in owner. It does NOT solve lost-session recovery.
- All four new tables have RLS enabled and no direct SELECT for anon/authenticated roles, verified live.
- `supabase/test-backups.sql` passed in the real database with temporary fixtures rolled back: owner save/list/read, duplicate save, invalid data, cross-user rejection, missing-session rejection.
- `scripts/test-revenuecat.mjs`: 8 local checks passed. Friends regression and `scripts/test-cloud-backup.cjs` passed Chromium/WebKit with mocked HTTP; this is not a native store or complete account recovery test.

## Remaining release gates
The initial short-secret failure was corrected by the user; the latest connectivity test passed. Receiver diagnostics distinguish missing and short secrets without exposing their values.

1. Complete real sandbox purchase/restore delivery tests, verify private ledger insertion and duplicate delivery handling.
2. Implement recoverable identity (optional linked provider or a reviewed, revocable recovery credential) and test lost-device recovery; anonymous signup alone is insufficient.
3. Build and test server-verified purchase association and authenticated staff recovery operations. Historical anonymous purchases cannot safely identify Friends by guesswork.
4. Finish signup abuse controls and real two-account Friends tests, then enable the Neo pilot. Keep `ui/social-config.js` disabled until these are complete.

## What support can promise
- Same-store Restore Purchases can recover eligible entitlements supported by the store/RevenueCat configuration. Do not promise all consumables or cross-platform restoration.
- A friend code, receipt screenshot, order number, display name or case reference alone is not authentication.
- Cats, earned currencies, item placements and progression require an existing valid backup. A shared picture is not a save backup.
- Purchases predating a verified identity binding may lack enough evidence to identify a Friends account. Explain the limit honestly; do not guess the owner.

## Operator procedure before a future transfer
1. Open the case in the private backend; never expose the queue to player accounts. Record an authenticated operator identity.
2. Verify the transaction with RevenueCat/store server APIs; check app, store, environment, product, revocation/refund status and original transaction lineage. Never accept a client `verified` flag.
3. Establish a previously server-verified binding from that transaction to the lost account. Purchase restoration by itself is not consent or proof to transfer Friends.
4. Establish control of the new claimant session; obtain explicit transfer confirmation. Flag competing claims, shared store accounts and recent transfers for manual review.
5. Preserve the target's local save. Do not silently overwrite or merge currencies. Show whether only purchases, Friends or an actual backed-up Cove can be restored.
6. Only after a tested recovery operation exists: lock both identities, snapshot recoverable state, transfer ownership once, revoke old access, rotate recovery credentials, and append actor/evidence/result to the audit log. A resolved support status alone is not a restoration.

## Required before enabling recovery
Authenticated support console/role; server-side RevenueCat verification and identity binding; durable abuse limits; proof expiry and replay protection; audited transfer and rollback tests; optional account linking or private recovery credential for non-paying players; opt-in versioned cloud backups if progression recovery is promised. Keep keys exclusively server-side. Define retention/deletion handling for support records before collecting real cases.

## Anonymous onboarding
Enable Supabase anonymous sign-ins only with project rate limits and an abuse-prevention strategy. Never expose a guest sign-out action without a recovery path. Friend codes are discoverability identifiers, not secrets. Keep Friends disabled until real two-account and unauthorized-third-account tests pass. No SMTP is needed for initial anonymous signup; optional email recovery still needs an email provider.
