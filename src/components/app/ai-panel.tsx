import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Reusable "AI analyst" evaluation panel — used on Store & Ad Studio. */
export function AiPanel({
  title = "AI evaluation",
  subtitle,
  insights,
  className,
}: {
  title?: string;
  subtitle?: string;
  insights: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col rounded-xl border bg-card", className)}>
      <div className="flex items-center gap-2.5 border-b px-4 py-3.5">
        <span className="flex size-8 items-center justify-center rounded-md bg-accent-soft">
          <Sparkles className="size-4 text-accent-ink" />
        </span>
        <div>
          <p className="text-sm font-medium leading-tight">{title}</p>
          <p className="text-xs text-ink-faint leading-tight">
            {subtitle ?? "Specific, actionable insights"}
          </p>
        </div>
      </div>
      <div className="space-y-3 p-4">
        {insights.map((t, i) => (
          <div
            key={i}
            className="flex gap-2.5 rounded-lg border bg-surface-2/40 p-3 text-sm leading-relaxed text-ink-soft"
          >
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-ink" />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
