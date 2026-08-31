# Catmint Cove — V1

**Snapshot date:** 2026-08-31
**Live:** https://ukiyazero.github.io/catmint-cove/
**Repo tag:** `v1`

A frozen copy of the Phase 1 prototype at its first milestone. `index.html` here is
the exact single-file build that was live at tagging; `game-plan.html` is the
research + design + roadmap document.

## What V1 contains

**Core loop** — Attract → Tend → Collect → Invest → Capture, with a trait-driven
cat personality state machine (10 traits, ~12 behaviours). No fail state.

**Cats** — 11 canvas-drawn coat types (tuxedo, ginger tabby, calico, siamese, …)
in a soft Cats & Soup style. Kittens arrive small and big-headed and grow into
adults over ~20 h of real time. A bouncy designed walk cycle. Self-grooming.
Cats sleep far more than they walk.

**Systems** — ★1–4 rarity with reveal celebrations; a Catdex collection screen with
pearl milestones; daily goals + a streak; a calm ~2-minute chunky token economy
that auto-banks; rehome-a-cat scaled by rarity.

**Cove** — buyable comforts (food bowl / toy / cozy bed) and scenery (shade tree,
cat cottage, flower patch) that cats actually walk to and use. Photo mode with a
caption + watermark. Offline earnings.

**Ownership** — name your cove on first run; shown in the HUD, on a wooden sign in
the scene, and on shared photos.

**Housekeeping** — dev panel (press D): RESET GAME + currency / cat / skip-day /
name helpers. iPad-safe: canvas follows orientation changes. Save is `localStorage`
(per browser/device).

## Not yet (Phase 2+)

Paper economy model, creative pre-test, the full cat bible, cloud saves / accounts,
a Unity vertical slice, real monetization, live-ops content.
