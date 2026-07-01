"use client";

import * as React from "react";
import { Wand2, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Board } from "@/lib/mock/moodboard";

export type ImportItem = { id: string; src: string; source: string };

const STEPS = ["How it works", "Folder rules", "Review & file"];

export function MoodAiSort({
  open,
  onOpenChange,
  boards,
  imports,
  onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  boards: Board[];
  imports: ImportItem[];
  onApply: (assignments: Record<string, string>, rules: Record<string, string>) => void;
}) {
  const [step, setStep] = React.useState(0);
  const [rules, setRules] = React.useState<Record<string, string>>({});
  const [assign, setAssign] = React.useState<Record<string, string>>({});

  // Seed rules + reset when opened.
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setRules(Object.fromEntries(boards.map((b) => [b.id, b.rule ?? ""])));
    }
  }, [open, boards]);

  // Compute naive suggestions when entering the review step.
  React.useEffect(() => {
    if (step === 2 && boards.length) {
      setAssign(Object.fromEntries(imports.map((im, i) => [im.id, boards[i % boards.length].id])));
    }
  }, [step, imports, boards]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        {/* Header / stepper */}
        <div className="border-b p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
              <Wand2 className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium leading-tight">AI Sort</p>
              <p className="text-xs leading-tight text-ink-faint">
                Teach Diorama how to file references into your boards
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[11px]",
                      i < step ? "bg-accent text-accent-foreground" : i === step ? "bg-accent-soft text-accent-ink" : "bg-surface-2 text-ink-faint",
                    )}
                  >
                    {i < step ? <Check className="size-3" /> : i + 1}
                  </span>
                  <span className={cn("text-xs", i === step ? "font-medium" : "text-ink-faint")}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {step === 0 ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-ink-soft">
                When you connect Pinterest or Are.na, new references land in your{" "}
                <span className="font-medium text-foreground">Imports</span> inbox. AI Sort reads
                each one and files it into the right board using rules you set per board — so your
                moodboard stays organized without manual dragging.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { t: "Define rules", d: "Say what belongs in each board, in plain language." },
                  { t: "AI matches", d: "Every import is scored against your rules." },
                  { t: "You approve", d: "Review the suggestions, tweak, then file them." },
                ].map((c, i) => (
                  <div key={c.t} className="rounded-lg border bg-surface-2/40 p-3">
                    <span className="flex size-6 items-center justify-center rounded-md bg-accent-soft text-xs text-accent-ink">
                      {i + 1}
                    </span>
                    <p className="mt-2 text-sm font-medium">{c.t}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{c.d}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-ink-soft">
                What belongs in each board? These rules are saved and reused every time new
                references sync.
              </p>
              {boards.map((b) => (
                <div key={b.id} className="space-y-1.5">
                  <label className="text-sm font-medium">{b.name}</label>
                  <Textarea
                    value={rules[b.id] ?? ""}
                    onChange={(e) => setRules((r) => ({ ...r, [b.id]: e.target.value }))}
                    placeholder="e.g. fabric close-ups, knits, weaves, washes…"
                    className="min-h-[60px] text-sm"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                <Sparkles className="size-3.5 text-accent-ink" />
                {imports.length} references scored — adjust any before filing.
              </p>
              {imports.map((im) => (
                <div key={im.id} className="flex items-center gap-3 rounded-lg border bg-surface-2/40 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.src} alt="" className="size-12 shrink-0 rounded-md object-cover" />
                  <Badge variant="outline" className="shrink-0">{im.source}</Badge>
                  <ArrowRight className="size-4 shrink-0 text-ink-faint" />
                  <select
                    value={assign[im.id] ?? ""}
                    onChange={(e) => setAssign((a) => ({ ...a, [im.id]: e.target.value }))}
                    className="ml-auto rounded-md border bg-card px-2 py-1.5 text-sm"
                  >
                    {boards.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              ))}
              {imports.length === 0 && (
                <p className="py-8 text-center text-sm text-ink-faint">Nothing in the inbox to sort.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t p-4">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? onOpenChange(false) : setStep((s) => s - 1))}
          >
            {step === 0 ? "Cancel" : (<><ArrowLeft className="size-4" /> Back</>)}
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                onApply(assign, rules);
                onOpenChange(false);
              }}
              disabled={imports.length === 0}
            >
              <Check className="size-4" /> File {imports.length} references
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
