import { cn } from "@/lib/utils";

/** Minimal responsive SVG line chart — no dependencies. */
export function LineChart({
  data,
  height = 160,
  area = true,
  color = "var(--accent)",
  className,
}: {
  data: number[];
  height?: number;
  area?: boolean;
  color?: string;
  className?: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const n = data.length;
  const pts = data.map((v, i) => [
    (i / (n - 1)) * 100,
    100 - ((v - min) / range) * 92 - 4,
  ]);
  const line = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
    .join(" ");
  const areaPath = `${line} L100 100 L0 100 Z`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ height }}
      className={cn("w-full", className)}
      aria-hidden
    >
      {area && <path d={areaPath} fill={color} opacity={0.1} />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Tiny inline sparkline. */
export function Bars({
  data,
  height = 48,
  color = "var(--accent)",
  className,
}: {
  data: number[];
  height?: number;
  color?: string;
  className?: string;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className={cn("flex items-end gap-[3px]", className)} style={{ height }}>
      {data.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.5 + (v / max) * 0.5 }}
        />
      ))}
    </div>
  );
}
