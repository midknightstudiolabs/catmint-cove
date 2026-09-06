# Catmint Cove — V3

**Snapshot date:** 2026-09-06
**Live at tagging:** https://midknightstudiolabs.github.io/catmint-cove/
**Repo tag:** `v3` · previous milestone frozen at `v2` / `releases/v2/`

A frozen copy of the build at the point V3 was cut. `index.html` here is the
exact single-file build; `game-plan.html` is the research + design + roadmap
document; `PROJECT-BRIEF.md` is the full context brief.

V3 landed as an **additive update to V2**, not a from-scratch rebuild. The
premise of the earlier rethink was to protect the calm "no fail state" rule;
the direction that shipped instead **drops the calm rule** and gives the game a
real care loop with recoverable-then-genuine consequences. See
[`../../V3-RETHINK.md`](../../V3-RETHINK.md) for the decision log.

## What V3 adds on top of V2

**The care layer — "a cove full of cats that need you"**
- A cove-wide **food store** (`G.food`, 0–56) — refill from a bowl or the HUD
  🍚 stat; empty bowls mean hungry cats
- Per-cat **hunger** and **thirst** that climb over time; cats self-serve at a
  stocked bowl and at any restored pond (a new `drinking` state) — tuned so a
  fed cove with water is a light background chore
- **Health as a buffer** (`c.health` 0–100) — drains only while a cat is
  genuinely hungry or thirsty, refills while comfortable, hits 0 → sick. Not a
  dice roll; a visible slope
- **Sickness** — output near zero, a desaturated + droopy visual, a green wisp,
  one sad meow. Cured with **medicine** (gradual, treat-all), **a shot from the
  vet kit** (instant, one cat, ~2.4× cost), or **the vet** (a nominal fee, the
  cat's away ~2.5h real time, home fully well)
- **A spa day** on the cat card for a run-down-but-not-sick cat — preventive
  top-up of wellbeing, mood and a little bond
- **The leave condition** — a cat sick or starving long enough (24h → a 🎒
  warning with a card countdown → 24h more) **leaves the cove**. Kept in the
  Catdex with a keepsake line; a quiet Moment, no full-screen. The first real
  fail state, heavily telegraphed

**Legibility**
- A **wellbeing bar** on the cat card (green / amber / rose) with a
  plain-language cause line and a one-tap Treat / Refill / Spa button
- **In-world status badges** — 🍽 💧 🤒 🎒 float over any cat that needs
  something; the leave badge pulses
- A **cove roster** (tap the 🐾 HUD stat) — every cat, worst-first, tap a row
  to jump to that cat
- **"While you were away"** — the roster in report mode on return when anyone's
  unwell or a cat has left, with a one-tap "Refill the bowls"

**Economy & arrivals**
- Pearl + shell drops cut ~50% across passive rate, goals, check-ins, fishing,
  Catdex and adventure hauls — so care items (food, medicine) matter
- **New cats are opt-in** — an ambient arrival surfaces a card (portrait, name,
  coat, a trait hint) with Welcome / Not right now. Coaxed, scripted and
  offline arrivals still auto-join

**Cosmetic monetization (in scope now)**
- Three pearl-bought **effect cosmetics**: a **glow collar** (soft static
  light), **little wings** (speed-scaled flap, sit behind the body so a sitting
  cat shows angelic arcs), a **rainbow trail** (a subtle-but-iconic streak of
  light that follows a running cat)
- **Dress-up screen rebuilt** into a two-pane live-cat + rack, tap-to-try,
  Save-the-look, Take-it-all-off, ‹ Name › switcher
- A **$2.99 Sparkle Pack** (unlocks all effects) is the planned real-money
  layer — **not built**, waiting on the pearl economy playtest

**Fixes**
- Cats no longer walk through or sleep in the pond (water is a hard per-frame
  pop-out for every state)
- Seasonal weather ("autumn was hit or miss") now shows at any hour, dimmed to
  a floor at night

**+ 20 new cat names** in the pool (50 total before numeral suffixes).

## Still open in V3

- An **inventory** — pack away every placed decor / comfort / station and
  re-place them by hand
- The **loading-screen cat wave** — a row of cats jumping in sequence
- The **$2.99 Sparkle Pack IAP** — after the pearl economy is playtested

## Unchanged from V2

Everything in [`../v2/NOTES.md`](../v2/NOTES.md): the core idle loop, 11-coat
Catdex, kittens, day/night + ambient audio + real cat voices, restoration
projects, activity stations, Photo mode, Rest mode, the full return-visit layer
(vignettes / While You Were Away / Moments / Cat Adventures / daily check-in /
the Cove Festival / Labubu / the Midknight cairn), the Cove Charter prestige,
the gentle rehome valve, Capacitor 8 + CI for both stores, and the ad-free
launch with a single simulated $4.99 Supporter Pack. Save `catmintCove.save.v9`
— V3 extends it in place.

**Three permanent web URLs:** root = the clean beta; `/dev/` = same game + dev
panel; `/v1/` = the frozen original greybox.
