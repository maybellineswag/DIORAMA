"use client";

import * as React from "react";
import { Plus, Paperclip, Calendar, GripVertical } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { MemberAvatar, PriorityDot } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TASKS, TASK_STATUSES } from "@/lib/mock/data";
import type { Task, TaskStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const COLUMN_ACCENT: Record<TaskStatus, string> = {
  "New Request": "bg-ink-faint",
  "In Progress": "bg-info",
  "In Review": "bg-accent",
  "In Progress After Revision": "bg-warn",
  Done: "bg-good",
  "On Hold": "bg-danger",
};

function TaskCard({
  task,
  onDragStart,
}: {
  task: Task;
  onDragStart: () => void;
}) {
  const overdue = new Date(task.dueDate) < new Date("2026-06-25") && task.status !== "Done";
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-all hover:border-ink-faint/40 hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start gap-1.5">
        <p className="flex-1 text-sm font-medium leading-snug">{task.name}</p>
        <GripVertical className="size-3.5 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <Badge variant="outline">{task.tag}</Badge>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-ink-faint">
          <span className={cn("flex items-center gap-1", overdue && "text-danger")}>
            <Calendar className="size-3" />
            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          {task.files > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="size-3" />
              {task.files}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <PriorityDot priority={task.priority} />
          <MemberAvatar id={task.assigneeId} className="size-5" />
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(TASKS);
  const dragId = React.useRef<string | null>(null);
  const [dragOver, setDragOver] = React.useState<TaskStatus | null>(null);

  const drop = (status: TaskStatus) => {
    const id = dragId.current;
    setDragOver(null);
    if (!id) return;
    const moved = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    if (moved && moved.status !== status) {
      toast.success(`Moved "${moved.name}"`, { description: `→ ${status}` });
    }
    dragId.current = null;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-6 pb-4 lg:px-8">
        <PageHeader
          title="Tasks"
          description="Everything the team is working on — drag to update."
          actions={
            <Button size="sm" onClick={() => toast("New task form is simulated in this prototype.")}>
              <Plus className="size-4" /> New task
            </Button>
          }
        />
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto px-6 pb-6 lg:px-8">
        <div className="flex h-full gap-4">
          {TASK_STATUSES.map((status) => {
            const cards = tasks.filter((t) => t.status === status);
            return (
              <div
                key={status}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(status);
                }}
                onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
                onDrop={() => drop(status)}
                className={cn(
                  "flex h-full w-[280px] shrink-0 flex-col rounded-xl border bg-surface-2/40 transition-colors",
                  dragOver === status && "border-accent/60 bg-accent-soft/30",
                )}
              >
                <div className="flex items-center justify-between px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", COLUMN_ACCENT[status])} />
                    <span className="text-sm font-medium">{status}</span>
                  </div>
                  <span className="tabular flex size-5 items-center justify-center rounded-md bg-surface-hi text-[11px] text-ink-soft">
                    {cards.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto px-2.5 pb-2.5">
                  {cards.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onDragStart={() => (dragId.current = t.id)}
                    />
                  ))}
                  {cards.length === 0 && (
                    <div className="flex h-20 items-center justify-center rounded-lg border border-dashed text-xs text-ink-faint">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
