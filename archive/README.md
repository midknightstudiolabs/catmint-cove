# archive/

Old working files, kept for reference. Nothing here ships or is built.

- **`pinch-test.html`** — the long-running staging copy of the game. Every big
  batch was built and phone-tested here first, then promoted into `index.html`.
  Archived 2026-09-09 once it had drifted behind `index.html` (missing
  `featureGraphic()` etc.) and `cafe-preview.html` took over as the isolated
  full-game test build. Recover any past state with
  `git log --oneline -- archive/pinch-test.html` +
  `git show <sha>:pinch-test.html`.
