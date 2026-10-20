/** Lightweight inline stroke icons (lucide-style, 24px grid) — no icon dependency needed. */
import type { ComponentPropsWithoutRef } from "react";

const P: Record<string, JSX.Element> = {
  home: (<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></>),
  book: (<><path d="M2 5.5C4.5 4 8 4 12 6c4-2 7.5-2 10-.5V19c-2.5-1.5-6-1.5-10 .5-4-2-7.5-2-10-.5Z" /><path d="M12 6v13.5" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  live: (<><rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 21h8M12 18v3" /><path d="m10 8.5 5 2.5-5 2.5Z" /></>),
  tools: (<><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5Z" /></>),
  webinar: (<><rect x="2" y="3" width="20" height="13" rx="2" /><circle cx="12" cy="8.5" r="2.2" /><path d="M8.5 13.5c.8-1.4 2-2 3.5-2s2.7.6 3.5 2" /><path d="M7 21l5-5 5 5" /></>),
  building: (<><path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M9 21v-5h6v5" /><path d="M9 10h.01M15 10h.01M12 10h.01" /></>),
  award: (<><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7" /></>),
  clipboard: (<><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="m9 13 2 2 4-4" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.7-3.5 3.2-5.5 6.5-5.5s5.8 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.2 2.5 3.5 5.2" /></>),
  message: (<><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /><path d="M8 9h8M8 12.5h5" /></>),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
  download: (<><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 17v3h16v-3" /></>),
  card: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>),
  help: (<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.3 2.2-2.3 3.6" /><path d="M12 17h.01" /></>),
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>),
  switch: (<><circle cx="9" cy="7" r="3.5" /><path d="M3 20c.6-3.5 2.8-5.5 6-5.5 1.3 0 2.4.3 3.3.9" /><path d="M16 14h6M19 11l3 3-3 3M22 19h-6" /></>),
  shield: (<><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6Z" /><path d="m9 12 2 2 4-4" /></>),
  crown: (<><path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 11H5Z" /><path d="M5 21h14" /></>),
  bell: (<><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9s-1.2 6.3-3.7 9c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3Z" /></>),
  chevDown: <path d="m6 9 6 6 6-6" />,
  chevRight: <path d="m9 6 6 6-6 6" />,
  chevLeft: <path d="m15 6-6 6 6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  heart: <path d="M12 20s-7.5-4.6-9.2-9.2C1.7 7.6 3.7 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.3 0 5.3 3.1 4.2 6.3C19.5 15.4 12 20 12 20Z" />,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z" />,
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  lessons: (<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>),
  play: <path d="M8 5v14l11-7Z" />,
  more: (<><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></>),
  pin: (<><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  video: (<><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m16 10 6-3v10l-6-3" /></>),
  eye: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>),
  // Admin
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  kanban: (<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7v7M12 7v4M16 7v10" /></>),
  rupee: (<><path d="M6 4h12M6 8.5h12M9 4c3.5 0 5.5 1.6 5.5 4.5S12.5 13 9 13H6l8 7" /></>),
  logout: (<><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5M5 12h11" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  alert: (<><path d="M12 3 2 20h20Z" /><path d="M12 10v4M12 17h.01" /></>),
  edit: (<><path d="M4 20h4L19 9l-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></>),
  trash: (<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>),
  table: (<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M3 15h18M9 4v16" /></>),
  chart: (<><path d="M4 20V4M4 20h16" /><path d="m7 15 4-4 3 3 5-6" /></>),
  external: (<><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>),
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8Z" />,
  box: (<><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" /></>),
  briefcase: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" /></>),
  checkCircle: (<><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.5 2.5L16 9.5" /></>),
  xCircle: (<><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>),
  undo: (<><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></>),
  // Artwork glyphs
  bulb: (<><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" /></>),
  laptop: (<><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /><path d="m10 9-2 2 2 2M14 9l2 2-2 2" /></>),
  pencil: (<><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /><path d="m14.5 5.5 3 3" /></>),
  planet: (<><circle cx="12" cy="12" r="6" /><path d="M3.5 15.5C2.2 17.6 2 19.2 3 20c1.8 1.4 7.5-1.3 12.7-6.5S23.4 4.8 22 3c-.8-1-2.4-.8-4.5.5" /></>),
  leader: (<><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></>),
  palette: (<><path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.6-.9 1.2-1.8-.5-1.1.1-2.2 1.3-2.2H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></>),
  robot: (<><rect x="5" y="8" width="14" height="11" rx="2" /><path d="M12 4v4M9.5 13h.01M14.5 13h.01M9.5 16h5M2 13v2M22 13v2" /><circle cx="12" cy="3.5" r="1" /></>),
  ai: (<><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /><path d="M10 14.5 12 9.5l2 5M10.7 13h2.6" /></>),
  speech: (<><path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>),
  python: (<><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" /></>),
  leaf: (<><path d="M5 21c0-9 5-15 16-16-1 11-7 16-16 16Z" /><path d="M5 21 14 12" /></>),
  sparkle: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" />,
  community: (<><circle cx="12" cy="7" r="3" /><circle cx="5" cy="10" r="2.2" /><circle cx="19" cy="10" r="2.2" /><path d="M7 20c.5-3.3 2.4-5 5-5s4.5 1.7 5 5M1.5 18c.3-2 1.5-3.2 3.5-3.2M22.5 18c-.3-2-1.5-3.2-3.5-3.2" /></>),
};

export type IconName = keyof typeof P;

/** All icon names (used by the website editor's icon picker). */
export const ICON_NAMES = Object.keys(P) as IconName[];

export function Icon({
  name,
  size = 20,
  fill,
  strokeWidth = 1.8,
  ...rest
}: { name: IconName; size?: number; fill?: string; strokeWidth?: number } & Omit<ComponentPropsWithoutRef<"svg">, "name">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ?? "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {P[name]}
    </svg>
  );
}
