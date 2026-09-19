# Cove Friends — Neo pilot

Status September 19: user explicitly approved the Friends tables and API in the existing Catmint Cove project. Migration `20260919_cove_friends.sql` was applied successfully through the Supabase SQL editor. Verified all five tables have RLS enabled and neither anon nor authenticated has direct SELECT permission. Verified anon cannot execute neo_social and authenticated can. Configuration remains disabled pending email delivery and multi-account access tests.

Project: `gbkkiejmqocbijhnzoxg`, Catmint Cove, Midknight Studio. Dashboard inspection found zero public tables on September 19, 2026. The client uses only the existing publishable key. No secret/service-role key has been read or copied.

## Execution order

Updated direction: anonymous Friends onboarding is now prepared in the client. Initial joining no longer requires SMTP or email. The public switch remains disabled until anonymous auth is configured and live authorization/abuse tests pass. Existing email helper code is retained but not offered in the guest flow. Do not expose sign-out for guests; a transient refresh failure preserves the session. Optional email linking can follow separately.

Recovery: `20260919_recovery_cases.sql` is a NEW, unapplied intake migration. It provides private case intake and an audit record only. See `RECOVERY-RUNBOOK.md` for verification, transfer and backup requirements. No store-proof verification, full account transfer or cloud-save restoration is delivered yet. A purchase must not be advertised as a guarantee of full recovery.

1. Migration is applied; do NOT rerun the create-table migration. Keep existing production game/store releases unchanged.
2. Configure the Magic Link and confirmation email templates to display `{{ .Token }}` for passwordless sign-in. The client requests `/auth/v1/otp` and verifies `/auth/v1/verify` with type `email`. No native redirect is needed for entering a code.
3. Configure a verified transactional SMTP sender. Supabase's default sender is restricted to project-team email addresses, so it cannot support the general player pilot. Do not disable email verification as a workaround.
4. Test with two real, consenting test accounts: join, invite, accept, publish, visit, greet, remove, block and stop sharing. Also test a third unrelated account cannot visit either snapshot, unauthenticated calls fail, and direct table reads/writes fail. Run negative tests for forged IDs and oversized pictures.
5. Set `socialConfig.enabled=true` only after the tests above pass. Until then the Journal entry explains that Friends is being prepared, and makes no backend calls.
6. Test on physical iOS and Android before an expressly approved unified store rollout. Browser UI tests are not native delivery tests.

## Pilot boundary

This first implementation visits a **saved Cove picture**, not a live or navigable simulation. Players explicitly preview and share it with accepted friends; saving a layout never publishes it automatically. Visits cannot modify items, cats, purchases or balances. The picture is a WebP data URL capped at 300KB, one per owner, and sharing has a 30-second cooldown.

The database uses five `neo_` tables with RLS enabled and no direct anon/authenticated grants. The narrow security-definer RPC authenticates each request, fixes its search path, and checks accepted friendship before returning pictures. Friend codes are random, server-generated 12-character identifiers. Invites are limited to 10 currently retained requests per day and 50 relationships; this is a pilot limit, not robust abuse prevention against repeated invite/removal. Greeting uniqueness is enforced per sender/recipient/day on the server. Blocked pairs cannot re-invite or visit. An unblock UI, durable request-rate counters and account deletion must be added before general availability.

Analytics is optional and off by default. It records only the authenticated account ID, timestamp and one of four feature-event names: edit_saved, snapshot_shared, visit_opened and hello_sent. No names, free text, balances or save files are submitted as event payloads. Account IDs remain pseudonymous, not anonymous. Add a 90-day retention job and updated privacy/store declarations before general release. Currently edit events are counted only after Friends has been opened in that session.

## Next phase

After the picture pilot proves useful, introduce versioned, allowlisted scene snapshots and a separate read-only visitor renderer for animated cats and camera movement. Never swap a friend's save into the host game's live state. Keep friend visits free. Weekly rituals and monthly keepsakes should follow economy tuning; this work does not introduce subscriptions or coin multipliers.

## Verification so far

Chromium and Windows WebKit simulated-response tests cover invitation UI, visits, greetings, explicit sharing, blocking, and analytics being off by default. These do **not** verify hosted authorization, email delivery or database execution. Edit Cove rollback, save and transition checks passed separately. Physical-device checks remain required.

Official references: https://supabase.com/docs/guides/database/postgres/row-level-security and https://supabase.com/docs/guides/auth/auth-smtp and https://supabase.com/docs/guides/auth/auth-email-passwordless
