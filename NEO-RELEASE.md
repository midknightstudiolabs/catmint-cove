# 3.0.9 — Loading screen, logo, and UI polish

Full Neo 4b5d277 payload; retains all 3.0.8 features and saves.

- Title screen now doubles as the loading screen: real cats from the roster
  walk in while actual assets load (no fixed timer), and the subtitle/Begin
  button only reveal once loading and the walk-in animation both finish — a
  fast device just plays the arrival at full speed instead of skipping it.
- New high-resolution, properly transparent wordmark logo (2083x755) replaces
  the old opaque-background version.
- Fixed a double scrollbar on cat-story dialogs (`.cove-bottom-dialog`).
- Standardized scrollbar tint across the app (Catdex no longer stands out
  green against grey everywhere else).
- Documented and corrected button color convention: neutral (.btn), green
  primary/affirmative (.btn.primary), and a new warm-red .btn.danger for
  irreversible choices (e.g. rehoming a cat) — previously miscolored green.
- Fixed shop product-image thumbnails stacking above (instead of beside) the
  item text on narrow mobile widths.
- Smoothed the Rainy Retreat -> Cove wake transition on slow devices by
  deferring the expensive canvas/attractor recompute one frame so the panel
  close already paints before the heavy work blocks the next frame.

Destination: iOS TestFlight and Android closed testing.
Verified locally in-browser: loading screen on simulated fast/slow load,
scrollbar/button changes across affected dialogs, shop layout at 375px width,
rest/wake cycle. Physical device verification (both platforms) still
recommended before wider promotion.
