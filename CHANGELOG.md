# Changelog

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
