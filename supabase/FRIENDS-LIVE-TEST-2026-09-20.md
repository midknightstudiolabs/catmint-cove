# Controlled Friends authentication test — September 20, 2026

User explicitly approved enabling anonymous sign-in for controlled testing. Enabled and saved in the existing Catmint Cove Supabase provider settings. Public `socialConfig.enabled` remains false.

Executed `node scripts/test-friends-live.mjs --create-test-accounts` against the hosted Auth and REST APIs. PASS:

- Three actual anonymous signups and profile creation.
- Exact-code name preview, invitation and recipient acceptance.
- Sender cannot self-accept; pending friendship cannot visit.
- Accepted friend can read a synthetic picture fixture; unrelated account cannot.
- Duplicate greetings counted once per day.
- Real refresh-token exchange preserves friend code and accepted friendship.
- Stop sharing denies subsequent visits; blocking denies greetings.

No game save, actual player picture or store data was used. Tokens stayed in process memory and were not logged or persisted. The synthetic picture was unpublished after testing. Test auth/profile rows are retained for traceability; no permanent deletion was attempted:

- A: `197b5b03-60e2-4be5-bd75-c24d84020a99`
- B: `9f8d8cce-396a-4e1f-86ff-63a43b5a0f10`
- Unrelated account: `cb010dfd-1727-4733-be26-3eb512eaef9a`

This supersedes the anonymous-sign-in approval/off status in FRIENDS-AUDIT-2026-09-20.md. It is API integration coverage, not physical two-device UI testing. Public launch still requires signup abuse protection, recoverable identity, purchase association if promised, and iOS/Android validation. Session refresh is NOT lost-device recovery. Anonymous auth is enabled project-wide even while the game's public Friends entry remains gated.
