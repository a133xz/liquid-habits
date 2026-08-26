import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Softens the LH monogram: same geometry as the original favicon,
 * drawn as overlapping rounded cells on a soft charcoal field.
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
const rx = 14;
const overlap = 12;

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

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}">
  <rect width="100%" height="100%" fill="#121212"/>
  <g fill="#EDEDED">
    ${rects.join("\n    ")}
  </g>
</svg>`;

const faviconPath = join(publicDir, "favicon.png");
await sharp(Buffer.from(svg)).png().toFile(faviconPath);
console.log("Wrote favicon.png");

for (const { size, out } of [
  { size: 192, out: "pwa-192x192.png" },
  { size: 512, out: "pwa-512x512.png" },
]) {
  const dest = join(publicDir, out);
  await sharp(faviconPath).resize(size, size, { fit: "cover" }).png().toFile(dest);
  console.log(`Wrote ${out} (${size}×${size})`);
}
