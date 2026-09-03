"use client";
import { useState } from "react";
import { Check, FileText, Pencil, Plus, RefreshCw, Trash2, Users } from "lucide-react";
import { useApp } from "@/lib/store";
import { analyzeResume } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { can } from "@/lib/plans";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DashSkeleton, SectionHeader, formatDate, wordCount } from "@/components/dashboard/widgets";
import { cn, uid } from "@/lib/utils";
import { SAMPLE_RESUME, SAMPLE_RESUME_NAME } from "@/data/sample-resume";

export function ResumesClient() {
  const hydrated = useApp((s) => s.hydrated);
  const plan = useApp((s) => s.plan);
  const resumes = useApp((s) => s.resumes);
  const analyses = useApp((s) => s.analyses);
  const activeResumeId = useApp((s) => s.activeResumeId);
  const addResume = useApp((s) => s.addResume);
  const removeResume = useApp((s) => s.removeResume);
  const setActiveResume = useApp((s) => s.setActiveResume);
  const setAnalysis = useApp((s) => s.setAnalysis);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [isOther, setIsOther] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <>
        <Topbar title="Resumes" eyebrow="Versions" />
        <DashSkeleton rows={2} />
      </>
    );
  }

  const showExact = can(plan, "exactMedian");

  function analyzeInto(resumeId: string, resumeText: string) {
    const a = analyzeResume({ text: resumeText, resumeId });
    setAnalysis(resumeId, a);
  }

  function addNew() {
    if (wordCount(text) < 12) return;
    const resumeId = uid("res");
    const finalName = name.trim() || (isOther ? "Someone else's resume" : `Resume · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
    addResume({ id: resumeId, name: finalName, text, isOther });
    analyzeInto(resumeId, text);
    setActiveResume(resumeId);
    setName("");
    setText("");
    setIsOther(false);
    setShowAdd(false);
  }

  function saveRename(id: string) {
    const v = editName.trim();
    if (v) useApp.setState((s) => ({ resumes: s.resumes.map((r) => (r.id === id ? { ...r, name: v } : r)) }));
    setEditingId(null);
  }

  return (
    <>
      <Topbar title="Resumes" eyebrow="Versions" />

      <SectionHeader
        eyebrow="Multiple resume versions"
        title="Your resumes"
        description="Keep several versions, benchmark a peer or candidate, and switch which one the dashboard is built around."
        action={
          <div className="flex gap-2">
            {resumes.length === 0 ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setName(SAMPLE_RESUME_NAME);
                  setText(SAMPLE_RESUME);
                  setShowAdd(true);
                }}
              >
                Use sample
              </Button>
            ) : null}
            <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
              <Plus className="h-4 w-4" aria-hidden /> Add resume
            </Button>
          </div>
        }
      />

      {/* Add form */}
      {showAdd ? (
        <div className="panel mb-6 rounded-xl2 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label hint="optional">Version name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. PM resume v3" aria-label="Version name" />
            </div>
            <label className="flex items-end gap-3 pb-1">
              <span className="relative inline-flex">
                <input type="checkbox" className="peer sr-only" checked={isOther} onChange={(e) => setIsOther(e.target.checked)} />
                <span className="grid h-5 w-9 items-center rounded-full bg-line-2 p-0.5 transition-colors peer-checked:bg-cyan/70" aria-hidden>
                  <span className={cn("h-4 w-4 rounded-full bg-fg transition-transform", isOther && "translate-x-4")} />
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-sm text-fg">
                <Users className="h-4 w-4 text-cyan" aria-hidden /> Someone else&apos;s resume
              </span>
            </label>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <Label>Resume text</Label>
              <span className="text-[11px] tabular-nums text-dim">{wordCount(text)} words</span>
            </div>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Paste the resume text…" aria-label="Resume text" />
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={addNew} disabled={wordCount(text) < 12}>
              Add & analyze
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {/* List */}
      {resumes.length === 0 ? (
        <div className="panel rounded-xl2 p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-dim" aria-hidden />
          <p className="mt-3 text-sm text-muted">No resumes yet. Add one above or run an analysis.</p>
          <Button href="/analyze" size="sm" className="mt-4">
            Analyze my resume
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((r) => {
            const a = analyses[r.id];
            const active = r.id === activeResumeId;
            return (
              <div
                key={r.id}
                className={cn("panel rounded-xl2 p-5 transition-colors", active ? "border-cyan/40" : "hover:border-line-2")}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {editingId === r.id ? (
                        <span className="flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveRename(r.id)}
                            className="h-8 w-56"
                            aria-label="Rename resume"
                            autoFocus
                          />
                          <Button size="sm" onClick={() => saveRename(r.id)}>
                            <Check className="h-4 w-4" aria-hidden /> Save
                          </Button>
                        </span>
                      ) : (
                        <h3 className="text-base font-semibold text-fg">{r.name}</h3>
                      )}
                      {active ? <Badge tone="cyan">Active</Badge> : null}
                      {r.isOther ? <Badge tone="neutral">Comparison</Badge> : null}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dim">
                      <span>{formatDate(r.createdAt)}</span>
                      <span className="tabular-nums">{wordCount(r.text)} words</span>
                      {a ? (
                        <span className="text-muted">
                          {a.estimate.role} · {showExact ? formatMoney(a.estimate.median, a.estimate.currency, { compact: true }) : a.estimate.percentileLabel} ·{" "}
                          {a.estimate.percentileLabel} · score {a.score.score}/100
                        </span>
                      ) : (
                        <span className="text-amber">Not analyzed yet</span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {!active ? (
                      <Button variant="secondary" size="sm" onClick={() => setActiveResume(r.id)}>
                        Set active
                      </Button>
                    ) : null}
                    <button
                      onClick={() => analyzeInto(r.id, r.text)}
                      className="grid h-8 w-8 place-items-center rounded-md border border-line text-muted hover:border-line-2 hover:text-fg"
                      aria-label="Re-analyze"
                      title="Re-analyze"
                    >
                      <RefreshCw className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(r.id);
                        setEditName(r.name);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-md border border-line text-muted hover:border-line-2 hover:text-fg"
                      aria-label="Rename"
                      title="Rename"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                    {confirmId === r.id ? (
                      <span className="flex items-center gap-1">
                        <Button variant="ember" size="sm" onClick={() => { removeResume(r.id); setConfirmId(null); }}>
                          Delete
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>
                          No
                        </Button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmId(r.id)}
                        className="grid h-8 w-8 place-items-center rounded-md border border-line text-muted hover:border-red/40 hover:text-red"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
