# Cove Friends audit — September 20, 2026

## Verified in the hosted database

`test-friends.sql` ran successfully in the existing Catmint Cove SQL editor. Three temporary auth identities exercised the installed RPC under the authenticated role; the transaction rolled back all fixtures.

Passed: join, exact-code name preview, request, recipient acceptance, accepted-friend snapshot visit, duplicate greeting counted once, stop sharing, block, unrelated-account denial, pending-invite visit denial, sender self-accept denial, missing-identity denial and direct snapshot-table denial. Removing invitations does not bypass the daily limit.

Applied `20260920_friend_invitation_preview.sql` successfully. It adds restricted action history and serializes per-player invite checks: 10 successful invitations and 30 successful name previews per rolling day. Existing friendships and shared pictures are preserved. The action history needs scheduled retention cleanup before broad release.

This is database integration coverage, not device authentication or real two-device testing.

## Client changes

- Refresh friends without closing the panel.
- Share friend code when the platform supports native sharing; Copy remains available.
- Validate 12-character codes and reject the player's own code before sending.
- Preview the matched Cove name and confirm before sending an invitation.
- Explain invitation success and that acceptance is required.
- Confirm removal/blocking; explain that unblock is not yet available.
- Show errors on the current page after a page transition.

`node scripts/test-friends-client.cjs` passes isolated client checks with a mock backend. No player save, purchase or currency was changed by this test.

## Remaining gates

Live provider settings inspected: anonymous sign-in OFF. Public Friends config remains disabled. Enabling anonymous sign-in awaits explicit action-time approval for controlled authentication testing. Do not enable the public pilot merely because database tests passed.

Still required: controlled real signup/session-refresh and two-device test; signup abuse protection; recoverable Friends identity; server-verified purchase-to-Friends association. Current visits are saved pictures, not an interactive scene.

Restore Purchases and Friends-account recovery are distinct. The purchase webhook/ledger does not itself restore a friend code, friendships or a lost save. The earlier README's email setup steps are superseded by anonymous onboarding direction; the recovery-case migration is already applied as recorded in RECOVERY-RUNBOOK.md.
