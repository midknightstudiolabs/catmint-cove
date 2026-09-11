# Catmint Cove Neo

Original Catmint Cove cats, animations and gameplay, with a soft illustrated coastal background.

## Play locally
Run `node serve.mjs`, then open http://127.0.0.1:8879/.

## Scenery
`art/scenery.js` changes only the Cove background. After editing it, run `node scripts/update-art.mjs` to update its embedded copy in `index.html`.

The background is `art/cove-2d.png`. Discarded painted scenery and experimental cat designs are not part of this build.

## Hosting
This folder is a static website. GitHub Pages can serve the main branch from the repository root once hosting is enabled. Saves stay in each browser and website origin; local preview saves are not automatically transferred.
