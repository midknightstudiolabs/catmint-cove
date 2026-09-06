# Catmint Cove — Monetization Strategy V2

> **Canonical monetization direction (adopted 2026-09-06).** Supersedes the
> ad-hoc "$4.99 Cozy Supporter Pack + pearl-bought effect cosmetics" approach
> in the current build. This file is the source of truth; see the
> **Implementation status** block below for what's built vs. what this changes.

---

## Implementation status (2026-09-06)

**Already aligned / built:**
- **Entitlement architecture** — `G.iap = {owned, grants}` in a dedicated
  `iapStore` (key `catmintCove.iap.v1`), decoupled from the game save.
  `applyEntitlements()` re-derives perks; `completePurchase(id)` /
  `grantOnce(key,fn)` / `reconcileEntitlements(ids, authoritative)` (union-only,
  fail-open). Store → entitlement → content-ownership → equip is exactly the
  layering this doc asks for.
- **Purchase restoration** — `restorePurchases()` (fail-open try/catch) + a
  "Restore purchases" affordance in the pack modal and the Back-up sheet.
  Survives app updates, save-format bumps and reinstalls (tested). Native
  billing query is the one piece left to wire (RevenueCat).
- **Generic accessory system** — `ACCESSORIES` array (`{key,label,price,slot,
  group}`), `ACC_SLOTS`, `c.worn` / `c.owned`, `equipAccessory` /
  `buyAccessory`, and the two-pane dress-up screen. Adding accessories is
  content work. ✅ matches "do not hardcode accessories individually".
- **Placeable cosmetic props** — buy → placement mode, move, pack away
  (`G.cosmetics.propPos` / `propBoxed`). Cove-decoration foundation.
- **Ad-free launch** — `ADS_ENABLED = false`, simulated `Ads` layer only.

**Conflicts with this doc — resolved:**
- ✅ **Cozy Supporter Pack → Founding Covekeeper** (commit `3914187`). Dropped
  the permanent 2× offline earnings **and** the ✦50 pearl grant. Contents now:
  a **Founder's plaque** by the cove sign ("FOUNDING COVEKEEPER · 2026" on a
  little brass post — `drawCoveSign`, gated on `iapOwns`), Midknight's founder
  ribbon, ad-free forever, "supports the studio". No photo frame (dropped per
  direction). Entitlement key `cozy_supporter` → `founding_covekeeper` with a
  load-time migration.
- ✅ **Effect cosmetics are Sparkle Pack only** (commit `9c9c61b`).
  Glow collar / little wings / rainbow trail lost their pearl price;
  `sparkle_pack` ($2.99) is the sole path. Owned-by-derivation for every cat
  once the pack is bought; stripped + re-locked if it isn't. `showSparkleOffer()`
  + a "Sparkle Pack · $2.99" button in the dress-up ✦ Sparkle header.
- ✅ **Welcome Pack — built at $0.99** (per direction; overrides the "$2.99, no
  $0.99 offer initially" line below). Contents pared to two cosmetics: an
  **amber ribbon** (neck accessory, `iap:"welcome_pack"`, group "Welcome",
  owned-by-derivation for every cat) and a carved **welcome paw** stone by the
  cove sign (`drawCoveSign`, left of the board, gated on `iapOwns`). No photo
  frame (dropped per direction). `showWelcomeOffer()`, a generic
  `showIapOffer(id)` router, a generalized pack-group header in the dress-up
  rack (Sparkle + Welcome), a Featured-tab row, and `maybeOfferWelcome()` —
  fires once after tutorial done + ≥1 framed photo + ≥2 residents
  (`G.welcomeOffered`). Purely cosmetic.
- ⚠️ **Shop is called "Shop"** with tabs Featured / Comforts / Stations /
  Dress-up / Decor / Upgrades. → reframe as **The Tideline Shop**; add
  **Accessories** and **Photos** categories.
- ⚠️ **Product IDs** are `cozy_supporter` / `sparkle_pack`. → move to
  reverse-DNS (`com.midknightstudiolabs.catmintcove.*`).

**Not built at all:**
- Accessory Pack #1
- The "Tideline Shop" reframe (still "Shop")
- Photo-frame system (Founding Covekeeper drops its frame; deferred)
- Seasonal cosmetic collections
- Monetization analytics events
- Membership (deliberately later), physical merch (later)
- Product ID → reverse-DNS migration (store-side, at billing integration)

---

## Core Monetization Philosophy

Catmint Cove is FREE TO PLAY and NEVER PAY-TO-WIN.

> We do not sell advantage. We sell attachment, expression, and ownership.

> You never pay to get ahead. You pay to make the Cove more yours.

A free player should be able to enjoy and complete the core Catmint Cove
experience without paying. Purchases exist because players love their cats and
their Cove — not because the game creates frustration and charges to remove it.

## Hard rules

Paid purchases must NEVER:

- Increase progression speed
- Increase Shell / Driftwood / offline earnings
- Improve cat rarity odds, unlock stronger/better cats, sell legendary cats
- Help complete the Catdex faster
- Improve Adventure rewards
- Skip meaningful timers
- Protect streaks
- Give Festival or competitive advantages
- Sell Pearls
- Lock important gameplay behind payment
- Use loot boxes, energy systems, or artificial frustration payment removes

Cats are individuals, not inventory. The rarest cats are **discovered — never
purchased.**

## What we monetize

1. Cat customization
2. Cove customization
3. Photo / memory customization
4. Seasonal cosmetic collections
5. Supporter / founder cosmetics
6. Optional membership (much later)
7. Physical merchandise

The commercial engine is *"I love this stupid cat and I want him wearing that
hat"* — not *"I need to buy this or I'm falling behind."*

---

## Monetization V1 — build the system now, small catalog

### 1. Welcome Pack — $0.99  *(BUILT — priced $0.99 per direction, contents pared)*

Convert an emotionally engaged free player into their first purchase. All
cosmetic — no Shells / Pearls / Driftwood / boosts.

- **Amber ribbon** (neck accessory — `iap:"welcome_pack"`, group "Welcome",
  owned-by-derivation for every cat present and future)
- **Welcome paw** — a carved stone with an amber paw print, tucked by the cove
  sign (`drawCoveSign`, left of the board, gated on `iapOwns`)
- ~~Little Cove Sign~~ / ~~Moon & Paw Photo Frame~~ — dropped (no frame/decor-
  prop system for this; the welcome paw covers the "world marker" role)

**Trigger** — `maybeOfferWelcome()`: tutorial done + ≥1 framed photo + ≥2
residents, offered once (`G.welcomeOffered`), hooked from the photo-save path
and `afterReturn`. Also surfaced as a Featured-tab Shop row and a locked
"Welcome" group in the dress-up rack. The player understands and cares about
the world before being asked to buy.

### 2. Accessory Pack #1 — $2.99 · "The Very Important Cat Collection"

The first major scalable system. Zero stats — personality and expression only.

- Amber Ribbon · Green Scarf · Cardboard Crown · Tiny Flower · Tiny Hat

Copy: *"Five accessories. Zero practical benefits."*

**Engineering:** generic cosmetic/equipment system, slots like
`cat.accessory.head` / `cat.accessory.neck`. Adding future accessories =
content work, not engineering. (This mostly exists — see status block.)

### 3. Founding Covekeeper Pack — $4.99  *(replaces Cozy Supporter Pack — BUILT, commit `3914187`)*

Cosmetic + support only — no 2× offline, no pearls.

- **Founder's plaque** by the cove sign ("FOUNDING COVEKEEPER · 2026") — the
  "cool signate" for a supporter of the game
- Founder's ribbon for Midknight
- ~~Founder's Cove Sign~~ — folded into the plaque
- ~~Founder's Photo Frame~~ — dropped (no frame system yet)
- Permanent future ad removal (if ads are ever introduced)
- Supports Midknight Studio Labs

Copy: *"You were here when the Cove was still finding its paws."*

Feels like *"I supported this little indie game when it started"*, not *"I
bought a progression booster."* The founder cosmetics can become unavailable
after the genuine founding/launch period — then replaced with a normal
Supporter Pack. **No fake countdowns, no aggressive FOMO.**

### Initial price ladder

| | |
|---|---|
| $2.99 | Welcome Pack |
| $2.99 | Accessory Collection |
| $4.99 | Founding Covekeeper |

No $0.99 offer initially — first test whether players value customization at
$2.99. Lower price points come later if conversion needs them.

---

## The Tideline Shop

Not a generic `SHOP 🛒`. Commerce is part of the Cove.

**The Tideline Shop** — *"Things the tide brought in. Midknight has already
inspected them."*

Categories: **Featured · Accessories · Cove · Photos**. Starts with a few
products; the architecture supports dozens later without a redesign.

## Cove customization

After accessories, the next major cosmetic category. Future packs (all
cosmetic — you're buying *your* Cove, not a better one):

- **Catmint Garden** — flowers, planters, garden lights, decorative grass, butterflies
- **Coastal Cottage** — wooden chair, umbrella, lantern, flower pots, picnic blanket
- **Moonlight Cove** — lanterns, fireflies, night decorations, cosmetic ambience
- **Rainy Cove** — cabin decorations, puddles, rain-themed objects, window treatments

## Photo mode monetization

Never charge to take or share normal photos — free players keep full Photo
Mode. Paid customization: Polaroid / postcard / film / scrapbook / seasonal
frames, decorative stickers. Purchased accessories and Cove decor appear in
photos naturally, creating the organic marketing loop:

customize cat → customize Cove → take photo → share → others see cosmetics →
discover Catmint Cove → customize their own Cove

## Seasonal collections (post-launch)

Recurring cosmetic content, ~$2.99–$4.99: **Autumn at the Cove**, **Christmas
at the Cove**, **Spring at the Cove** (hats, decorations, lanterns, patches,
seasonal photo frames). Can connect with Cove Festival / events. Kept in the
calm register: **no countdowns, no "BUY NOW!!!", no urgency, no advantages.**

## Ads

Launches AD-FREE. Not a priority for initial monetization. If introduced
later: strongly favour **optional rewarded ads**, avoid forced interstitials,
respect no-pay-to-win. Eventually test whether *"ad-free cozy game"* is itself
a competitive differentiator. The game must never feel like an ad delivery
machine.

## Future membership

**Not at launch.** Only after proven retention, recurring engagement, demand
for more customization, and the ability to consistently ship new cosmetics.

Possible: **Covekeeper's Club** $2.99–$4.99/mo — monthly accessory / Cove
decoration / photo frame, cosmetic weather, Rest Mode ambience, supporter
badge. **Never** faster progression, better rarity/cats, production boosts,
Catdex or competitive advantages.

## Physical merchandise

Catmint Cove should become a character / lifestyle IP. Stickers, pins, acrylic
keychains, mugs, totes, shirts, hoodies, hats. Long-term hero product: the
**Midknight plush**. Let community engagement reveal fan-favourite characters
before manufacturing around them.

- **CATMINT COVE** = Game / IP
- **MIDKNIGHT STUDIO LABS** = Creator / Studio

---

## Technical monetization foundation

Do NOT implement purchases as random individual boolean checks. Build a
reusable entitlement system:

```
STORE PRODUCT → ENTITLEMENT → CONTENT OWNERSHIP → EQUIP / USE
```

```
entitlements:      { welcome_pack, founding_covekeeper, accessory_pack_01 }
ownedAccessories:  [ amber_ribbon, green_scarf, cardboard_crown ]
ownedDecor:        [ little_cove_sign ]
ownedFrames:       [ moon_paw ]
```

The game must not care whether an entitlement came from Apple, Google Play, or
dev testing. *(Current build: `G.iap.owned` = entitlements; `c.owned` per cat +
`G.cosmetics.props` = content ownership. A unified `ownedDecor` / `ownedFrames`
is the gap.)*

### Web beta / development

Build the complete shop UI, ownership system, cosmetic system, equip system,
locked/unlocked state, and product catalog **before** native store purchases.
Use a DEV / simulated purchase mechanism now; later, an Apple/Google
transaction → verify → grant entitlement, with the rest of the game unchanged.
*(Done — `completePurchase` + `__cove.iap("buy", id)`.)*

### Purchase restoration

Design from the beginning — purchases are permanent and the save system is
device-local. Never rely solely on localStorage for ownership. *(Done —
`iapStore` + `reconcileEntitlements` + `restorePurchases`.)*

### Product ID convention

Clean permanent reverse-DNS IDs:

```
com.midknightstudiolabs.catmintcove.welcome
com.midknightstudiolabs.catmintcove.accessories.001
com.midknightstudiolabs.catmintcove.founder2026
```

Not `starter1` / `pack2` / `supporter_new`. *(Current: `cozy_supporter`,
`sparkle_pack` — migrate.)*

### Analytics

Instrument immediately. Minimum: `shop_open`, `product_view`,
`purchase_started`, `purchase_success`, `purchase_failed`. Usage:
`accessory_equipped`, `decor_equipped`, `frame_used`, `photo_taken`,
`photo_shared`. Questions to answer: shop open rate, product views, what
converts, time-to-first-purchase, which cats get the most accessories, do
cosmetic buyers take/share more photos, accessories vs. Cove decor, which
characters generate the most attachment. *(Nothing instrumented yet.)*

---

## Development order

1. Generic cat accessory system  *(done)*
2. Generic Cove decoration system  *(props done; unify ownership)*
3. Generic photo-frame system  *(not started)*
4. Ownership / entitlement architecture  *(done)*
5. The Tideline Shop  *(reframe existing shop)*
6. Equip / customization interface  *(dress-up done; add frames + a Cove editor)*
7. Welcome Pack
8. Accessory Pack #1
9. Founding Covekeeper Pack  *(replaces Cozy Supporter)*
10. DEV purchase simulation  *(done)*
11. Purchase restoration architecture  *(done)*
12. Monetization analytics
13. Apple IAP integration
14. Google Play Billing integration

## After soft launch

Do NOT flood the shop. Follow player behaviour: if accessories win → more
accessories; if Cove customization wins → more decor; if Photo/share wins →
photo customization; if Midknight dominates → Midknight collections → merch.
Then: seasonal collections → deeper Cove customization → more character
cosmetics → merch → membership (only when justified).

---

## Product design test

> "Would a player who doesn't buy this still have the same opportunity to
> enjoy, progress through, and complete Catmint Cove?"

If NO — do not sell it. If YES:

> "Does this help the player express attachment to their cats, Cove, memories,
> or the studio?"

If YES — it probably belongs in Catmint Cove.

## North star

```
FREE GAME → MEET MIDKNIGHT → DISCOVER CATS → NAME THE COVE → GET ATTACHED
→ PERSONALIZE CAT → PERSONALIZE COVE → CAPTURE MEMORY → SHARE
→ DEEPER ATTACHMENT → BUY MORE COSMETIC EXPRESSION → EVENTUALLY BUY MERCH
```

Catmint Cove never makes money by making the free experience worse. It makes
money because the free experience is good enough that players become attached.

**NO PAY-TO-WIN. NO PAY-TO-PROGRESS. NO SELLING FRUSTRATION RELIEF.**

We sell: personality · expression · memories · ownership · support for the
studio.

> Players don't spend because they have to. They spend because the Cove
> became theirs.
