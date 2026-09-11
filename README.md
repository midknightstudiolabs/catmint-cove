# Catmint Cove Neo

Original Catmint Cove cats, animations and gameplay, with a soft illustrated coastal background.

## Play locally
Run `node serve.mjs`, then open http://127.0.0.1:8879/.

## Scenery
`art/scenery.js` changes only the Cove background. After editing it, run `node scripts/update-art.mjs` to update its embedded copy in `index.html`.

The background is `art/cove-2d.png`. Discarded painted scenery and experimental cat designs are not part of this build.

## Hosting
This folder is a static website. GitHub Pages can serve the main branch from the repository root once hosting is enabled. Saves stay in each browser and website origin; local preview saves are not automatically transferred.

## Soft Coastal Storybook update

The original cats, their animation code, saves, economy and activity rules are preserved.
Festival grounds, race, volleyball and Tug of Paws fields, cafe scenery and the indoor box room share the Cove palette. Active play areas use the quieter portion of the existing scenery image so painted corner rocks do not sit inside lanes. Menus use cream panels, sage selection states, readable locked-event descriptions, visible keyboard focus and larger touch controls.

The sun and full moon follow continuous projected circular arcs on the existing game clock, clipped at the painted horizon. This is a stylized twelve-hour day/night cycle, not a location-specific ephemeris. Celestial position is evaluated every frame instead of following the two-second color cache; moon rendering does not erase the background.

Raised decor and movable props now sort with cats by ground contact. Indoor and perched cats retain their furniture depth; working cats stay visible at their stations. Photo exports use the Cove art and corrected sky, with furniture/cat depth ordering.

Validation: `node scripts/check-theme.mjs` checks script syntax and sky continuity. Local visual checks covered Cove, festival selection, volleyball/tug/cafe scenery, shop, and a completed race, including a 390px phone viewport. Original cat rendering and animation section compared unchanged against the prior release. No device-wide FPS guarantee is implied; this update reuses one existing image and avoids per-frame asset generation. Test-only artwork review pages remain outside the published repository.
