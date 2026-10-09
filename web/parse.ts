// Reads the participant list: a plain list of names, or rows copied from the master register
// (Serial · Certificate No. · Name · Location · Course · Date), from a paste, a CSV or an Excel file.

export interface Entry {
  name: string;
  certNo?: string; // register rows keep their number
  location?: string;
  date?: string; // YYYY-MM-DD
}

export interface Parsed {
  entries: Entry[];
  numbered: number; // how many came with their own certificate number
}

const CERT = /^FAT-[A-Z]+\/(\d{1,2})-(\d{1,2})-(\d{4})\/\d+$/i;
const HEADER = /^(s\.?\s*no\.?|sr\.?\s*no\.?|serial|name|names|participant|participants|full name|cert(ificate)?\s*no\.?|location|course|date)$/i;

const tidy = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();
const ymd = (d: string, m: string, y: string) => `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

/** "24-07-2026", "24/07/2026", "2026-07-24" → "2026-07-24". */
function dateOf(v: string): string | undefined {
  const dmy = v.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) return ymd(dmy[1], dmy[2], dmy[3]);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
}

const hasLetters = (v: string) => /\p{L}/u.test(v);

export function parseRows(rows: unknown[][]): Parsed {
  const entries: Entry[] = [];
  let numbered = 0;
  for (const raw of rows) {
    const cells = raw.map(tidy);
    if (!cells.some(Boolean) || cells.every((c) => !c || HEADER.test(c))) continue;
    const at = cells.findIndex((c) => CERT.test(c));
    if (at >= 0) {
      // A register row: the number, then the name and location after it; the date from the number itself.
      const [, d, m, y] = cells[at].match(CERT)!;
      const rest = cells.slice(at + 1).filter(Boolean);
      const name = rest.find(hasLetters) ?? "";
      const location = rest.slice(rest.indexOf(name) + 1).find((c) => hasLetters(c) && !dateOf(c));
      entries.push({ name, certNo: cells[at].toUpperCase(), location, date: rest.map(dateOf).find(Boolean) ?? ymd(d, m, y) });
      numbered++;
    } else {
      // Just names: the first cell with letters in it (a serial or count before it is skipped).
      const name = cells.find(hasLetters);
      if (name) entries.push({ name });
    }
  }
  return { entries, numbered };
}

/** Pasted text: tab-separated when copied from a sheet, otherwise one name per line. */
export const parseText = (text: string): Parsed =>
  parseRows(text.split(/\r?\n/).map((line) => (line.includes("\t") ? line.split("\t") : [line])));

/** CSV with quoted cells. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') (cell += '"', i++);
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") (row.push(cell), (cell = ""));
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell), rows.push(row), (row = []), (cell = "");
    } else cell += ch;
  }
  if (cell || row.length) (row.push(cell), rows.push(row));
  return rows;
}

/** An Excel workbook (first sheet), a CSV or a text file → rows, then the same reading as a paste. */
export async function parseFile(file: File): Promise<Parsed> {
  const lower = file.name.toLowerCase();
  if (/\.(xlsx|xlsm|xls|ods)$/.test(lower)) {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, dateNF: "dd-mm-yyyy", blankrows: false });
    return parseRows(rows);
  }
  const text = await file.text();
  return lower.endsWith(".csv") ? parseRows(parseCsv(text)) : parseText(text);
}

/** Rows back out, tab-separated, in the register's column order — the course column left empty. */
export const registerRows = (rows: { serial: string; certNo: string; name: string; location: string; date: string }[]) =>
  rows.map((r) => [r.serial, r.certNo, r.name, r.location, "", r.date].join("\t")).join("\n");
