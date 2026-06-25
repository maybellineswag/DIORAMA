/* eslint-disable @next/next/no-img-element */

/** The DIORAMA wordmark (the provided SVG, recolored to ink-white on dark). */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <img
      src="/diorama-logo.svg"
      alt="DIORAMA"
      className={`dark:[filter:invert(0.92)_sepia(0.08)_saturate(0.6)_brightness(1.05)] ${className}`}
      draggable={false}
    />
  );
}
