# Changelog

## Approved V2 icons — 2026-09-12

- Applied the approved sleep moon, sage festival flag and rope-with-paws icons. All other V2 artwork is retained. Updated the icon cache version.

## Economy balance — 2026-09-12

- Gentler collection income growth and smaller rarity income bonuses. Baseline adult one-star Coves earn approximately 477/672/857/987 shells per hour at 3/8/16/24 cats (75 mood, neutral traits, no upgrades or boosts). Cat Tree remains 300.
- Festival retains Cove income while visible and grants a separate time-based performance bonus. Hidden pages do not accrue active Festival earnings; replaying remains unrestricted.
- Sleep and offline returns share four hours at 18% of the home rate, followed by eight hours at 4.5%, capped at twelve hours. Expired sleep sessions settle their earnings.
- New adventures last 30 minutes, four hours, or eight hours. Shell stipends are 18/110/190 per cat before small variation and trait/party bonuses. Destinations retain different collectibles; mishaps no longer reduce shells. Existing departure timestamps are unchanged.
- Shore driftwood arrives every 6–10 minutes after the introductory piece. Material trips give 1/2/3 pieces per cat by duration, with a small curious-cat bonus.
- Mid-range scenery prices reduced to bridge the gap between starter furniture and prestige themes. Basic care, existing balances and ownership remain unchanged.
- Automated checks cover baseline progression, background limits, Festival income/bonus accounting and hidden-page behavior. Real-device session playtesting remains necessary.

## After V3 — 2026-09-12

- Café now has player-directed table service: seat, order, prepare, serve, and clear. Patience indicators and task buttons accompany the existing staff role swaps. The camera crops unused sky to enlarge the working area. Payout formulas are unchanged; service gate checks passed, with device playtesting still needed.

- Enabled A Little Hello: 3–5 empty foreground taps show a resident cat close-up with personalized playful captions. Five-second duration, 30-second cooldown, tap-position placement, reduced-motion support, and no resource rewards. Existing cats and accessories are reused.

- Six destination-specific flat postcard illustrations replace the shared Cove picture.
- New delivered cards save a random art seed and one of four palettes; consecutive cards for the same destination avoid repeating the palette. Scene details, greetings, and sign-offs vary. Reopening a saved card preserves its appearance.
- Existing postcards retain their text and receive a deterministic illustration without changing saves.
- Verified six distinct destinations and stable rendering; reviewed the illustration sheet.

## V3 — 3.0.0 — 2026-09-12

Release tag: `v3.0.0`. Game code baseline: `2d3930e`.
This release packages the current Catmint Cove Neo web build. Original character designs and gameplay remain the foundation.

### Cove and atmosphere
- Cozy coastal 2D scenery with edge-to-edge overview coverage and foreground foliage layering.
- Sun and moon occlusion behind mountain ridges, sunrise/sunset transitions, and darker moonlit nights.
- Calm moving clouds replace fixed background clouds.
- Race spectators stand on meadow ground; festival evenings use warm lights.
- Rainy retreat uses a darker sage-and-linen room palette and softened sleep rain audio.
- Driftwood arrivals have a restrained glint, label, and thinner outline.

### Navigation and cats
- Visible Catdex, Activities, Shop, and Journal navigation; no redundant Cove tab.
- Saved V2 keepsake artwork for Catdex, Shop, and Journal, with a matching Activities icon.
- Flat icons extend to Festival events, Adventures, Rainy retreat, Help, Sound, Photo, and Community Pantry.
- Refined Catdex layout, centered cat profiles, search, favorites, personal notes, and recorded memories.
- Past resident records collapse into Cove memories instead of repeating a tagline. Search appears above eight archived cats.
- Help and onboarding reflect the current navigation. Community Pantry explains its free care and reports the result.

### Adventures and interaction
- Destination/duration selection followed by cat selection with clear send status.
- Responsive cat picker: five columns on wider screens, three on phones, two on very narrow screens.
- Travel postcard available from departure; actual notes still arrive partway through the trip.
- Postcards use a scenic front, paw stamp, Cove address, message, and signature. Delivered cards remain available in Journal.
- Founding Covekeeper plaque opens a description of its meaning and cosmetic keepsakes.
- Placement grid and item footprints reduce accidental relocation.
- Overview zoom uses its button. Double-tap overview zoom, pinch camera zoom, and cat-hold close-up are removed; canvas browser double-tap zoom is suppressed. Panning remains.

### Economy and saves
- First cat tree costs 300 shells; repeat purchases scale upward (second: 525).
- Raised comfort, station, output-upgrade, and accessory prices to slow purchase progression.
- Retained original income multiplier, invitation/food curves, and four-hour offline earnings cap.
- Refunds track new purchases at their paid price; legacy items use legacy prices to prevent inflated refunds.
- Existing cats, balances, owned items, and saves are preserved. Neo keeps its separate save migration and backup protections.

### Verification and release limits
- Home regression and theme/script checks passed during implementation; main navigation and Festival icons were visually checked in-game.
- Postcard layout was visually reviewed; full iOS/Android device validation remains outstanding.
- This tag does not represent a TestFlight or Android closed-testing upload. Existing mobile workflows were located but have not been dispatched for Neo V3.
- A Little Hello (3–5 foreground taps) remains a parked prototype and is not enabled.
- No new painted cat replacement, live-purchase certification, or cloud save system is claimed by this release.
- Postcard fronts currently share the Cove illustration; destination-specific art remains future work.
