# Catmint Cove — Project Brief

> A single-source context document for writing further documentation (store
> listings, press kit, wiki, marketing copy, FAQ, support articles, pitch
> decks). Everything here is drawn from the live build, the design docs, and
> the studio's existing web properties as of **September 2026**. When a
> number or feature detail matters for a public-facing doc, check it against
> `index.html` or the live site first — this brief is a summary, not the
> source of truth.

---

## 1. What it is

**Catmint Cove** is a cozy-idle cat-sanctuary game. Cats wander into a quiet
coastal cove; you look after them, get to know them, and slowly restore the
place until it's theirs.

- **Genre:** cozy idle / hybrid-casual (idle stickiness + Neko Atsume calm +
  an engineered photo/share loop as the differentiator)
- **Platforms:** mobile (Android + iOS), wrapped from a web build with
  Capacitor. Also playable free in a browser.
- **Status:** playable beta (V3), live on the web. Pre-launch — not yet on
  Google Play or the App Store.
- **Studio:** Midknight Studio (Midknight Studio Labs)
- **Price model at launch:** free, ad-free, with one optional IAP (see §9)
- **Live build:** https://midknightstudiolabs.github.io/catmint-cove/
- **Repo:** github.com/midknightstudiolabs/catmint-cove (`main` branch,
  GitHub Pages redeploys ~1 min after push)

### One-liners

- **Elevator:** "A cozy corner of the world where cats come to be looked
  after — and you slowly make it theirs."
- **Store subtitle (App Store, 30 char):** "A cozy cat sanctuary"
- **Play short description (80 char):** "A cozy corner where cats come to be
  looked after — and you make it theirs."
- **Tagline:** "Time is weather here, not a timer."

---

## 2. Design philosophy — the calm rule

The north star, locked early and never broken:

> **"A cozy corner of the world where cats come to be looked after — and you
> slowly make it theirs."**

Rules that follow from it:

- **No fail state, no timer, no countdown.** Time is weather, not a clock.
  Leaving for a day loses nothing; the cove carries on without you and you
  come back to what it did while you were gone. Absence is neutral.
- **Cats never leave.** (The only way a cat exits is the player's own gentle
  "find them a new home" choice, which is a cap-management valve, not a loss.)
- **Fun and addicting are not a tradeoff.** Every engagement mechanic
  (dailies, streaks, festivals, adventures, the Catdex chase) has to live
  inside the calm register. Festive energy is fine; genuine tension,
  competition, or loss-aversion pressure is not.
  - This is why the festival race is **upside-only** (no betting, no stakes)
    and why there is **no player-vs-AI sport** — both were considered and
    ruled out for breaking the calm rule.
- **Cats as individuals, not inventory.** Names (renameable), personalities,
  quirks, an about-line, cat-initiated moments, a field guide. The collection
  hook is "get to know them," not "grind for numbers."
- **You make it yours.** Naming the cove, restoring the dock, planting the
  catmint, lighting the bakery oven — visible, permanent progress the player
  chose. Not decoration that resets.

### Tone of voice

Deadpan, warm, unhurried, a little comic. Heavy on cat-nature humour (the box
beats the bed, 3am eye contact, the undefeatable red dot). All-ages. Never
saccharine, never shouty. Copy example, a "While You Were Away" beat: *"Met a
squirrel. It was rude. The story develops."*

---

## 3. Core loop

**Attract → Tend → Collect → Invest → Capture**

- **Attract** — "Coax a cat" (player-paced), Shop comforts that draw
  different personality types, and free arrivals over time (~1 cat / 3h — the
  "came home from work to a new friend" beat).
- **Tend** — tap a cat to pet it: mood up + a short production buff. Prickly
  cats (Grumpy, Shy) sulk if over-petted.
- **Collect** — cats drop one chunky token (~every 2 min); tap to bank
  shells. Un-tapped tokens auto-bank after ~75s, so you can't lose earnings.
  Offline earnings on return.
- **Invest** — Shop upgrades scale in price; comforts raise cat capacity; a
  global Comfort multiplier; restoration projects.
- **Capture** — Photo mode frames the scene with a caption + cove-name
  watermark. The intended share loop.

---

## 4. Systems

### Cats & personalities

Every cat rolls **2 of 10 traits**: Glutton, Playful, Shy, Cuddly, Climber,
Chatty, Lazy, Curious, Grumpy, Bold. Traits drive which comfort a cat seeks,
what it produces, how it reacts to petting, its race pace, its adventure
haul, and its idle behaviour: **sleeping** (by far the most common — a
nap-heavy cove), grooming (face-washing with a raised paw), loafing, eating
(then a wash), playing, socialising, stretching after a nap, the odd wander,
knocking things over, sulking. Walking is rare and purposeful.

**Rarity:** ★1–4 (Common → Legendary, ~4% legendary). Higher stars = more
output (up to ~1.9×) + a sparkle aura. Infinite chase: you always want a
better ★ of a coat you already have. A pity timer guarantees a Legendary by
the 40th coax.

**Age:** ~45% of new cats arrive as **kittens** — smaller, big-headed,
big-eyed, jigglier, play/groom more, produce ~half. They grow to adults over
~20h of real time with a little "grew up!" moment (and a yawn). Starters
arrive grown.

### The Catdex (field guide)

Collection screen. **11 coats** — tuxedo, ginger tabby, grey tabby, brown
tabby, grey & white, black, calico, tortoiseshell, white, russian blue,
siamese. Silhouette until found, live progress bar, pearl rewards at
3 / 6 / 9 / 11. The main return driver: visible gaps. Weighted so the last
coats take longer (~41 cats to complete, a 1–2 week casual arc). Every coat
met → new ones turn up as the seasons turn.

### Currencies

- **Shells (◈)** — everyday currency. Cats leave them; spend on coaxing and
  comforts.
- **Pearls (✦)** — soft premium currency, earned **only** through the Catdex
  and daily goals, so the meta systems feed each other. Never sold for money.
- **Driftwood (🪵)** — building material for restoration projects. Washes up
  on the shore, comes home from adventures, occasionally dragged in by Labubu.

### Daily rituals

- **Daily check-in** — one warm welcome a day, 7-day reward loop. A missed
  day never punishes; the cycle just continues.
- **Daily goals** — 3 rotating goals (pet N, gather N shells, coax, collect,
  photo, discover) with per-goal rewards.
- **Streak** — finish all 3 to extend it; celebration + bonus pearls. Resets
  on a skipped day (the one gentle loss-aversion touch, and it only costs a
  counter, never progress).

### Cat Adventures

One trip a day. Pick a destination (**Fishing** ~30m / **Forest** ~2h /
**Island** ~6h) and a cat. The cat leaves the cove; traits shape the haul
(curious → map fragments, glutton → recipes, lazy → slower, bold → no bad
encounter, grumpy → rare jackpot). **Send-off:** the cat trots to the edge,
stops to look back at you (a heart), heads off with a bindle; a chalk tag
hangs on the cove sign — *"<name> is out exploring"* — until they walk back
in. **Postcards** arrive at ~⅓ and ~⅔ through the trip. Rare torn-map
fragments build toward unlocking the island.

### Rest mode ("Rainy-day rest" — 🌙 in the HUD)

A companion mode, not a minigame. Cats come inside a cabin; rain on the
window, a fireplace, a wall clock on real local time, a steaming mug. A real
rain-audio loop (processed from a field recording) with optional
fireplace/thunder, an auto-stop timer (1h/3h/8h/off), an idle-dim
screensaver, and a wake-lock. Good to work or sleep to. On wake it credits a
share of offline earnings + a mood lift for every cat. **Rest mode stays
ad-free forever**, by design.

### The Cove Festival (weekly event — 🎪, unlocks at day 7)

A short cat race down at the track. **Upside-only:** no shells staked;
everyone who enters gets a small payout, your picked cat winning gets ~2.5–3×
that plus a rare pearl chance. A landing screen → pick your cat → 3-2-1
countdown → the race (10–15s, varied pace, "zoomies" bursts, always
skippable) → a 1-2-3 podium result card with the real reward shown. Fields
exactly 5 racers every time (padded with visiting guests if the cove is
small). Fairground calliope music (original, oom-pah bass) and a crowd that
keeps cheering until every cat is in.

### While You Were Away / the vignette engine

A shared runner for short scripted moments (text + emoji prop + choices +
weighted outcome). On return, a capped chance (scales with time away, ~15h
cooldown, anti-repeat) that a small story is waiting — **14 beats**, deadpan,
all-ages, ~70% comic / ~30% pure warmth: a kitten in a box, a gift on the
step, a crab with opinions, an eleven-minute meeting with a wall. Never a
loss. Also feeds **Moments**, a gentle log of the cove's little happenings in
the Today sheet.

### Restoration projects

The cove starts run-down. Repair the dock, and other projects, using
driftwood — each one visibly changes the scene and raises cat capacity. This
is the "make it yours" spine.

### Activity stations

Placeable in the Shop: **fishing dock** (a real cast/wait/bite/reel/cook/eat
mini-loop that drops bonus fish), **bakery**, **sunbeam mat**, **catmint
garden** (grants a temporary zoomies speed boost). Per-station rate
multiplier, mood target, and a busy-slot cap. Cats walk over and use them.

### The Shop

Sells comforts cats *use* (food bowl → eat, toy → play, cozy bed / cat
cottage → nap, shade tree → doze, scratch pad → scratch-then-stretch) and
pure scenery (flower patch → lifts the whole cove's baseline mood). Also:
Fresh catnip (repeatable, 2× earnings for 20 min), a trinket basket
(accessories), the four stations, and the **Cove Charter** prestige unlock
(raises the cat ceiling from 16 to 30, gated behind a complete Catdex).
Every placeable item has a "remove" button that refunds 40%.

### Accessories & photo

Cats can wear a collar / bandana / bow / flower / flower-crown / bell / specs
/ hat, drawn on canvas. ~24% of arrivals wear one; ★4 cats get a crown;
Midknight has a signature bell collar. **Photo mode** frames the current
scene (sky, foreground meadow, cats, accessories) with a caption + the cove's
name as a watermark, and can also record a short animated clip.

### The Midknight cairn (Phase C payoff)

Once Labubu (see §5) has dragged enough junk onto the shelf by the sign and
Midknight has settled there, a quiet multi-stage sequence starts: Midknight
builds a small cairn / monument by the sign — the founder's tale, told
without words.

---

## 5. World & characters

### The setting

A small, run-down coastal cove. A weathered wooden signpost reads **CATMINT
COVE** (the player renames it on first run; the name shows on the sign, the
HUD, and photo watermarks). A tidal pond with a broken dock, long grass,
wildflowers, a shore. An accelerated day/night cycle — one full sunrise→night
loop every ~30 real minutes, anchored to the player's real local time so a
night-owl still sees dawn within a session. The audio bed follows the light
(birdsong by day, crickets at night, wind chimes, a wandering brook).

### Midknight — the mascot

The studio mascot and the player's guaranteed first cat. A chunky longhair
**tuxedo** (warm black + cool-neutral white), based on the founder's real
cat. Personality: **grumpy-looking softie** — deadpan default, gold
half-lidded eyes, snap-back-to-deadpan comedy. He never leaves, is outside
the gacha, and isn't a Catdex coat — he's a character. Locked markings: black
cap/mask, lynx-tipped ears, a forehead freckle off to his left, a nose-bridge
wedge, a chin dot ("goatee"), white mitten paws, one back-leg spot. Pose
canon: the loaf. He keeps his loafing spot right by the sign.

### Labubu — Midknight's sidekick

A recurring **non-resident visitor** (not collectible, not permanent),
modelled on the founder's other real cat: a **snowshoe** — seal points, white
boots, an inverted-V blaze, blue eyes, a dark off-centre nose smudge, a
**purple bell collar**. Turns up ~10 min into the first session, then up to
2× a day (3–7h apart, tapering to ~1×/day later). Pads around near Midknight
for a couple of minutes, drops a bit of worthless junk by the sign
(bottlecap, chewed cork, a sock that isn't yours…), and wanders off.
Occasionally the junk is driftwood instead. Framing stays low-key — *"Labubu
wandered in and left a sock,"* never *"brought you a present."* His junk pile
is what eventually triggers the Midknight cairn.
> ⚠️ **Naming watch-out:** "Labubu" is also a well-known trademarked toy
> character (Pop Mart). Worth confirming the in-game name is safe for a
> commercial release, or picking an alternative, before it's baked into store
> copy and marketing.

### Special / named cats

Sir Biscuits, Mochi, The Mayor, the keeper's cat, and others — named
characters that sit outside the standard 11 coats, some tied to themed sets
and "cats with jobs" vignettes (fishing, bakery, sunbeam, nap-pile). Some are
built, some are still concept.

---

## 6. Art direction

- **Style:** soft "Cats & Soup"-adjacent — big round simple eyes with a
  bright catchlight, gentle low-contrast markings, rounded ears, tiny nose, an
  always-on rosy blush, subtle sticker-style top-light / base-shade, a soft
  light-rim instead of a hard outline, a contact shadow on everything.
  Deliberately charming and comical, **not realistic** (the walk cycle has a
  `CHARM` constant). Cats are a chunky rounded-triangle **loaf**, head merged
  into a ruff rather than stacked.
- **Rendering:** everything is drawn on `<canvas>` at runtime — **no image
  assets** for the game art. One shared cat renderer handles all coats via
  pattern logic (tux / tabby / solid / points / calico / tortie).
- **Palette:** warm. Forest green `#356b4c` (brand accent), warm cream
  `#f3efe2`, warm near-black `#241f17`, shell gold `#e8b45a`, a heart pink
  `#d6688a`, dusk-sky gradients that shift with the clock (midnight navy →
  dawn pink → midday `#7ec0dc` blue → dusk orange).
- **Fonts:** **Fraunces** (display serif — headings, the wordmark) + **Hanken
  Grotesk** (body/UI). Both used in the game and across the marketing sites.
- **Recurring motif:** the paw print — the loading/title emblem, the "Coax"
  button, the interior neck-print on merch.
- **Logo / app icon (decided):** the **"Cove nocturne"** — a crescent moon
  over a still pond, one cat silhouette on the bank, a single gold eye-glint
  (a thread to Midknight without being him), on deep green `#1c3327`. Drawn as
  a responsive icon with a simplification ladder for small sizes.

---

## 7. Audio direction

Fully **procedural Web Audio** — no music/SFX files except a handful of real
samples. No asset-heavy soundtrack.

- **Ambient bed:** layered pink-noise brook, night crickets, day birdsong,
  pentatonic wind chimes; crossfades between day and night with the light.
- **Real cat voices:** `sfx/` holds ~11 small MP3s recorded from real cats —
  meow ×5, kitten ×2, grumpy ×2, a wake-yawn, a purr. Random pick with no
  immediate repeat, per-play pitch/level jitter. Anti-annoyance: ~1 in 3 pets
  stays silent, kittens use the kitten pool, cuddly cats sometimes purr,
  prickly cats grumble when over-petted, a cat yawns when it grows up. A
  synthesised ASMR meow is the fallback.
- **Rain:** Rest mode uses a real seamless rain loop processed from a
  founder field recording (long-form 5-min and 47-min versions also exist,
  intended for an 8-hour ambience video).
- **Festival:** an original fairground calliope melody with oom-pah bass —
  Chrono Trigger's "Millennial Fair" is a *mood* reference only, never
  transcribed.

---

## 8. Tech & build

- **The whole game is one self-contained `index.html`** — vanilla canvas 2D,
  no framework, no build step, an IIFE-wrapped `<script>`, a fixed-timestep
  sim. `window.__cove` exposes debug hooks.
- **Save:** `localStorage` only, per browser/device, no cloud account. Key is
  versioned (`catmintCove.save.v9` as of the Phase A/B overhaul; major
  overhauls are clean breaks with no migration). `pagehide` persists state on
  any navigation.
- **Native wrap:** **Capacitor 8** (targets Android API 36 / min 24, JDK 21)
  + **GitHub Actions** builds and signs `.aab` / TestFlight builds — no Mac
  needed. `scripts/build-www.mjs` assembles `www/` from `index.html` + sfx +
  the rain loop and injects a small native bridge. The `android/` and `ios/`
  folders are generated fresh in CI, never committed.
- **Bundle / package id:** `com.midknightstudiolabs.catmintcove`
- **App name:** Catmint Cove
- **Orientation:** portrait-locked (manifest patch in CI + an in-web rotate
  overlay).
- **Release:** `git tag android-v2.0.1` / `ios-v2.0.1` and push. `versionCode`
  = the GitHub run number; `versionName` = the bit after `-v`.
- **Three permanent web URLs:** root = the clean beta for testers (no dev
  tools); `/dev/` = same game + dev panel; `/v1/` = the frozen original
  greybox.
- Local play: `node serve.mjs` → http://localhost:8765
- See **`STORE-SETUP.md`** for the full account/keystore/secrets checklist.

---

## 9. Monetization

**Launch ad-free.** `ADS_ENABLED = false`. The launch build ships with no
interstitials, no rewarded prompts, and no age gate — just the one IAP. This
is deliberate: get a clean retention baseline, let the store listing age and
pass [AdMob's app-readiness review](https://support.google.com/admob/answer/10564477)
(needs a *published* app + matching store IDs + verified payments), then flip
ads on — `ADS_ENABLED` becomes a remote-config flag, no re-submission needed.

- **Cozy Supporter Pack — $4.99** (one-time IAP). Permanent 2× offline
  earnings, ✦50, a ribbon for Midknight, and it removes ads once ads exist.
  Works independently of the ad flag. Currently a simulated purchase.
- **Ads, when eventually on:** Google AdMob. Rewarded-first (double offline
  earnings, coax a cat for free) + **one light** session-boundary
  interstitial — 48h new-player grace, ≤3/day, ≥4min apart, never for
  supporters, **never in Rest mode / tutorial / over a modal**. A one-time
  neutral age gate on first run; unknown / under-18 → non-personalised
  (contextual) ads only.
- **Ethical guardrails:** no pay-to-win (there's nothing to win), rarity odds
  shown on every reveal, the one ad surface is opt-in, streaks never punish
  progress, pearls are never sold.
- **Data:** the app collects nothing, needs no account, and saves
  device-local. Keep it that way until AdMob goes in, then revisit the Data
  Safety form.
- **Cloud save (planned):** Google Play Games Saved Games + Apple Game Center
  — not Firebase/Drive. The in-app `saveCode()` export is the interim.

---

## 10. Roadmap (phase map)

- **Phase 1 — Playable prototype.** Done. Exit gate: 5–10 testers voluntarily
  reopen across 3+ days (a user-run device task).
- **Phase 2 — Vertical slice / look & feel.** Mostly done, on the web build
  (art bible, real cat voices, day/night, stations, accessories, Rest mode,
  the return-visit layer, camera work, Catdex, perf pass, monetization
  scaffold, the Capacitor + CI pipeline). Open: a first-hour playtest, a
  60fps feel-tune, a 15–20s trailer clip, store listing assets.
- **Phase 3 — Soft launch (numbers).** Not started. Needs Play/Apple
  accounts, keystore + secrets, a first manual `.aab`, Google's 12 testers ×
  14 days closed-testing requirement, real AdMob + IAP, analytics, cloud
  saves. Gate: D1 ≥ 40% / D7 ≥ 15% / positive LTV:CPI trend.
- **Phase 4 — Global launch + live-ops.** The post-launch content roadmap:
  Friendship ❤️1–10 + Memories (the moat), a Butterfly Catch mini-game (one
  optional 40s), weekly rotating events, Catdex depth (~18 coats, named
  specials, themed sets, ★4 mastery, dupes→shards, seasonal).
- **Phase 5 — Platform expansion (optional).** An ad-free premium port
  (Netflix / Steam / Switch); a Unity/Godot rebuild only becomes worthwhile
  here.

---

## 11. Studio & brand

- **Midknight Studio Labs** — the founder's indie game studio.
  `midknightstudiolabs.com` (Blogspot). Mascot: **Midknight**, the same
  tuxedo cat.
- **Studio site palette:** black `#111` / amber `#FFC107` / Poppins.
- **Catmint Cove's own marketing identity** (for `catmintcove.com`): cream
  `#faf7ef` + forest green `#356b4c` / `#1c3327`, Fraunces + Hanken Grotesk,
  cozy. A one-page marketing site (hero → overview → features → how-it-works →
  gallery → Rest-mode spotlight → roadmap → pricing → FAQ → community).
- **Socials:** `discord.gg/midknightstudiolabs`,
  `youtube.com/@midknightstudiolabs`, `facebook.com/midknightstudiolabs`
- **Privacy policy:** `midknightstudiolabs.com/p/privacy.html` — states the
  app collects nothing / no account / no ads / device-local save (a Play
  reviewer cross-checks this against the Data Safety form).
- **Studio milestones:** kick-off Aug 5 2026; beta V2 Sep 1 2026.

---

## 12. Store listing metadata (drafts)

- **Category:** Games ▸ Simulation (or Casual)
- **App Store subtitle (30 char):** "A cozy cat sanctuary"
- **Play short description (80 char):** "A cozy corner where cats come to be
  looked after — and you make it theirs."
- **App Store keywords (100 char):**
  `cat,cats,cozy,idle,relax,calm,pet,animal,collector,sanctuary,kitten,chill,wholesome`
- **Full description (both stores):**

  > Catmint Cove is a calm place. Cats wander in, and you look after them —
  > a warm spot in the sun, a bowl by the door, a scratch behind the ears.
  >
  > There is no timer and no fail state. Time is weather here, not a
  > countdown. Leave for a day and nothing is lost; come back and the cove
  > has carried on without you. Every cat has its own way of being a cat — a
  > lazy one loafs, a bold one gets the zoomies, a shy one watches from the
  > long grass — and the more time you spend together, the more you notice.
  >
  > Slowly you make the place theirs: mend the old dock, plant the catmint,
  > light the little bakery oven. Send a few cats off exploring and read the
  > postcards they send home. Fill the field guide. Sit with one cat a while
  > and just watch it groom.
  >
  > A cozy corner of the world where cats come to be looked after — and you
  > slowly make it theirs.

- **Screenshots needed:** phone (a few), 7" tablet, 10" tablet; iOS also
  wants 6.7" and 6.5". All **portrait**. Current marketing shots are of the
  V2 greybox in five lighting states (day / golden / night / rest / dawn).
- **Also required:** privacy policy URL, content rating questionnaire (IARC
  for Play, Apple's own), Data Safety form / privacy nutrition labels
  (currently: collects nothing, all local).

---

## 13. Merch

First concept: a **heavyweight fleece hoodie** (400 gsm, brushed interior).

- **Front:** small left-chest crest — Midknight in his loaf pose, deadpan,
  over a `CATMINT COVE` wordmark in Fraunces. 3.5 in, 2-color, or tonal
  embroidery as a premium option.
- **Back:** the statement print — the cove signpost with three regulars
  (Midknight, a ginger, a grey) loafing under the afternoon sun. 11 in wide,
  3 spot colors (Forest Green PMS 7484 C / Warm Black PMS Black 7 C / Shell
  Gold PMS 7563 C), no halftones so it holds on fleece.
- **Colorways:** Heather Oatmeal (primary), Forest Green, Fog Grey.
- **Details:** inside-neck screen print instead of a woven tag ("made for
  slow days"), matte antique-gold drawcord aglets, optional 1 in paw at the
  left cuff, a kraft hangtag with a seed-paper insert (plant it, grow
  catmint).
- **Sizes:** XS–3XL, unisex, slightly boxy.
- **Lockup:** "Time is weather here, not a timer." · CATMINT COVE · MIDKNIGHT
  STUDIO

Full spec sheet with placement measurements is in the hoodie concept
artifact.

---

## 14. Key links & files

| What | Where |
|---|---|
| Live beta (share this) | https://midknightstudiolabs.github.io/catmint-cove/ |
| Dev build | https://midknightstudiolabs.github.io/catmint-cove/dev/ |
| Frozen V1 greybox | https://midknightstudiolabs.github.io/catmint-cove/v1/ |
| Game repo | github.com/midknightstudiolabs/catmint-cove |
| Studio site | midknightstudiolabs.com |
| Catmint Cove marketing site (planned) | catmintcove.com |
| Store setup checklist | `STORE-SETUP.md` (in the repo) |
| Design / research doc | `game-plan.html` (in the repo) |
| Marketing site sources | `Documents/Codex/midknight-studio-web/` (separate repo) |
| Rain audio masters | `Documents/Codex/rain-v2/` |

---

## 15. Open questions & watch-outs

- **"Catmint Cove" vs "Midknight: Home" — one game or two?** The studio site
  currently lists both (Catmint Cove as featured / now playable, Midknight:
  Home as game #2 / in development). Public docs should not imply Midknight:
  Home is a separate shipping product unless that's the decision.
- **The "Labubu" character name** may collide with a real trademark (Pop
  Mart). Resolve before it's in store copy.
- **AdMob can't be approved until the app is published** — so the launch is
  genuinely ad-free, and any "supported by ads" language is premature. Lead
  with "free, no ads."
- **Cloud save is not in yet** — saves are device-local. Don't promise
  cross-device sync in launch materials; the `saveCode()` export is the
  current story.
- **`apple-touch-icon`** still needs a real 180px PNG uploaded to the
  marketing site.
- Balance numbers (base earn rate, upgrade costs, mood curves) are first-pass
  and still being tuned — don't cite specific economy figures in public docs.
- Google Play's new-developer rule: **12 testers × 14 days of closed
  testing** before Production unlocks. Start that clock early; factor it into
  any launch-date messaging.
