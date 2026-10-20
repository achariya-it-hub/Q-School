/** Per-subject 3D icon identity, shared by the home rails and the catalog. */
export type Icon3DStyle = { glyph: string; from: string; to: string };

export const CAT_STYLE: Record<string, Icon3DStyle> = {
  Science: { glyph: "🔬", from: "#3FC0DA", to: "#0E6E8E" },
  Competitive: { glyph: "📐", from: "#2BB39C", to: "#054038" },
  School: { glyph: "🎓", from: "#8EC5FF", to: "#3B6FA8" },
  Coding: { glyph: "🐍", from: "#9BE38C", to: "#2F7A3E" },
  Skills: { glyph: "🗣️", from: "#FFD98A", to: "#E8A33D" },
};

export function styleFor(category: string): Icon3DStyle {
  return CAT_STYLE[category] ?? CAT_STYLE.Science;
}
