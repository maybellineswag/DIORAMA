"use client";

import * as React from "react";
import { Paperclip } from "lucide-react";

import type { Task, TaskStatus, Priority } from "@/lib/mock/types";
import { MEMBERS, TASK_STATUSES } from "@/lib/mock/data";
import { MemberAvatar } from "@/components/app/bits";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

const PRIORITIES: Priority[] = ["Urgent", "High", "Medium", "Low"];

export function TaskDetail({
  task,
  onChange,
}: {
  task: Task;
  onChange: (patch: Partial<Task>) => void;
}) {
  return (
    <>
      <SheetHeader>
        <Badge variant="outline" className="w-fit">{task.tag}</Badge>
        <SheetTitle className="sr-only">{task.name}</SheetTitle>
        <Input
          value={task.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="border-0 bg-transparent px-0 text-lg font-medium shadow-none focus-visible:ring-0"
        />
      </SheetHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <div className="grid grid-cols-[110px_1fr] items-center gap-y-4 text-sm">
          <Label className="text-ink-faint">Status</Label>
          <Select value={task.status} onValueChange={(v) => onChange({ status: v as TaskStatus })}>
            <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label className="text-ink-faint">Priority</Label>
          <Select value={task.priority} onValueChange={(v) => onChange({ priority: v as Priority })}>
            <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label className="text-ink-faint">Assignee</Label>
          <Select value={task.assigneeId} onValueChange={(v) => onChange({ assigneeId: v })}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEMBERS.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label className="text-ink-faint">Due date</Label>
          <Input
            type="date"
            value={task.dueDate}
            onChange={(e) => onChange({ dueDate: e.target.value })}
            className="h-8"
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-ink-faint">Notes</Label>
          <Textarea
            placeholder="Add details, links, or context for this task…"
            className="min-h-28"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-ink-faint">Attachments</Label>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-6 text-sm text-ink-faint transition-colors hover:border-ink-faint/50 hover:text-ink-soft cursor-pointer">
            <Paperclip className="size-4" />
            {task.files > 0 ? `${task.files} file(s) attached` : "Attach files"}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-faint">
          Assigned to <MemberAvatar id={task.assigneeId} showName />
        </div>
      </div>
    </>
  );
}
