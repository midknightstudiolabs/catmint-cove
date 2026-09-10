// Assembles www/ — the web payload Capacitor bundles into the native app.
// Everything the game needs at runtime, plus a small native bridge, copied from
// the same index.html that ships to GitHub Pages (one source of truth).
import { readFile, writeFile, rm, mkdir, cp, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const www = join(root, "www");

const exists = async (p) => { try { await stat(p); return true; } catch { return false; } };

await rm(www, { recursive: true, force: true });
await mkdir(www, { recursive: true });

// 1. index.html — inject the native bridge immediately before the game's own
//    <script> so window.CoveNative is set up before the game boots
let html = await readFile(join(root, "index.html"), "utf8");
const marker = /<script>\s*\(\(\)\s*=>\s*\{/;   // the game IIFE: `<script>\n(() => {`
if (!marker.test(html)) throw new Error("build-www: could not find the game <script> to inject the bridge before");

// iOS WKWebView won't fetch() a bundled capacitor:// asset, so the festival
// music never loads on device. But <script src> uses the resource loader, not
// fetch — so ship the clips as base64 in their own fest-audio-data.js and load
// it before the game. The web index.html has no such file → fetch() path.
const festAudio = ["fest-bed-hub.mp3", "fest-bed-race.mp3", "fest-bed-volley.mp3", "fest-bed-tug.mp3", "fest-bed-cafe.mp3", "fest-win.mp3"];
const fa = {};
for (const f of festAudio) {
  if (await exists(join(root, f))) fa[f] = "data:audio/mpeg;base64," + (await readFile(join(root, f))).toString("base64");
}
await writeFile(join(www, "fest-audio-data.js"), "window.__FEST_AUDIO_DATA = " + JSON.stringify(fa) + ";\n");

html = html.replace(marker, '<script src="capacitor-bridge.js"></script>\n<script src="fest-audio-data.js"></script>\n$&');
await writeFile(join(www, "index.html"), html);

// 2. runtime assets the game fetch()es by relative path
for (const asset of ["rain-loop.opus", "fest-bed-hub.mp3", "fest-bed-race.mp3", "fest-bed-volley.mp3", "fest-bed-tug.mp3", "fest-bed-cafe.mp3", "fest-win.mp3", "sfx"]) {
  if (await exists(join(root, asset))) await cp(join(root, asset), join(www, asset), { recursive: true });
}

// 3. the native bridge
await cp(join(root, "scripts", "capacitor-bridge.js"), join(www, "capacitor-bridge.js"));

console.log("built www/ from index.html + assets");
