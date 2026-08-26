import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * LH monogram as overlapping rounded cells.
 * Phone icons get extra inset so the mark sits smaller and lighter
 * on the home screen; the favicon stays a bit tighter for the tab/header.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const ascii = `
.....######.#####....######.....
.....######.#####....######.....
.....##..##.#..##....##..##.....
.....##..##.#..##....##..##.....
.....##..##.#..##....##..##.....
.....##..##.#..##....##..##.....
.....##..##.#..##....##..##.....
.....##..##.#..##....##..##.....
.....##..##.#..########..##.....
.....##..##.#..########..##.....
.....##..##.#............##.....
.....##..##.#............##.....
.....##..##.#..########..##.....
.....##..####..########..##.....
.....##..####..##....##..##.....
.....##..........##..##..##.....
.....##..........##..##..##.....
.....########..####..##..##.....
.....########..####..##..##.....
...........##..##....##..##.....
...........######....######.....
...........######....######.....
`.trim().split("\n");

const padTop = 5;
const grid = 32;
const cell = 32;
const canvas = grid * cell;
const rx = 6;
const overlap = 2;

function markGroup() {
  const rects = [];
  for (let y = 0; y < ascii.length; y++) {
    for (let x = 0; x < ascii[y].length; x++) {
      if (ascii[y][x] !== "#") continue;
      const px = x * cell - overlap;
      const py = (y + padTop) * cell - overlap;
      const w = cell + overlap * 2;
      const h = cell + overlap * 2;
      rects.push(
        `<rect x="${px}" y="${py}" width="${w}" height="${h}" rx="${rx}" ry="${rx}"/>`,
      );
    }
  }
  return rects.join("\n    ");
}

function iconSvg(scale) {
  const offset = ((1 - scale) / 2) * canvas;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}">
  <rect width="100%" height="100%" fill="#121212"/>
  <g fill="#E6E6E6" transform="translate(${offset} ${offset}) scale(${scale})">
    ${markGroup()}
  </g>
</svg>`;
}

async function writePng(svg, dest, size) {
  await sharp(Buffer.from(svg)).resize(size, size, { fit: "cover" }).png().toFile(dest);
  console.log(`Wrote ${dest.split("/").pop()} (${size}×${size})`);
}

const faviconPath = join(publicDir, "favicon.png");
await writePng(iconSvg(0.86), faviconPath, canvas);

for (const { size, out } of [
  { size: 192, out: "pwa-192x192.png" },
  { size: 512, out: "pwa-512x512.png" },
]) {
  await writePng(iconSvg(0.62), join(publicDir, out), size);
}
