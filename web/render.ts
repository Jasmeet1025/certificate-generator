// Draws a PDF page onto a canvas with pdf.js — the preview shows exactly what prints.
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/** Renders page 1 of `pdf` into `canvas`, `width` CSS pixels wide, sharp on high-density screens. */
export async function drawPdf(pdf: Uint8Array, canvas: HTMLCanvasElement, width: number): Promise<void> {
  const doc = await pdfjs.getDocument({ data: pdf.slice() }).promise;
  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const ratio = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: (width / base.width) * ratio });
    const off = document.createElement("canvas");
    off.width = Math.round(viewport.width);
    off.height = Math.round(viewport.height);
    await page.render({ canvasContext: off.getContext("2d")!, viewport }).promise;
    // Swap in one go, so the preview never flashes blank between certificates.
    canvas.width = off.width;
    canvas.height = off.height;
    canvas.style.aspectRatio = `${base.width} / ${base.height}`;
    canvas.getContext("2d")!.drawImage(off, 0, 0);
  } finally {
    await doc.destroy();
  }
}

/** A small PNG of page 1, for a template tab. */
export async function thumbnail(pdf: Uint8Array, width = 240): Promise<string> {
  const canvas = document.createElement("canvas");
  await drawPdf(pdf, canvas, width / (window.devicePixelRatio || 1));
  return canvas.toDataURL("image/png");
}
