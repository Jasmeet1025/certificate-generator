# Product

<!-- impeccable:product-schema 1 -->

> Written from the owner's brief and the build sessions of 9 Oct 2026. The owner delegated the open decisions
> ("choose the best option"); lines marked *(inferred)* are Claude's assumptions, not confirmed answers.

## Platform

web

## Stack

Delegated: TypeScript library (`src/`, pdf-lib) plus a static single-page tool built with Vite and plain TypeScript
(no UI framework) — everything runs in the browser, so no participant data or template ever leaves the PC. Deploy
target undecided (GitHub Pages fits a static build). *(inferred)*

## Users

- **Shreya**, fulfillment coordinator at ThinkHealth Care and Safety (Pune). After a training (CPR & AED / BLS, or CPR,
  AED & First Aid) she gets the participants' names from the client and prints one participation certificate per
  person. Works on an office desktop and prints on A4 paper, two certificates per sheet, cut in half.
- The owner / Admin, occasionally, for the same job.

## Product Purpose

Turn a participant list into a print-ready PDF of certificates — two A5 certificates per A4 page — on the company's own
certificate designs, with correct numbering. Success: Shreya goes from a list of names to printed certificates in a
minute, every long name fits inside the border, and no number is reused.

## Positioning

It prints on the company's exact Canva designs (same picture, same print colours) and numbers certificates the way the
master register does (`FAT-OD/<training date>/<serial>`); generic certificate makers can do neither.

## Operating Context

- **Master register:** a Zoho Sheet, one row per certificate issued: Serial, Certificate No., Name, Training location
  ("course conducted at"), Course, Date. New certificates continue the serial from the last row.
- **Templates:** designed in Canva, exported as PDF (two certificates on one page). Today: "Basic Life Support (CPR & AED
  Training)" and "CPR, AED and First aid Training". More may come; Shreya picks one per batch.
- **Training dashboard** (ThinkHealth's Next.js app, Fulfillment board) uses this library to generate certificates from a
  completed training and to append the rows to the master sheet. The standalone page is for anything outside that
  flow: reprints, corrections, one-off batches. *(the standalone page's role is inferred)*
- Lists arrive as rows copied from the register or from Excel, or as a plain list of names.

## Capabilities and Constraints

- Fields printed: training date (dd/mm/yyyy), certificate number, participant name, training location.
- Long names and locations only get a smaller font — never wrap, never another font — and stay inside the border.
- Fonts on the certificate: Great Vibes (name), Montserrat Bold Italic (location), Open Sans Bold Italic (date, number).
- **The templates carry the trainer's signature and the company seal: never committed, never uploaded anywhere.** The
  repository is public.
- A name the certificate fonts can't draw is reported, not printed broken.

## Brand Commitments

The certificates themselves are fixed by the company's Canva designs (dark teal #0E3F51, light blue #0099D3). The tool
around them has no brand of its own yet.

## Evidence on Hand

- Two real templates in `private/` (ignored by Git) and sample PDFs with made-up people in `private/samples/`.
- No real participant data in the repository; demonstrations use made-up names.

## Product Principles

1. The certificate is the truth: what the page shows is exactly what prints.
2. Nothing leaves the PC — names, templates and PDFs stay in the browser.
3. Numbers are never guessed: they come from the register's serial or are shown before printing.
4. Fast for a repeated chore: paste, check, print.

## Accessibility & Inclusion

Office desktop use, mouse and keyboard; names in Indian and international spellings (accents, apostrophes, hyphens).
No specific standard was set; WCAG AA contrast and full keyboard use as the floor. *(inferred)*
