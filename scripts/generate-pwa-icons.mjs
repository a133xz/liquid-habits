import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const src = join(publicDir, "favicon.png");

if (!existsSync(src)) {
  console.error(`Missing source file: ${src}`);
  process.exit(1);
}

const sizes = [
  { size: 192, out: "pwa-192x192.png" },
  { size: 512, out: "pwa-512x512.png" },
];

for (const { size, out } of sizes) {
  const dest = join(publicDir, out);
  await sharp(src)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(dest);
  console.log(`Wrote ${out} (${size}×${size})`);
}
