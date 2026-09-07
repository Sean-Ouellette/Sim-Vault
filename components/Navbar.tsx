import React, { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { usePathname, useRouter } from "expo-router";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { useTheme } from "../lib/theme";
import { Colors, Mode, Scheme, font, layout, radius, space } from "../theme";
import { Pill } from "./ui";
import { useAuth } from "../lib/auth";
import { LogoMark } from "./LogoMark";
import { useSettings } from "../lib/settings";
import { search, Hit } from "../lib/search";

const links = [
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/top-performers", label: "Top Performers" },
];

/**
 * Shared navbar (design.md → Shared components). Full-width; logo → links →
 * search (teams + players, dropdown) → user icon (menu: sign in/out, saved
 * stats, Settings). Collapses links + search at narrow widths.
 */
export function Navbar() {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const path = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user, avatar, openDialog, signOut } = useAuth();
  const { openSettings } = useSettings();
  const narrow = width < 860;
  const [menu, setMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const hits = search(q);
  const go = (h: Hit) => { setQ(""); setSearchOpen(false); router.push({ pathname: h.type === "team" ? "/teams" : "/players", params: { [h.type]: h.id } } as any); };

  return (
    <View style={s.bar}>
      <View style={s.inner}>
        <Pressable onPress={() => router.push("/" as any)} style={[s.brand, { cursor: "pointer" } as any]}>
          <LogoMark size={36} />
          <Text style={s.wordmark}>Sim Vault</Text>
        </Pressable>

        {!narrow && (
          <View style={s.links}>
            {links.map((l) => (
              <Pill key={l.href} active={path.startsWith(l.href)} onPress={() => router.push(l.href as any)}>{l.label}</Pill>
            ))}
          </View>
        )}

        <View style={{ flex: 1 }} />

        {/* Search */}
        {(!narrow || searchOpen) ? (
          <View style={[s.search, narrow && { flex: 1 }]}>
            <SearchIcon />
            <TextInput value={q} onChangeText={setQ} placeholder="Search teams & players" placeholderTextColor={colors.muted}
              style={s.searchInput} autoFocus={narrow} onBlur={() => narrow && !q && setSearchOpen(false)} />
            {hits.length > 0 && (
              <View style={s.dropdown}>
                {hits.map((h) => (
                  <Pressable key={h.type + h.id} onPress={() => go(h)} style={[s.dropRow, { cursor: "pointer" } as any]}>
                    <Text style={[s.tag, h.type === "player" && s.tagPlayer]}>{h.type}</Text>
                    <Text style={s.dropName}>{h.name}</Text>
                    <Text style={s.dropMeta}>{h.meta}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ) : (
          <IconButton onPress={() => setSearchOpen(true)} label="Search"><SearchIcon /></IconButton>
        )}

        {/* User */}
        <View>
          <IconButton onPress={() => setUserMenu((v) => !v)} label="Account" active={!!user}>{user && avatar ? <Image source={{ uri: avatar }} style={{ width: 38, height: 38, borderRadius: 19 }} /> : <UserIcon signedIn={!!user} />}</IconButton>
          {userMenu && (
            <View style={s.userMenu}>
              {user ? (
                <>
                  <View style={s.dropRow}><Text style={s.dropMeta}>Signed in as </Text><Text style={s.dropName}>{user}</Text></View>
                  <MenuRow onPress={() => { setUserMenu(false); router.push("/" as any); }}>My saved stats</MenuRow>
                  <MenuRow onPress={() => { setUserMenu(false); openSettings(); }}>Settings</MenuRow>
                  <MenuRow onPress={() => { setUserMenu(false); signOut(); }}>Sign out</MenuRow>
                </>
              ) : (
                <>
                  <MenuRow onPress={() => { setUserMenu(false); openDialog(); }} mint>Sign in</MenuRow>
                  <MenuRow onPress={() => { setUserMenu(false); openDialog(); }}>My saved stats</MenuRow>
                  <MenuRow onPress={() => { setUserMenu(false); openSettings(); }}>Settings</MenuRow>
                </>
              )}
              <QuickAccess />
            </View>
          )}
        </View>

        {narrow && <IconButton onPress={() => setMenu((v) => !v)} label="Menu"><MenuIcon /></IconButton>}
      </View>
      {narrow && menu && (
        <View style={s.mobileMenu}>
          {links.map((l) => (
            <Pill key={l.href} active={path.startsWith(l.href)} onPress={() => { setMenu(false); router.push(l.href as any); }}>{l.label}</Pill>
          ))}
        </View>
      )}
    </View>
  );
}

/** Quick-access block at the bottom of the user menu: mode switch + accent scheme. */
function QuickAccess() {
  const { c: colors, mode, scheme, setMode, setScheme } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const schemes: { id: Scheme; label: string; swatch: string }[] = [
    { id: "green", label: "Green", swatch: "#3DF5B6" }, { id: "purple", label: "Purple", swatch: "#B48CFF" }, { id: "sky", label: "Sky blue", swatch: "#4DB1FF" },
  ];
  return (
    <View style={s.quick}>
      <Text style={s.quickLabel}>Appearance</Text>
      <View style={s.segment}>
        {(["dark", "light"] as Mode[]).map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={[s.segBtn, mode === m && s.segBtnActive, { cursor: "pointer" } as any]}>
            {m === "dark" ? <MoonIcon color={mode === m ? colors.onMint : colors.muted} /> : <SunIcon color={mode === m ? colors.onMint : colors.muted} />}
            <Text style={[s.segText, mode === m && { color: colors.onMint }]}>{m === "dark" ? "Dark" : "Light"}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[s.quickLabel, { marginTop: space.sm }]}>Color scheme</Text>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {schemes.map((sc) => (
          <Pressable key={sc.id} onPress={() => setScheme(sc.id)} accessibilityLabel={sc.label}
            style={[s.swatch, { backgroundColor: sc.swatch }, scheme === sc.id && { borderColor: colors.text }, { cursor: "pointer" } as any]} />
        ))}
        <Text style={[s.segText, { alignSelf: "center", marginLeft: 4 }]}>{schemes.find((x) => x.id === scheme)!.label}</Text>
      </View>
    </View>
  );
}

function MenuRow({ children, onPress, mint }: { children: string; onPress: () => void; mint?: boolean }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return <Pressable onPress={onPress} style={[s.dropRow, { cursor: "pointer" } as any]}><Text style={[s.dropName, mint && { color: colors.mint }]}>{children}</Text></Pressable>;
}

function IconButton({ children, onPress, label, active }: { children: React.ReactNode; onPress: () => void; label: string; active?: boolean }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [h, setH] = useState(false);
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} onHoverIn={() => setH(true)} onHoverOut={() => setH(false)}
      style={[s.iconBtn, (h || active) && { borderColor: colors.mint }, { cursor: "pointer" } as any]}>{children}</Pressable>
  );
}

const SearchIcon = () => {
  const { c } = useTheme();
  return <Svg width={16} height={16} viewBox="0 0 24 24"><Circle cx={11} cy={11} r={7} stroke={c.muted} strokeWidth={2} fill="none" /><Line x1={16.5} y1={16.5} x2={21} y2={21} stroke={c.muted} strokeWidth={2} strokeLinecap="round" /></Svg>;
};
const UserIcon = ({ signedIn }: { signedIn: boolean }) => {
  const { c } = useTheme();
  const k = signedIn ? c.mint : c.text;
  return <Svg width={18} height={18} viewBox="0 0 24 24"><Circle cx={12} cy={8} r={4} stroke={k} strokeWidth={2} fill={signedIn ? c.mintDim : "none"} /><Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke={k} strokeWidth={2} fill="none" strokeLinecap="round" /></Svg>;
};
const MenuIcon = () => {
  const { c } = useTheme();
  return <Svg width={18} height={18} viewBox="0 0 24 24">{[6, 12, 18].map((y) => <Line key={y} x1={4} x2={20} y1={y} y2={y} stroke={c.text} strokeWidth={2} strokeLinecap="round" />)}</Svg>;
};
const SunIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24"><Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={2} fill="none" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = (a * Math.PI) / 180; return <Line key={a} x1={12 + 7 * Math.cos(r)} y1={12 + 7 * Math.sin(r)} x2={12 + 9.5 * Math.cos(r)} y2={12 + 9.5 * Math.sin(r)} stroke={color} strokeWidth={2} strokeLinecap="round" />; })}</Svg>
);
const MoonIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24"><Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" /></Svg>
);

const makeStyles = (colors: Colors) => StyleSheet.create({
  bar: { width: "100%", borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.navBg, zIndex: 50 },
  inner: { height: layout.navHeight, paddingHorizontal: space.lg, flexDirection: "row", alignItems: "center", gap: space.md },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 36, height: 36 },
  wordmark: { fontFamily: font.family, color: colors.text, fontWeight: "800", fontSize: 18, letterSpacing: -0.3 },
  links: { flexDirection: "row", gap: 4, marginLeft: space.sm },
  search: { flexDirection: "row", alignItems: "center", gap: 8, width: 300, maxWidth: "100%", height: 40, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  searchInput: { flex: 1, color: colors.text, fontFamily: font.family, fontSize: 14, outlineStyle: "none" } as any,
  dropdown: { position: "absolute", top: 46, left: 0, right: 0, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.tile, overflow: "hidden", zIndex: 100 },
  dropRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropName: { fontFamily: font.family, color: colors.text, fontSize: 14, fontWeight: "600" },
  dropMeta: { fontFamily: font.family, color: colors.muted, fontSize: 12, marginLeft: "auto" },
  tag: { fontFamily: font.family, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, color: colors.mint, backgroundColor: colors.mintDim, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagPlayer: { color: colors.series[1], backgroundColor: "rgba(77,163,255,0.18)" },
  iconBtn: { width: 40, height: 40, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  userMenu: { position: "absolute", top: 46, right: 0, width: 240, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.tile, overflow: "hidden", zIndex: 100 },
  quick: { padding: 12, gap: 6, backgroundColor: colors.surface },
  quickLabel: { fontFamily: font.family, fontSize: 10, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase", color: colors.muted },
  segment: { flexDirection: "row", borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, overflow: "hidden" },
  segBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 7 },
  segBtnActive: { backgroundColor: colors.mint },
  segText: { fontFamily: font.family, fontSize: 12, fontWeight: "600", color: colors.muted },
  swatch: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: "transparent" },
  mobileMenu: { flexDirection: "row", flexWrap: "wrap", gap: 4, paddingHorizontal: space.lg, paddingBottom: space.sm },
});
