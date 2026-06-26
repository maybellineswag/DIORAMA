"use client";

import * as React from "react";

// Evocative, time-of-day "session title" vibes (Claude-style), a couple each.
const SETS: { range: (h: number) => boolean; phrases: string[] }[] = [
  {
    range: (h) => h >= 5 && h < 12,
    phrases: ["Bright and early", "First light", "Fresh canvas", "Morning shift"],
  },
  {
    range: (h) => h >= 12 && h < 17,
    phrases: ["Midday momentum", "Afternoon flow", "In the thick of it", "Golden afternoon"],
  },
  {
    range: (h) => h >= 17 && h < 22,
    phrases: ["Golden hour", "Winding down", "Last light", "Evening studio"],
  },
  {
    range: () => true,
    phrases: ["Late shift", "After hours", "The studio's sleeping", "Burning the midnight oil", "Moonlit shift"],
  },
];

function pick(): string {
  const set = SETS.find((s) => s.range(new Date().getHours())) ?? SETS[0];
  return set.phrases[Math.floor(Math.random() * set.phrases.length)];
}

export function Greeting({ name }: { name: string }) {
  // Computed on the client to avoid SSR time mismatches.
  const [phrase, setPhrase] = React.useState("");
  React.useEffect(() => {
    setPhrase(pick());
  }, []);

  return (
    <div className="space-y-1" suppressHydrationWarning>
      <h1 className="serif text-[30px] leading-tight tracking-tight text-ink">
        {phrase || "Welcome back"}
      </h1>
      <p className="text-sm text-ink-soft">
        Welcome back,{" "}
        <span className="font-medium text-foreground">{name}</span> — here&apos;s
        what&apos;s moving across Olivine today.
      </p>
    </div>
  );
}
