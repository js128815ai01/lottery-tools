import { cp, mkdir, copyFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const serverDir = join(dist, "server");

const rootFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "robots.txt",
  "sitemap.xml",
  ".nojekyll",
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await mkdir(serverDir, { recursive: true });

for (const file of rootFiles) {
  const source = join(root, file);
  if (existsSync(source)) {
    await copyFile(source, join(dist, file));
  }
}

const assets = join(root, "assets");
if (existsSync(assets)) {
  await cp(assets, join(dist, "assets"), { recursive: true });
}

const openaiConfig = join(root, ".openai");
if (existsSync(openaiConfig)) {
  await cp(openaiConfig, join(dist, ".openai"), { recursive: true });
}

await writeFile(
  join(serverDir, "index.js"),
  `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    if (pathname.endsWith("/")) pathname += "index.html";
    const assetUrl = new URL(pathname, url.origin);
    return env.ASSETS.fetch(new Request(assetUrl, request));
  }
};
`
);
