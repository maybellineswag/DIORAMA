"use client";

import * as React from "react";

const SETS: { range: (h: number) => boolean; phrases: string[] }[] = [
  {
    range: (h) => h >= 5 && h < 12,
    phrases: ["Good morning", "Morning", "A fresh start", "Bright and early", "Rise and design"],
  },
  {
    range: (h) => h >= 12 && h < 17,
    phrases: ["Good afternoon", "Afternoon", "Hope it's flowing", "Midday momentum", "Back at it"],
  },
  {
    range: (h) => h >= 17 && h < 22,
    phrases: ["Good evening", "Evening", "Winding down", "Golden hour", "Soft landing"],
  },
  {
    range: () => true,
    phrases: ["Burning the midnight oil", "The studio's sleeping", "Still up", "Quiet hours", "Late shift"],
  },
];

function pick(): string {
  const set = SETS.find((s) => s.range(new Date().getHours())) ?? SETS[0];
  // A couple of options per slot — pick a fresh one each visit.
  return set.phrases[Math.floor(Math.random() * set.phrases.length)];
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
