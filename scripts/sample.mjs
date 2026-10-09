// Sample certificates with made-up people, to check the layout:
//   node scripts/sample.mjs <background.pdf> <out.pdf>
import { readFileSync, writeFileSync } from "node:fs";
import { generateCertificates, certificateNumber, printedDate } from "../dist/index.js";

const [bg, out] = process.argv.slice(2);
if (!bg || !out) {
  console.error("Usage: node scripts/sample.mjs <background.pdf> <out.pdf>");
  process.exit(1);
}

const date = "2026-10-06";
const people = [
  ["Asha Rao", "Sample Hotels Pvt Ltd"],
  ["Venkataraghavan Subramaniam Iyer", "Sample Hotels Pvt Ltd"],
  ["Jo Li", "A Very Long Sample Company Name Private Limited - Andheri East Mumbai"],
  ["Maria D'Souza-Fernandes", "Sample Hotels Pvt Ltd"],
  ["Rohit Kumar", "Sample Hotels Pvt Ltd"],
];
const pdf = await generateCertificates({
  background: readFileSync(bg),
  certificates: people.map(([name, location], i) => ({ name, location, certNo: certificateNumber(date, 9001 + i), date: printedDate(date) })),
});
writeFileSync(out, pdf);
console.log(`${out}: ${people.length} certificates, ${Math.ceil(people.length / 2)} pages, ${(pdf.length / 1024).toFixed(0)} KB`);
