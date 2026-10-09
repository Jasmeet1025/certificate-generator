---
name: ThinkHealth Certificates
description: An in-browser batch printer for participation certificates, dressed in ambulance livery.
colors:
  ink: "#0f2419"
  ink-2: "#33473c"
  muted: "#56695e"
  ground: "#ffffff"
  surface: "#ffffff"
  wash: "#eef3ef"
  line: "#d3dcd4"
  line-2: "#b9c6bc"
  green: "#0a7a3f"
  green-deep: "#075a2e"
  green-soft: "#e3f1e7"
  yellow: "#ffd21f"
  yellow-soft: "#fff4c2"
  red: "#c42b1f"
  red-soft: "#fbe9e7"
  tab-blue: "#1f5fbf"
  tab-amber: "#b4610a"
  tab-violet: "#6a4bb5"
typography:
  display:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.03em"
  headline:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  title:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
  column-label:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.45
  body-sm:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.45
  cell-numeral:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
    fontFeature: "tnum"
rounded:
  hairline: "3px"
  sm: "4px"
  md: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.ground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.green-deep}"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "42px"
  button-mini:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "28px"
  button-mini-danger:
    backgroundColor: "{colors.red}"
    textColor: "{colors.ground}"
    rounded: "{rounded.sm}"
    height: "28px"
  link-button:
    textColor: "{colors.green}"
    rounded: "{rounded.sm}"
    padding: "2px 4px"
  link-button-hover:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.green-deep}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "38px"
  list-box:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  top-bar:
    backgroundColor: "{colors.green}"
    textColor: "{colors.ground}"
    typography: "{typography.headline}"
    height: "52px"
  band-cell-yellow:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.cell-numeral}"
    height: "30px"
  band-cell-green:
    backgroundColor: "{colors.green}"
    textColor: "{colors.ground}"
    typography: "{typography.cell-numeral}"
    height: "30px"
  band-cell-errata:
    backgroundColor: "{colors.red}"
    textColor: "{colors.ground}"
    height: "30px"
  template-tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "0 0 6px 6px"
    padding: "8px"
  tag:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.hairline}"
    padding: "2px 7px"
  tag-shrink:
    backgroundColor: "{colors.yellow-soft}"
    textColor: "#5c4700"
    rounded: "{rounded.hairline}"
    padding: "2px 7px"
---

# Design System: ThinkHealth Certificates

## Overview

**Creative North Star: "The Ambulance Livery"**

The tool wears the side of a rescue vehicle: a white body, a solid rescue-green top bar, and below it a reflective Battenburg strip of high-visibility yellow and deep green checks. The same check pattern becomes the working instrument. The band of sheets is a Battenburg strip too: one column per A4 sheet, the top and bottom blocks alternating yellow and green, so the whole batch reads as livery before anything prints.

It is a dense operator tool for a repeated office chore. Surfaces are flat and white, divided by green-grey hairlines. Colour is spent where it carries information: the checks show the batch, red shows a certificate that can't print, and one ink outline shows what is selected. The type is Barlow throughout, with Barlow Condensed in caps for the few pieces of livery lettering: the wordmark, section heads, column heads and the band's serials.

The printed certificate is a separate world. Its colours (dark teal #0E3F51, light blue #0099D3) belong to the company certificate design (kept private), not to the tool. The tool frames that design like a proof sheet and never borrows its colours.

**Key Characteristics:**
- White ground, hairline green-grey dividers, flat surfaces.
- Yellow and green used only as paired checks: the top bar's livery strip and the band of sheets.
- Red is only for failure: a certificate that can't print, an error message, and the confirm step before removing a template.
- Selection is an ink outline. There is no selection tint.
- Every number uses tabular figures.
- Barlow Condensed caps are limited to livery lettering. They are never used for running text.

## Colors

A livery palette: two high-visibility check colours on a white body, green-tinted neutrals, and one alarm red.

### Primary
- **Rescue Green** (green): the top bar, the primary button, link buttons, the focus glow on fields, the caret, the spinner, and the dark check in the band.
- **Deep Livery Green** (green-deep): the dark check in the top bar's livery strip, plus hover on green controls and success status text.
- **Green Mist** (green-soft): the hover background behind link buttons.

### Secondary
- **Hi-Vis Yellow** (yellow): the light check in the band and the livery strip, text selection, and the drop overlay's plate. It always carries ink text and never white.
- **Pale Hi-Vis** (yellow-soft): the "printed smaller" tag on a long name. Its text is a dark amber (#5c4700) that only that tag uses.

### Tertiary
- **Errata Red** (red): a band cell or message for a certificate that can't print, error status text, and the destructive "Remove" confirm button on a template.
- **Errata Blush** (red-soft): the background of a list row that can't print.
- **Template tab hues** (green, tab-blue, tab-amber, tab-violet): each saved template gets one of these as a 4px top edge, assigned in turn. They identify a template and carry no state. They are defined in the script, not on `:root`.

### Neutral
- **Cab Ink** (ink): body text, the selection outline, the focus ring, the template tab marked "on", and the corner notch on a shrunk-name cell.
- **Ink Two** (ink-2): secondary text, field labels, crop marks, and column heads.
- **Muted Sage** (muted): hints, sheet numbers, and cancelled rows.
- **White Body** (ground / surface): the page and every panel. They are two tokens with the same white.
- **Wash** (wash): the background of neutral tags.
- **Hairline** (line): panel and row dividers, and the outer border on tabs and the list.
- **Hairline Strong** (line-2): input borders, ghost button borders, the drop-zone dash, and the hatch on blank cells.

### Named Rules
**The Paired Checks Rule.** Yellow and green appear together as alternating checks: in the livery strip, and in the band, where the colour alternates by sheet and slot. Never use yellow alone as a fill for a generic accent.

**The Errata Red Rule.** Red means something will fail or be destroyed. Use it for a certificate that can't print, an error, or the confirm step of a removal, and for nothing else. A shrunk name is not an error, so its marker is an ink notch and a pale yellow tag.

**The Print Colours Stay On Paper Rule.** The certificate design's teal and blue are never used as tool UI tokens.

## Typography

**Display Font:** Barlow Condensed (with Barlow, system-ui), loaded at weights 600 and 700
**Body Font:** Barlow (with system-ui), loaded at weights 400 to 700

**Character:** Barlow is a humanist grotesk that borrows from road and vehicle signage. Its condensed cut in caps reads like the lettering on a vehicle panel, and the regular cut keeps the working text calm and legible.

### Hierarchy
- **Display** (700, 28px, 1.1, caps, 0.03em): the empty-state headline in the drop zone. At 20px, the same style is used on the drop overlay plate.
- **Headline** (700, 21px, 1, caps, 0.02em): the wordmark in the top bar, with its second word in yellow. It drops to 19px on phones.
- **Title** (700, 16px, 1, caps, 0.06em): section heads in the rail and on the stage (Template, Participants, Batch, Sheets).
- **Column label** (700, 13px, 1, caps, 0.06em): sticky table heads in the certificate list.
- **Body** (500, 15px, 1.45): the default text, field values, template names and buttons (at 600).
- **Body small** (500, 14px): list rows, counts, the caption, status and the list box (14px/1.6).
- **Label** (600, 13px): field labels, mini buttons and hints (hints at 500 in muted). Tags and sheet numbers use 600 at 11 to 12px.
- **Cell numeral** (700, 12px, condensed, tabular): the last four digits of each serial in the band.

### Named Rules
**The Register Numerals Rule.** Every number (serials, sheet numbers, counts, dates, the caption's position) uses tabular figures.

**The Livery Lettering Rule.** Use condensed caps only for marks and headings of three words or fewer. Never use them for sentences, and never for a label above a heading.

## Layout

On desktop, the layout is a fixed-height work area under a 52px top bar and its 12px livery strip. There is no page scroll.

- **Rail (380px, left):** in work order: template tabs, participant list (it fills the spare height), then the batch fields. Blocks are separated by hairlines, with 18px vertical and 22px horizontal padding.
- **Stage (right):** stacked rows: the heading line with counts, then the band (scrolls past 80px), the split, and the actions.
- **Split:** the preview takes the larger share, and the list takes 340 to 380px beside it.
- **Preview:** the sheet keeps the certificate's true aspect ratio (595.72 / 420.91). Its width is capped by the viewport height so the whole certificate stays in view.
- **Band columns:** flexible, from 42 to 72px wide.

Spacing works in small steps: 4, 8, 12, 18 and 24px, with 10, 14 and 20px for inner gaps.

Responsive behaviour:
- **At 1100px or below:** the page scrolls, the stage becomes a single column and the preview spans the full width.
- **At 820px or below:** the rail stacks above the stage, padding drops to 16px, the top bar wraps (it keeps the privacy line), and the action buttons share one row equally.

## Elevation & Depth

The system is flat by default: hairlines do the separating. Shadows are soft and green-tinted (ink at low alpha), and appear in only four places.

### Shadow Vocabulary
- **Paper** (`0 1px 2px rgba(15,36,25,0.06), 0 10px 24px -14px rgba(15,36,25,0.3)`): the preview sheet, a printed page resting on the desk.
- **Picked tab** (`0 1px 2px rgba(15,36,25,0.08), 0 6px 16px -8px rgba(15,36,25,0.25)`): the template tab marked "on".
- **Cell lift** (`0 3px 8px -2px rgba(15,36,25,0.35)`, with a 1px rise): hover on a band cell.
- **Overlay plate** (`0 12px 32px -8px rgba(0,0,0,0.45)`): the yellow plate shown while a file is dragged over the page, on a dimmed ink scrim.

### Named Rules
**The Paper Rule.** Only the certificate sheet rests at elevation. Other panels stay flat; a lift appears only for a picked tab or a hovered cell.

## Shapes

Corners are small: 6px for panels, inputs, buttons and the sheet; 4px for mini and link buttons, the rename field and the drop zone; 3px for tags, thumbnails and focus rings.

Template tabs are acetate index tabs: square at the top, where a 4px band in their hue runs along the edge, and rounded only at the bottom. Band cells have no rounding at all: they are checks, separated by a white 1px inset between columns.

The sheet carries hairline crop marks, 12px long, at its four corners, 7px in from the edge, drawn in ink-2. Dashes mark the empty state: a dashed drop zone, a ghost band of dashed columns, and diagonal hatching on a blank bottom half.

## Components

### Buttons
Solid and plain, like controls on a vehicle panel.
- **Shape:** gently rounded (6px), 42px tall, with an 18px inline pad and a drawn 18px icon leading the label.
- **Primary:** a rescue-green fill with white text. Only Download PDF and Choose PDF use it.
- **Ghost:** a white fill with a strong hairline border and ink text, for Print and Copy rows. On hover the border darkens to ink-2.
- **Hover / Active:** primary deepens to green-deep. Every button presses 1px down on active.
- **Focus:** a 3px ink outline, offset by 2px.
- **Disabled:** a grey-green fill (#e6ebe6) with muted text (#74857a) and no border.
- **Mini:** a 28px tool button for rename, remove, restore and the caption's previous and next. It has a hairline border, and the icon-only version is square. Its danger version (red fill) appears only on the confirm step of a removal.
- **Link button:** green text with an icon (Add template, Open file). On hover it gets a green-mist pad.

### Inputs / Fields
- **Style:** a white fill with a strong hairline border, 6px corners, and 38px height for fields. Field labels sit above in 13px semibold ink-2.
- **List box:** a textarea that fills the rail's spare height. It uses 14px/1.6 text with tabular figures and can't be resized.
- **Focus:** the border turns green, with a 3px green glow (`0 0 0 3px rgba(10,122,63,0.18)`).

### Navigation
- **Top bar:** a solid green band 52px tall. The condensed wordmark sits on the left, with "Certificates" in yellow. On the right is the privacy line with a lock icon in pale green-white (#e6f3ea). Below it runs a 12px livery strip of 24×12px checks in yellow and green-deep.

### Template Tab (house component)
A row with a 96px thumbnail and a name with its tools, in a hairline-bordered card. A 4px top edge carries the template's hue. When the tab is "on", its border turns ink and it lifts with the picked-tab shadow. When it is off, the name drops to ink-2. Removal asks inline before it acts.

### The Band (house component)
A Battenburg strip of the batch, one column per A4 sheet, with the sheet number above two 30px cells (top and bottom).
- **Colours:** the cells alternate yellow and green by sheet and slot. A cell that can't print turns red and shows an alert icon in place of its serial.
- **Blank half:** a blank bottom half is hatched.
- **Shrunk name:** an ink corner notch (9px) marks a name that had to print smaller.
- **Selection:** the selected cell gets a 3px ink outline inset by 1px.
- **Before a batch exists:** six dashed ghost columns hold the shape.

### Certificate List
A flat table in a hairline panel.
- **Head:** sticky condensed column heads.
- **Rows:** each row shows the sheet number and slot, the serial in tabular figures, the name in semibold, then the fit tag below it. A mini remove button sits at the end.
- **Selected row:** a 2px inset ink outline. Hover tints the row faintly (#f7faf6).
- **Error row:** a row that can't print fills with red-soft.
- **Removed row:** the name is struck through in muted text with a "Removed" tag and a restore button, until the batch is rebuilt.

### Tags
Small 3px-cornered chips in 12px semibold.
- **Neutral:** wash.
- **Shrink:** pale yellow with dark amber text, showing the print size as a percentage.
- **Errata:** red text with an alert icon and no fill.

### Icons
One drawn set: a 20×20 viewBox, 1.75 stroke, round caps and joins, `currentColor`. Icons render at 18px by default, at 16px inside mini buttons and at 14px in tags and cells. Use no other icon source.

## Do's and Don'ts

### Do:
- **Do** put tokens on `:root` and reference them by `var(--…)`. Tool UI colours come from the livery palette above.
- **Do** keep yellow and green paired as checks (yellow #ffd21f always with ink text, green #0a7a3f with white).
- **Do** mark selection with the ink outline (3px on band cells, 2px inset on list rows, an ink border on the "on" tab), never with a tint.
- **Do** use tabular figures for every number.
- **Do** show the certificate at its true aspect ratio (595.72 / 420.91), framed as a proof with hairline crop marks.
- **Do** use the one drawn icon set (20×20, 1.75 stroke) for every icon.
- **Do** refer to the company certificate design (kept private) only through what the tool renders. Keep its teal (#0E3F51) and blue (#0099D3) on the certificate.

### Don't:
- **Don't** use red for anything except failure, error or a destructive confirm. A shrunk name uses the ink notch and the pale yellow tag.
- **Don't** use a tinted background to mark selection, or a second selection colour.
- **Don't** set sentences, or labels above headings, in Barlow Condensed caps.
- **Don't** add shadows to flat panels. Only the sheet rests at elevation.
- **Don't** round band cells or the top edge of a template tab.
- **Don't** use the certificate's teal or blue in the tool UI.
