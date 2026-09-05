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

## The north star still holds

> "A cozy corner of the world where cats come to be looked after — and you
> slowly make it theirs."

Plus the calm rule: no fail state, no timer, time is weather, absence is
neutral, cats never leave, fun and compulsion aren't a tradeoff.

Nothing in the rethink should break this. If anything, V2's idle-retention kit
(streaks that reset, daily goals, a weekly event) sits in slight tension with
"absence is neutral" and is worth questioning.

## Four possible visions for V3

### A. Radical simplification — the cozy purist
Cut back toward Neko Atsume tightness: cats visit, you tend + photo + collect,
everything else goes (stations, adventures, festival, prestige, most of the
economy). Risk: gives up the depth that could differentiate it; competes
directly with an entrenched incumbent on its own turf.

### B. The relationship game *(recommended core)*
The game *is* your deepening relationship with specific cats. Strip the
idle-number spine and the RPG-adventure scaffolding. Keep the cove, the cats,
day/night, the return-visit story engine, and photo. Build **individual-cat
relationships done really well**: the cat remembers shared history, references
it, has moods and preferences you learn over weeks, gives you things that mean
something. Progression = knowing your cats, not growing a number.
Risk: less-proven design, weaker obsessive-check-in hooks, a big cut of built
content.

### C. The living diary
Lean all the way into "the cove carries on without you." The game generates a
gentle ongoing story — WYWA, Moments, postcards, seasonal change — and you're
a caretaker checking in on a life that continues. Scrapbook / journal framing;
the artifact you build is a record, not a base. Pairs naturally with B.

### D. The restoration game
"Make it yours" as the literal spine. The cove is a weeks-long rebuilding
project (dock, bakery, garden, lighthouse…); cats are the population and the
reward, not the mechanic. A cozy, slow town-builder with cats.
Risk: shifts the emotional weight from cats to construction.

### E. Keep the scope, tighten the tissue
The systems are fine, they just don't talk to each other. V3 makes them one
coherent whole. Lowest disruption — but "re-examine the whole design" asks for
more than this.

## Recommendation

**A B + C hybrid: the relationship & living-diary game.** It's the version
that matches the stated soul, occupies market territory nobody owns, and turns
the *unbuilt* moat into the whole point instead of a bolt-on.

Concretely, V3 would:
- **Keep:** the cove + restoration spine (D as texture, not the whole game),
  cats + coats + traits, day/night + audio, the vignette/return-visit engine,
  Photo, Rest mode.
- **Deepen:** individual cats — memory, mood, preference, a relationship arc
  that plays out over real weeks; the cove as a record of that history.
- **Demote to optional texture:** adventures, festival, stations — they can
  exist, but nothing load-bearing depends on them.
- **Question hard:** streaks, daily goals, the prestige loop, the whole
  idle-number economy. If "absence is neutral" is real, most of these are
  fighting it.
- **Design the share loop in from the start:** every relationship beat should
  produce something a player *wants* to post.

## Open decisions for the user

1. **Which vision** (A / B / C / D / E / a different one)?
2. **How much of V2 is a hard reset vs. a refactor?** Willing to cut built
   systems, or is V3 additive on top of V2?
3. **Idle or not?** Keep passive shell/pearl income and number-go-up, or drop
   it for a relationship-only progression?
4. **Retention model** — if streaks/daily-goals go, what brings people back?
   (Candidate: the cats themselves generate reasons — a cat's been waiting to
   show you something, the cove changed, a story beat is ready.)
5. **Monetization** — ad-free + one IAP is thin. A cosmetic economy (cove
   decor, themes, cat outfits) can fund a cozy game without breaking calm.
   In scope for V3?
6. **Session shape** — short frequent check-ins (idle) vs. lingering visits
   (cozy) vs. leave-it-running ambient (Rest). Which is the intended default?

## Decisions log

_(to be filled in as we work through the above)_
