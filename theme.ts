// Sim Vault design tokens — from design.md "Visual language" (ZeBeyond reference).
// Colors are built per mode (dark/light) and scheme (green/purple/sky) by
// makeColors(); components read them through useTheme() in lib/theme.tsx.
// `colors` below is the default (dark + green) for non-component code.

export type Mode = "dark" | "light";
export type Scheme = "green" | "purple" | "sky";

// accentLight: a darker tone of the same hue so accent text/buttons stay readable on the light ground
const accents: Record<Scheme, { accent: string; accentLight: string; onAccent: string; glowDark: [string, string]; bgDark: string; glowLight: [string, string] }> = {
  green:  { accent: "#3DF5B6", accentLight: "#0B8F63", onAccent: "#06110C", glowDark: ["#0E2B1F", "#051009"], bgDark: "#0B0F0D", glowLight: ["#CDEFE0", "#F4F7F5"] },
  purple: { accent: "#B48CFF", accentLight: "#6D3FE0", onAccent: "#120A22", glowDark: ["#22143D", "#0B0716"], bgDark: "#0D0A14", glowLight: ["#E3D9FA", "#F6F4FA"] },
  sky:    { accent: "#4DB1FF", accentLight: "#1667C7", onAccent: "#061220", glowDark: ["#0F2540", "#050C16"], bgDark: "#0A0F16", glowLight: ["#D5E8FA", "#F3F7FB"] },
};

export function makeColors(mode: Mode, scheme: Scheme) {
  const a = accents[scheme];
  const dark = mode === "dark";
  const accent = dark ? a.accent : a.accentLight;
  const rgb = hexToRgb(accent);
  return {
    mode, scheme,
    bg: dark ? a.bgDark : "#F4F7F5",
    glowA: dark ? a.glowDark[0] : a.glowLight[0],
    glowB: dark ? a.glowDark[1] : a.glowLight[1],
    surface: dark ? "#121815" : "#FFFFFF",
    surfaceRaised: dark ? "#182019" : "#F1F5F2",
    border: dark ? "#233028" : "#DCE4DF",
    borderStrong: dark ? "#2F4236" : "#C5D0C9",
    mint: accent,
    mintDim: `rgba(${rgb},${dark ? 0.18 : 0.14})`,
    mintGlow: `rgba(${rgb},${dark ? 0.45 : 0.3})`,
    text: dark ? "#F2F5F3" : "#0F1512",
    muted: dark ? "#9BA8A1" : "#5C6B63",
    onMint: dark ? a.onAccent : "#FFFFFF",
    // W/D/L: FIXED, independent of scheme (design.md → Themes)
    win: "#3DF5B6",
    draw: "#6B7A72",
    loss: "#F25C5C",
    // chart series: FIXED, independent of mode/scheme (design.md → Themes)
    series: ["#3DF5B6", "#4DA3FF", "#FF9F43", "#B388FF", "#FF5C7A", "#FFD84D", "#34D3E6", "#F97FD6", "#A3E635", "#FF7A45"],
    navBg: dark ? "rgba(11,15,13,0.9)" : "rgba(244,247,245,0.92)",
  };
}
export type Colors = ReturnType<typeof makeColors>;
export const colors: Colors = makeColors("dark", "green");

function hexToRgb(h: string) { const n = parseInt(h.slice(1), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; }

export const font = {
  // Web: Inter / Space Grotesk feel. Native picks the platform grotesque.
  family: "Inter, 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  display: 56, h1: 40, h2: 28, h3: 20, body: 16, small: 13, label: 11,
};

export const radius = { card: 16, pill: 999, tile: 14, sm: 8 };
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, xxl: 72 };
export const motion = { fast: 180, base: 260, slow: 600, draw: 1400, rearmMs: 10_000 };
export const layout = { maxWidth: 1400, gutter: 40, navHeight: 64, sidebar: 280 };
