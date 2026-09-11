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

## Sleep rain — September 12, 2026

Replaced `rain-loop.mp3` using the supplied Rain V1 recording. Selected a steadier 96-second section beginning at 13:15, made a 90-second cyclic master with a six-second equal-power overlap, and encoded stereo MP3 at 44.1 kHz / 192 kbps. Release file is approximately 2.2 MB; decoded Web Audio memory is about 32–35 MB depending on device sample rate. The original 48-minute file was not uploaded or modified.

Encoded analysis: average approximately -28.3 dBFS, peak -5.6 dBFS, no clipping or decode errors. Chrome decoded exactly 90 seconds in stereo and played the actual recording with looping enabled. The seam is blended in the asset, with the game's existing gentle entry/exit fades retained. Thunder remains optional and defaults off.

Loading now shares a single in-flight request, times out stalled network fetches, ignores results from replaced audio contexts, and exposes Retry rain when the recording fails. Begin resumes audio within its tap handler for iOS. Existing interruption recovery and native base64 asset loading remain intact. Stale thunder callbacks are cancelled when a rest session is replaced.

Run `node scripts/check-rain.mjs` for loader lifecycle tests. The separate local Neo native payload was rebuilt and its embedded/copy audio bytes verified against this MP3. This is not an App Store submission or an on-device iOS certification. Safari/WKWebView may suspend Web Audio when the screen locks or the app backgrounds; uninterrupted screen-locked sleep playback still requires device testing and potentially native background-audio support.

### Calmer rain mix
Softened the upper-mid drop transients and high-frequency hiss, removed low rumble, applied gentle compression and reduced overall level. Approximate encoded average -33 dBFS and peak -14 dBFS. Processing uses the middle repeat of a cyclic master so filter/compressor startup does not create a loop-boundary artifact. The 90-second stereo loop, 192 kbps MP3 and native embedding remain unchanged; a rain-specific URL revision refreshes browser caches.

### Mountain-aware sky lighting
Sun, moon and stars clip against the painted mountain silhouette using the same image coordinates in Cove, festival scenes and photos. Dawn/dusk have a gentle peach/gold horizon gradient. Night darkens smoothly toward the moon's apex with a cool moon halo and subtle water highlights. The arc stays low enough to keep its apex visible through the game camera. Tested dawn, dusk and midnight lighting locally; geometry and timing checks are in check-theme.mjs.
