# Three-currency economy update

Implemented in this redesign copy only. Not published to GitHub or mobile stores.

- Preserve balances: retired the legacy shell reset. Previously lost balances cannot be reconstructed automatically.
- Cat tree starts at 300 shells. Beds 80; flowers 30; shade trees 90 + 5 wood; scratch pads 60 + 3 wood; cottages 120 + 8 wood. Repeat prices still increase. Basic bowls/toys remain inexpensive.
- 24-cat charter: existing Catdex gate, 5,000 shells + 40 wood; no pearl requirement. Existing ownership retained.
- Shore wood every 4–6 active minutes. Continues after repairs, with offline finds retained. Per-cat exploration chance scales down with roster size.
- Gathering adventures: short 1, medium 3, overnight 5 wood, plus existing random/curious extras. Shell base 30–50 per cat-hour by destination; trait bonuses reduced. Larger total rewards for longer trips.
- Pearls buy existing laurel (4), tiara (8), crown (12). Existing owned accessories remain owned. IAP entitlements unchanged. No pearl exchange or paid progression added.
- Rehoming grants no pearls. First cove-wide Friends/Close/Bonded milestones grant 1/2/3 pearls once each; persistent ledger prevents repeated per-cat farming. Catdex and daily pearl sources retained.
- Baseline adult, full mood, neutral trait, no upgrades: 4/8/16/24 cats produce approximately 325/459/649/795 shells/hour before collection behavior, care, stations, stars and buffs. New-player boost retained. These are model outputs, not measured playtest income.
- Festival uses shared 15-minute reward window: first 100 shells full, overflow 20%; games remain playable. Random pearl limited to one per UTC day. Budget saved with game state. Help explains policy.

Validation: inline JavaScript parse; executable tests for festival overflow/window refresh, pearl limit, once-only friendship milestone, rehoming, and configuration checks at 4/8/16/24 cats. No browser/device playtest completed.

Not added: new cosmetic art/sets, new garden gameplay, inventory storage redesign. Existing garden/station and story reward systems retained; broader playtesting is still needed before release.
