import { PDFDocument, PDFName, PDFRawStream, PDFRef, concatTransformationMatrix, drawObject, popGraphicsState, pushGraphicsState } from "pdf-lib";
import { DESIGN } from "./layout.js";

/**
 * A blank certificate background from a filled-in template PDF (a Canva export with names typed on top): the
 * certificate picture is copied as it is — same print colours (CMYK) — without any of the typed text.
 * Returns a one-page A5-landscape PDF for generateCertificates({ background }).
 */
export async function backgroundFromTemplate(template: Uint8Array | ArrayBuffer): Promise<Uint8Array> {
  const src = await PDFDocument.load(template);
  // The certificate picture: the largest image in the template.
  let image: PDFRawStream | undefined;
  for (const [, obj] of src.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream && obj.dict.get(PDFName.of("Subtype"))?.toString() === "/Image" && (!image || obj.contents.length > image.contents.length)) image = obj;
  }
  if (!image) throw new Error("This PDF has no certificate picture in it. Export the design from Canva as a PDF and try again.");

  const out = await PDFDocument.create();
  const dict = out.context.obj({});
  for (const [key, value] of image.dict.entries()) {
    if (key.toString() === "/Length") continue;
    if (value instanceof PDFRef) throw new Error("This PDF stores its picture in a way that isn't supported. Export it from Canva as a PDF again.");
    dict.set(key, value);
  }
  const ref = out.context.register(PDFRawStream.of(dict, image.contents));
  const page = out.addPage([DESIGN.width, DESIGN.height]);
  const name = page.node.newXObject("Certificate", ref);
  page.pushOperators(pushGraphicsState(), concatTransformationMatrix(DESIGN.width, 0, 0, DESIGN.height, 0, 0), drawObject(name), popGraphicsState());
  out.setTitle("Certificate background");
  return out.save();
}
