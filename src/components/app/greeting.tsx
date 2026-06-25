"use client";

import * as React from "react";

const SETS: { range: (h: number) => boolean; phrases: string[] }[] = [
  { range: (h) => h >= 5 && h < 12, phrases: ["Good morning", "Morning", "A fresh start"] },
  { range: (h) => h >= 12 && h < 17, phrases: ["Good afternoon", "Afternoon", "Hope it's flowing"] },
  { range: (h) => h >= 17 && h < 22, phrases: ["Good evening", "Evening", "Winding down"] },
  { range: () => true, phrases: ["Burning the midnight oil", "Still up", "The studio's quiet"] },
];

function pick(): string {
  const now = new Date();
  const set = SETS.find((s) => s.range(now.getHours())) ?? SETS[0];
  return set.phrases[now.getDate() % set.phrases.length];
}

export function Greeting({ name }: { name: string }) {
  // Compute on the client to avoid SSR time mismatches.
  const [phrase, setPhrase] = React.useState("Welcome back");
  React.useEffect(() => {
    setPhrase(pick());
  }, []);

  return (
    <h1 className="text-[28px] leading-tight tracking-tight" suppressHydrationWarning>
      <span className="serif text-ink-soft">{phrase},</span>{" "}
      <span className="display text-ink">{name}</span>
    </h1>
  );
}
