import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-md border border-input bg-surface-2/60 px-3 py-2 text-sm shadow-sm transition-colors outline-none",
        "placeholder:text-ink-faint",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50 field-sizing-content",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
