"use client";

import * as React from "react";
import { Wand2, ArrowRight, ArrowLeft, Check } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Board } from "@/lib/mock/moodboard";

const STEPS = ["How it works", "Folder rules"];

/**
 * One-time onboarding for AI Sort. Runs the first time a brand opens the
 * sorter (and again from Settings), then hands off to the sorter itself.
 */
export function MoodAiSortOnboarding({
  open,
  onOpenChange,
  boards,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  boards: Board[];
  onComplete: (rules: Record<string, string>) => void;
}) {
  const [step, setStep] = React.useState(0);
  const [rules, setRules] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setStep(0);
      setRules(Object.fromEntries(boards.map((b) => [b.id, b.rule ?? ""])));
    }
  }, [open, boards]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="border-b p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
              <Wand2 className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium leading-tight">Set up AI Sort</p>
              <p className="text-xs leading-tight text-ink-faint">A one-time setup — edit anytime in Settings</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1.5">
                  <span className={cn("flex size-5 items-center justify-center rounded-full text-[11px]", i < step ? "bg-accent text-accent-foreground" : i === step ? "bg-accent-soft text-accent-ink" : "bg-surface-2 text-ink-faint")}>
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
                Drop in a folder of references — even a few hundred at once — and AI Sort files each
                one into the right folder. It learns from a short rule you write per folder, then works
                on <span className="font-medium text-foreground">automatic</span>,{" "}
                <span className="font-medium text-foreground">semi-automatic</span>, or{" "}
                <span className="font-medium text-foreground">manual</span> — your call, in batches.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { t: "Write rules", d: "One line per folder describing what belongs." },
                  { t: "Drop images", d: "Ingest hundreds at once, in batches." },
                  { t: "Auto or review", d: "Let it file, or approve batch by batch." },
                ].map((c, i) => (
                  <div key={c.t} className="rounded-lg border bg-surface-2/40 p-3">
                    <span className="flex size-6 items-center justify-center rounded-md bg-accent-soft text-xs text-accent-ink">{i + 1}</span>
                    <p className="mt-2 text-sm font-medium">{c.t}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{c.d}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-ink-soft">What belongs in each folder? Saved and reused every time you sort.</p>
              {boards.map((b) => (
                <div key={b.id} className="space-y-1.5">
                  <label className="text-sm font-medium">{b.name}</label>
                  <Textarea
                    value={rules[b.id] ?? ""}
                    onChange={(e) => setRules((r) => ({ ...r, [b.id]: e.target.value }))}
                    placeholder="e.g. fabric close-ups, knits, weaves, washes…"
                    className="min-h-[56px] text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t p-4">
          <Button variant="ghost" onClick={() => (step === 0 ? onOpenChange(false) : setStep(0))}>
            {step === 0 ? "Cancel" : (<><ArrowLeft className="size-4" /> Back</>)}
          </Button>
          {step === 0 ? (
            <Button onClick={() => setStep(1)}>Continue <ArrowRight className="size-4" /></Button>
          ) : (
            <Button onClick={() => onComplete(rules)}><Check className="size-4" /> Save & start sorting</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
