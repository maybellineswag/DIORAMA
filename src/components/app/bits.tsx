import { member } from "@/lib/mock/data";
import { STATUS_TONE } from "@/lib/mock/data";
import type { Priority, SampleStatus } from "@/lib/mock/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Deterministic, muted profile-placeholder colors per member.
const AVATAR_COLORS = [
  "#6b7a55",
  "#9c6b8a",
  "#5e6b78",
  "#a86b52",
  "#7b6d86",
  "#5b8a72",
  "#9a7b4f",
];
function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
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
      <AvatarFallback
        className="text-[11px] font-medium text-white"
        style={{ backgroundColor: colorFor(m.id) }}
      >
        {m.name[0]}
      </AvatarFallback>
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
  "danger" | "warn" | "accent" | "default"
> = {
  Urgent: "danger",
  High: "warn",
  Medium: "accent",
  Low: "default",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={PRIORITY_VARIANT[priority]}>{priority}</Badge>;
}

export function PriorityDot({ priority }: { priority: Priority }) {
  const color: Record<Priority, string> = {
    Urgent: "bg-danger",
    High: "bg-warn",
    Medium: "bg-accent",
    Low: "bg-ink-faint",
  };
  return <span className={cn("size-1.5 rounded-full", color[priority])} />;
}

export function StatusBadge({ status }: { status: SampleStatus }) {
  return <Badge variant={STATUS_TONE[status]}>{status}</Badge>;
}
