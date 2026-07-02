"use client";

import * as React from "react";
import { Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Connection } from "@/lib/mock/commerce";

function PinterestMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#e60023]" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.08 2.44 7.58 5.94 9.13-.08-.78-.16-1.97.03-2.82.18-.77 1.15-4.9 1.15-4.9s-.29-.59-.29-1.46c0-1.37.79-2.39 1.78-2.39.84 0 1.25.63 1.25 1.39 0 .85-.54 2.12-.82 3.3-.23.98.49 1.79 1.46 1.79 1.75 0 3.1-1.85 3.1-4.51 0-2.36-1.7-4.01-4.12-4.01-2.81 0-4.46 2.1-4.46 4.28 0 .85.33 1.76.74 2.25.08.1.09.18.07.29l-.27 1.1c-.04.18-.14.22-.33.13-1.23-.57-2-2.37-2-3.81 0-3.1 2.25-5.95 6.5-5.95 3.41 0 6.06 2.43 6.06 5.68 0 3.39-2.14 6.12-5.1 6.12-1 0-1.93-.52-2.25-1.13l-.61 2.34c-.22.85-.82 1.91-1.22 2.56.92.28 1.89.44 2.9.44 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}
function ArenaMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <circle cx="5" cy="12" r="2.4" />
      <circle cx="12" cy="12" r="2.4" />
      <circle cx="19" cy="12" r="2.4" />
    </svg>
  );
}

export function MoodConnections({
  open,
  onOpenChange,
  connections,
  setConnections,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  connections: Connection[];
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
}) {
  const patch = (id: string, p: Partial<Connection>) =>
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, ...p } : c)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sources</DialogTitle>
          <DialogDescription>
            Sync references from Pinterest and Are.na straight into your moodboard.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {connections.map((c) => (
            <div key={c.id} className="flex flex-col rounded-xl border bg-surface-2/40 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg border bg-card">
                    {c.id === "pinterest" ? <PinterestMark /> : <ArenaMark />}
                  </span>
                  <span className="font-medium">{c.name}</span>
                </div>
                {c.connected ? (
                  <Badge variant="good"><Check className="size-3" /> Connected</Badge>
                ) : null}
              </div>

              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-ink-faint">
                    {c.id === "pinterest" ? "Boards to sync" : "Channels to sync"}
                  </Label>
                  <Input
                    value={c.source}
                    onChange={(e) => patch(c.id, { source: e.target.value })}
                    placeholder={c.id === "pinterest" ? "username/board" : "channel-slug"}
                    disabled={!c.connected}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-ink-faint">Sync frequency</Label>
                  <Select
                    value={c.frequency}
                    onValueChange={(v) => patch(c.id, { frequency: v as Connection["frequency"] })}
                    disabled={!c.connected}
                  >
                    <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="hourly">Every hour</SelectItem>
                      <SelectItem value="daily">Every day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {c.connected && (
                  <>
                    <div className="flex items-center justify-between text-xs text-ink-faint">
                      <span>Last synced {c.lastSynced}</span>
                      <button
                        onClick={() => {
                          patch(c.id, { lastSynced: "just now" });
                          toast.success(`Synced ${c.name}`, { description: "Pulled new references into Imports." });
                        }}
                        className="flex items-center gap-1 text-accent-ink hover:underline cursor-pointer"
                      >
                        <RefreshCw className="size-3" /> Sync now
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {c.preview.map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={src}
                          src={src}
                          alt=""
                          draggable={false}
                          className="aspect-square w-full select-none rounded-md border object-cover"
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <Button
                variant={c.connected ? "secondary" : "default"}
                size="sm"
                className="mt-4"
                onClick={() => {
                  patch(c.id, {
                    connected: !c.connected,
                    lastSynced: !c.connected ? "just now" : "Never",
                  });
                  toast.success(c.connected ? `Disconnected ${c.name}` : `Connected ${c.name}`);
                }}
              >
                {c.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
