## Neo hotfix recovery — 2026-09-13

- Restore the full existing Neo implementation after an incorrect redesign-copy deployment.
- Preserve placement grid and footprints, inventory counts and dragging, nearby placement actions, V2 icons, Activities, and existing progression.
- Apply only the requested fixes: ignore cats during placement, actual shop product previews, compact mobile Tug spinner, and Cove-name sizing with a 12-character limit.
- Checked JavaScript and layouts at 320px, 390px, and 1280px without runtime errors or page overflow.
## Café cooking and progression — 2026-09-12

- Two parallel cooking stoves; café points unlock a third and fourth stove for 200 and 350 shells.
- Two named recipe counters, with matching batches stacked and stock-backed offline sales.
- Equipment appears in the editable room; existing cooking progress migrates safely.
- Buy a small carrot refill for 4 shells, or grow the same quantity for 2 shells.
- Retain no-spoil food, existing garden, original cat artwork and saved furniture layouts.
- Verified timers, parallel cooking, duplicate-payment protection, equipment costs and layout routes.

# Changelog

## Café room design — 2026-09-12

- Replaced the small café illustration with a larger editable 2D room: stove, counter, table/chair sets and plant.
- Added grid placement, stored furniture, floor choices and persistent individual positions. Placement protects the entrance and routes to functional furniture.
- Guests follow room routes; stove and counter taps connect to cooking and stocking. Existing recipes, sales and garden progress are retained.
- Added placement and persistence checks. Physical mobile drag testing remains outstanding.

## Approved garden and café concept — 2026-09-12

- Added a flat café interior using the existing resident cat artwork, subtle idle movement and a welcome interaction. Rendering pauses when the sheet closes and respects reduced motion.
- Added saved cream, sage and rose tablecloths and two seating arrangements, free to switch.
- Garden patches expand from four to eight; café seating from three to five, with explicit shell prices. Extra seats do not multiply automatic income.
- Added crop illustrations, mobile-sized controls and Help guidance. Existing growing, cooking and sales progress is retained.

## Permanent café and garden — 2026-09-12

- Festival now lists only Cove Race, Volleyball and Tug of Paws. Catmint Café and Cove Garden are separate Activities destinations, with clickable entrances in the Cove.
- Added four saved garden patches, three crop timings and harvest inventory. Crops never wither.
- Replaced the main café entry with permanent batch cooking and stocked-counter sales, linked to garden ingredients. Cooking has three recipes; finished batches never spoil. Sales are limited by actual servings, including time away.
- Added mobile-friendly activity sheets and updated Help. The former timed café code remains dormant for potential future special events; it is no longer in Festival navigation.

## Friendly discovery and updated guide — 2026-09-12

- Added a contextual first-time Little Hello hint and encouragement after the first foreground tap. Successful discovery is saved so the prompts stop; cooldown still applies.
- Updated Help with greeting activation, inventory and selling, direct café service, adventure postcards and button-only zoom.
- Updated the opening tutorial's closing guidance to introduce My inventory and point to the current Help guide. Café instructions retain drag/tap seating guidance.

## Mobile finishing pass — 2026-09-12

- Wrapped inventory actions and Shop tabs for narrow screens, with 44px minimum action targets and 52px café service buttons.
- Restyled arrangement controls in the approved cream/sage palette and enlarged their mobile touch targets.
- Made cat greeting placement responsive to rotation and added a split café layout on short landscape screens.
- Verified inventory visually at 390×844 and 320×568; regression checks pass. Physical-device performance and complete café-shift testing remain outstanding.

## Direct café table service — 2026-09-12

- Drag a waiting guest to a clean table, or tap the guest and then the table. Guests walk to their assigned seats.
- Tap tables directly to take orders, prepare, serve and clear. Table labels show the next action; available seats highlight when a guest is selected.
- Retained table buttons as an accessible alternative, staff role management, patience and existing rewards.

## Screen-edge cat greetings — 2026-09-12

- Anchored Little Hello close-ups to the actual bottom viewport edge instead of floating 64 pixels above the menu.
- Attached greetings outside the Cove layout and kept their shoulder crop flush throughout the fade. Menu controls remain tappable underneath.

## Redecorating inventory — 2026-09-12

- Added Put away while moving furniture, comforts and stations, retaining ownership without refunds or repurchase.
- Added My inventory with separate In storage and In the cove groups, free placement, Move and Put away actions, and direct access from the arrangement bar and Shop.
- Stored objects no longer appear as world obstacles or usable cat spots. Existing capacity upgrades remain owned; storage persists across reloads.
- Clearly labeled furniture purchases Buy and the former refund control Sell, separating selling from storage.

## Tug timer readability — 2026-09-12

- Enlarged the Tug of Paws title above the timer and the remaining seconds, with a taller cream panel and thicker progress bar.

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

