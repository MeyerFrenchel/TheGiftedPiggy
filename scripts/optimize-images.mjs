/**
 * Optimizează imaginile din src/content/blog/images/ în place.
 * Rulează: node scripts/optimize-images.mjs
 *
 * Ce face:
 *  - Redimensionează la max 1920px lățime (păstrează aspect ratio)
 *  - JPG → quality 82, progressive
 *  - PNG → quality 80, compresie maximă
 *  - Sare imaginile deja mici (sub 100KB) ca să nu piardă calitate
 */

import sharp from "sharp";
import { readdir, stat, rename, writeFile, unlink } from "fs/promises";

import { join, extname } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIRS = [
  join(__dirname, "../src/content/blog/images"),
  join(__dirname, "../src/content/products/images"),
  join(__dirname, "../src/assets/images"),
  join(__dirname, "../public"),
];
const MAX_WIDTH = 1920;
const SKIP_BELOW_KB = 100;

const extensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!extensions.has(ext)) return;

  const before = (await stat(filePath)).size;
  if (before < SKIP_BELOW_KB * 1024) {
    console.log(`  skip  ${path.basename(filePath)} (${kb(before)}KB — already small)`);
    return;
  }

  const img = sharp(filePath);
  const meta = await img.metadata();

  let pipeline = img;
  if (meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  if (ext === ".png") {
    pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
  } else if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: 82 });
  } else {
    pipeline = pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true });
  }

  // Scrie într-un buffer, apoi suprascrie fișierul original
  const buffer = await pipeline.toBuffer();
  const after = buffer.byteLength;

  if (after >= before) {
    console.log(`  skip  ${path.basename(filePath)} (${kb(before)}KB → ${kb(after)}KB — no gain)`);
    return;
  }

  const tmpPath = filePath + ".tmp";
  await writeFile(tmpPath, buffer);
  await unlink(filePath);
  await rename(tmpPath, filePath);
  const saved = ((before - after) / before * 100).toFixed(1);
  console.log(`  ✓     ${path.basename(filePath)}: ${kb(before)}KB → ${kb(after)}KB  (−${saved}%)`);
}

function kb(bytes) {
  return (bytes / 1024).toFixed(0);
}

async function processDir(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // directorul nu există
  }
  const imageFiles = entries.filter(
    (e) => e.isFile() && extensions.has(extname(e.name).toLowerCase())
  );
  if (imageFiles.length > 0) {
    console.log(`\n📁 ${dir}`);
    for (const entry of imageFiles) {
      await optimizeImage(join(dir, entry.name));
    }
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await processDir(join(dir, entry.name));
    }
  }
}

async function main() {
  for (const dir of IMAGES_DIRS) {
    await processDir(dir);
  }
  console.log("\nGata.");
}

main().catch(console.error);
