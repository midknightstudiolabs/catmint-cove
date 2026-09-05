# Catmint Cove — Quick Context

> Condensed companion to `PROJECT-BRIEF.md`. Paste this into an AI chat as
> context for writing docs. It's a summary — verify specific numbers against
> the live build before putting them in public copy.

**What it is:** A cozy-idle cat-sanctuary mobile game (Android + iOS, wrapped
from a web build with Capacitor; also free in-browser). Genre: cozy idle /
hybrid-casual — idle stickiness + Neko Atsume calm + an engineered photo/share
loop. By **Midknight Studio** (Midknight Studio Labs). Status: playable beta,
live on the web, pre-launch (not yet on the stores).

- Live: https://midknightstudiolabs.github.io/catmint-cove/
- Repo: github.com/midknightstudiolabs/catmint-cove
- Bundle id: com.midknightstudiolabs.catmintcove
- Price model: free, ad-free at launch, one optional IAP ($4.99 Cozy
  Supporter Pack)

**Elevator line:** "A cozy corner of the world where cats come to be looked
after — and you slowly make it theirs."
**Tagline:** "Time is weather here, not a timer."

## Design philosophy — the calm rule
- No fail state, no timer, no countdown. Time is weather. Leaving loses
  nothing; the cove carries on and you return to what it did while you were
  away. Absence is neutral.
- Cats never leave (the only exit is the player's own gentle "rehome" choice).
- Fun and addicting are not a tradeoff — every engagement system stays in the
  calm register. Festive energy yes; real tension/competition/loss-pressure
  no. (The festival race is upside-only, no betting. No player-vs-AI sport.)
- Cats are individuals, not inventory — names (renameable), 10 traits, quirks,
  a field guide. The hook is "get to know them," not "grind numbers."
- You make it yours — name the cove, restore the dock, plant the catmint.
  Permanent, player-chosen progress.

**Tone of voice:** deadpan, warm, unhurried, a little comic. Heavy on
cat-nature humour. All-ages. Never saccharine, never shouty.

## Core loop
Attract → Tend → Collect → Invest → Capture. Coax/attract cats, pet them for
mood + a production buff, collect the tokens they drop (auto-bank so you can't
lose earnings), spend on comforts/upgrades/restoration, frame photos with the
cove-name watermark to share.

## Key systems
- **Cats:** 2 of 10 traits (Glutton, Playful, Shy, Cuddly, Climber, Chatty,
  Lazy, Curious, Grumpy, Bold). ★1–4 rarity (~4% legendary). ~45% arrive as
  kittens that grow up over ~20h real time. Nap-heavy behaviour.
- **The Catdex:** field guide, 11 coats, silhouette until found, pearl rewards
  at 3/6/9/11. Main return driver. ~41 cats to complete (1–2 week casual arc).
- **Currencies:** Shells ◈ (everyday), Pearls ✦ (soft-premium, only from
  Catdex + goals, never sold), Driftwood 🪵 (building material).
- **Daily rituals:** 7-day check-in loop, 3 rotating daily goals, a streak
  (resets on a skipped day — the one gentle loss-aversion touch).
- **Cat Adventures:** one trip/day (Fishing ~30m / Forest ~2h / Island ~6h),
  traits shape the haul, postcards home mid-trip, a chalk tag on the sign.
- **Rest mode (🌙):** a rainy-day cabin companion — cats inside, real rain
  audio loop, fireplace, auto-stop timer. Ad-free forever by design.
- **The Cove Festival (🎪, unlocks day 7):** a short 5-cat race, upside-only
  rewards, 1-2-3 podium, always skippable.
- **While You Were Away:** on return, a capped chance a short deadpan story is
  waiting (14 beats, ~70% comic / 30% warmth, never a loss). Feeds a
  "Moments" log.
- **Restoration projects, activity stations** (fishing/bakery/sunbeam/garden),
  **accessories, photo mode** (+ short animated clip capture).

## World & characters
- **The cove:** a run-down coastal cove with a weathered "CATMINT COVE"
  signpost (player renames it), a broken dock, tidal pond, long grass. An
  accelerated day/night cycle (~30 real min per loop, anchored to real local
  time); the audio bed follows the light.
- **Midknight:** the studio mascot + guaranteed first cat. A chunky longhair
  tuxedo, grumpy-looking softie, deadpan, gold half-lidded eyes, lynx ears,
  loaf pose, keeps his spot by the sign. Outside the gacha, never leaves.
- **Labubu:** Midknight's sidekick — a recurring non-resident visitor (a
  snowshoe, purple bell collar). Turns up, pads around near Midknight, drops a
  bit of worthless junk by the sign, wanders off. NOTE: "Labubu" may collide
  with a real trademark (Pop Mart) — confirm before it's in store copy.
- Named specials: Sir Biscuits, Mochi, The Mayor, the keeper's cat.

## Art & audio
- Soft "Cats & Soup"-adjacent style — big round eyes + catchlight, gentle
  markings, always-on blush, chunky loaf body, light-rim not hard outline.
  Deliberately comical, not realistic. All cats drawn on canvas at runtime,
  no image assets.
- Palette: forest green #356b4c (accent), warm cream #f3efe2, warm black
  #241f17, shell gold #e8b45a, heart pink #d6688a, dusk-sky gradients.
- Fonts: Fraunces (display serif) + Hanken Grotesk (body).
- Motif: the paw print. Logo/icon: the "Cove nocturne" — a crescent moon over
  a still pond, one cat silhouette, a gold eye-glint, on deep green #1c3327.
- Audio: fully procedural Web Audio (ambient bed follows day/night) + a
  handful of real cat-voice samples + a real rain loop for Rest mode. Festival
  music is original fairground calliope.

## Tech
One self-contained index.html (vanilla canvas, no framework, no build step).
Save is localStorage only, device-local, no account (versioned key, major
overhauls are clean breaks). Capacitor 8 + GitHub Actions build/sign for both
stores, no Mac needed. Portrait-locked. Cloud save (Play Games / Game Center)
is planned, not in yet.

## Monetization
Launches **ad-free** — the only IAP is the $4.99 Cozy Supporter Pack
(permanent 2× offline, ✦50, a Midknight ribbon, removes ads once they exist).
Ads (Google AdMob, rewarded-first + one light session-boundary interstitial)
come later — AdMob can't approve serving until the app is published, so any
"ad-supported" language is premature. App collects nothing.

## Roadmap status
Phase 1 (prototype) + Phase 2 (vertical slice) essentially done. **Phase 3
(soft launch) is next** — needs store accounts, keystore, a first manual .aab,
Google's 12-testers × 14-days closed-testing period, real IAP + AdMob,
analytics, cloud save. Phase 4 = post-launch content (Friendship + Memories,
a Butterfly Catch mini-game, weekly events, Catdex depth).

## Brand
Midknight Studio Labs — midknightstudiolabs.com (Blogspot). Catmint Cove has
its own marketing identity for catmintcove.com (cream + forest green,
Fraunces + Hanken Grotesk). Socials: discord.gg/midknightstudiolabs,
youtube.com/@midknightstudiolabs, facebook.com/midknightstudiolabs.

## Watch-outs when writing public copy
- Don't imply "Midknight: Home" is a separate shipping product (studio site
  lists both — the one-game-or-two question is unresolved).
- The "Labubu" name may be a trademark risk.
- Don't promise ads or cross-device cloud save yet — neither exists at launch.
- Don't cite specific economy numbers — balance is still being tuned.
- Factor Google's 12×14 closed-testing rule into any launch-date messaging.
