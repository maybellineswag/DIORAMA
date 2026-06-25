import { cn } from "@/lib/utils";
import type { Workspace } from "@/lib/mock/types";

/**
 * The logos are near-black single-color SVGs. On the dark UI we recolor them to
 * a warm ink-white via an invert filter; in light mode they render as-is.
 */
const recolor =
  "dark:[filter:invert(0.92)_sepia(0.08)_saturate(0.6)_brightness(1.05)]";

export function DioramaWordmark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/diorama-logo.svg"
      alt="Diorama"
      className={cn("h-auto w-auto select-none", recolor, className)}
      draggable={false}
    />
  );
}

export function WorkspaceLogo({
  workspace,
  className,
}: {
  workspace: Workspace;
  className?: string;
}) {
  if (workspace.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={workspace.logo}
        alt={workspace.name}
        className={cn("h-full w-full object-contain p-1", recolor, className)}
        draggable={false}
      />
    );
  }
  return (
    <span className="display flex h-full w-full items-center justify-center text-[13px] font-medium text-ink">
      {workspace.name.slice(0, 1)}
    </span>
  );
}
