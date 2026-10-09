import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./style.css";
import {
  type Certificate, type CertificateCheck, backgroundFromTemplate, certificateNumber, createChecker, generateCertificates, printedDate, renderCertificate,
} from "../src/index.js";
import { type Template, listTemplates, prefs, removeTemplate, saveTemplate } from "./store";
import { type Entry, parseFile, parseText, registerRows } from "./parse";
import { drawPdf, thumbnail } from "./render";
import { icon } from "./icons";

/* ---------- state ---------- */

const HUES = ["#0A7A3F", "#1F5FBF", "#B4610A", "#6A4BB5"];

interface Item extends Certificate {
  key: string; // stable across edits of the list, for removing / restoring
  serial: string;
  numbered: boolean; // the number was given here (not taken from a register row)
  cancelled: boolean;
  check?: CertificateCheck;
  slot?: { sheet: number; top: boolean; index: number }; // where it prints, for active items
}

const state = {
  templates: [] as Template[],
  templateId: prefs.get<string | null>("template", null),
  entries: [] as Entry[],
  cancelled: new Set<string>(),
  location: prefs.get("location", ""),
  date: prefs.get("date", ""),
  serial: prefs.get("nextSerial", ""),
  selected: 0, // index among active items
  renaming: null as string | null,
  confirmRemove: null as string | null,
  working: "",
  message: null as null | { tone: "ok" | "error"; text: string },
};
let check: ((c: Certificate) => CertificateCheck) | null = null;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const template = () => state.templates.find((t) => t.id === state.templateId) ?? state.templates[0];
const keyOf = (e: Entry, i: number) => `${i}|${e.name}|${e.certNo ?? ""}`;

/** The batch as it will print: numbers given in order to the names that don't carry one, cancelled rows kept aside. */
function items(): Item[] {
  let next = /^\d+$/.test(state.serial.trim()) ? Number(state.serial.trim()) : NaN;
  let index = 0;
  return state.entries.map((e, i) => {
    const key = keyOf(e, i);
    const cancelled = state.cancelled.has(key);
    const date = e.date ?? state.date;
    let certNo = e.certNo ?? "";
    let serial = certNo.split("/").pop() ?? "";
    const numbered = !e.certNo;
    if (numbered && !cancelled && Number.isFinite(next) && date) {
      serial = String(next);
      certNo = certificateNumber(date, next++);
    }
    const item: Item = {
      key, serial, numbered, cancelled, certNo, name: e.name, location: e.location ?? state.location,
      date: date ? printedDate(date) : "",
    };
    if (!cancelled) {
      item.slot = { sheet: Math.floor(index / 2) + 1, top: index % 2 === 0, index };
      index++;
      if (check) {
        const c = check(item);
        const why = (p: string) =>
          p === "No certificate no." ? (numbered ? (date ? "Needs the first serial number (Batch)" : "Needs the training date (Batch)") : p)
          : p === "No date" ? "Needs the training date (Batch)"
          : p === "No location" ? "Needs the training location (Batch)" : p;
        item.check = { ...c, problems: [...new Set(c.problems.map(why))] };
      }
    }
    return item;
  });
}

/* ---------- rendering ---------- */

function renderStatic() {
  $("private").innerHTML = `${icon("lock")}<span>Nothing leaves this PC</span>`;
  $("add-template-label").innerHTML = `${icon("plus")}<span>Add template</span>`;
  $("open-list-label").innerHTML = `${icon("upload")}<span>Open file</span>`;
  $("copy").innerHTML = `${icon("copy")}<span>Copy rows for register</span>`;
  $("print").innerHTML = `${icon("printer")}<span>Print</span>`;
  $("download").innerHTML = `${icon("download")}<span>Download PDF</span>`;
  $<HTMLInputElement>("location").value = state.location;
  $<HTMLInputElement>("date").value = state.date;
  $<HTMLInputElement>("serial").value = state.serial;
}

function renderTemplates() {
  const box = $("templates");
  if (!state.templates.length) {
    box.innerHTML = `<p class="hint">No template on this PC yet. Add the certificate PDF exported from Canva.</p>`;
    return;
  }
  const current = template();
  box.innerHTML = state.templates.map((t) => {
    const on = t.id === current?.id;
    const hue = HUES[t.hue % HUES.length];
    const name = state.renaming === t.id
      ? `<input class="rename" data-rename="${t.id}" value="${esc(t.name)}" aria-label="Template name" />`
      : `<span class="t-name">${esc(t.name)}</span>`;
    const tools = on && state.renaming !== t.id
      ? state.confirmRemove === t.id
        ? `<span class="t-confirm">Remove from this PC? <button type="button" class="mini danger" data-remove-yes="${t.id}">Remove</button><button type="button" class="mini" data-remove-no>Keep</button></span>`
        : `<span class="t-tools"><button type="button" class="mini icon-only" data-rename-start="${t.id}" title="Rename">${icon("pencil")}<span class="sr">Rename</span></button><button type="button" class="mini icon-only" data-remove="${t.id}" title="Remove from this PC">${icon("trash")}<span class="sr">Remove</span></button></span>`
      : "";
    return `<div class="tab${on ? " on" : ""}" style="--hue:${hue}">
      <button type="button" role="radio" aria-checked="${on}" class="tab-pick" data-template="${t.id}">
        <img src="${t.thumb}" alt="" width="96" height="68" />
      </button>
      <div class="tab-text">${name}${tools}</div>
    </div>`;
  }).join("");
  box.querySelector<HTMLInputElement>("input.rename")?.select();
}

function renderBand(all: Item[]) {
  const active = all.filter((i) => !i.cancelled);
  const band = $("band");
  const sheets = Math.ceil(active.length / 2);
  $("counts").innerHTML = active.length
    ? `<b>${active.length}</b> certificate${active.length === 1 ? "" : "s"} · <b>${sheets}</b> A4 sheet${sheets === 1 ? "" : "s"}${active.length % 2 ? " · last bottom half blank" : ""}`
    : "No certificates yet";
  if (!active.length) {
    band.innerHTML = Array.from({ length: 6 }, () => `<div class="col ghost"><span></span><span></span></div>`).join("");
    return;
  }
  const cell = (it: Item | undefined, sheet: number, top: boolean) => {
    if (!it) return `<span class="cell blank" title="Sheet ${sheet}, bottom: left blank"></span>`;
    const tone = it.check?.problems.length ? " bad" : (sheet + (top ? 0 : 1)) % 2 ? " yellow" : " green";
    const scale = it.check && !it.check.problems.length ? it.check.nameScale : 1;
    const shrunk = scale < 0.995 ? ` · name printed at ${Math.round(scale * 100)}% size` : "";
    const sel = it.slot!.index === state.selected;
    return `<button type="button" role="option" aria-selected="${sel}" class="cell${tone}${shrunk ? " shrunk" : ""}${sel ? " sel" : ""}" data-select="${it.slot!.index}" title="Sheet ${sheet}, ${top ? "top" : "bottom"} · ${esc(it.name)}${it.certNo ? ` · ${esc(it.certNo)}` : ""}${shrunk}" aria-label="Sheet ${sheet}, ${top ? "top" : "bottom"}: ${esc(it.name)}${shrunk}">${it.check?.problems.length ? icon("alert", "icon xs") : `<span class="num">${esc(it.serial.slice(-4))}</span>`}</button>`;
  };
  band.innerHTML = Array.from({ length: sheets }, (_, s) => {
    const top = active[s * 2], bottom = active[s * 2 + 1];
    return `<div class="col"><span class="sheet-no num">${s + 1}</span>${cell(top, s + 1, true)}${cell(bottom, s + 1, false)}</div>`;
  }).join("");
}

function renderRows(all: Item[]) {
  const body = $("rows");
  if (!all.length) {
    body.innerHTML = `<tr class="none"><td colspan="4">Paste the participants on the left: one name per line, or rows copied from the register. Each one shows up here, numbered, with where it prints.</td></tr>`;
    return;
  }
  body.innerHTML = all.map((it) => {
    if (it.cancelled) {
      return `<tr class="cancelled"><td class="num">—</td><td class="num"></td><td><s>${esc(it.name)}</s> <span class="tag">Removed</span></td>
        <td class="end"><button type="button" class="mini icon-only" data-restore="${esc(it.key)}" title="Restore">${icon("undo")}<span class="sr">Restore ${esc(it.name)}</span></button></td></tr>`;
    }
    const sel = it.slot!.index === state.selected;
    const problems = it.check?.problems ?? [];
    const scale = it.check ? Math.min(it.check.nameScale, 1) : 1;
    const fit = problems.length
      ? `<span class="tag bad">${icon("alert", "icon xs")}${esc(problems[0])}</span>`
      : scale < 0.995 ? `<span class="tag shrink" title="Long name: printed smaller so it stays inside the border">${Math.round(scale * 100)}% size</span>` : "";
    return `<tr class="${sel ? "sel" : ""}${problems.length ? " bad" : ""}" data-select="${it.slot!.index}">
      <td class="num">${it.slot!.sheet}<span class="side">${it.slot!.top ? "top" : "bottom"}</span></td>
      <td class="num" title="${esc(it.certNo)}">${esc(it.serial || "—")}</td>
      <td><span class="p-name">${esc(it.name)}</span>${fit ? `<span class="p-fit">${fit}</span>` : ""}</td>
      <td class="end"><button type="button" class="mini icon-only" data-cancel="${esc(it.key)}" title="Remove from this batch">${icon("x")}<span class="sr">Remove ${esc(it.name)}</span></button></td>
    </tr>`;
  }).join("");
  body.querySelector("tr.sel")?.scrollIntoView({ block: "nearest" });
}

function renderActions(all: Item[]) {
  const active = all.filter((i) => !i.cancelled);
  const bad = active.filter((i) => i.check?.problems.length);
  const ready = Boolean(template()) && active.length > 0 && !bad.length && !state.working;
  for (const id of ["download", "print"]) $<HTMLButtonElement>(id).disabled = !ready;
  $<HTMLButtonElement>("copy").disabled = !active.length || bad.length > 0 || Boolean(state.working);
  const status = $("status");
  status.className = "status";
  if (state.working) status.innerHTML = `<span class="spin" aria-hidden="true"></span>${esc(state.working)}`;
  else if (state.message) (status.className = `status ${state.message.tone}`, (status.innerHTML = `${icon(state.message.tone === "ok" ? "check" : "alert")}<span>${esc(state.message.text)}</span>`));
  else if (!template()) status.textContent = "Add a template to start.";
  else if (bad.length) (status.className = "status error", (status.innerHTML = `${icon("alert")}<span>${bad.length} certificate${bad.length === 1 ? "" : "s"} can't print yet: ${esc(bad[0].check!.problems[0])}${bad.length > 1 ? " (and more, see the list)" : ""}.</span>`));
  else if (active.length) {
    const last = [...active].reverse().find((i) => i.numbered);
    status.textContent = last ? `Numbers ${active.find((i) => i.numbered)!.serial}–${last.serial}. Check the first one against the register before printing.` : "Numbers come from the register rows you pasted.";
  } else status.textContent = "";
}

function renderHints(all: Item[]) {
  const fromRegister = state.entries.filter((e) => e.certNo).length;
  $("list-hint").textContent = state.entries.length
    ? `${state.entries.length} read${fromRegister ? ` · ${fromRegister} with their own number (from the register)` : ""}${state.cancelled.size ? ` · ${all.filter((i) => i.cancelled).length} removed` : ""}`
    : "Excel, CSV or a copy from the register all work.";
  $("batch-hint").textContent = state.entries.length && fromRegister === state.entries.length
    ? "Every row brought its own number, date and location; these fields are only used for plain names."
    : "Numbers count up from the first serial: FAT-OD/<training date>/<serial>.";
}

let lastPreview = "";
let previewRun = 0;
async function renderPreview(all: Item[]) {
  const t = template();
  const sheet = $("sheet");
  if (!t) {
    lastPreview = "";
    sheet.classList.add("empty-sheet");
    sheet.innerHTML = `<div class="drop-zone">
      <h3>Add your certificate design</h3>
      <p>Choose the PDF exported from Canva: a filled-in one is fine, the names typed on it are left out. It stays in this browser.</p>
      <label class="btn primary"><input type="file" accept="application/pdf,.pdf" class="sr" data-add-template />${icon("upload")}<span>Choose PDF</span></label>
      <p class="hint">Or drop it anywhere on this page.</p></div>`;
    $("caption").textContent = "";
    return;
  }
  if (sheet.classList.contains("empty-sheet")) {
    sheet.classList.remove("empty-sheet");
    sheet.innerHTML = `<canvas id="canvas" role="img" aria-label="Certificate preview"></canvas>`;
  }
  const active = all.filter((i) => !i.cancelled);
  const it = active[Math.min(state.selected, active.length - 1)];
  const sample: Certificate = {
    name: "Participant Name", location: state.location || "Training location",
    certNo: state.date && /^\d+$/.test(state.serial.trim()) ? certificateNumber(state.date, Number(state.serial.trim())) : "FAT-OD/DD-MM-YYYY/0000",
    date: state.date ? printedDate(state.date) : "DD/MM/YYYY",
  };
  const cert = it ?? sample;
  $("caption").innerHTML = it
    ? `<span class="num cap-no">${esc(it.certNo || "No number yet")} <span class="cap-where">· sheet ${it.slot!.sheet}, ${it.slot!.top ? "top" : "bottom"}</span></span><span class="cap-nav"><button type="button" class="mini icon-only" data-step="-1" title="Previous (←)" ${it.slot!.index === 0 ? "disabled" : ""}>${icon("left")}<span class="sr">Previous</span></button><span class="num">${it.slot!.index + 1} / ${active.length}</span><button type="button" class="mini icon-only" data-step="1" title="Next (→)" ${it.slot!.index === active.length - 1 ? "disabled" : ""}>${icon("right")}<span class="sr">Next</span></button></span>`
    : `<span>Example: paste names to see each certificate exactly as it prints.</span>`;
  const key = JSON.stringify([t.id, cert.name, cert.location, cert.certNo, cert.date]);
  if (key === lastPreview) return;
  lastPreview = key;
  const run = ++previewRun;
  try {
    const pdf = await renderCertificate(t.background, { ...cert, name: cert.name || " " });
    if (run !== previewRun) return;
    const canvas = $<HTMLCanvasElement>("canvas");
    await drawPdf(pdf, canvas, sheet.clientWidth || 640);
    canvas.setAttribute("aria-label", `Certificate preview: ${cert.name}, ${cert.certNo}`);
  } catch {
    /* text the fonts can't draw: the list already says why */
  }
}

function render() {
  const all = items();
  const activeCount = all.filter((i) => !i.cancelled).length;
  if (state.selected >= activeCount) state.selected = Math.max(0, activeCount - 1);
  renderTemplates();
  renderBand(all);
  renderRows(all);
  renderActions(all);
  renderHints(all);
  void renderPreview(all);
}

/* ---------- actions ---------- */

const say = (tone: "ok" | "error", text: string) => ((state.message = { tone, text }), render());

async function addTemplate(file: File) {
  state.working = "Reading the design…";
  state.message = null;
  render();
  try {
    const background = await backgroundFromTemplate(await file.arrayBuffer());
    const t: Template = {
      id: crypto.randomUUID(), name: file.name.replace(/\.pdf$/i, "").trim() || "Certificate",
      hue: state.templates.length, background, thumb: await thumbnail(background), addedAt: new Date().toISOString(),
    };
    await saveTemplate(t);
    state.templates.push(t);
    state.templateId = t.id;
    state.renaming = t.id; // name it now: the file name is rarely what Shreya calls it
    prefs.set("template", t.id);
    state.working = "";
    say("ok", `Added. Give it a short name, like the course it's for.`);
  } catch (e) {
    state.working = "";
    say("error", e instanceof Error ? e.message : "That PDF couldn't be read.");
  }
}

function setList(text: string) {
  const parsed = parseText(text);
  state.entries = parsed.entries;
  const keys = new Set(state.entries.map(keyOf));
  for (const k of state.cancelled) if (!keys.has(k)) state.cancelled.delete(k);
  state.message = null;
  render();
}

async function openList(file: File) {
  try {
    const parsed = await parseFile(file);
    const dmy = (d?: string) => (d ? d.split("-").reverse().join("-") : "");
    const text = parsed.entries.map((e) => (e.certNo ? [e.certNo, e.name, e.location ?? "", dmy(e.date)].join("\t") : e.name)).join("\n");
    $<HTMLTextAreaElement>("list").value = text;
    setList(text);
    if (!parsed.entries.length) say("error", `No names found in ${file.name}.`);
  } catch {
    say("error", `${file.name} couldn't be read. Copy the rows in the file and paste them instead.`);
  }
}

async function build(): Promise<{ pdf: Uint8Array; all: Item[] } | null> {
  const t = template();
  const all = items();
  const active = all.filter((i) => !i.cancelled);
  if (!t || !active.length) return null;
  state.working = `Making ${active.length} certificate${active.length === 1 ? "" : "s"}…`;
  state.message = null;
  render();
  try {
    const pdf = await generateCertificates({ background: t.background, certificates: active.map(({ certNo, name, location, date }) => ({ certNo, name, location, date })) });
    state.working = "";
    // Next time, numbering continues after this batch (on this PC); the status line asks to check it.
    const last = [...active].reverse().find((i) => i.numbered);
    if (last) prefs.set("nextSerial", String(Number(last.serial) + 1));
    return { pdf, all };
  } catch (e) {
    state.working = "";
    say("error", e instanceof Error ? e.message.split("\n").slice(0, 2).join(" ") : "The PDF couldn't be made.");
    return null;
  }
}

/** "Certificates – Sample Hotels Pvt Ltd – 06-10-2026.pdf", from the batch's first certificate (register rows carry their own). */
const fileName = (first?: Item) => {
  const loc = (first?.location ?? "").replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 60);
  return ["Certificates", loc, first?.date.replace(/\//g, "-") ?? ""].filter(Boolean).join(" – ") + ".pdf";
};

async function download() {
  const out = await build();
  if (!out) return;
  const url = URL.createObjectURL(new Blob([out.pdf as Uint8Array<ArrayBuffer>], { type: "application/pdf" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: fileName(out.all.find((i) => !i.cancelled)) });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  const n = out.all.filter((i) => !i.cancelled).length;
  say("ok", `Downloaded ${n} certificate${n === 1 ? "" : "s"}. Print at actual size (100%), then cut each sheet in half.`);
}

async function print() {
  const out = await build();
  if (!out) return;
  const frame = $<HTMLIFrameElement>("print-frame");
  const url = URL.createObjectURL(new Blob([out.pdf as Uint8Array<ArrayBuffer>], { type: "application/pdf" }));
  frame.onload = () => {
    try {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    } catch {
      window.open(url, "_blank");
    }
  };
  frame.src = url;
  say("ok", "Print at actual size (100%), not fit to page, then cut each sheet in half.");
}

async function copyRows() {
  const active = items().filter((i) => !i.cancelled);
  const text = registerRows(active.map((i) => ({ serial: i.serial, certNo: i.certNo, name: i.name, location: i.location, date: i.date.replace(/\//g, "-") })));
  try {
    await navigator.clipboard.writeText(text);
    say("ok", `Copied ${active.length} row${active.length === 1 ? "" : "s"}. Paste them at the end of the register.`);
  } catch {
    say("error", "The browser didn't allow copying. Select the rows in the list and copy them by hand.");
  }
}

function select(index: number) {
  const n = items().filter((i) => !i.cancelled).length;
  if (!n) return;
  state.selected = Math.max(0, Math.min(n - 1, index));
  render();
}

/* ---------- events ---------- */

document.addEventListener("click", async (ev) => {
  const el = (ev.target as HTMLElement).closest<HTMLElement>("[data-template],[data-select],[data-cancel],[data-restore],[data-step],[data-rename-start],[data-remove],[data-remove-yes],[data-remove-no]");
  if (!el) return;
  const d = el.dataset;
  if (d.template) {
    state.templateId = d.template;
    state.confirmRemove = null;
    prefs.set("template", d.template);
  } else if (d.select) state.selected = Number(d.select);
  else if (d.cancel) state.cancelled.add(d.cancel);
  else if (d.restore) state.cancelled.delete(d.restore);
  else if (d.step) return select(state.selected + Number(d.step));
  else if (d.renameStart) state.renaming = d.renameStart;
  else if (d.remove) state.confirmRemove = d.remove;
  else if ("removeNo" in d) state.confirmRemove = null;
  else if (d.removeYes) {
    await removeTemplate(d.removeYes);
    state.templates = state.templates.filter((t) => t.id !== d.removeYes);
    state.confirmRemove = null;
    state.templateId = state.templates[0]?.id ?? null;
  }
  render();
});

function finishRename(input: HTMLInputElement, save: boolean) {
  const t = state.templates.find((x) => x.id === input.dataset.rename);
  state.renaming = null;
  if (t && save && input.value.trim()) {
    t.name = input.value.trim();
    void saveTemplate(t);
  }
  render();
}

document.addEventListener("keydown", (ev) => {
  const target = ev.target as HTMLElement;
  if (target instanceof HTMLInputElement && target.dataset.rename) {
    if (ev.key === "Enter") finishRename(target, true);
    if (ev.key === "Escape") finishRename(target, false);
    return;
  }
  if (target.closest("input, textarea, select")) return;
  if (ev.key === "ArrowRight" || ev.key === "ArrowDown") (ev.preventDefault(), select(state.selected + 1));
  if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") (ev.preventDefault(), select(state.selected - 1));
});
document.addEventListener("focusout", (ev) => {
  const t = ev.target as HTMLElement;
  if (t instanceof HTMLInputElement && t.dataset.rename && state.renaming) finishRename(t, true);
});

document.addEventListener("change", (ev) => {
  const input = ev.target as HTMLInputElement;
  if (input.type !== "file" || !input.files?.[0]) return;
  const file = input.files[0];
  input.value = "";
  if (input.id === "open-list") void openList(file);
  else void addTemplate(file);
});

let typing: number | undefined;
$("list").addEventListener("input", (ev) => {
  clearTimeout(typing);
  const text = (ev.target as HTMLTextAreaElement).value;
  typing = window.setTimeout(() => setList(text), 180);
});
for (const id of ["location", "date", "serial"] as const) {
  $(id).addEventListener("input", (ev) => {
    const v = (ev.target as HTMLInputElement).value;
    if (id === "location") state.location = v;
    if (id === "date") state.date = v;
    if (id === "serial") state.serial = v.replace(/\D/g, "");
    prefs.set(id === "serial" ? "nextSerial" : id, id === "serial" ? state.serial : v);
    state.message = null;
    render();
  });
}
$("download").addEventListener("click", () => void download());
$("print").addEventListener("click", () => void print());
$("copy").addEventListener("click", () => void copyRows());

// Drop a PDF anywhere to add a template; an Excel / CSV / text file to read the participants.
const dropping = $("dropping");
let depth = 0;
window.addEventListener("dragenter", (ev) => {
  if (!ev.dataTransfer?.types.includes("Files")) return;
  depth++;
  dropping.hidden = false;
  dropping.innerHTML = `<p>${icon("upload")}<span>Drop a certificate PDF to add a template, or an Excel / CSV file for the participants</span></p>`;
});
window.addEventListener("dragleave", () => { if (--depth <= 0) (depth = 0), (dropping.hidden = true); });
window.addEventListener("dragover", (ev) => ev.preventDefault());
window.addEventListener("drop", (ev) => {
  ev.preventDefault();
  depth = 0;
  dropping.hidden = true;
  const file = ev.dataTransfer?.files?.[0];
  if (!file) return;
  if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") void addTemplate(file);
  else void openList(file);
});

let resizing: number | undefined;
window.addEventListener("resize", () => {
  clearTimeout(resizing);
  resizing = window.setTimeout(() => ((lastPreview = ""), render()), 150);
});

/* ---------- start ---------- */

renderStatic();
render();
Promise.all([
  createChecker().then((c) => (check = c)),
  listTemplates().then((t) => (state.templates = t)).catch(() => say("error", "This browser won't keep templates (private window?). Add one; it works until the tab closes.")),
]).then(render);
