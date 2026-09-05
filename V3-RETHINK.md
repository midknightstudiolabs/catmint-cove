# V3 — rethinking the whole design

> Started 2026-09-06. A step back to re-examine the fundamentals before adding
> anything: what the game *is*, whether the current systems earn their place,
> and what V3 should be. V2 is frozen (`releases/v2/`, tag `v2`) as the restore
> point. This is a living doc — it captures the rethink as it develops.

---

## Where V2 landed

Two years of concept compressed into ~6 weeks of one `index.html`. V2 is
**feature-rich**:

- Core idle loop (attract / tend / collect / invest / capture)
- 11-coat Catdex + rarity + kittens + 10 traits
- Day/night cycle + procedural ambient audio + real cat voices
- Restoration projects (the run-down cove → yours)
- Activity stations (fishing / bakery / sunbeam / garden)
- Accessories + Photo mode + clip capture
- Rest mode (the rainy-day cabin companion)
- The return-visit layer: vignette engine, While You Were Away, Moments,
  Cat Adventures + postcards, daily check-in / goals / streak
- The Cove Festival (weekly race)
- Labubu (visiting sidekick) + the Midknight cairn
- Fresh catnip, Cove Charter prestige, gentle rehome valve
- Capacitor 8 + CI for both stores; ad-free launch + one $4.99 IAP scaffold

It is polished and it holds together mechanically. But it has never launched
and never proven retention.

## The tension

**The game is trying to be a lot of things at once:** an idle number-go-up
game, a gacha-lite collector, an adventure-RPG-lite, a rhythm-of-life sim, an
ambient/rest app, and a photo tool. Each system is individually fine. Together
they dilute the answer to *"what is this game, in one sentence a stranger gets
in five seconds?"*

- **"Make it yours"** is a value, not a mechanic.
- **"The cove carries on without you"** is a beautiful idea that's currently
  expressed thinly (a few WYWA beats, a Moments log).
- **Cats as individuals** is the stated emotional core and the intended
  moat — Friendship ❤️ + Memories — and it's the **one big thing that was
  never built**. Right now cats have a name and two traits and that's most of
  their individuality.
- The **share loop** was named as the differentiator. Photo mode exists, but
  the game isn't *designed around* producing shareable moments.

The market context: cozy idle cat games are owned (Cats & Soup). Cat
collectors are owned (Neko Atsume). What almost nothing does well is **cats as
characters you have a real, deepening relationship with, in a place that lives
whether or not you're watching.** That's exactly where the north star already
points.

---

# DIRECTION LOCKED (2026-09-06)

The rethink above was premised on protecting the calm rule. **The user chose
a different path:** keep V2, drop the calm goal, add a real care layer, and
monetize cosmetics. This section supersedes the four-visions analysis.

## Decisions

1. **V3 is additive to V2** — a refactor + expansion on the existing
   `index.html`, not a hard reset. Built systems stay.
2. **The calm rule is dropped.** No longer "no fail state / no timer / absence
   is neutral." The game gains a **care layer with real neglect
   consequences.**
3. **Neglect floor: a cat can leave if neglected long enough.** Recoverable up
   to a point (feed it, treat it, it stays), then it's a genuine loss. A real
   fail state, Tamagotchi-style. Cats do **not** die and sickness is never
   permanent — the loss is a cat *leaving*, not worse.
4. **Cosmetic monetization is in scope** — premium decor with visual effects
   (glowing collar, rainbow-back with effect, little wings), sold for real
   money or a hard currency.
5. **The economy tightens** — pearl + shell drops cut ~50%, and care items
   (food, medicine) are new sinks, so the numbers matter and neglect has bite.
6. **New cats are opt-in** — an arrival is an accept/deny choice, not
   automatic. (You choose who joins the cove and take on their care.)
7. **Community feedback folds in as it comes** — build now, adjust from
   Discord reaction; no gate.

## What this makes the game

Less "a place that carries on without you," more **"a cove full of cats that
need you."** The pull is now care-loop tension (keep everyone fed, watered,
well, happy) layered on top of the V2 collection + cozy-decor + return-visit
systems. Closer to a warmer, prettier *Neko Atsume × Tamagotchi × 
decorate-your-space* than the ambient-diary direction that was on the table.

**This obsoletes a lot of public copy.** README, `PROJECT-BRIEF.md`,
`PROJECT-SUMMARY.md`, both marketing sites, and the drafted store listing all
lead with "no fail state / time is weather / cats never leave." All of that
needs a rewrite once V3's shape is proven. Hold the marketing rewrite until
the care loop is playtested — don't ship copy for a design that might still
move.

---

# V3 feature backlog

From the user's list (2026-09-06), bucketed and ordered.

## Bucket 1 — bugs & quick fixes (independent, do first)

- **Cats walk into / sleep in the pond.** Pathfinding + rest-spot placement
  don't treat the pond as blocked. Add the pond footprint to the
  no-walk / no-sleep zones (like station footprints in `placeClear()`).
- **Autumn (and other seasonal) effects are broken.** Investigate the seasonal
  effect system — leaves / palette shift / whatever autumn does — and fix.
- **Decor placement doesn't show the selected cat preview.** Placing an
  accessory (ribbon etc.) shows which cat it's going on; placing decor
  doesn't. Add the same selected-cat preview to the decor flow for
  consistency.

## Bucket 2 — economy & arrivals (small, self-contained)

- **Cut pearl + shell drops ~50%.** One pass over `festReward`, token values,
  goal/checkin rewards, adventure hauls. Retune so care items feel meaningful
  without being punishing.
- **Accept / deny new cats.** An arrival (free visitor or coax) surfaces a
  small card — name, coat, a trait hint — with Accept / Not now. Denied cats
  just don't join (maybe drift back off). Affects `scriptArrival`, the coax
  flow, and offline arrivals.

## Bucket 3 — the care layer (the big new pillar; build incrementally)

Order matters — each step needs the one before it.

1. **Food has a life.** A food bowl holds N servings / a freshness timer. You
   refill it (costs shells). Empty bowl = cats can't eat = hunger rises.
2. **Water.** If the pond / dock is restored, cats drink from it (free, always
   available). No water source = thirst rises. (Gives the restoration spine a
   care payoff — a reason to fix the dock beyond capacity.)
3. **Hunger & thirst meters** per cat. Rise over time, fall when the cat eats
   / drinks. High hunger or thirst → mood down, output down, a visible "needs
   something" state.
4. **Health bar & sickness.** Sustained hunger/thirst → a chance the cat gets
   sick. Sick = health bar drops, output near zero, a sick visual + sound.
   **Buy medicine** (shells, a real sink) → treat → recovers over time.
5. **The leave condition.** A cat that's been sick + untreated, or starving,
   for long enough (days, with clear warnings) → it leaves the cove. Kept in
   the Catdex; a Moments entry; recoverable only by re-coaxing that coat, not
   that individual. This is the fail state — telegraph it hard.

## Bucket 4 — inventory / decor management

- **An inventory.** "Pack away everything" → all placed decor + comforts +
  stations go into an inventory. Re-place them manually one at a time (drag /
  tap-to-place). Lets a player redecorate from scratch. Extends the existing
  per-item "remove" (which already refunds 40%) into a full store-and-replace
  system with no refund penalty — it's *yours*, you're just moving it.

## Bucket 5 — cosmetic monetization

- **Premium decor with effects.** A premium shop tab (hard currency or direct
  IAP). Items: **glowing collar** (soft pulsing light on the cat), **rainbow
  back-trail** (a rainbow arc + particle effect that follows the cat),
  **little wings** (animated flutter). Each is a `drawAccessory` extension +
  an effect layer in the render loop. **Mock the effects first** (per the
  standing preview-before-build preference) — glow / rainbow / wings are
  judgment calls on how much sparkle fits the tone.
- Needs: a hard-currency or IAP structure beyond the single $4.99 pack; a
  premium shop surface; "owned" tracking that survives reinstall (ties into
  the not-yet-built cloud save).

## Bucket 6 — polish

- **Loading-screen cats.** A row of cats lining up and jumping in a wave (like
  a stadium wave). Replaces / augments the current title screen. Mock it
  first.

## Proposed build order

Bucket 1 → Bucket 2 → Bucket 3 (steps 1–5 in order) → Bucket 4 → Bucket 6
→ Bucket 5. Care layer before monetization: the cosmetic shop only makes
sense once the game around it is the v3 game.

## Decisions log

- **2026-09-06** — Renumbered v2 (see memory / README). Opened this rethink.
- **2026-09-06** — Direction locked: additive to V2, calm rule dropped,
  neglect can cost you a cat (it leaves; no death), cosmetic monetization in,
  ~50% economy cut, accept/deny arrivals. Feature backlog above. Building
  starts with Bucket 1.

## Build progress (2026-09-06)

- [x] **Pond bug** (`5d…` / commit "Fix cats walking through / sleeping in
  the pond") — water is a hard per-frame pop-out for every state now.
- [x] **Economy −50%** — passive rate 0.55→0.28, goalShells halved, Catdex
  pearls halved, check-in / fishing / adventure payouts halved.
- [x] **Accept / deny arrivals** — ambient free-arrival timer shows a card
  (portrait, name, coat, trait) with Welcome / Not right now. Coax + scripted
  + offline arrivals still auto-join.
- [x] **Care layer** — food store + refill, per-cat hunger/thirst, drinking
  at any pond, sickness + medicine, the ~40h leave clock, offline handling,
  HUD 🍚 stat. Tuned so a stocked cove + a pond is a light background task.
- [ ] Autumn / seasonal effect — **blocked on the user** (renders fine here;
  need specifics on what's wrong).
- [ ] Decor cat-preview — **blocked on the user** (need to know exactly what
  "show the selected cat picture" means).
- [ ] Inventory (pack away / re-place all decor).
- [ ] Loading-screen cat wave (mock first).
- [ ] Premium cosmetic decor — glowing collar / rainbow trail / wings (mock
  the effects first). Needs a hard-currency / IAP surface.

## Decisions log

_(to be filled in as we work through the above)_
