import { cp, mkdir, copyFile, readFile, readdir, rm, writeFile } from "node:fs/promises";
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
  "ads.txt",
  ".nojekyll",
];

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml; charset=utf-8",
};

function extensionOf(pathname) {
  const index = pathname.lastIndexOf(".");
  return index >= 0 ? pathname.slice(index).toLowerCase() : "";
}

async function collectFiles(folder, prefix = "") {
  if (!existsSync(folder)) return [];
  const entries = await readdir(folder, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const source = join(folder, entry.name);
    const publicPath = `${prefix}/${entry.name}`.replace(/\\/g, "/");
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(source, publicPath)));
    } else {
      files.push({ source, publicPath });
    }
  }

  return files;
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await mkdir(serverDir, { recursive: true });

for (const file of rootFiles) {
  const source = join(root, file);
  if (existsSync(source)) {
    await copyFile(source, join(dist, file));
  }
}

const assetsPath = join(root, "assets");
if (existsSync(assetsPath)) {
  await cp(assetsPath, join(dist, "assets"), { recursive: true });
}

const openaiConfig = join(root, ".openai");
if (existsSync(openaiConfig)) {
  await cp(openaiConfig, join(dist, ".openai"), { recursive: true });
}

const embeddedFiles = [];
for (const file of rootFiles) {
  const source = join(root, file);
  if (existsSync(source) && file !== ".nojekyll") {
    embeddedFiles.push({ source, publicPath: `/${file}` });
  }
}
embeddedFiles.push(...(await collectFiles(assetsPath, "/assets")));

const embeddedAssets = {};
for (const file of embeddedFiles) {
  const body = await readFile(file.source);
  embeddedAssets[file.publicPath] = {
    body: body.toString("base64"),
    contentType: contentTypes[extensionOf(file.publicPath)] || "application/octet-stream",
  };
}
embeddedAssets["/"] = embeddedAssets["/index.html"];

await writeFile(
  join(serverDir, "index.js"),
  `const assets = ${JSON.stringify(embeddedAssets)};

function responseFor(pathname) {
  const asset = assets[pathname] || assets[pathname.replace(/\\/$/, "/index.html")];
  if (!asset) {
    return new Response("Not found", { status: 404 });
  }
  const bytes = Uint8Array.from(atob(asset.body), (char) => char.charCodeAt(0));
  return new Response(bytes, {
    headers: {
      "content-type": asset.contentType,
      "cache-control": pathname === "/" || pathname.endsWith(".html") ? "no-cache" : "public, max-age=3600"
    }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    return responseFor(url.pathname);
  }
};
`
);
