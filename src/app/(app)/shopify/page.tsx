"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, AlertTriangle, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { AiPanel } from "@/components/app/ai-panel";
import { Thumb } from "@/components/thumb";
import { LineChart } from "@/components/chart";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SHOPIFY_STATS } from "@/lib/mock/data";
import { SHOPIFY_SERIES, SHOPIFY_INSIGHTS, DROPS } from "@/lib/mock/commerce";
import { cn } from "@/lib/utils";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type Period = "30d" | "90d" | "drop";

function Delta({ v }: { v: number }) {
  return (
    <span className={cn("flex items-center gap-1 text-xs", v >= 0 ? "text-good" : "text-danger")}>
      {v >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {Math.abs(v)}%
    </span>
  );
}

export default function ShopifyPage() {
  const [period, setPeriod] = React.useState<Period>("30d");
  const released = DROPS.filter((d) => d.released);
  const maxDropRev = Math.max(...released.map((d) => d.revenue), 1);

  const series =
    period === "90d" ? SHOPIFY_SERIES.revenue90 : SHOPIFY_SERIES.revenue30;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Store"
        description="Your Shopify performance, in one place."
        actions={
          <Button variant="secondary" size="sm">
            <ExternalLink className="size-4" /> Open Shopify
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Revenue", value: money(SHOPIFY_STATS.revenue30d), delta: SHOPIFY_STATS.revenueDelta },
              { label: "Orders", value: SHOPIFY_STATS.orders30d.toLocaleString(), delta: SHOPIFY_STATS.ordersDelta },
              { label: "Avg. order value", value: money(SHOPIFY_STATS.aov), delta: SHOPIFY_STATS.aovDelta },
            ].map((m) => (
              <Card key={m.label} className="p-4">
                <p className="text-xs text-ink-soft">{m.label}</p>
                <p className="tabular mt-1.5 text-2xl font-medium">{m.value}</p>
                <div className="mt-1"><Delta v={m.delta} /></div>
              </Card>
            ))}
          </div>

          {/* Revenue chart */}
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">Revenue</span>
              <div className="flex items-center gap-0.5 rounded-lg border bg-surface-2/60 p-0.5">
                {(["30d", "90d", "drop"] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors cursor-pointer",
                      period === p ? "bg-card text-foreground shadow-sm" : "text-ink-soft hover:text-foreground",
                    )}
                  >
                    {p === "30d" ? "30 days" : p === "90d" ? "90 days" : "By drop"}
                  </button>
                ))}
              </div>
            </div>

            {period === "drop" ? (
              <div className="space-y-3 pt-1">
                {released.map((d) => (
                  <div key={d.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-soft">{d.name}</span>
                      <span className="tabular font-medium">{money(d.revenue)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${(d.revenue / maxDropRev) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <LineChart data={series} height={180} />
            )}
          </Card>

          {/* Orders over time */}
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Orders over time</span>
              <span className="text-xs text-ink-faint">Last 30 days</span>
            </div>
            <LineChart data={SHOPIFY_SERIES.orders30} height={120} color="var(--info)" />
          </Card>

          {/* Top products */}
          <Card>
            <div className="border-b px-5 py-3.5">
              <span className="text-sm font-medium">Top products</span>
            </div>
            <div className="grid grid-cols-[1fr_90px_110px] gap-4 border-b bg-surface-2/40 px-5 py-2 text-xs font-medium text-ink-faint">
              <span>Product</span>
              <span className="text-right">Units</span>
              <span className="text-right">Revenue</span>
            </div>
            {SHOPIFY_STATS.topProducts.map((p) => (
              <div key={p.name} className="grid grid-cols-[1fr_90px_110px] items-center gap-4 border-b px-5 py-3 last:border-0">
                <span className="flex items-center gap-3 min-w-0">
                  <span className="size-8 shrink-0 overflow-hidden rounded-md border">
                    <Thumb seed={p.name} />
                  </span>
                  <span className="truncate text-sm">{p.name}</span>
                </span>
                <span className="tabular text-right text-sm text-ink-soft">{p.units}</span>
                <span className="tabular text-right text-sm">{money(p.revenue)}</span>
              </div>
            ))}
          </Card>

          {/* Inventory alerts */}
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
                  <Badge variant={a.level === "Critical" ? "danger" : "warn"}>{a.level}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI evaluation */}
        <div className="lg:col-span-1">
          <AiPanel
            subtitle="Reading your store like an analyst"
            insights={SHOPIFY_INSIGHTS}
            className="lg:sticky lg:top-20"
          />
        </div>
      </div>
    </div>
  );
}
