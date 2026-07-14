import { cp, mkdir, copyFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

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
