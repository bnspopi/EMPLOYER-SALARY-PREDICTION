"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Eraser, MessageSquare, Send, User } from "lucide-react";
import { useApp, useActiveAnalysis } from "@/lib/store";
import { coachReply } from "@/lib/engine";
import type { ChatMessage } from "@/lib/types";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/Button";
import { Gate } from "@/components/ui/Gate";
import { DashSkeleton } from "@/components/dashboard/widgets";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What should I fix first?",
  "Rewrite my summary",
  "Am I underpaid?",
  "How do I negotiate?",
  "Which certification?",
];

export function ChatClient() {
  const hydrated = useApp((s) => s.hydrated);
  const chat = useApp((s) => s.chat);
  const pushChat = useApp((s) => s.pushChat);
  const clearChat = useApp((s) => s.clearChat);
  const { analysis } = useActiveAnalysis();

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.length, busy]);

  if (!hydrated) {
    return (
      <>
        <Topbar title="AI resume chat" eyebrow="Hunter" />
        <DashSkeleton rows={2} />
      </>
    );
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    const history: ChatMessage[] = chat;
    pushChat({ role: "user", content: message });
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, history, analysis }),
      });
      if (!res.ok) throw new Error("bad status");
      const data = (await res.json()) as { reply?: string };
      pushChat({ role: "assistant", content: data.reply || coachReply(message, { profile: analysis?.profile, analysis: analysis ?? undefined, history }) });
    } catch {
      // Network failed — fall back to the deterministic coach on the client.
      pushChat({ role: "assistant", content: coachReply(message, { profile: analysis?.profile, analysis: analysis ?? undefined, history }) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Topbar title="AI resume chat" eyebrow="Hunter" />
      <Gate feature="resumeChat">
        <div className="panel flex h-[calc(100vh-13rem)] min-h-[520px] flex-col overflow-hidden rounded-xl2">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-cyan/30 bg-cyan/10 text-cyan shadow-glow-cyan">
                <Bot className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <div className="text-sm font-semibold text-fg">Hunter</div>
                <div className="text-[11px] text-dim">
                  {analysis ? "Grounded in your active analysis" : "Analyze a résumé for tailored answers"}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearChat} disabled={chat.length === 0}>
              <Eraser className="h-4 w-4" aria-hidden /> Clear
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {chat.length === 0 ? (
              <div className="mx-auto max-w-md py-10 text-center">
                <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-line-2 bg-white/5 text-cyan">
                  <MessageSquare className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-base font-semibold text-fg">Ask Hunter anything about your résumé</h3>
                <p className="mt-2 text-sm text-muted">
                  Every answer is grounded in your real analysis — score, gaps, market range and negotiation targets.
                </p>
              </div>
            ) : (
              chat.map((m) => <Bubble key={m.id} message={m} />)
            )}
            {busy ? (
              <div className="flex items-center gap-2 text-sm text-dim">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-2 bg-white/5 text-cyan">
                  <Bot className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex gap-1">
                  <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                </span>
              </div>
            ) : null}
          </div>

          {/* Suggestions + input */}
          <div className="border-t border-line px-5 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  disabled={busy}
                  className="rounded-full border border-line bg-bg-2 px-3 py-1.5 text-xs text-muted transition-colors hover:border-cyan/40 hover:text-cyan disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                placeholder="Ask about your résumé, salary or next move…"
                aria-label="Message Hunter"
                className="max-h-32 min-h-[44px] w-full resize-none rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
              />
              <Button type="submit" disabled={busy || !input.trim()}>
                <Send className="h-4 w-4" aria-hidden /> Send
              </Button>
            </form>
          </div>
        </div>
      </Gate>
    </>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
    >
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full border",
          isUser ? "border-line-2 bg-white/5 text-muted" : "border-cyan/30 bg-cyan/10 text-cyan",
        )}
        aria-hidden
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </span>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-xl2 px-4 py-2.5 text-sm leading-relaxed",
          isUser ? "bg-cyan/10 text-fg" : "border border-line bg-bg-2 text-fg",
        )}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <AnimatePresence>
      <motion.span
        className="inline-block h-1.5 w-1.5 rounded-full bg-cyan"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay }}
      />
    </AnimatePresence>
  );
}
