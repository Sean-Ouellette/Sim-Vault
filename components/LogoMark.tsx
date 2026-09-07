import React from "react";
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, Polygon, Rect } from "react-native-svg";
import { useTheme } from "../lib/theme";

/**
 * Vector version of assets/logo.png: dark rounded-square vault, open door with a
 * crosshair handle, a white soccer ball and two speed lines inside. The ball is
 * always white; its pentagon patches and the speed lines take the scheme accent
 * (design.md → Shared components → Logo).
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  const { c } = useTheme();
  const accent = c.mint;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="ball"><Circle cx={68.0} cy={50.0} r={24.0} /></ClipPath>
      </Defs>
      <Rect x={0} y={0} width={100} height={100} rx={22} fill="#1B2129" />
      {/* vault interior */}
      <Circle cx={57} cy={50} r={36} fill="#070B10" />
      {/* soccer ball: white sphere, accent pentagons, thin seams */}
      <Circle cx={68.0} cy={50.0} r={24.0} fill="#FFFFFF" />
      <G clipPath="url(#ball)">
        <Polygon points="68.0,42.0 75.6,47.5 72.7,56.5 63.3,56.5 60.4,47.5" fill={accent} stroke="#070B10" strokeWidth={1.4} strokeLinejoin="round" />
        <Polygon points="74.8,40.7 72.0,32.3 79.2,27.1 86.3,32.3 83.6,40.7" fill={accent} stroke="#070B10" strokeWidth={1.4} strokeLinejoin="round" /><Polygon points="78.9,53.6 86.1,48.4 93.2,53.6 90.5,61.9 81.7,61.9" fill={accent} stroke="#070B10" strokeWidth={1.4} strokeLinejoin="round" /><Polygon points="68.0,61.5 75.1,66.7 72.4,75.1 63.6,75.1 60.9,66.7" fill={accent} stroke="#070B10" strokeWidth={1.4} strokeLinejoin="round" /><Polygon points="57.1,53.6 54.3,61.9 45.5,61.9 42.8,53.6 49.9,48.4" fill={accent} stroke="#070B10" strokeWidth={1.4} strokeLinejoin="round" /><Polygon points="61.2,40.7 52.4,40.7 49.7,32.3 56.8,27.1 64.0,32.3" fill={accent} stroke="#070B10" strokeWidth={1.4} strokeLinejoin="round" />
        <G stroke={accent} strokeWidth={1.6} strokeLinecap="round">
          <Line x1={68.0} y1={42.0} x2={68.0} y2={35.0} /><Line x1={75.6} y1={47.5} x2={82.3} y2={45.4} /><Line x1={72.7} y1={56.5} x2={76.8} y2={62.1} /><Line x1={63.3} y1={56.5} x2={59.2} y2={62.1} /><Line x1={60.4} y1={47.5} x2={53.7} y2={45.4} />
        </G>
      </G>
      <Circle cx={68.0} cy={50.0} r={24.0} fill="none" stroke="#070B10" strokeWidth={1.5} />
      {/* speed lines */}
      <G stroke={accent} strokeWidth={4} strokeLinecap="round">
        <Line x1={86} y1={30} x2={97} y2={30} />
        <Line x1={90} y1={40} x2={99} y2={40} opacity={0.6} />
      </G>
      {/* rivets */}
      <G fill="#4B5563">
        <Circle cx={54} cy={9} r={3} /><Circle cx={54} cy={91} r={3} /><Circle cx={85} cy={28} r={3} /><Circle cx={85} cy={72} r={3} />
      </G>
      {/* door */}
      <Ellipse cx={36} cy={50} rx={24} ry={38} fill="#5B6675" />
      <Ellipse cx={34} cy={50} rx={22} ry={36} fill="#C9D1DA" />
      {/* crosshair handle */}
      <G stroke="#5B6675" strokeWidth={4} strokeLinecap="round" fill="none">
        <Circle cx={34} cy={50} r={10} />
        <Line x1={34} y1={30} x2={34} y2={36} /><Line x1={34} y1={64} x2={34} y2={70} />
        <Line x1={14} y1={50} x2={20} y2={50} /><Line x1={48} y1={50} x2={54} y2={50} />
      </G>
    </Svg>
  );
}
