"use client";

import * as React from "react";
import {
  Plus,
  Paperclip,
  Calendar,
  GripVertical,
  SquareKanban,
  Table as TableIcon,
  CalendarDays,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { ViewSwitcher } from "@/components/app/view-switcher";
import { TaskDetail } from "@/components/app/task-detail";
import { MemberAvatar, PriorityDot } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CalendarView } from "@/components/app/calendar-view";
import { TASKS, TASK_STATUSES, member } from "@/lib/mock/data";
import { CALENDAR_EVENTS } from "@/lib/mock/commerce";
import type { Task, TaskStatus, Priority } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type View = "board" | "table" | "calendar";

const TODAY = new Date("2026-06-26");

const COLUMN_ACCENT: Record<TaskStatus, string> = {
  "New Request": "bg-ink-faint",
  "In Progress": "bg-info",
  "In Review": "bg-accent",
  "In Progress After Revision": "bg-warn",
  Done: "bg-good",
  "On Hold": "bg-danger",
};

const PRIORITY_RANK: Record<Priority, number> = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function TaskCard({
  task,
  onOpen,
  onDragStart,
}: {
  task: Task;
  onOpen: () => void;
  onDragStart: () => void;
}) {
  const overdue = new Date(task.dueDate) < TODAY && task.status !== "Done";
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className="group cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-all hover:border-ink-faint/40 hover:shadow-md active:cursor-grabbing"
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
            {fmtDate(task.dueDate)}
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

// ── Table view ───────────────────────────────────────────────
type SortKey = "name" | "status" | "priority" | "assignee" | "dueDate";

function TableView({
  tasks,
  onOpen,
}: {
  tasks: Task[];
  onOpen: (t: Task) => void;
}) {
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "dueDate",
    dir: 1,
  });

  const sorted = [...tasks].sort((a, b) => {
    let av: string | number;
    let bv: string | number;
    if (sort.key === "priority") {
      av = PRIORITY_RANK[a.priority];
      bv = PRIORITY_RANK[b.priority];
    } else if (sort.key === "assignee") {
      av = member(a.assigneeId)?.name ?? "";
      bv = member(b.assigneeId)?.name ?? "";
    } else {
      av = a[sort.key];
      bv = b[sort.key];
    }
    if (av < bv) return -1 * sort.dir;
    if (av > bv) return 1 * sort.dir;
    return 0;
  });

  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggle(k)}
      className="flex items-center gap-1 text-left text-xs font-medium text-ink-faint transition-colors hover:text-ink-soft cursor-pointer"
    >
      {label}
      {sort.key === k ? (
        sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
      ) : (
        <ArrowUpDown className="size-3 opacity-40" />
      )}
    </button>
  );

  return (
    <div className="overflow-x-auto rounded-xl border">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[2fr_1fr_0.9fr_1fr_0.9fr] gap-4 border-b bg-surface-2/40 px-4 py-2.5">
          <Th k="name" label="Task" />
          <Th k="status" label="Status" />
          <Th k="priority" label="Priority" />
          <Th k="assignee" label="Assignee" />
          <Th k="dueDate" label="Due" />
        </div>
        {sorted.map((t) => {
          const overdue = new Date(t.dueDate) < TODAY && t.status !== "Done";
          return (
            <button
              key={t.id}
              onClick={() => onOpen(t)}
              className="grid w-full grid-cols-[2fr_1fr_0.9fr_1fr_0.9fr] items-center gap-4 border-b px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-elevated/40 cursor-pointer"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="truncate text-sm font-medium">{t.name}</span>
                <Badge variant="outline" className="shrink-0">{t.tag}</Badge>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                <span className={cn("size-2 rounded-full", COLUMN_ACCENT[t.status])} />
                {t.status}
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <PriorityDot priority={t.priority} /> {t.priority}
              </span>
              <MemberAvatar id={t.assigneeId} showName />
              <span className={cn("text-xs", overdue ? "text-danger" : "text-ink-soft")}>
                {fmtDate(t.dueDate)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(TASKS);
  const [view, setView] = React.useState<View>("board");
  const [selected, setSelected] = React.useState<Task | null>(null);
  const [open, setOpen] = React.useState(false);
  const dragId = React.useRef<string | null>(null);
  const [dragOver, setDragOver] = React.useState<TaskStatus | null>(null);

  const openTask = (t: Task) => {
    setSelected(t);
    setOpen(true);
  };

  const patchTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const drop = (status: TaskStatus) => {
    const id = dragId.current;
    setDragOver(null);
    if (!id) return;
    const moved = tasks.find((t) => t.id === id);
    patchTask(id, { status });
    if (moved && moved.status !== status) {
      toast.success(`Moved "${moved.name}"`, { description: `→ ${status}` });
    }
    dragId.current = null;
  };

  const current = selected ? tasks.find((t) => t.id === selected.id) ?? selected : null;

  return (
    <div className="flex h-full flex-col">
      <div className="p-6 pb-4 lg:px-8">
        <PageHeader
          title="Tasks"
          description="Everything the team is working on."
          actions={
            <div className="flex items-center gap-2">
              <ViewSwitcher
                value={view}
                onChange={setView}
                options={[
                  { id: "board", label: "Board", icon: SquareKanban },
                  { id: "table", label: "Table", icon: TableIcon },
                  { id: "calendar", label: "Calendar", icon: CalendarDays },
                ]}
              />
              <Button size="sm" onClick={() => toast("New task form is simulated in this prototype.")}>
                <Plus className="size-4" /> New task
              </Button>
            </div>
          }
        />
      </div>

      {view === "board" && (
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
                        onOpen={() => openTask(t)}
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
      )}

      {view === "table" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 lg:px-8">
          <TableView tasks={tasks} onOpen={openTask} />
        </div>
      )}

      {view === "calendar" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 lg:px-8">
          <CalendarView
            events={CALENDAR_EVENTS.filter((e) => e.type === "task")}
            types={["task"]}
          />
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          {current && (
            <TaskDetail task={current} onChange={(patch) => patchTask(current.id, patch)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
