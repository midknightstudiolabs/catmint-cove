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
html = html.replace(marker, '<script src="capacitor-bridge.js"></script>\n$&');
await writeFile(join(www, "index.html"), html);

// 2. runtime assets the game fetch()es by relative path
for (const asset of ["rain-loop.opus", "sfx"]) {
  if (await exists(join(root, asset))) await cp(join(root, asset), join(www, asset), { recursive: true });
}

// 3. the native bridge
await cp(join(root, "scripts", "capacitor-bridge.js"), join(www, "capacitor-bridge.js"));

console.log("built www/ from index.html + assets");
