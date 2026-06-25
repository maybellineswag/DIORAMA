"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Plus,
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NAV } from "@/components/app/nav";
import {
  PRODUCTS,
  productsByStatusTrack,
  RECENT_ACTIVITY,
  UPCOMING_DEADLINES,
  SHOPIFY_STATS,
} from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TONE: Record<string, { dot: string; bar: string }> = {
  info: { dot: "bg-info", bar: "bg-info" },
  clay: { dot: "bg-clay", bar: "bg-clay" },
  good: { dot: "bg-good", bar: "bg-good" },
  warn: { dot: "bg-warn", bar: "bg-warn" },
};

export default function DashboardPage() {
  const tracks = productsByStatusTrack();
  const total = PRODUCTS.length;

  const statusCards = [
    { label: "In development", value: tracks.Development, tone: "info" as const },
    { label: "In sampling", value: tracks["Sample Rounds"], tone: "clay" as const },
    { label: "In production", value: tracks.Production, tone: "good" as const },
    { label: "On hold / dropped", value: tracks["Dead ends"], tone: "warn" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
      <PageHeader
        title="Good morning, Sasha"
        description="Here's what's moving across Olivine today — Thursday, June 25."
        actions={
          <Button size="sm" asChild>
            <Link href="/samples">
              <Plus className="size-4" /> New product
            </Link>
          </Button>
        }
      />

      {/* Pipeline summary */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statusCards.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">{s.label}</span>
              <span className={cn("size-2 rounded-full", TONE[s.tone].dot)} />
            </div>
            <div className="mt-3 flex items-end gap-1.5">
              <span className="tabular text-3xl font-medium leading-none">
                {s.value}
              </span>
              <span className="text-xs text-ink-faint">/ {total} products</span>
            </div>
            <Progress
              value={(s.value / total) * 100}
              className="mt-4"
              indicatorClassName={TONE[s.tone].bar}
            />
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Shopify */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Shopify performance</span>
                <Badge variant="good">Connected</Badge>
              </div>
              <span className="text-xs text-ink-faint">Last 30 days</span>
            </div>
            <div className="grid grid-cols-3 divide-x">
              {[
                { label: "Revenue", value: money(SHOPIFY_STATS.revenue30d), delta: SHOPIFY_STATS.revenueDelta },
                { label: "Orders", value: SHOPIFY_STATS.orders30d.toLocaleString(), delta: SHOPIFY_STATS.ordersDelta },
                { label: "Avg. order", value: money(SHOPIFY_STATS.aov), delta: SHOPIFY_STATS.aovDelta },
              ].map((m) => (
                <div key={m.label} className="p-5">
                  <p className="text-xs text-ink-soft">{m.label}</p>
                  <p className="tabular mt-1.5 text-2xl font-medium">{m.value}</p>
                  <p
                    className={cn(
                      "mt-1 flex items-center gap-1 text-xs",
                      m.delta >= 0 ? "text-good" : "text-danger",
                    )}
                  >
                    {m.delta >= 0 ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {Math.abs(m.delta)}%
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <div className="border-b px-5 py-3.5">
                <span className="text-sm font-medium">Top products</span>
              </div>
              <div className="divide-y">
                {SHOPIFY_STATS.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 px-5 py-3">
                    <span className="tabular w-4 text-xs text-ink-faint">{i + 1}</span>
                    <div className="size-9 shrink-0 overflow-hidden rounded-md border">
                      <Thumb seed={p.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{p.name}</p>
                      <p className="text-xs text-ink-faint">{p.units} units</p>
                    </div>
                    <span className="tabular text-sm text-ink-soft">
                      {money(p.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 border-b px-5 py-3.5">
                <AlertTriangle className="size-4 text-warn" />
                <span className="text-sm font-medium">Inventory alerts</span>
              </div>
              <div className="divide-y">
                {SHOPIFY_STATS.inventoryAlerts.map((a) => (
                  <div key={a.name} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{a.name}</p>
                      <p className="text-xs text-ink-faint">{a.units} units left</p>
                    </div>
                    <Badge variant={a.level === "Critical" ? "danger" : "warn"}>
                      {a.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <Card>
            <div className="border-b px-5 py-3.5">
              <span className="text-sm font-medium">Upcoming deadlines</span>
            </div>
            <div className="divide-y">
              {UPCOMING_DEADLINES.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-5 py-3">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 flex-col items-center justify-center rounded-md border text-center",
                      d.tone === "danger" && "border-danger/30 bg-danger-soft text-danger",
                      d.tone === "warn" && "border-warn/30 bg-warn-soft text-warn",
                      d.tone === "default" && "bg-surface-2 text-ink-soft",
                    )}
                  >
                    <span className="text-[9px] uppercase leading-none">
                      {d.date.split(" ")[0]}
                    </span>
                    <span className="tabular text-sm font-medium leading-tight">
                      {d.date.split(" ")[1]}
                    </span>
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm">{d.label}</p>
                  <span className="text-xs text-ink-faint">{d.daysOut}d</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="border-b px-5 py-3.5">
              <span className="text-sm font-medium">Recent activity</span>
            </div>
            <div className="space-y-3 p-5">
              {RECENT_ACTIVITY.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-clay" />
                  <div>
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-ink-soft">{a.action}</span>
                    </p>
                    <p className="text-xs text-ink-faint">
                      {a.context} · {a.at}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick links */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink-soft">Jump back in</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {NAV.filter((n) => n.href !== "/dashboard").map((n) => {
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href}>
                <Card className="group p-4 transition-colors hover:border-ink-faint/40 hover:bg-surface-hi">
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-md bg-surface-2 group-hover:bg-clay-soft">
                      <Icon className="size-4 text-ink-soft group-hover:text-clay-ink" />
                    </span>
                    <ArrowRight className="size-4 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-3 text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-ink-faint">{n.hint}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
