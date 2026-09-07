import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { G, Line, Path, Rect, Text as SvgText, Circle } from "react-native-svg";
import { useTheme } from "../lib/theme";
import { useSettings } from "../lib/settings";
import { Colors, font, motion, radius, space } from "../theme";

export type Series = { name: string; color: string; values: number[] };

/**
 * Multi-line chart (react-native-svg). Legend on the right, y labels, vertical
 * gridlines per x tick, draw-in when `play` is true, hover dims other lines
 * and shows a cursor-following tooltip (pointer events; web only for now).
 */
export function LineChart({ series, xLabels, xTooltip, play = true, height = 320, yFormat = (v: number) => String(v) }:
  { series: Series[]; xLabels: string[]; xTooltip?: (i: number) => string; play?: boolean; height?: number; yFormat?: (v: number) => string }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<{ s: number; i: number; x: number; y: number } | null>(null);
  const pad = { l: 56, r: 24, t: 20, b: 40 };
  const legendW = series.length > 6 ? 180 : 160;
  const plotW = Math.max(0, width - legendW - pad.l - pad.r);
  const plotH = height - pad.t - pad.b;
  const n = xLabels.length;
  const maxY = Math.max(1, ...series.flatMap((s) => s.values));
  const yTicks = 5;
  const step = niceStep(maxY / yTicks);
  const yMax = Math.ceil(maxY / step) * step;
  const X = (i: number) => pad.l + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const Y = (v: number) => pad.t + plotH - (v / yMax) * plotH;

  const paths = useMemo(() => series.map((s) => {
    const pts = s.values.map((v, i) => [X(i), Y(v)] as const);
    const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return { d, len: len + 1, pts };
  }), [series, width, height]);

  const { reduceMotion } = useSettings();
  const draw = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = draw.addListener(({ value }) => setProgress(value));
    return () => draw.removeListener(id);
  }, []);
  useEffect(() => {
    draw.setValue(0);
    if (!play) return;
    if (reduceMotion) { draw.setValue(1); setProgress(1); return; }
    Animated.timing(draw, { toValue: 1, duration: motion.draw, useNativeDriver: false }).start();
  }, [play, width, reduceMotion, series.map((x) => x.name).join("|")]);

  const onMove = (e: any) => {
    const ne = e.nativeEvent;
    const x = ne.offsetX ?? ne.locationX; const y = ne.offsetY ?? ne.locationY;
    if (x == null || plotW <= 0) return;
    const i = Math.round(Math.min(n - 1, Math.max(0, ((x - pad.l) / plotW) * (n - 1))));
    let best = -1, bestD = 28;
    series.forEach((s, si) => {
      if (i >= s.values.length) return;
      const d = Math.abs(Y(s.values[i]) - y);
      if (d < bestD) { bestD = d; best = si; }
    });
    setHover(best >= 0 ? { s: best, i, x, y } : null);
  };

  return (
    <View style={{ flexDirection: "row" }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <View style={{ width: width - legendW, height }} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          <Svg width={width - legendW} height={height}>
            {/* y gridlines + labels */}
            {Array.from({ length: yTicks + 1 }, (_, k) => {
              const v = k * step; const y = Y(v);
              return (
                <G key={k}>
                  <Line x1={pad.l} x2={pad.l + plotW} y1={y} y2={y} stroke={colors.border} strokeWidth={1} />
                  <SvgText x={pad.l - 10} y={y + 4} fill={colors.muted} fontSize={11} fontFamily={font.family} textAnchor="end">{yFormat(v)}</SvgText>
                </G>
              );
            })}
            {/* x gridlines + labels */}
            {xLabels.map((l, i) => l === "" ? null : (
              <G key={l + i}>
                <Line x1={X(i)} x2={X(i)} y1={pad.t} y2={pad.t + plotH} stroke={colors.border} strokeWidth={1} strokeDasharray="3 4" />
                <SvgText x={X(i)} y={pad.t + plotH + 22} fill={colors.muted} fontSize={11} fontFamily={font.family} textAnchor="middle">{l}</SvgText>
              </G>
            ))}
            {paths.map((p, si) => {
              const dim = hover && hover.s !== si;
              return (
                <Path key={si} d={p.d} stroke={series[si].color} strokeWidth={hover?.s === si ? 3.5 : 2.5} fill="none"
                  strokeLinejoin="round" strokeLinecap="round" opacity={dim ? 0.18 : 1}
                  strokeDasharray={`${p.len} ${p.len}`}
                  strokeDashoffset={p.len * (1 - progress)} />
              );
            })}
            {hover && (
              <Circle cx={X(hover.i)} cy={Y(series[hover.s].values[hover.i])} r={5} fill={series[hover.s].color} stroke={colors.bg} strokeWidth={2} />
            )}
          </Svg>
          {hover && (
            <View style={[s.tip, { pointerEvents: "none" } as any, { left: Math.min(hover.x + 14, width - legendW - 170), top: Math.max(0, hover.y - 48) }]}>
              <Text style={[s.tipName, { color: series[hover.s].color }]}>{series[hover.s].name}</Text>
              <Text style={s.tipVal}>{yFormat(series[hover.s].values[hover.i])} <Text style={{ color: colors.muted }}>· {xTooltip ? xTooltip(hover.i) : xLabels[hover.i]}</Text></Text>
            </View>
          )}
        </View>
      )}
      <View style={{ width: legendW, paddingLeft: space.lg, paddingTop: pad.t, gap: 10 }}>
        {series.map((sr, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8, opacity: hover && hover.s !== i ? 0.35 : 1 }}>
            <View style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: sr.color }} />
            <Text style={s.legend} numberOfLines={1}>{sr.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Simple vertical bar chart used for average ratings / Ballon d'Or counts. */
export function BarChart({ values, labels, height = 220, color, barColors, yMax: yMaxIn, yMin = 0, yFormat = (v: number) => String(v) }:
  { values: number[]; labels: string[]; height?: number; color?: string; barColors?: string[]; yMax?: number; yMin?: number; yFormat?: (v: number) => string }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  color = color ?? colors.mint;
  const [width, setWidth] = useState(0);
  const pad = { l: 44, r: 12, t: 12, b: 32 };
  const plotW = width - pad.l - pad.r, plotH = height - pad.t - pad.b;
  const yMax = yMaxIn ?? Math.max(1, ...values) * 1.1;
  const bw = values.length ? Math.min(40, (plotW / values.length) * 0.6) : 0;
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          {[0, 0.5, 1].map((f) => (
            <G key={f}>
              <Line x1={pad.l} x2={pad.l + plotW} y1={pad.t + plotH * (1 - f)} y2={pad.t + plotH * (1 - f)} stroke={colors.border} />
              <SvgText x={pad.l - 8} y={pad.t + plotH * (1 - f) + 4} fill={colors.muted} fontSize={11} textAnchor="end" fontFamily={font.family}>{yFormat(+(yMin + (yMax - yMin) * f).toFixed(1))}</SvgText>
            </G>
          ))}
          {values.map((v, i) => {
            const cx = pad.l + ((i + 0.5) / values.length) * plotW;
            const h = Math.max(0, ((v - yMin) / (yMax - yMin)) * plotH);
            return (
              <G key={i}>
                <Rect x={cx - bw / 2} y={pad.t + plotH - h} width={bw} height={h} rx={4} fill={barColors?.[i] ?? color} opacity={0.9} />
                <SvgText x={cx} y={height - 10} fill={colors.muted} fontSize={11} textAnchor="middle" fontFamily={font.family}>{labels[i]}</SvgText>
              </G>
            );
          })}
        </Svg>
      )}
    </View>
  );
}

function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const r = raw / p;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * p;
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  tip: { position: "absolute", backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6, minWidth: 150 },
  tipName: { fontFamily: font.family, fontWeight: "700", fontSize: 12 },
  tipVal: { fontFamily: font.family, color: colors.text, fontSize: 13, fontWeight: "600" },
  legend: { fontFamily: font.family, color: colors.text, fontSize: 13 },
});
