# Player recovery — support boundaries

## Current deliverable
Anonymous onboarding is prepared, not enabled publicly. Recovery-case intake migration is prepared, not applied. Intake creates a private case and an audit record; it does not restore an account. The existing Restore Purchases path uses RevenueCat. No cloud save backup, verified purchase-to-Supabase binding or account-transfer endpoint currently exists.

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
