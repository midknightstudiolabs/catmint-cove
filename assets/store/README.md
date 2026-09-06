# Store assets

Drop the Google Play graphics here. Referenced by `LAUNCH-ANDROID.md` §7 and
`STORE-SETUP.md` §2.

| file | spec | status |
|---|---|---|
| `feature-graphic.png` | **1024 × 500**, PNG/JPG, no alpha needed | ✅ generated — regenerate from `assets/_feature-graphic.html` (pick day/dusk/night, "Download PNG") |
| `phone-1.png` … `phone-8.png` | portrait, 2–8 required, min 320px, max 3840px, 16:9 or 9:16 | ⛔ capture on device |
| `tablet-7-*.png`, `tablet-10-*.png` | optional | ⛔ |
| `icon-512.png` | 512 × 512 — Play generates from `assets/logo.png` in CI, or export one | optional |

## Capturing phone screenshots

Do this on a **real Android phone** running the internal-testing build, with a
**fresh save** (or a save you're happy to show):

1. Play until the cove looks lived-in — ~6–10 cats, a couple of comforts, a
   restored dock, some cats in accessories.
2. Android: Power + Volume-Down. Files land in Photos → Screenshots.
3. Good shots to get (Play shows the first 2–3 largest — lead with the best):
   - the cove at dusk or golden hour, cats loafing, the sign visible
   - the **dress-up** screen with a cat mid-outfit
   - a **care** moment — a cat with a needs bar, the "treat" button
   - **Photo mode** — the framed shot with the cove-name watermark
   - **Rest mode** (🌙) — cats inside, rain on the glass
   - **Arrange mode** — dragging the cottage
4. No dev panel, no debug text, real cove name (not "dd" / a test name).

Play also accepts screenshots straight from an emulator (Android Studio →
Pixel 7 portrait) if you don't want to use your own phone.

## Note on the feature graphic

`_feature-graphic.html` uses the Fraunces display font via Google Fonts — open
it in a normal browser (not an offline/sandboxed one) so the wordmark renders in
the real typeface before you export.
