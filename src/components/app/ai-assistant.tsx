"use client";

import * as React from "react";
import { Sparkles, ArrowUp, Send } from "lucide-react";

import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface Msg {
  role: "user" | "ai";
  text: string;
}

const SUGGESTIONS = [
  "What samples are blocked right now?",
  "Summarize this week's deadlines",
  "Which manufacturer is best for knitwear?",
  "Draft a follow-up to İstanbul Knitworks",
];

function mockAnswer(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("block") || t.includes("delay") || t.includes("risk"))
    return "Two items need attention: the Reliquary Trail Sneaker is in Production Delay (Coimbra reported a 3-week outsole tooling backlog), and the Reliquary Hoodie techpack v3 is due in 2 days. I'd prioritize chasing Coimbra and finalizing the hoodie techpack today.";
  if (t.includes("deadline") || t.includes("week") || t.includes("due"))
    return "This week: Core tote QC sign-off (tomorrow), Reliquary hoodie techpack v3 (Jun 27), and Ember scarf Round 2 revisions (Jun 28). The hoodie and tote are the two at-risk items — both are flagged Urgent.";
  if (t.includes("knit") || t.includes("sweater"))
    return "For knitwear, İstanbul Knitworks (Turkey) is your strongest fit — heavy-gauge specialty, MOQ 120, 30–40 day lead time, 4.3★. Hangzhou Silk Road also handles knit but is better suited to loopback fleece. Want me to draft a sampling brief?";
  if (t.includes("draft") || t.includes("follow") || t.includes("email"))
    return "Here's a draft:\n\n\"Hi Elif — checking in on the Round 2 Lichen sweater sample shipped Jun 20. Could you confirm the tracking and the revised collar-rib gauge? We're aiming to lock production by early July. Thanks!\"";
  if (t.includes("collection") || t.includes("capsule") || t.includes("drop"))
    return "Your AW25 — Reliquary collection has 6 active pieces across Development and Production. The hoodie and bomber are the hero pieces; the cargo and sneaker round out the silhouette. Consider adding one accessory (the Ember scarf could bridge into this drop).";
  return "Based on your Olivine workspace: you have 11 products in the pipeline, 5 upcoming deadlines this week, and 3 inventory alerts from Shopify. The most pressing item is the Reliquary hoodie techpack, due in 2 days. What would you like to dig into?";
}

export function AiAssistant() {
  const { assistantOpen, setAssistantOpen } = useApp();
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: mockAnswer(text) }]);
      setThinking(false);
    }, 700);
  };

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, thinking]);

  return (
    <>
      {/* Floating button — present on every page */}
      {!assistantOpen && (
        <button
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-clay text-primary-foreground shadow-xl shadow-black/40 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open AI assistant"
        >
          <Sparkles className="size-5" />
        </button>
      )}

      <Sheet open={assistantOpen} onOpenChange={setAssistantOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="flex-row items-center gap-2.5 space-y-0">
            <span className="flex size-8 items-center justify-center rounded-md bg-clay-soft">
              <Sparkles className="size-4 text-clay-ink" />
            </span>
            <div>
              <SheetTitle>Diorama AI</SheetTitle>
              <SheetDescription>Your studio assistant · Olivine</SheetDescription>
            </div>
          </SheetHeader>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-ink-soft">
                  Ask anything about your pipeline, samples, manufacturers, or
                  deadlines. Try one of these:
                </p>
                <div className="space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3.5 py-2.5 text-left text-sm transition-colors hover:border-ink-faint/40 hover:bg-surface-hi cursor-pointer"
                    >
                      {s}
                      <ArrowUp className="size-3.5 shrink-0 rotate-45 text-ink-faint" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-clay text-primary-foreground"
                      : "border bg-surface text-foreground",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl border bg-surface px-3.5 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 animate-bounce rounded-full bg-ink-faint"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Diorama AI…"
                className="h-10"
              />
              <Button type="submit" size="icon" className="size-10 shrink-0" disabled={!input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
            <p className="mt-2 text-center text-[11px] text-ink-faint">
              Responses are simulated for this prototype.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
