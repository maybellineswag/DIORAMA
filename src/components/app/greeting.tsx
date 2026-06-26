"use client";

import * as React from "react";
import { useApp } from "@/lib/store";

// Warm, personal openers — lightly time-aware. Rendered as "{phrase}, {name}."
const SETS: { range: (h: number) => boolean; phrases: string[] }[] = [
  {
    range: (h) => h >= 5 && h < 12,
    phrases: ["Good morning", "Rise and shine", "Nice to have you back", "Fresh start"],
  },
  {
    range: (h) => h >= 12 && h < 17,
    phrases: ["Good afternoon", "Hope the day's flowing", "Nice to have you back", "Back at it"],
  },
  {
    range: (h) => h >= 17 && h < 22,
    phrases: ["Good evening", "Winding down", "Nice to have you back", "Good to see you"],
  },
  {
    range: () => true,
    phrases: ["Late one tonight", "Burning the midnight oil", "The studio's quiet", "Nice to have you back"],
  },
];

function pick(): string {
  const set = SETS.find((s) => s.range(new Date().getHours())) ?? SETS[0];
  return set.phrases[Math.floor(Math.random() * set.phrases.length)];
}

export function Greeting({ name }: { name: string }) {
  const { workspace } = useApp();
  const [phrase, setPhrase] = React.useState("Nice to have you back");
  React.useEffect(() => {
    setPhrase(pick());
  }, []);

  return (
    <div className="space-y-2.5" suppressHydrationWarning>
      {workspace.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={workspace.logo}
          alt={workspace.name}
          className="h-7 w-auto select-none dark:[filter:invert(0.92)_sepia(0.08)_saturate(0.6)_brightness(1.05)]"
          draggable={false}
        />
      ) : (
        <span className="display text-xl">{workspace.name}</span>
      )}
      <p className="text-2xl tracking-tight text-ink">
        <span className="serif">{phrase},</span>{" "}
        <span className="font-medium">{name}.</span>
      </p>
    </div>
  );
}
