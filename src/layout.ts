// Where each field goes on a certificate, measured from the templates Shreya uses (designed in Canva).
// Units are PDF points on the design, 595.72 × 420.91 pt (A5 landscape); y is the text baseline, from the bottom.

export const DESIGN = { width: 595.72, height: 420.91 };

export type Align = "left" | "center";

export interface FieldLayout {
  x: number; // left edge (left-aligned) or centre (centred)
  y: number; // baseline
  size: number; // font size; long text shrinks to fit maxWidth
  maxWidth: number;
  align: Align;
  font: "name" | "location" | "label";
  color: [number, number, number]; // RGB, 0–255
}

const TEAL: [number, number, number] = [14, 63, 81]; // #0E3F51, the colour of the "CERTIFICATE" heading
const BLUE: [number, number, number] = [0, 153, 211]; // #0099D3

export const LAYOUT: Record<"date" | "certNo" | "name" | "location", FieldLayout> = {
  // After "Training Date:" (top left, above the border).
  date: { x: 112.5, y: 402.8, size: 9.2, maxWidth: 140, align: "left", font: "label", color: TEAL },
  // After "Certificate No:" (top right).
  certNo: { x: 433.5, y: 402.8, size: 9.2, maxWidth: 140, align: "left", font: "label", color: TEAL },
  // Right of the divider, under "This certificate is proudly presented to". Narrower than the gap (divider ~294 pt,
  // inner border ~566 pt): Great Vibes' swashes reach past the letters, and a long name must stay inside the border.
  name: { x: 430, y: 268.3, size: 39, maxWidth: 232, align: "center", font: "name", color: BLUE },
  // On the line under "course conducted at,".
  location: { x: 302.6, y: 173.8, size: 12, maxWidth: 262, align: "center", font: "location", color: TEAL },
};
