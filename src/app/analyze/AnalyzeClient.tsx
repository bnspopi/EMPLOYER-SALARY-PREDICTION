"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FileText, Sparkles, Users, Wand2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { analyzeResume, listLocations, listRoles } from "@/lib/engine";
import { SAMPLE_RESUME, SAMPLE_RESUME_NAME } from "@/data/sample-resume";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Eyebrow } from "@/components/ui/Section";
import { wordCount } from "@/components/dashboard/widgets";
import { cn, uid } from "@/lib/utils";

const STAGES = [
  { key: "parsing", label: "Parsing", detail: "Extracting role, skills, seniority and location" },
  { key: "embedding", label: "Embedding", detail: "Mapping your profile into the market vector space" },
  { key: "pricing", label: "Pricing", detail: "Matching against openings with known pay" },
  { key: "scoring", label: "Scoring", detail: "Building your range, percentile and brief" },
] as const;

const STAGE_MS = 380;

export function AnalyzeClient() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  const user = useApp((s) => s.user);
  const hydrated = useApp((s) => s.hydrated);
  const signIn = useApp((s) => s.signIn);
  const addResume = useApp((s) => s.addResume);
  const setAnalysis = useApp((s) => s.setAnalysis);
  const setActiveResume = useApp((s) => s.setActiveResume);
  const setTargets = useApp((s) => s.setTargets);

  const [text, setText] = useState("");
  const [isOther, setIsOther] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [PdfDropCmp, setPdfDropCmp] = useState<null | typeof import("@/components/dashboard/pdf/PdfDrop").PdfDrop>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const roles = useMemo(() => listRoles(), []);
  const locations = useMemo(() => listLocations(), []);
  const words = wordCount(text);
  const canSubmit = words >= 12 && !analyzing;

  // Lazy-load the PDF drop zone (pulls in pdfjs only when the page is interacted with).
  if (!PdfDropCmp && typeof window !== "undefined") {
    void import("@/components/dashboard/pdf/PdfDrop").then((m) => setPdfDropCmp(() => m.PdfDrop));
  }

  function loadSample() {
    setText(SAMPLE_RESUME);
    setFileName(SAMPLE_RESUME_NAME);
    setTargetLocation("Los Angeles, US");
    setError(null);
  }

  function run() {
    if (!canSubmit) {
      setError("Add at least a couple of sentences of resume or job-description text.");
      return;
    }
    setError(null);
    setAnalyzing(true);
    setStage(0);

    // Staged progress animation (~1.5s total) purely for feel; the engine is instant.
    timers.current.forEach(clearTimeout);
    timers.current = STAGES.map((_, i) => setTimeout(() => setStage(i), i * STAGE_MS));

    const finish = setTimeout(() => {
      try {
        if (!user) signIn({ name: "Guest", email: "" });

        const resumeName = isOther
          ? displayName.trim()
            ? `${displayName.trim()} (comparison)`
            : "Someone else's resume"
          : fileName ?? `Resume · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

        const resumeId = uid("res");
        addResume({ id: resumeId, name: resumeName, text, isOther });

        const analysis = analyzeResume({
          text,
          resumeId,
          displayName: displayName.trim() || (isOther ? "This candidate" : "You"),
          targetRole: targetRole.trim() || undefined,
          targetLocation: targetLocation.trim() || undefined,
        });
        setAnalysis(resumeId, analysis);
        setActiveResume(resumeId);
        setTargets({
          role: targetRole.trim() || analysis.estimate.role,
          location: targetLocation.trim() || analysis.estimate.location.label,
        });

        router.push(callbackUrl || "/dashboard/market-value");
      } catch {
        setAnalyzing(false);
        setError("We couldn't analyze that text. Try the sample resume to see how it works.");
      }
    }, STAGES.length * STAGE_MS + 120);
    timers.current.push(finish);
  }

  return (
    <main className="relative min-h-screen overflow-hidden pt-16">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden />

      <section className="relative mx-auto max-w-5xl px-5 py-16 md:px-10 md:py-24">
        <Eyebrow tone="cyan">Resume analysis · 30 seconds</Eyebrow>
        <h1 className="display mt-3 text-5xl leading-[0.92] md:text-7xl">
          What is your resume
          <br />
          <span className="serif-italic text-cyan">actually</span> worth?
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
          Upload a PDF or paste your resume or a job description. We map it into the market, price it against real
          openings, and show your range, percentile and skills breakdown. No guessing. Your number.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          {/* Input column */}
          <div className="panel rounded-xl2 p-5 md:p-6">
            {PdfDropCmp ? (
              <PdfDropCmp
                onExtracted={(t, name) => {
                  setText(t);
                  setFileName(name);
                  setError(null);
                }}
                onError={(m) => setError(m)}
                disabled={analyzing}
              />
            ) : (
              <div className="flex w-full items-center justify-center rounded-xl2 border border-dashed border-line-2 px-6 py-10 text-center text-xs text-dim">
                <FileText className="mr-2 h-4 w-4" aria-hidden /> Loading PDF reader…
              </div>
            )}

            <div className="my-5 flex items-center gap-3 text-dim">
              <span className="h-px flex-1 bg-line" />
              <span className="mono-caps">or paste text</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label>Resume or job description</Label>
                <span className="text-[11px] tabular-nums text-dim">{words} words</span>
              </div>
              <Textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (fileName) setFileName(null);
                }}
                disabled={analyzing}
                rows={10}
                placeholder="Paste your resume, or a job description you want priced…"
                className="min-h-[220px]"
                aria-label="Resume or job description text"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={loadSample} disabled={analyzing}>
                <Wand2 className="h-4 w-4" aria-hidden /> Use sample resume
              </Button>
              {text ? (
                <button
                  type="button"
                  onClick={() => {
                    setText("");
                    setFileName(null);
                  }}
                  disabled={analyzing}
                  className="text-xs text-dim hover:text-fg disabled:opacity-50"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          {/* Options column */}
          <div className="space-y-4">
            <div className="panel rounded-xl2 p-5 md:p-6">
              <label className="flex cursor-pointer items-start gap-3">
                <span className="relative mt-0.5 inline-flex">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={isOther}
                    onChange={(e) => setIsOther(e.target.checked)}
                    disabled={analyzing}
                  />
                  <span className="grid h-5 w-9 grid-cols-2 items-center rounded-full bg-line-2 p-0.5 transition-colors peer-checked:bg-cyan/70" aria-hidden>
                    <span className={cn("h-4 w-4 rounded-full bg-fg transition-transform", isOther && "translate-x-4")} />
                  </span>
                </span>
                <span>
                  <span className="flex items-center gap-2 text-sm font-medium text-fg">
                    <Users className="h-4 w-4 text-cyan" aria-hidden /> Analyze someone else&apos;s resume
                  </span>
                  <span className="mt-1 block text-xs text-dim">Benchmark a peer, report or candidate. Saved as a comparison version.</span>
                </span>
              </label>

              <div className="mt-4">
                <Label hint={isOther ? "shown on the report" : "optional"}>Display name for the report</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={analyzing}
                  placeholder={isOther ? "e.g. Candidate A" : "e.g. your first name"}
                  aria-label="Display name for the report"
                />
              </div>
            </div>

            <div className="panel rounded-xl2 p-5 md:p-6">
              <div className="eyebrow mb-3">Target (optional)</div>
              <div className="space-y-4">
                <div>
                  <Label>Target role</Label>
                  <Input
                    list="paylens-roles"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    disabled={analyzing}
                    placeholder="e.g. Senior Product Manager"
                    aria-label="Target role"
                  />
                  <datalist id="paylens-roles">
                    {roles.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label>Target location</Label>
                  <Input
                    list="paylens-locations"
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    disabled={analyzing}
                    placeholder="e.g. Los Angeles, US"
                    aria-label="Target location"
                  />
                  <datalist id="paylens-locations">
                    {locations.map((l) => (
                      <option key={l.label} value={l.label} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <Button type="button" variant="ember" size="lg" className="w-full" onClick={run} disabled={!canSubmit}>
              <Sparkles className="h-4 w-4" aria-hidden /> Analyze my resume <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            {error ? (
              <p className="text-center text-xs text-red" role="alert">
                {error}
              </p>
            ) : null}
            {hydrated && !user ? (
              <p className="text-center text-xs text-dim">
                No sign-up needed — you&apos;ll analyze as a guest.{" "}
                <a href="/auth/signup" className="text-cyan hover:underline">
                  Sign up to keep your analyses
                </a>
                .
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Progress overlay */}
      <AnimatePresence>
        {analyzing ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-bg/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="status"
            aria-live="polite"
          >
            <div className="w-full max-w-md px-6">
              <div className="eyebrow text-cyan">Analyzing</div>
              <div className="display mt-2 text-4xl">{STAGES[stage].label}…</div>
              <p className="mt-2 text-sm text-muted">{STAGES[stage].detail}</p>
              <div className="mt-8 space-y-3">
                {STAGES.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full border text-[10px] font-semibold tabular-nums transition-colors",
                        i < stage
                          ? "border-cyan/50 bg-cyan/15 text-cyan"
                          : i === stage
                            ? "border-cyan bg-cyan text-bg"
                            : "border-line-2 text-dim",
                      )}
                    >
                      {i < stage ? "✓" : i + 1}
                    </span>
                    <span className={cn("text-sm", i <= stage ? "text-fg" : "text-dim")}>{s.label}</span>
                    <span className="ml-auto h-1 w-24 overflow-hidden rounded-full bg-line-2">
                      <motion.span
                        className="block h-full rounded-full bg-cyan"
                        initial={{ width: "0%" }}
                        animate={{ width: i < stage ? "100%" : i === stage ? "70%" : "0%" }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
