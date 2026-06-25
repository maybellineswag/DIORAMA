import { member } from "@/lib/mock/data";
import { STATUS_TONE } from "@/lib/mock/data";
import type { Priority, SampleStatus } from "@/lib/mock/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export function MemberAvatar({
  id,
  className,
  showName = false,
}: {
  id: string;
  className?: string;
  showName?: boolean;
}) {
  const m = member(id);
  if (!m) return null;
  const avatar = (
    <Avatar className={cn("size-6", className)}>
      <AvatarFallback className="text-[10px]">{initials(m.name)}</AvatarFallback>
    </Avatar>
  );
  if (!showName) return avatar;
  return (
    <span className="flex items-center gap-2">
      {avatar}
      <span className="text-sm">{m.name}</span>
    </span>
  );
}

const PRIORITY_VARIANT: Record<
  Priority,
  "danger" | "warn" | "clay" | "default"
> = {
  Urgent: "danger",
  High: "warn",
  Medium: "clay",
  Low: "default",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={PRIORITY_VARIANT[priority]}>{priority}</Badge>;
}

export function PriorityDot({ priority }: { priority: Priority }) {
  const color: Record<Priority, string> = {
    Urgent: "bg-danger",
    High: "bg-warn",
    Medium: "bg-clay",
    Low: "bg-ink-faint",
  };
  return <span className={cn("size-1.5 rounded-full", color[priority])} />;
}

export function StatusBadge({ status }: { status: SampleStatus }) {
  return <Badge variant={STATUS_TONE[status]}>{status}</Badge>;
}
