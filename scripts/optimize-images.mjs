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
const IMAGES_DIR = join(__dirname, "../src/content/blog/images");
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

async function main() {
  const files = await readdir(IMAGES_DIR);
  console.log(`Optimizez ${files.length} fișiere din ${IMAGES_DIR}\n`);

  for (const file of files) {
    await optimizeImage(join(IMAGES_DIR, file));
  }

  console.log("\nGata.");
}

main().catch(console.error);
