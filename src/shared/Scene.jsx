import { offsetFor } from "./geometry.js";

export default function Scene({ frameIndex, objects, showPointsFor, showBoxes, compact }) {
  const mark = "var(--accent)";
  return (
    <svg viewBox="0 0 320 190" preserveAspectRatio="xMidYMid slice">
      <rect x={0} y={0} width={320} height={190} fill="var(--surface-sunken)" />
      <rect x={12} y={12} width={296} height={166} rx={16} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.2} />
      <ellipse cx={90} cy={143} rx={54} ry={25} fill="var(--ink-faint)" opacity={0.3} />
      {(objects || []).map((obj, oi) => {
        const p = offsetFor(oi, frameIndex);
        const dashed = oi === 1;
        return (
          <g key={obj.id}>
            <rect
              x={p.x - 4} y={p.y - 38} width={8} height={74} rx={4}
              transform={`rotate(${28 - oi * 40} ${p.x} ${p.y - 2})`}
              fill="var(--ink)"
            />
            {showBoxes && (
              <rect
                x={p.x - 33} y={p.y - 44} width={66} height={88} rx={8} fill="none"
                stroke={mark} strokeWidth={compact ? 1.3 : 2} strokeDasharray={dashed ? "3 3" : "5 4"}
              />
            )}
            {showPointsFor === obj.id && obj.points.map((pt, i) => (
              <circle
                key={i} cx={pt.x} cy={pt.y} r={compact ? 3 : 5}
                fill={pt.type === "fg" ? mark : "none"}
                stroke={pt.type === "fg" ? mark : "var(--ink-faint)"} strokeWidth={1.5}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
