# Product analytics — September 20, 2026

Private dashboard: https://catmint-cove-studio.carlosgotiong.workers.dev/

- Explicit opt-in under Help > About. Off by default and independent of Friends consent.
- Tracks completed in-game purchases: accessories, comforts, stations, decor/themes and upgrades. Shells and pearls remain separate; no cash revenue claim.
- Tracks starts/results for five Festival games and Little Matches; round identifiers prevent duplicated finishes.
- Tracks Help, Credits, About, Cares, Catdex, Journal, Shop tabs, Activities, Garden, Cafe and Rainy Retreat opens.
- Bounded queue, batched uploads, retries, no gameplay dependency on network. No names, saves, custom recipes, emails or cat identifiers in event payloads.
- Server sets account ownership; table access blocked to clients; private aggregate reporting only. 1,000 events/account/hour limit.
- Live dashboard filters period, platform and Neo/native channel. Friends report is explicitly unsegmented.
- No historical backfill. Existing native apps require a later coordinated release to send new events.

Validation: Node consent/retry/duplicate-finish tests; inline script syntax; cafe regression suite; native web asset build; live SQL dedup and aggregation fixture rolled back; anonymous/player report and raw-table access denied; Cloudflare signed-access tests; live dashboard aggregate fetch verified.

Limitations: client-reported trends, not audited revenue; reinstall creates a new analytics identity. No retention cohorts or FPS telemetry. Older mobile builds send no new product events.
