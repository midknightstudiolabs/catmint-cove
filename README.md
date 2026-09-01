# Catmint Cove — Phase 1 prototype

## Play

| | | |
|---|---|---|
| **V2** (current) | https://ukiyazero.github.io/catmint-cove/ | mascot Midknight, chunky-loaf art, procedural audio, tutorial — see the V2 roadmap below |
| **V1** (original prototype, frozen) | https://ukiyazero.github.io/catmint-cove/v1/ | the first greybox — tag `v1`, 2026-08-31 |

Both are live and permanent — V2 ships from `index.html` at the repo root, V1 from
[`v1/`](v1/) (a copy of the frozen [`releases/v1/`](releases/v1/) snapshot). Each
has a small `v1` / `v2` badge in the top bar that jumps to the other. GitHub Pages
redeploys ~1 min after a push to `main`. The two keep separate saves
(`catmintCove.save.v5` vs `.v6`).

A playable greybox of the cozy-idle cat game concept. One self-contained HTML file,
no build step, no dependencies.

## V2 roadmap

- [x] Midknight mascot + chunky-loaf cat art, deadpan gold eyes
- [x] Procedural happy-meow SFX (pet / coax / buy / reveal)
- [x] Skippable tutorial, re-openable from **?**
- [x] Mobile-first layout (safe-area, 44px targets, scroll/icon action bar)
- [x] V1 + V2 both permanently hosted
- [x] Ambient procedural sound bed (rain / stream / birds / night crickets)
- [x] Day/night lighting cycle the audio follows
- [ ] Activity stations — fishing dock, bakery, sunbeam mat, catmint garden
- [ ] Canvas accessories — collar / bandana / bow / flower crown
- [ ] Photo → short animated clip capture
- [ ] Tall-screen scene layout pass

## What this is testing

The **core loop** — Attract → Tend → Collect → Invest → Capture — and the
**cat personality state machine**. Art is deliberately greybox.

- **Attract**: "Coax a cat" and Shop comforts (food bowl / toy / cozy bed). Each
  comfort draws different personality types; capacity grows with comforts.
- **Tend**: tap a cat to pet it → mood up + a temporary production buff. Prickly
  cats (Grumpy, Shy) sulk if over-petted.
- **Collect**: cats drop yarn / fish / shell tokens; tap to bank shells. Offline
  earnings on return (with a simulated "watch ad for 2×" placement).
- **Invest**: Shop upgrades scale in price; Comfort upgrade is a global multiplier.
- **Capture**: Photo mode frames the scene with a caption + watermark (the
  intended viral loop).

Every cat rolls 2 of 10 traits (Glutton, Playful, Shy, Cuddly, Climber, Chatty,
Lazy, Curious, Grumpy, Bold). Traits drive which comfort the cat seeks, what it
produces, how it reacts to petting, and its idle behaviour: **sleeping** (by far
the most common — a nap-heavy cove), **grooming** (a cat washing its face with a
raised paw), loafing, eating (then a wash), playing, socializing, the odd wander,
knocking things over, sulking. Walking is now rare and purposeful.

The shop sells comforts cats *use* (food bowl → eat, toy → play, cozy bed /
**cat cottage** → nap, **shade tree** → doze) and pure scenery (**flower patch**,
which lifts the whole cove's baseline mood). Cats walk over and use anything you
place; a couple head there immediately when you buy it.

Cats produce slowly and drop **one chunky token every ~2 minutes** (calmer scene,
fewer taps, each worth a lot). Tokens never disappear — an un-tapped one
auto-banks after ~75s, so you can't lose earnings by not playing.

When the cove has more than three cats, each cat's card offers **"Find them a new
home"** — a gentle rehome option that pays out scaled to rarity (◈ 15 + ★×18, plus
pearls for rares) and keeps the cat in your Catdex. It's the cap-management valve
for a big collection.

Cats are drawn on `<canvas>` (no image assets) with 11 recognisable coat types —
tuxedo, ginger tabby, grey tabby, brown tabby, grey & white, black, calico,
tortoiseshell, white, russian blue, siamese — in a soft *Cats & Soup*-style:
big round simple eyes with a bright highlight, gentle low-contrast markings,
rounded ears, tiny nose, a soft always-on rosy blush, and subtle sticker-style
top-light / base-shade. Expression changes with state.

**Age:** ~45% of new cats arrive as **kittens** — noticeably smaller, big-headed,
big-eyed, extra jiggly, and they play/groom more. They produce about half as much
and **grow into adults over ~20 h of real time** (`KITTEN_MS`), with a little
"grew up!" celebration. Starter cats are already grown. The dev "skip a day"
button ages them for testing; the cat card shows "kitten (Xh old)" / "adult".

There is **no fail state** — the "calm rule" from the design doc. Cats never leave.

## The engagement layer (fun + compulsion, together)

The cozy loop is the *fun*. These systems are the *pull*:

- **Rarity** — every cat rolls ★1–4 (Common → Legendary, ~4% legendary). Higher
  stars = more shell output (up to 1.9×) + a sparkle aura. Infinite chase: you
  always want a better ★ of a coat you already have.
- **Coax reveal** — coaxing / visitor arrivals surface a celebration for a *new
  coat*, a *rare* pull, or a *legendary*. Variable-ratio reward, wholesome.
- **Catdex** — collection screen, 11 coats, silhouette until found, live progress
  bar, pearl rewards at 3 / 6 / 9 / 11. The main return driver: visible gaps.
- **Daily goals** — 3 rotating goals (pet N, gather N shells, coax, collect,
  photo, discover) with progress bars and per-goal rewards.
- **Streak** — finish all 3 goals to extend it; a celebration + bonus pearls, and
  the counter resets if you skip a day (gentle loss aversion).
- **Pearls** — a soft premium currency earned only through the Catdex and goals,
  so the meta systems feed each other.

Ethical guardrails kept: no pay-to-win (there's nothing to win), rarity odds are
shown on the reveal, the one ad surface is opt-in, streaks never punish progress.

## Run it

```bash
node catmint-cove/serve.mjs
# open http://localhost:8765
```

Or just open `index.html` in a browser (Photo download only works when served /
opened as a real file, not inside a sandboxed embed — screenshot works anywhere).

## Dev panel

- **Press `D`** in-game to toggle the developer panel (bottom-left). It shows live
  stats (session length, day, cats, mood, shells/pearls, dex, streak, rate) and a
  row of buttons:
  - **RESET GAME** — wipes all progress and starts a fresh cove (asks to confirm)
  - **+500 ◈** / **+5 ✦** — top up currency
  - **+ cat** — spawn a cat immediately
  - **skip a day** — advance the day counter + roll new daily goals + bank ~2 min
    of production (for testing the daily loop without waiting)
- **Press `R`** — same as RESET GAME.
- `window.__cove.hardReset()` from the console also resets (no confirm).

## Known limitations (fine for a greybox)

- `requestAnimationFrame` pauses when the tab is hidden — real background time is
  handled by the offline-earnings calc, same as the shipped game would.
- Balance numbers (`0.55` base rate, upgrade costs, mood curves) are first-pass
  and meant to be tuned in a spreadsheet model next.
- `window.__cove` is exposed for debugging/playtest tooling
  (`__cove.audit("being_pet")` lays out one cat of every coat in a given state;
  `__cove.hardReset()` wipes the save).

## Files

- `index.html` — the prototype
- `game-plan.html` — the research + design + build-roadmap document
- `serve.mjs` — tiny static server for local play
