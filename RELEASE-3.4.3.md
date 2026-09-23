# Catmint Cove 3.4.3

- **Cove Garden has its own full-screen view** — no more centered scrolling sheet. One header,
  one "next action" (harvest ripe patches / plant recommended), and three tabs: My patches,
  Ingredients, Improve. All crop and patch art is unchanged; only the surrounding layout moved.
- Fixed the Garden "blank space" bug on some phones: removed the legacy duplicate patch grid
  and un-collapsed "Sell spare harvests" into a plain always-visible card instead of a
  details/summary toggle.
- Fixed the rest-bar overflowing to a second row on phones wider than ~410px, and "Brighten
  room" being nearly invisible once the bar dimmed (a light-cream/dark-green combo that didn't
  survive the bar's own idle-dimming).
- New opt-in reminders for the Wishing Well (when today's wish is ready) and the Café (a
  check-in nudge after it's been running a while), matching the existing Garden/Adventure
  reminder pattern.
- Two new Shell-priced cosmetics: Butterfly wings and Fairy wings. Moonlit Pendant and Wishing
  Star (the Wishing Well's rare drops) now have real art — winning one previously changed
  nothing visible.
- Cold-open tutorial now shows Activities before it ends, so new players see Café, Garden,
  Festival, Wishing Well and Adventures exist instead of discovering them on their own.

Validation: all of the above verified live against a running build (planting, harvesting,
selling, tab navigation, reminder opt-in/opt-out, wing rendering on light and dark coats) with
no console errors. Also fixed a stuck GitHub Pages deployment queue that had been silently
dropping web updates for several commits prior to this release.
