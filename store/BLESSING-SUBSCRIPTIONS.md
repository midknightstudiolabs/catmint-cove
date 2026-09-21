# Midknight's Blessing: store copy (weekly and monthly)

Ready-to-paste text for App Store Connect, Google Play and RevenueCat. Character counts are in brackets and match each store's limits.

Product IDs (must match the game exactly):
- `midknight_blessing_weekly`
- `midknight_blessing_monthly`

Prices shown in the game as placeholders: **$1.99 weekly, $4.99 monthly**. The stores' real prices win; set them to match.

What the Blessing includes (keep copy consistent with this): Harvest all, Feed all, auto-gather, auto-replant, Tend everything, a new moonlit decor piece each month (the Guardian statue and the Moonlight Swing so far, which real cats use), and Moonlight Wings for any cat. **No Shell bonus.** The whole game stays fully playable without it.

---

## 1. iOS: App Store Connect (Monetization → Subscriptions)

### Subscription group

| Field | Value |
|---|---|
| Group reference name | `Midknight's Blessing` |
| Group display name (localized) | `Midknight’s Blessing` |

### Subscriptions

| Field | Weekly | Monthly |
|---|---|---|
| Reference name | `Blessing Weekly` | `Blessing Monthly` |
| Product ID | `midknight_blessing_weekly` | `midknight_blessing_monthly` |
| Duration | 1 week | 1 month |
| Display name (30 max) | `Midknight’s Blessing · Weekly` [29] | `Midknight’s Blessing · Monthly` [30] |
| Description (45 max) | `One-tap tending for your cove, weekly.` [38] | `One-tap tending and a new decor each month.` [43] |

### Review notes (paste for both)

```
Midknight's Blessing is an optional auto-renewing subscription that adds convenience features to Catmint Cove: Harvest all, Feed all, auto-gather, auto-replant and Tend everything, plus a new decor piece each month. It never gates progress or content; the whole game is playable without it. To find it: Cove > Cove Garden (or Catmint Cafe) > tap the Blessing prompt.
```

Needed: a review screenshot of the Blessing offer screen. Apple also wants the auto-renewal terms in the app's App Store description or EULA. The in-game offer screen already shows renewal terms and a Restore button.

---

## 2. Google Play: Monetize → Subscriptions

Create two subscriptions, each with one auto-renewing base plan.

| Field | Weekly | Monthly |
|---|---|---|
| Product ID | `midknight_blessing_weekly` | `midknight_blessing_monthly` |
| Name (55 max) | `Midknight’s Blessing (Weekly)` | `Midknight’s Blessing (Monthly)` |
| Base plan billing period | Weekly | Monthly |
| Description (80 max) | `Convenience perks for your cove. Everything stays fully playable without it.` [76] | same |

### Benefits (40 max each; same for both)

1. `Harvest all and Feed all in one tap` [35]
2. `Shells gather and crops replant for you` [39]
3. `Tend everything in your cove at once` [36]
4. `New moonlit decor each month` [28]

Play products can take a while to activate after creation.

---

## 3. RevenueCat

- **Products:** add both product IDs exactly as above, with the store app linked for each.
- **Product display names:** `Midknight’s Blessing · Weekly` and `Midknight’s Blessing · Monthly`.
- **Entitlement (optional):** `midknight_blessing`, with both products attached. The game currently reads active subscriptions directly, so this is not required.
- **Offering:** weekly product in a `$rc_weekly` package, monthly in `$rc_monthly`, in your current offering.
- **Offering description:** `Optional convenience subscription. Cancel any time in your store settings.`

---

## Checklist

- [x] App Store Connect: group, both subscriptions, prices, localization, review notes (2026-09-21). Still needed: review screenshot on each subscription; first subscription must ship with a new app version.
- [x] Google Play: both subscriptions and base plans, benefits, activated (2026-09-21)
- [x] RevenueCat: Play + iOS products imported, entitlement `midknight_blessing`, `$rc_weekly` / `$rc_monthly` in the `default` offering (2026-09-21)
- [ ] Store listings: auto-renewal terms present (Apple description or EULA)
- [ ] App Store privacy labels updated for Friends data (separate from the subscriptions)

## Optional wording update (2026-09-22): mention the wings
The store text that is live today ("a new moonlit decor each month") is still true. To mention the wings, use:
- Apple description (45 max): `One-tap tending, moonlit decor and wings.` [40]
- Play benefit 4 (40 max): `Moonlit decor and wings each month` [34]  (Play allows 4 benefits, so this replaces "New moonlit decor each month")
- RevenueCat needs no change.
