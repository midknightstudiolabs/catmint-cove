# Neo — A Place to Come Home To

Release scope: personal-home product pass, September 12, 2026.
Base: Claude source 599345222ad18d78480b46dc1f33a11f32d07e62, with all approved Neo scenery/audio patches.

## Implemented
- Independent Neo save and entitlement keys. Copy-once migration, untouched original save, original migration snapshot, previous-session backup.
- Cove / Cats / Explore / Journal navigation. Personal roster above coat collection. Explore groups festival, adventures, rainy retreat and shop.
- Cat profiles retain actual markings/accessories, show existing preferences and friendships, allow private personal notes and journal pins.
- Persistent first-hello, bond-level and first-race memories. Archived notes and memories remain accessible after voluntary rehoming.
- Cats no longer leave from unmet needs. Basic care is available free from Cats or the food store. Absence does not consume stock or generate sickness/departures; existing illness recovers after two hours away.
- Daily goals filter impossible adoption and chance-dependent discovery. Unfinished goals can be replaced without charge. Completed lovely days accumulate without reset.
- Food unit price is constant. Adoption grows gently and is bounded. Intro income drop is smaller. Offline income continues at a reduced rate through 24 hours. Illness no longer reduces production to 15%. Rehoming cannot farm shells or pearls.
- Brighter festival play areas and warm hanging lights at night. Original cats, coastal scenery, foreground layering, camera edges and latest BGM retained.
- Larger small-screen café labels/buttons; unfinished shop items removed from purchase lists.
- Public web purchases explicitly remain previews. Simulated confirmation cannot grant new pretend purchases. Existing entitlements are retained.
- Opt-in on-device playtest counters with anonymous aggregate export; no automatic transmission.
- Source baseline/audio verification and product regression checks.

## Deliberately not claimed complete
- Live payments: requires configured store products, signed platform builds and real purchase/restore/refund validation. Existing native bridge preserved, not certified in this pass.
- Cloud backup/account synchronization: local backups are not cloud recovery. Needs a chosen identity/backend solution and recovery testing.
- Retention, conversion or revenue improvements: need longitudinal player data. No fabricated benchmarks.
- Real iOS device performance and audio interruption tests: not available in this environment.
- New paid seasonal art collections: concept/content specs below, not placeholder products in the live shop.
- New personalities/relationship state machines: reuse and surface the existing implementation first; expand after observing attachment.
- Global third-party analytics: intentionally not installed. Local opt-in notebook is a pilot, not a production retention dashboard.

## Content next, after the prototype is played
1. Reading nook: cushion, rug, floor lamp, matching ribbon. All cosmetics account-wide where possible. Preview on the player's real cats. No earnings or care benefits.
2. Seaside picnic: blanket, basket, paper lanterns, bandana. No random purchased contents.
3. Memory collection: optional journal cover and photo presentation; core memories remain free.
Store price tests are hypotheses. Configure localized prices through the billing bridge; never treat hardcoded USD labels as store confirmation.

## Release procedure
1. Compare original HEAD and working tree, then run `node scripts/verify-source.mjs <original-folder>`.
2. Merge new Claude differences against the recorded snapshot, preserving explicit Neo overrides. Record new source version/hash; verify every festival audio hash.
3. Run check-home, check-theme and check-rain. Check new and migrated saves, full-Cove daily goals, absence, free care and note persistence.
4. Inspect phone and desktop navigation, cat stories, festival at night and return from activities.
5. Sync the preview code/assets. Rebuild the native payload only after verifying its resolved output path. Test native billing/audio on real devices before distribution.
6. Publish and verify live code after normalizing Git line endings plus a byte-for-byte audio check.

## Playtest plan
Recruit 12–20 voluntary testers: cat owners, cozy players, and first-time casual players. This is qualitative discovery, not enough to establish market-wide retention.
- First session: give no verbal help; observe naming, first hello, finding Cats, inviting a cat, seeing their story, reaching Explore, and returning to Cove.
- After one day and one week: ask which cat they remember, what it did, what felt confusing, and why they returned or stopped.
- Inspect failed taps, unreadable text, task replacement, support needs, and whether long absences feel safe.
- Ask testers to optionally export the private notebook. Do not request private cat notes or personal memories.
- Only broaden acquisition after important usability issues and save failures are resolved.
- Device gate: test 24 residents plus weather and full festival audience, 30-minute sessions, interruption/resume, slow network and lower-powered iOS/Android hardware. Select quality settings from measured frame times, not promises.

## Economy pilot assumptions
Food is 0.8 shells per serving, four servings per resident per active real day. Bulk discounts remain.
Adoption: min(1800, round(12 + 5n + 2.8 max(0,n-3)^2)). Approximately 22 / 67 / 299 / 565 shells at 2 / 6 / 12 / 16 residents.
Offline: first four hours at existing 18% recorded rate, subsequent twenty hours at one-fifth that accrual, retaining the existing balance cap.
These are starting parameters. Compare low-resource, high-resource, once-daily and active cohorts; tune net discretionary income and time to a desired decoration. Do not call the economy validated without longitudinal play.
