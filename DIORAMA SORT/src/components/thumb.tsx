import { cn } from "@/lib/utils";

/**
 * Deterministic generative artwork from a seed string. Keeps the prototype
 * fully offline while looking intentional and on-brand — muted fashion-studio
 * palette, simple geometry, no gradients.
 */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Muted, warm studio palette — clays, mosses, bones, slate.
const PALETTES = [
  ["#b56c47", "#7c4a30", "#e8d9c5"],
  ["#6b7a55", "#3f4a33", "#dfe2cf"],
  ["#9c8466", "#5c4d3a", "#e9e1d2"],
  ["#5e6b78", "#37424d", "#d9dee2"],
  ["#a85b52", "#6e362f", "#ecd8cf"],
  ["#807a6a", "#4a4639", "#e6e2d6"],
  ["#7b6d86", "#473d50", "#e2dbe6"],
];

export type ThumbVariant = "blocks" | "arcs" | "stripes" | "grid";

export function Thumb({
  seed,
  variant,
  className,
  rounded = true,
}: {
  seed: string;
  variant?: ThumbVariant;
  className?: string;
  rounded?: boolean;
}) {
  const h = hash(seed);
  const rng = mulberry32(h);
  const palette = PALETTES[h % PALETTES.length];
  const [c1, c2, c3] = palette;
  const variants: ThumbVariant[] = ["blocks", "arcs", "stripes", "grid"];
  const v = variant ?? variants[(h >> 3) % variants.length];

  const shapes: React.ReactElement[] = [];

  if (v === "blocks") {
    for (let i = 0; i < 4; i++) {
      const x = Math.floor(rng() * 70);
      const y = Math.floor(rng() * 70);
      const w = 30 + Math.floor(rng() * 45);
      const ht = 30 + Math.floor(rng() * 45);
      const fill = [c1, c2, c3][i % 3];
      shapes.push(
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={ht}
          rx={6}
          fill={fill}
          opacity={0.78 - i * 0.12}
        />,
      );
    }
  } else if (v === "arcs") {
    for (let i = 0; i < 3; i++) {
      const cx = 20 + Math.floor(rng() * 60);
      const cy = 20 + Math.floor(rng() * 60);
      const r = 24 + Math.floor(rng() * 40);
      shapes.push(
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={[c1, c2, c3][i % 3]}
          strokeWidth={6 + Math.floor(rng() * 8)}
          opacity={0.85 - i * 0.18}
        />,
      );
    }
  } else if (v === "stripes") {
    const count = 4 + Math.floor(rng() * 4);
    const horizontal = rng() > 0.5;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * 100;
      const thick = 6 + Math.floor(rng() * 8);
      shapes.push(
        horizontal ? (
          <rect key={i} x={0} y={t} width={100} height={thick} fill={[c1, c2, c3][i % 3]} opacity={0.8} />
        ) : (
          <rect key={i} x={t} y={0} width={thick} height={100} fill={[c1, c2, c3][i % 3]} opacity={0.8} />
        ),
      );
    }
  } else {
    const n = 3 + Math.floor(rng() * 2);
    const cell = 100 / n;
    for (let r = 0; r < n; r++) {
      for (let col = 0; col < n; col++) {
        if (rng() > 0.45) {
          shapes.push(
            <rect
              key={`${r}-${col}`}
              x={col * cell + 4}
              y={r * cell + 4}
              width={cell - 8}
              height={cell - 8}
              rx={4}
              fill={[c1, c2, c3][(r + col) % 3]}
              opacity={0.5 + rng() * 0.4}
            />,
          );
        }
      }
    }
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn("block h-full w-full", rounded && "rounded-[inherit]", className)}
      aria-hidden
    >
      <rect width="100" height="100" fill="var(--surface-2)" />
      {shapes}
    </svg>
  );
}
