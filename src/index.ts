import { PDFDocument, type PDFEmbeddedPage, type PDFFont, type PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { FONTS_BASE64 } from "./fonts.js";
import { DESIGN, LAYOUT, type FieldLayout } from "./layout.js";

export { DESIGN, LAYOUT } from "./layout.js";
export type { FieldLayout } from "./layout.js";
export { backgroundFromTemplate } from "./background.js";

/** One person's certificate, as printed. */
export interface Certificate {
  certNo: string; // e.g. FAT-OD/06-10-2026/2077 — see certificateNumber()
  name: string; // the participant
  location: string; // "course conducted at": the training's alias, or the customer's name
  date: string; // as printed, e.g. 06/10/2026 — see printedDate()
}

export interface GenerateOptions {
  /** The blank certificate design: a one-page PDF with no name, date, number or location on it (A5 landscape). */
  background: Uint8Array | ArrayBuffer;
  certificates: Certificate[];
}

/** How a certificate will come out: what can't be printed, and how far long text had to shrink (1 = full size). */
export interface CertificateCheck {
  problems: string[];
  nameScale: number;
  locationScale: number;
}

type Field = keyof Certificate;
const FIELDS: Field[] = ["date", "certNo", "name", "location"];
const FIELD_LABEL: Record<Field, string> = { date: "date", certNo: "certificate no.", name: "name", location: "location" };

// A4 portrait, in points; two A5 landscape certificates per page, one above the other.
const A4 = { width: 595.28, height: 841.89 };
const HALF = A4.height / 2;

/** "2026-10-06" (or a Date) → "06-10-2026" / "06/10/2026". */
function dmy(d: string | Date, sep: string): string {
  const ymd = typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10);
  const [y, m, day] = ymd.split("-");
  if (!y || !m || !day) throw new Error(`Not a date: ${String(d)}`);
  return [day, m, y].join(sep);
}

/** The date as printed after "Training Date:" — 06/10/2026. */
export const printedDate = (date: string | Date) => dmy(date, "/");

/** FAT-OD/<training date>/<serial in the master sheet> — e.g. FAT-OD/06-10-2026/2077. */
export const certificateNumber = (date: string | Date, serial: number) => `FAT-OD/${dmy(date, "-")}/${serial}`;

const fromBase64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const clean = (text: string) => text.trim().replace(/\s+/g, " ");

type Fonts = Record<FieldLayout["font"], PDFFont>;

async function embedFonts(pdf: PDFDocument): Promise<Fonts> {
  pdf.registerFontkit(fontkit);
  return {
    name: await pdf.embedFont(fromBase64(FONTS_BASE64.name), { subset: true }),
    location: await pdf.embedFont(fromBase64(FONTS_BASE64.location), { subset: true }),
    label: await pdf.embedFont(fromBase64(FONTS_BASE64.label), { subset: true }),
  };
}

/** Long text only gets a smaller font, so it always stays inside its space (and the border). */
const fitScale = (font: PDFFont, text: string, f: FieldLayout) => {
  const width = font.widthOfTextAtSize(text, f.size);
  return width > f.maxWidth ? f.maxWidth / width : 1;
};

function drawField(page: PDFPage, text: string, f: FieldLayout, font: PDFFont, oy: number, scale: number) {
  const value = clean(text);
  if (!value) return;
  const size = f.size * fitScale(font, value, f);
  const w = font.widthOfTextAtSize(value, size);
  const x = f.align === "center" ? f.x - w / 2 : f.x;
  page.drawText(value, { x: x * scale, y: oy + f.y * scale, size: size * scale, font, color: rgb(f.color[0] / 255, f.color[1] / 255, f.color[2] / 255) });
}

function drawCertificate(page: PDFPage, design: PDFEmbeddedPage, fonts: Fonts, c: Certificate, oy: number, width: number) {
  const scale = width / DESIGN.width;
  page.drawPage(design, { x: 0, y: oy, width, height: DESIGN.height * scale });
  for (const k of FIELDS) drawField(page, c[k], LAYOUT[k], fonts[LAYOUT[k].font], oy, scale);
}

/** Characters a font can't draw (e.g. a name typed in another script) — reported instead of a broken certificate. */
function check(fonts: Fonts, c: Certificate): CertificateCheck {
  const problems: string[] = [];
  for (const k of FIELDS) {
    const font = fonts[LAYOUT[k].font];
    const chars = font.getCharacterSet();
    const bad = [...new Set([...c[k]])].filter((ch) => ch.trim() && !chars.includes(ch.codePointAt(0)!));
    if (bad.length) problems.push(`The ${FIELD_LABEL[k]} "${clean(c[k])}" has letters the certificate font can't print. Type it in English letters`);
    if (!clean(c[k])) problems.push(`No ${FIELD_LABEL[k]}`);
  }
  return {
    problems,
    nameScale: fitScale(fonts.name, clean(c.name), LAYOUT.name),
    locationScale: fitScale(fonts.location, clean(c.location), LAYOUT.location),
  };
}

/** Checks certificates before printing: missing fields, characters the fonts can't draw, how much long text shrinks. */
export async function createChecker(): Promise<(c: Certificate) => CertificateCheck> {
  const fonts = await embedFonts(await PDFDocument.create());
  return (c) => check(fonts, c);
}

/** One certificate on its own page (A5 landscape) — for previews. */
export async function renderCertificate(background: Uint8Array | ArrayBuffer, certificate: Certificate): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fonts = await embedFonts(pdf);
  const [design] = await pdf.embedPdf(background, [0]);
  const page = pdf.addPage([DESIGN.width, DESIGN.height]);
  drawCertificate(page, design, fonts, certificate, 0, DESIGN.width);
  return pdf.save();
}

/**
 * One PDF with every certificate: A4 pages, two A5 certificates each (top and bottom, with a light cut line between);
 * an odd last one leaves the bottom half blank. Print at actual size.
 */
export async function generateCertificates({ background, certificates }: GenerateOptions): Promise<Uint8Array> {
  if (!certificates.length) throw new Error("No certificates to generate.");
  const pdf = await PDFDocument.create();
  pdf.setTitle("Certificates");
  pdf.setCreator("certificate-generator");
  const fonts = await embedFonts(pdf);

  const problems = certificates.flatMap((c, i) => check(fonts, c).problems.map((p) => `#${i + 1} ${clean(c.name) || "(no name)"}: ${p}`));
  if (problems.length) throw new Error(`Some certificates can't be printed:\n${problems.join("\n")}`);

  const [design] = await pdf.embedPdf(background, [0]);
  // Fill the page width; the design is A5 landscape (within a fraction of a point), centred in its half.
  const h = DESIGN.height * (A4.width / DESIGN.width);
  for (let i = 0; i < certificates.length; i += 2) {
    const page = pdf.addPage([A4.width, A4.height]);
    certificates.slice(i, i + 2).forEach((c, j) => drawCertificate(page, design, fonts, c, (j === 0 ? HALF : 0) + (HALF - h) / 2, A4.width));
    page.drawLine({ start: { x: 0, y: HALF }, end: { x: A4.width, y: HALF }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7), dashArray: [3, 3] });
  }
  return pdf.save();
}
