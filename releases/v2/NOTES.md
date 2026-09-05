# Catmint Cove — V2

**Snapshot date:** 2026-09-06
**Live at tagging:** https://midknightstudiolabs.github.io/catmint-cove/
**Repo tag:** `v2` (the earlier Sept-2 vertical-slice point is kept as `v2-slice`)

A frozen copy of the build at the close of v2 development. `index.html` here is
the exact single-file build; `game-plan.html` is the original research + design
+ roadmap document; `PROJECT-BRIEF.md` is the full context brief for the state
of the project at this point.

This is the restore point taken before the **v3 rethink** — a step back to
re-examine the whole design.

## What V2 contains

Everything from V1 (core loop, 11 canvas coats, kittens, Catdex, daily goals,
cove ownership, no fail state) plus:

**Look & feel**
- Midknight the mascot + chunky-loaf cat art, deadpan gold half-lidded eyes,
  lynx ears, soft light-rim rendering, always-on blush
- Skippable 7-step tutorial, re-openable from the `?` guide
- Mobile-first layout — safe-area insets, 44px targets, a HUD that collapses
  cleanly to a phone, the cat-count/day stats as a quiet no-chip readout
- Off-screen culling + adaptive perf tiers for a 30-cat cove on a mid phone

**A world that turns**
- Accelerated day/night cycle — one full sunrise→night loop every ~30 real
  minutes, anchored to real local time
- Procedural ambient audio bed (brook, birdsong, night crickets, wind chimes)
  that crossfades with the light
- Foreground meadow layer for tall screens

**Sound**
- Real recorded cat voices (`sfx/` — meow ×3, kitten ×2, grumpy ×2, a wake
  yawn, a purr) with anti-repeat variety and per-play pitch/level jitter
- A synthesised ASMR meow as the fallback
- Rest mode's rain is a real seamless field-recording loop

**Systems on top of the loop**
- Activity stations — fishing dock (a real cast→bite→reel→cook→eat mini-loop),
  bakery, sunbeam mat, catmint garden
- Canvas accessories — collar / bandana / bow / flower / crown / bell / specs
- Photo mode + short animated clip capture (MediaRecorder)
- Rest mode — the rainy-day cabin companion (🌙): cats inside, rain on the
  window, a fire, real rain audio, idle-dim, auto-stop timer, wake-lock
- The return-visit layer (previously labelled "V3"):
  - Vignette engine — one shared runner for short scripted moments
  - While You Were Away — 14 deadpan beats on return, never a loss
  - Moments — a gentle log of the cove's happenings
  - Cat Adventures — one trip a day, trait-shaped hauls, postcards home, a
    chalk tag on the sign, torn map fragments toward the island
  - Daily check-in — a 7-day welcome loop that never punishes a missed day
  - The Cove Festival (🎪, unlocks day 7) — a short upside-only 5-cat race
    with a 1-2-3 podium
  - Labubu — Midknight's snowshoe sidekick, a recurring non-resident visitor
    who drops junk by the sign
  - The Midknight cairn — the founder's wordless monument sequence

**Restoration & economy**
- Run-down cove → repair the dock and other projects with driftwood; each
  visibly changes the scene and raises capacity
- `earnMult()` pacing — a generous welcome window fading to a tighter baseline
- Fresh catnip (repeatable 2×-for-20-min boost)
- Cove Charter prestige unlock (cat ceiling 16 → 30, gated behind a full
  Catdex)
- Gentle rehome valve on the cat card once the cove is comfortably full

**Shipping**
- Capacitor 8 native wrap (Android API 36 / min 24, JDK 21) + GitHub Actions
  build/sign for both stores, no Mac needed
- Ads + IAP scaffold — a simulated `Ads` layer behind the real AdMob
  interface; **ships OFF** (`ADS_ENABLED = false`)
- Cozy Supporter Pack $4.99 (simulated) — permanent 2× offline, ✦50, a
  Midknight ribbon
- Save `catmintCove.save.v9`

**Three permanent web URLs:** root = the clean beta; `/dev/` = same game + dev
panel; `/v1/` = the frozen original greybox.
