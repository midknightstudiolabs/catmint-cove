# Neo release audit — September 13, 2026

## Scope
Incremental audit on 68a3175. Current index.html is canonical; older UI/source reconstruction scripts may overwrite accumulated fixes and must not be run as a release step. No native version bump or store upload in this pass.

## Changes
- Standardize sheet backgrounds and close buttons with the cream/sage palette.
- Align adventure destination icons and text in separate columns.
- Replace Sound and Rainy Retreat system emoji icons with existing V2 SVGs; fix standalone Journal SVG namespace.
- Give Garden headers room beside Close and shorten the introductory text.
- Keep Rainy Retreat setup scrollable on short landscape displays.
- Skip hidden-page rendering and avoid repeated unchanged HUD counter writes.
- Remove unused art experiments and review pages from the shipping tree; retain local backburner copies and Git history. No saves, currency, ownership or cat identities are removed.
- Retain the compact four-topic Help and action-driven inventory tour.

Performance caveat: automated 24-active-cat stress runs on this host missed 60 FPS. Do not describe this release as guaranteed 60 FPS; real iOS/Android testing remains required.


## Size
21 local files moved to work/backburner/neo-release-audit: 9,029,429 bytes including untracked review drafts. Art removed from the shipping art folder: 7,287,650 bytes. This reduces a native bundle that previously copied the full art folder. Web download savings are not equivalent: most archived files were already not requested by the game. Git history size is unchanged.

## Verification
Menu screenshot and bounds checks at 320×568, 390×844, 844×390 and 1280×800. Covered Help, Catdex, shop tabs, inventory, Journal, Activities, Sound, roster, adventure picker, Garden, Rainy Retreat setup, backup, festival picker, credits, Cove Cares, food, story and wardrobe. Additional checks: JavaScript parsing, source migration, offline care, inventory storage/reload, economy formulas, scenery ordering and rain audio loading. These checks are not a full manual playthrough of every festival or native purchase flow.

## Performance gate — OPEN
A 24-active-cat synthetic workload in headless Edge on this host recorded median frame intervals around 33–50 ms in repeated samples, despite adaptive detail. Render command timings are not GPU completion timings. One initial non-active setup near 16.7 ms is not valid evidence of full-load 60 FPS. A landscape cache experiment was discarded because improvement was inconclusive. Hidden-page rendering now returns early; the dimmed sleep screen intentionally remains 15 FPS for battery.

Before broad mobile release: run 24 cats + eight bunting + eight garden lanterns, rain/night, dragging and each festival on an older iPhone and Android device. Measure sustained frame times, thermals and memory over 20–30 minutes, including background/resume. No claim of 60 FPS certification.

## Native handoff
Sync this Neo revision as the web source into the existing mobile wrapper. Replace the old art payload rather than overlay-copying it (otherwise removed files survive). Retain the Capacitor bridge, signing, billing, bundle IDs and native audio injection. Include ui/device-fixes.css. Rebuild www from the verified source and inspect its asset list. Increment build numbers only when preparing the next actual upload. Test mood/wellbeing bars, sound switch, safe areas, purchases/restore and save retention on TestFlight and Android closed testing before promotion.

Additional visual fixes: wardrobe uses one scroll area with a compact preview on narrow phones, so accessory controls remain reachable; cat-story heading clears the close button.
