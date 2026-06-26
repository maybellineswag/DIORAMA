"use client";

import { PageHeader } from "@/components/app/page-header";
import { CalendarView } from "@/components/app/calendar-view";

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Calendar"
        description="Every deadline, delivery, task, and drop across the workspace."
      />
      <CalendarView />
    </div>
  );
}
