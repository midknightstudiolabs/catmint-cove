# Catmint Cove — Phase 1 prototype

## Play

| | | |
|---|---|---|
| **V3 — beta** (share this) | https://midknightstudiolabs.github.io/catmint-cove/ | the clean build for testers — no dev tools |
| **V3 — dev** (keep this) | https://midknightstudiolabs.github.io/catmint-cove/dev/ | same game + the dev panel, `D`/`R` keys, `v3 · dev` badge |
| **V1** (original prototype, frozen) | https://midknightstudiolabs.github.io/catmint-cove/v1/ | the first greybox — tag `v1`, 2026-08-31 |

All live and permanent. V2 ships from `index.html` at the repo root; `/dev/` is a
one-line redirect to `/?dev` (single source of truth — the `DEV_BUILD` flag reads
the URL). The **beta build has no dev access at all** — no dev panel, and the `R`
key won't wipe a tester's save. In the **dev build** the panel opens on load with
live stats + **RESET GAME**, or tap the cats-count pill 5× / press `D`.
V1 is a copy of the frozen [`releases/v1/`](releases/v1/) snapshot. Each build has
a small badge in the top bar. GitHub Pages redeploys ~1 min after a push to
`main`. V1 keeps a separate save (`catmintCove.save.v5`); the current build uses
`catmintCove.save.v7` and migrates older `.v6` / `.v5` coves in place.

A playable greybox of the cozy-idle cat game concept. One self-contained HTML file,
no build step, no dependencies.

## Shipping to the app stores

The same `index.html` is wrapped with **Capacitor** and built/signed by **GitHub
Actions** (no Mac needed). See **[STORE-SETUP.md](STORE-SETUP.md)** for the
one-time account + secrets setup. After that:

```bash
git tag android-v2.0.1 && git push origin android-v2.0.1   # → signed .aab
git tag ios-v2.0.1     && git push origin ios-v2.0.1        # → TestFlight
```

`npm run build` assembles `www/` from `index.html`; `npm run sync` runs Capacitor.
Native `android/` and `ios/` folders are generated fresh in CI, never committed.

## V3 — the return-visit layer

The engagement pass. See the design doc ("Something Happened While You Were Away").
Ships MVP steps 1–3; Friendship/Memories, Butterfly Catch and Weekly Events are next.

- [x] **Vignette engine** — one shared runner for short scripted moments (text +
      emoji prop + choices + weighted outcome). WYWA beats and adventure results
      both run through it. `runVignette()`, `__cove.wywa(id)`.
- [x] **Moments** — a gentle log of the cove's little happenings, in the Today
      sheet. `logMoment()`, `__cove.moments()`.
- [x] **While You Were Away** — on return, a capped chance (scales with time away,
      ~15h cooldown, anti-repeat) that a small story is waiting: a kitten in a box,
      a gift on the step, a crab with opinions, an eleven-minute meeting with a
      wall. **14 beats**, deadpan / all-ages, ~70% comic and ~30% pure warmth,
      heavy on cat-nature humour (the box beats the bed, 3am eye contact, the
      undefeatable red dot). Never a loss. Rolls after the offline-earnings modal
      via `checkOffline(afterReturn)`.
- [x] **Cat Adventures** — one trip a day: pick a destination (Fishing ~30m /
      Forest ~2h / Island ~6h) and a cat. The cat leaves the cove; traits shape the
      haul (curious→map fragments, glutton→recipes, lazy→slower, bold→no bad
      encounter, grumpy→rare jackpot, …). Result vignette on return. Rare torn-map
      fragments build toward the island (`G.mapPieces` / `MAP_TOTAL`, island stubbed).
      `G.adventure`, `__cove.adventure(cmd)`. **Send-off:** the cat trots toward
      the edge, stops to look back at you (a heart), then heads off with a little
      bindle; a chalk tag hangs on the cove sign — *"<name> is out exploring"* —
      the whole time; they walk back in on return. **Postcards:** at ~⅓ and ~⅔
      through the trip a note comes home (*"Met a squirrel. It was rude. The story
      develops."*) — pops as a card if you've been away, a gentle toast if you're
      playing, and always shows in the Today adventure card + Moments.
      `G.postcards`, `POSTCARD_LINES`, `__cove.adventure("card")`.
- [x] **Daily check-in** — a warm little welcome, one a day, 7-day loop
      (`CHECKIN_REWARDS`). Never punishes a missed day — the cycle just continues.
      Card at the top of the Today sheet; `__cove.checkin()`.
- [x] **Token polish** — field drops now carry a breathing two-layer glow, a
      ground shadow, a crisp rim + a "just landed" ring, a bigger bob, and a
      wider tap target (34px). Drops clamp clear of the bottom action bar.
- [x] **No more overlapping scenery** — `placeClear()` lays out cottages, trees,
      flower patches and food/toy/bed spots with footprint-aware spacing so
      nothing lands on top of a station or another object.
- [x] **Wake-up stretch** — waking from a nap (or a scratch), a cat has a ~40%
      chance of a brief `stretching` state: body lengthens, chest drops, front
      paws slide forward. Eases in and out over ~1.3s.
- [x] **Scratch pad** — a new Comforts shop item. Cats stop by for a `scratching`
      state (both front paws raking an angled sisal board, fluff puffs), a mood
      lift, and they always stretch after. Climbers / playful / bold cats love it.
      `G.scratch`, +1 capacity.
- [x] Save `catmintCove.save.v7` — migrates `.v6` / `.v5` in place.
- [ ] Friendship ❤️1–10 + Memories (the moat) — next
- [ ] Butterfly Catch — one 40s optional mini-game — next
- [ ] Weekly rotating events (template) — next

## V2 roadmap

- [x] Midknight mascot + chunky-loaf cat art, deadpan gold eyes
- [x] Procedural happy-meow SFX (pet / coax / buy / reveal)
- [x] Skippable tutorial, re-openable from **?**
- [x] Mobile-first layout (safe-area, 44px targets, scroll/icon action bar)
- [x] V1 + V2 both permanently hosted
- [x] Ambient procedural sound bed (rain / stream / birds / night crickets)
- [x] Day/night lighting cycle the audio follows — an accelerated cove clock:
      one full sunrise→night loop every 30 real minutes, started from your real
      local time (so a night-owl still sees dawn within a session). `DAY_CYCLE_MIN`
- [x] Activity stations — fishing dock, bakery, sunbeam mat, catmint garden
- [x] Canvas accessories — collar / bandana / bow / flower crown
- [x] Photo → short animated clip capture (MediaRecorder webm)
- [x] Tall-screen scene layout pass (foreground meadow)
- [x] Calmer ASMR meow synth (now the fallback)
- [x] Real recorded cat voices — `sfx/` MP3s (meow ×5, kitten ×2, grumpy ×2, a
      wake yawn, a purr). Random pick with no immediate repeat + per-play pitch/
      level jitter; ~1 in 3 pets stays quiet, kittens use the kitten pool,
      cuddly cats sometimes purr, prickly cats grumble when over-petted, and a
      cat yawns when it grows up. Sources kept in `../meow-src/`.
- [x] Fishing mini-loop — cast / wait / bite / reel / cook / eat
- [x] Rest mode — the rainy-day cabin companion (**🌙** in the HUD): cats come
      inside, rain on the window, a fire, a real rain-audio loop, idle-dim,
      auto-stop timer, wake-lock. Rain audio polished from a field recording
      (`rain-loop.opus`; long-form versions in `../rain-v2/`).
- [x] Ads + IAP scaffold — a simulated `Ads` layer (rewarded / interstitial)
      behind the interface the real Google AdMob SDK will use in the native
      build. **Ads ship OFF** (`ADS_ENABLED = false`) — see below. When on:
      rewarded (double offline earnings, coax a cat for free) + one *light*
      session-boundary interstitial (48h grace · ≤3/day · none in Rest mode /
      for supporters) + a one-time neutral age gate for ad treatment.
- [x] **Cozy Supporter Pack $4.99** (simulated purchase) — permanent 2× offline,
      ✦50, a ribbon for Midknight. Removes ads too, once ads are on. Works
      independently of the ad flag.

### Monetization notes — launch ad-free, ads on later

`ADS_ENABLED` (top of the script) is **false**. The launch build ships **ad-free
with the Supporter Pack IAP only** — no interstitials, no rewarded prompts, no
age gate. This is deliberate: get a clean retention baseline, let the store
listing age and pass [AdMob's app-readiness review](https://support.google.com/admob/answer/10564477)
(which needs a *published* app + matching store IDs + verified payments), then
flip ads on — `ADS_ENABLED` becomes a remote-config flag in the native build, so
no re-submission. `?ads` in the URL forces ads on for QA; the dev panel's
**show ad** button does too. Still to wire before the real SDK: UMP consent,
iOS ATT, families / child-directed tagging.

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
