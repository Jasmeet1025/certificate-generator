---
version: 1
slug: "web-index-html"
primary_target: "web/index.html"
related_targets: []
---

# Surface: certificate tool (web/index.html)

Scope: the standalone page of certificate-generator. Mode: Operate. Audience: Shreya (fulfillment), office desktop, A4 printer.
Job: pick a template, give the participant list, check every certificate, download / print, copy the rows for the register.
Constraints: everything in the browser; templates remembered only in this browser; numbering FAT-OD/<date>/<serial>.

## Direction contract

THESIS: The batch is the interface. A Battenburg band — one column per A4 sheet, its top and bottom blocks the two certificates on it — replaces the category's upload-form-then-download page; every certificate is visible and clickable before anything prints.

OWN-WORLD: Ambulance livery. White body ground, high-visibility yellow #FFD21F and rescue green #0A7A3F as the paired checker, ink #0F2419, red only for errata (a row that cannot print). Barlow for UI, Barlow Condensed caps for livery lettering on the few labels. Reserved selection colour: the ink outline on the active block and row. Tabular numerals for every number.

STORY: She sees which template, how many sheets, which certificate is odd, and exactly how each name lands — then prints.

FIRST VIEWPORT: Top bar: name, "Nothing leaves this PC" (kept as text on phones too). Left 380px rail in work order: template tabs, the list box, then batch details (location, training date, first serial) — the list comes first because register rows bring their own number, date and location, which decides whether the batch fields are needed at all. Right: the band across the top, the selected certificate at true aspect below it, actions (Download PDF, Print, Copy rows for register) under the preview.

FORM: ambulance livery (Battenburg), position 7 of the ordered list; seed key 7474863a. Raises: template tabs each carry their own hue (acetate tab manual); hairline crop marks at the cut line (design annual); tabular register numerals (datamatics); the selected certificate owns the work area (vertical feed); one reserved colour for the current selection (orienteering); removed rows cancel, not vanish, until the batch is rebuilt (ticket wallet).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
