import sharp from "sharp";
import { resolve } from "path";

const SOURCE = resolve("public/bd-site-icon-v2.png");
const OUT_192 = resolve("public/icon-192.png");
const OUT_512 = resolve("public/icon-512.png");

async function main() {
  await sharp(SOURCE).resize(192, 192, { fit: "contain", background: { r: 10, g: 15, b: 10 } }).png().toFile(OUT_192);
  console.log("Created public/icon-192.png");

  await sharp(SOURCE).resize(512, 512, { fit: "contain", background: { r: 10, g: 15, b: 10 } }).png().toFile(OUT_512);
  console.log("Created public/icon-512.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
