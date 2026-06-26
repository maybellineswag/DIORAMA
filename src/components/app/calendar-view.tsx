"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  CALENDAR_EVENTS,
  EVENT_COLORS,
  EVENT_LABELS,
  type CalendarEvent,
  type EventType,
} from "@/lib/mock/commerce";
import { cn } from "@/lib/utils";

const TODAY = new Date("2026-06-26");
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function EventChip({ ev, onClick }: { ev: CalendarEvent; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={ev.meta ? `${ev.title} · ${ev.meta}` : ev.title}
      className="flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left text-[11px] leading-tight transition-colors hover:bg-elevated cursor-pointer"
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: EVENT_COLORS[ev.type] }} />
      <span className="truncate">{ev.title}</span>
    </button>
  );
}

export function CalendarView({
  events = CALENDAR_EVENTS,
  types,
}: {
  events?: CalendarEvent[];
  /** Limit the legend/colors shown (e.g. sample+production only). */
  types?: EventType[];
}) {
  const router = useRouter();
  const [cursor, setCursor] = React.useState(new Date(2026, 5, 1));
  const [mode, setMode] = React.useState<"month" | "week">("month");

  const byDate = React.useMemo(() => {
    const m = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const arr = m.get(e.date) ?? [];
      arr.push(e);
      m.set(e.date, arr);
    }
    return m;
  }, [events]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells: (Date | null)[] = [];
  if (mode === "month") {
    const first = new Date(year, month, 1);
    const lead = first.getDay();
    const days = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
  } else {
    const start = new Date(cursor);
    start.setDate(cursor.getDate() - cursor.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push(d);
    }
  }

  const step = (dir: 1 | -1) => {
    const c = new Date(cursor);
    if (mode === "month") c.setMonth(c.getMonth() + dir);
    else c.setDate(c.getDate() + dir * 7);
    setCursor(c);
  };

  const legendTypes = types ?? (["sample", "production", "task", "drop"] as EventType[]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="display text-lg">
            {MONTHS[month]} {year}
          </span>
          <div className="flex items-center gap-0.5">
            <button onClick={() => step(-1)} className="flex size-7 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-elevated cursor-pointer">
              <ChevronLeft className="size-4" />
            </button>
            <button onClick={() => step(1)} className="flex size-7 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-elevated cursor-pointer">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <button
            onClick={() => setCursor(new Date(2026, 5, 1))}
            className="rounded-md border px-2.5 py-1 text-xs text-ink-soft transition-colors hover:bg-elevated cursor-pointer"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            {legendTypes.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-ink-soft">
                <span className="size-2 rounded-full" style={{ backgroundColor: EVENT_COLORS[t] }} />
                {EVENT_LABELS[t]}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-0.5 rounded-lg border bg-surface-2/60 p-0.5">
            {(["month", "week"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[13px] font-medium capitalize transition-colors cursor-pointer",
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-ink-soft hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="grid grid-cols-7 border-b bg-surface-2/40">
          {DOW.map((d) => (
            <div key={d} className="px-2 py-2 text-[11px] font-medium text-ink-faint">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            const dayEvents = d ? byDate.get(iso(d)) ?? [] : [];
            const isToday = d && iso(d) === iso(TODAY);
            return (
              <div
                key={i}
                className={cn(
                  "border-b border-r p-1.5 [&:nth-child(7n)]:border-r-0",
                  mode === "month" ? "min-h-[104px]" : "min-h-[320px]",
                  !d && "bg-surface-2/20",
                )}
              >
                {d && (
                  <>
                    <div className="mb-1 flex items-center px-0.5">
                      <span
                        className={cn(
                          "tabular flex size-6 items-center justify-center rounded-full text-xs",
                          isToday ? "bg-accent text-primary-foreground font-medium" : "text-ink-soft",
                        )}
                      >
                        {d.getDate()}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, mode === "month" ? 3 : 12).map((ev) => (
                        <EventChip key={ev.id} ev={ev} onClick={() => router.push(ev.href)} />
                      ))}
                      {mode === "month" && dayEvents.length > 3 && (
                        <span className="px-1.5 text-[11px] text-ink-faint">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
