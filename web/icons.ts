// One drawn icon set: 20 × 20, 1.75 stroke, round joins.
const PATHS = {
  plus: "M10 4.5v11M4.5 10h11",
  upload: "M10 12.5V4m0 0L6.5 7.5M10 4l3.5 3.5M4 13.5v1.5c0 .8.7 1.5 1.5 1.5h9c.8 0 1.5-.7 1.5-1.5v-1.5",
  download: "M10 4v8.5m0 0L6.5 9M10 12.5 13.5 9M4 13.5v1.5c0 .8.7 1.5 1.5 1.5h9c.8 0 1.5-.7 1.5-1.5v-1.5",
  printer: "M6 8V3.5h8V8M6 14H4.5C3.7 14 3 13.3 3 12.5v-3C3 8.7 3.7 8 4.5 8h11c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5H14M6 11.5h8v5H6z",
  copy: "M7.5 7.5h8.5v9H7.5zM5 12.5h-.5v-9h8V5",
  x: "M5.5 5.5l9 9m0-9-9 9",
  undo: "M7.5 5.5 4 9l3.5 3.5M4 9h7.5a4 4 0 0 1 0 8H9",
  left: "M12.5 5 7.5 10l5 5",
  right: "M7.5 5l5 5-5 5",
  lock: "M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9M4.5 9h11v8h-11zM10 12v2",
  alert: "M10 3.5 17.5 16.5h-15zM10 8.5V12m0 2.3v.2",
  pencil: "M12.5 4.5l3 3L7 16H4v-3z",
  trash: "M4.5 6h11M8 6V4h4v2M6 6l.8 10.5h6.4L14 6",
  check: "M4.5 10.5l3.5 3.5 7.5-8",
} as const;

export type IconName = keyof typeof PATHS;

export const icon = (name: IconName, cls = "icon") =>
  `<svg class="${cls}" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name]}"/></svg>`;
