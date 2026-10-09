// Makes a blank certificate background from a filled-in template PDF (Canva export + typed fields):
// the certificate picture is copied as it is (same print colours, CMYK), without any of the typed text.
//   node scripts/make-background.mjs <template.pdf> <background.pdf>      (run `npm run build` first)
// Templates and backgrounds carry the signature and seal: keep them in private/ (never committed).
import { readFileSync, writeFileSync } from "node:fs";
import { backgroundFromTemplate } from "../dist/index.js";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node scripts/make-background.mjs <template.pdf> <background.pdf>");
  process.exit(1);
}
writeFileSync(output, await backgroundFromTemplate(readFileSync(input)));
console.log(`${output} written`);
