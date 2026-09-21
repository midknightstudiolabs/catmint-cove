## Neo testing — September 22, 2026 (after 3.3.0)

- **Cove Race lengths:** choose Sprint (50 m), Cove Run (100 m) or Long Haul (200 m) before the race. Longer runs add late kicks, fades and catch-up so the lead changes, a distance readout under the positions, and the course on the result card. Rewards already follow play time, so a longer run pays for its time.
- **Café top bar:** about half the height on phones (the café name and next-goal card now sit in the expanded strip, and the goal still shows as a dot on Upgrades); full width on iPad and larger, with the name inline.
- **Café view:** the outside view no longer crops 12-33% off each side on phones, and opening Menu, Pantry, Report or Upgrades no longer rescales the café. The camera pans and eases instead of jumping; on wide screens the docked panel no longer shrinks the scene.

## Catmint Cove 3.3.0 — September 22, 2026 (based on 3.2.0)

- **Midknight Blessing** subscription (weekly / monthly): moonlit decor v2 (Moonlight Guardian shrine, swing cats can use, moon-wing glow, fairy lighting), clearer offer with Cancel and a pinned close button.
- **Free earned decor:** Reading Nook (Cozy Rug, Reading Lamp) from Little Matches, Seaside Picnic (Blanket, Lanterns) from adventures, Memory Corner (Postcard Board, Photo Easel) from postcards. Cats nap on the rug and blanket.
- **Scrapbook and postcards:** adventure postcards are kept in the Journal and can be sent as pictures.
- **Cafe rush hours** twice a day; status line shows "Rush hour!".
- **Festival:** back-to-cove and back-to-festival exits in every activity, flat 2D Tug of Paws HUD, Volleyball-style commentary, unified cheer buttons.
- **Save safety:** the phone keeps a second copy of your cove and restores it if the app's storage is cleared; manual backup code and file export with a gentle reminder; safer restore.
- **Living sky**, adventure reminders, lighter Journal, updated Help (9 topics) and first-visit tour.
- **Fixes:** Harvest all now confirms with a toast and sound; stale "ripe" toast; cats heading to the swing, cottage or cat tree no longer give up on long walks.
- Checks: 37 browser suites and economy/inventory/cafe checks pass; screen sweep at 390 and 320 wide has no console errors or sideways overflow. Real-device testing is still to do.

## Neo testing — September 19, 2026 (based on 3.1.2)

- Edit Cove now stages movable-item layout/storage changes until Save changes. Cancel restores the previous layout; autosave continues preserving current game progress without saving draft placements. Added Undo, a stored-item picker with product artwork, stable mobile controls and direct dragging in edit mode.
- Holding a cat in normal play focuses the camera again; long-press no longer picks up decor. Updated decorating Help instructions.
- Added a disabled Cove Friends pilot in Journal: email-code UI, invitations, explicit picture sharing, saved-picture visits, daily greetings and remove/block controls. Supabase migration is prepared but not applied; hosted authorization and email delivery are not yet verified. This is not live animated visiting.
- Edit transaction checks pass in Chromium and Windows WebKit. Friends interaction checks pass with simulated responses only. No primary-site or store rollout.

- Keep cat details scrollable and within the available screen; retain all details and Decor access.
- Wrap mobile shop artwork, descriptions and actions; reserve actual bottom-navigation space in the Cove canvas and separate zoom from toast notifications.
- Clear sheets, dialogs, Help, placement, theme previews and transient effects on activity entry. About, Credits and Cove Cares return to Help.
- Use cottage artwork for Back to Cove and packaged artwork/SVG for common interface emoji across platforms.
- Use the selected Cove theme for the Festival outdoor plate; synchronize scenery source with the existing embedded implementation to preserve prior fixes.
- Drive Little Matches shuffle with explicit frame transforms; add a visible companion hop and drowsy/idle responses.
- Reduce nearby-cat avoidance searches with spatial bins and reuse resting-cat drawings for larger populations.
- Validation: Chromium and WebKit at 320x568, 390x844 and 844x390; shuffle motion and changed deck order; matching; dialog cleanup; Help returns; spatial-neighbor coverage; inventory, economy and rain-loader regression checks.
- Performance remains under review: a 24-cat Chromium sample had ~16.7ms median frames, but Windows WebKit measured 29–31ms. Physical iOS/Android testing is still required. No production site or native-store rollout.

## Little Matches feedback

- Added card press/flip motion, amber mismatch feedback and match bounce.
- Added soft tap, flip, mismatch, match and win tones using the existing Cove audio bus; master mute and Cove volume are respected.
- Reduced-motion mode keeps static result feedback. Audio uses short synthesized notes with no new asset downloads.
- Checked flip/mismatch/match behavior and mute gating in the browser.

## Neo web 2026.09.14.2 - Bottom actions and seasonal welcome

- Moved reward collection, completion and modal actions to fixed bottom footers with independently scrolling content.
- Moved sheet exits for Shop, Catdex, Journal, Activities and Garden to bottom controls; grouped Help and adventure actions below their content.
- Removed duplicate top exits in roster, Credits and Cove Cares. Cat stories now exit from the footer.
- Added the first-visit Little Matches introduction: 30 levels, a free favour each level, six earned accessories and new drops every season. Acknowledgement is saved; earned progress is preserved.
- Reward preview Back returns to the collection when opened there.
- Checked 72 menu entry states, phone portrait/landscape footers, Help, storage actions and all 30 levels with reward/save/reload coverage.

## Neo web 2026.09.14.1 - Menu audit fixes

- Added a visible Back to Cove action to Little Matches completion and disabled already-spent favour options when resuming.
- Added a reachable close control to both adventure-planning steps; removed the duplicate Festival exit.
- Enlarged Backup, Credits, Cove Cares, Rainy Rest and Dress-up controls. Rainy Rest durations now use two clear rows.
- Moved paid cosmetic packs to Featured, shortened Inventory guidance and made Garden planting choices easier to read.
- Put Little Matches first in Activities, consistently called its stages levels, and compacted the disabled cafe entry.
- Reused custom icons in audited Shop, Dress-up, Journal and Credits elements; framed memory-card object art to fill available space.
- Added the Neo web build identifier to Credits without changing native version numbers.
- Validation: all 30 levels, six reward unlocks/equip/save/reload, 72 menu entry states across four sizes, targeted exits/favour state and no page errors in those checks. Native release and device performance verification remain separate.

## Little Matches rewards and companions — 2026-09-14

- Progress through 30 levels in order; unlock level selection after completing all 30. Existing completions and unfinished rounds remain saved.
- Add six earned accessories at levels 5/10/15/20/25/30: Gingham Bow, Daisy Crown, Cozy Neckerchief, Sleepy Bonnet, Explorer Hat, and Little Lion.
- Preview rewards on the selected cat from the five-level progress trail or reward collection. Earned outfits belong to all resident cats and cannot be bought before unlocking.
- Add companion hops, grooming, and naps using the existing cat renderer. Remove the furnished nook; no beds or props accumulate beside the board.
- Add milestone reveals, Wear it, Journal keepsakes, and the 30-level finale with the next-season message. No currency payout or entry fee changes.
- Preserve earned rewards on legacy saves with gaps; complete remaining levels before replay unlocks.
- Fix interrupted Little peek consumption and prevent Second look from being spent on a matched pair. Keep personal-best metadata tied to the corresponding attempt.
- Respect reduced motion and stop companion animation when the activity closes. Update Help and mobile layouts.

GitHub web release only; native iOS/Android packaging is not updated by this change.

## Menu and release audit — 2026-09-13

- Standardize sheet backgrounds and close buttons with the cream/sage palette.
- Align adventure destination icons and text in separate columns.
- Replace Sound and Rainy Retreat system emoji icons with existing V2 SVGs; fix standalone Journal SVG namespace.
- Give Garden headers room beside Close and shorten the introductory text.
- Keep Rainy Retreat setup scrollable on short landscape displays.
- Make the phone wardrobe scroll as one page with a smaller preview; separate the cat-story heading from Close.
- Skip hidden-page rendering and avoid repeated unchanged HUD counter writes.
- Remove unused art experiments and review pages from the shipping tree; retain local backburner copies and Git history. No saves, currency, ownership or cat identities are removed.
- Retain the compact four-topic Help and action-driven inventory tour.

Performance caveat: automated 24-active-cat stress runs on this host missed 60 FPS. Do not describe this release as guaranteed 60 FPS; real iOS/Android testing remains required.

## Repeatable shoreline decorations — 2026-09-13

- Allow eight bunting, garden lantern, and lantern-string copies at unchanged prices.
- Preserve original item ids and positions; additional copies have independent placement and storage.
- Show shop ownership limits and inventory stored/placed totals.
- Extend placement grid toward the shore; make lantern strings freestanding and soften light halos.
- Keep placement actions within the phone viewport.

## Help and guided tour — 2026-09-13

- Replace the expanded help wall with searchable, collapsible topics.
- Add a six-step guided tour opening the real Catdex, Shop, inventory, Activities, and Journal panels, with minimize and exit controls.
- Update guidance for inventory placement and storage, wellbeing, sound, Little Hello, and current Activities.
- Check mobile and desktop layouts and tour navigation without changing saves or buying items.

## HUD icons — option B — 2026-09-13

- Use fixed V2-style SVGs for cat capacity (cat silhouette), food supply (sage bowl), and Cove day (calendar).
- Preserve counters, existing tap actions, and all other Neo features.
- Checked phone and desktop layouts at 320px, 390px, and 1280px.

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

## Neo café playtest — September 19, 2026

- Added Catmint Café in Activities: a sage-and-timber seaside kiosk with Outside and Inside views, actual game cats, night lighting and automatic stock-backed service.
- Open for 120 Shells with starter ingredients. First guest arrives after 30 seconds; normal service starts at one guest every four minutes. No per-order serving or collection taps.
- Three drinks, menu availability, manual imports, coffee/catmint/honey Garden crops, operating-profit report, pause control and bounded brew/seating upgrades.
- Added versioned café state, reserved orders, automatic Shell payments and stock-limited offline settlement capped at 12 hours. No spoiled ingredients or penalties.
- Preserved legacy Garden/café state. Legacy earnings and prepared treats receive a once-only value carry-over; existing extra equipment grants corresponding kiosk upgrades.
- Tests now exercise the actual inline Garden implementation, plus the shared café engine for accounting, offline/reload, clock rollback, stockouts and duplicate-payment protection.
- This is a Neo-only Phase 1 playtest. Creative recipes, personality preferences, Festival demand and Friends visits are not enabled. Primary and native releases remain 3.1.3.
## Café viewpoint update — September 19, 2026

- Outside shows a small human customer queue with cats running the kiosk. Inside is the view from behind the counter, looking through the serving window at the customers.
- Coffee-machine upgrades change the visible brewer. Added an optional 180-Shell copper kettle/pot upgrade, with no income multiplier; purchases open the Inside view to show the change.
- Reused the same service state in both views; retained existing inventory, upgrades and earnings.
## Café cats and shop progression — September 19, 2026

- Removed human customer art. Both views use the existing game cat renderer, coats, markings, ages and accessories; walking uses the game's cat animation fields.
- Added three sequential shop stages: Little Kiosk, Garden Café (50,000 Shells), Seaside Café (100,000 additional Shells). Existing saves start at their original kiosk without losing equipment or ingredients.
- Added free building previews, savings information and a confirmation step for expansions. Higher stages change the exterior and interior finish; machine speed remains separate.
## Neo café kiosk refresh

- Simplified Garden around What should I plant? and priced Plant recommended actions; individual crop choices and surplus sales expand only when needed. Café recipe cards hide secondary editing/improvement controls and desktop management has a wider dedicated panel.

- Garden offers a priced recommended planting batch for empty patches, with balanced crop choices and no occupied-patch replacement. Garden footer actions align in a two-column row. Desktop café management reserves a side panel rather than covering scenery.
- Make & taste is disabled and grayed out for an empty selection or insufficient selected stock; shortage messages identify each ingredient, required quantity and available amount.

- Fixed mobile café menu overlap: bounded scrollable panels above navigation, hidden background view controls during management, wrapped recipe content and full-width actions, with safe-area spacing.

- Shared café/Garden supply planning targets five orders of each on-sale recipe, totals shared ingredient needs, and credits planted/ready crops. Pantry shows stock, recipe coverage and planting costs; Garden highlights and prioritizes needed crops and warns that selling harvests uses café stock.

- Recipes now show explicit serving status with Start serving / Stop serving actions. Naming a recipe no longer puts a saved recipe on sale automatically; existing on-sale recipes stay selected.
- Completed orders generate playful food/drink reactions, happiness totals and a saved ten-visit feedback history. Improved recipes earn better reactions. Duplicate settlement does not duplicate feedback; old sales are not retroactively rated.

- Guided free first coffee: add, brew, taste, name and add to My Menu. Mixing moved into a separate creation flow with optional recipe guides and clear ingredient costs.
- Player-named drinks and Honey Garden Bites persist in saves and appear in orders. Food uses Garden carrots and honey from the shared pantry. Added two recipe improvement levels after 10/20 sales (50/100 Shells), each adding 2 Shells per sale. Trial ingredient costs are included in reports.

- Added ingredient experimentation: new cafés start closed with an empty menu; successful tasting batches discover recipes for players to add before opening. Failed batches consume ingredients and provide hints. Existing menus remain available.
- Separated upgrades by outside/inside view and added free equipment previews. Expanded the scenery edge to edge to remove the framed presentation.

- Added a seaside garden setting with flower beds, a stepping-stone path, soft clouds, garden lamps and a resting bench. Quiet periods retain a cat visitor; the purchased table gains a cup and companion. Added rotating customer greetings and a small bench interaction; reduced-motion preferences remain respected.

- Café now opens as a full-screen visit with an unobstructed storefront, serving-window entry, inside/outside views and compact bottom management controls. Panels close independently; Return to Cove exits. Responsive scenery fills portrait screens, sales give brief feedback, and Garden remains linked from Pantry.
- Matched the café Activities card to the standard destination cards and placed it before Cove Garden.

- Rebuilt all three exteriors as straight-on 2D elevations: compact kiosk, planted garden shop with striped awning, and broad seaside café with arched windows and raised signage. Added warm night window/lamp glow and interior counter lighting; retained finishes, prices and saved upgrades.

- Scaled queue and window customers down to suit the kiosk. Added smooth arrivals, queue advancement and departures using the existing cat gait, plus grounded breathing, blinking and tail movement while waiting. Reduced-motion settings suppress customer animation.

- Reworked exterior with Catmint Café roof signage, timber serving window, vertical paneling, blade sign and warm lighting; retained the actual game cats and animation.
- Added five coordinated finishes across inside/outside: Sage (included), Buttercup and Coastal Blue (2,500 Shells each), Rosewater and Oatmilk (5,000 each). Free previews; unlock once and reuse freely.
- Preserved three building stages, equipment, stock, saved progress and 50,000 / 100,000 Shell expansion costs.
