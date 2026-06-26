"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Plus,
} from "lucide-react";

import { Greeting } from "@/components/app/greeting";
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
import { SHOPIFY_DROPS_STATS } from "@/lib/mock/commerce";
import { cn } from "@/lib/utils";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TONE: Record<string, { dot: string; bar: string }> = {
  info: { dot: "bg-info", bar: "bg-info" },
  accent: { dot: "bg-accent", bar: "bg-accent" },
  good: { dot: "bg-good", bar: "bg-good" },
  warn: { dot: "bg-warn", bar: "bg-warn" },
};

const contextHref: Record<string, string> = {
  "Sample Tracker": "/samples",
  Moodboard: "/moodboard",
  Tasks: "/tasks",
};

export default function HomePage() {
  const router = useRouter();
  const tracks = productsByStatusTrack();
  const total = PRODUCTS.length;
  const [shopPeriod, setShopPeriod] = React.useState<"30d" | "drops">("30d");
  const shop =
    shopPeriod === "drops"
      ? SHOPIFY_DROPS_STATS
      : {
          revenue: SHOPIFY_STATS.revenue30d,
          revenueDelta: SHOPIFY_STATS.revenueDelta,
          orders: SHOPIFY_STATS.orders30d,
          ordersDelta: SHOPIFY_STATS.ordersDelta,
          aov: SHOPIFY_STATS.aov,
          aovDelta: SHOPIFY_STATS.aovDelta,
        };

  const statusCards = [
    { label: "In development", value: tracks.Development, tone: "info" as const },
    { label: "In sampling", value: tracks["Sample Rounds"], tone: "accent" as const },
    { label: "In production", value: tracks.Production, tone: "good" as const },
    { label: "On hold / dropped", value: tracks["Dead ends"], tone: "warn" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Greeting name="Grisha" />
        <Button size="sm" asChild>
          <Link href="/samples">
            <Plus className="size-4" /> New product
          </Link>
        </Button>
      </div>

      {/* Pipeline summary — each links into the tracker */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statusCards.map((s) => (
          <Link key={s.label} href="/samples">
            <Card className="p-5 transition-all hover:-translate-y-0.5 hover:border-ink-faint/40 hover:shadow-md">
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
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Shopify */}
        <div className="space-y-6 lg:col-span-2">
          <Card
            onClick={() => router.push("/shopify")}
            className="cursor-pointer overflow-hidden transition-all hover:border-ink-faint/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Shopify performance</span>
                <Badge variant="good">Connected</Badge>
              </div>
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-0.5 rounded-lg border bg-surface-2/60 p-0.5"
              >
                {(
                  [
                    ["30d", "Last 30 days"],
                    ["drops", "Last 2 drops"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setShopPeriod(id)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      shopPeriod === id ? "bg-card text-foreground shadow-sm" : "text-ink-soft hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x">
              {[
                { label: "Revenue", value: money(shop.revenue), delta: shop.revenueDelta },
                { label: "Orders", value: shop.orders.toLocaleString(), delta: shop.ordersDelta },
                { label: "Avg. order", value: money(shop.aov), delta: shop.aovDelta },
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
                {SHOPIFY_STATS.topProducts.map((p, i) => {
                  const pid = PRODUCTS.find((x) => x.name === p.name)?.id;
                  return (
                  <Link
                    key={p.name}
                    href={pid ? `/samples?product=${pid}` : "/samples"}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-elevated/50"
                  >
                    <span className="tabular w-4 text-xs text-ink-faint">{i + 1}</span>
                    <div className="size-9 shrink-0 overflow-hidden rounded-md border">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Thumb seed={p.name} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{p.name}</p>
                      <p className="text-xs text-ink-faint">{p.units} units</p>
                    </div>
                    <span className="tabular text-sm text-ink-soft">
                      {money(p.revenue)}
                    </span>
                  </Link>
                  );
                })}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 border-b px-5 py-3.5">
                <AlertTriangle className="size-4 text-warn" />
                <span className="text-sm font-medium">Inventory alerts</span>
              </div>
              <div className="divide-y">
                {SHOPIFY_STATS.inventoryAlerts.map((a) => (
                  <Link
                    key={a.name}
                    href="/samples"
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-elevated/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">{a.name}</p>
                      <p className="text-xs text-ink-faint">{a.units} units left</p>
                    </div>
                    <Badge variant={a.level === "Critical" ? "danger" : "warn"}>
                      {a.level}
                    </Badge>
                  </Link>
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
                <Link
                  key={d.id}
                  href="/samples"
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-elevated/50"
                >
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
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <div className="border-b px-5 py-3.5">
              <span className="text-sm font-medium">Recent activity</span>
            </div>
            <div className="divide-y">
              {RECENT_ACTIVITY.map((a) => (
                <Link
                  key={a.id}
                  href={contextHref[a.context] ?? "/home"}
                  className="flex gap-3 px-5 py-3 transition-colors hover:bg-elevated/50"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-ink-soft">{a.action}</span>
                    </p>
                    <p className="text-xs text-ink-faint">
                      {a.context} · {a.at}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick links */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink-soft">Jump back in</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {NAV.filter((n) => n.href !== "/home").map((n) => {
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href}>
                <Card className="group p-4 transition-all hover:-translate-y-0.5 hover:border-ink-faint/40 hover:bg-surface-hi hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-md bg-surface-2 group-hover:bg-accent-soft">
                      <Icon className="size-4 text-ink-soft group-hover:text-accent-ink" />
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
