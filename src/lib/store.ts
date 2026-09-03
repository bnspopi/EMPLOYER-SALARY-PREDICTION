"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Analysis, ChatMessage, OfferInput, PipelineCard, Plan, ResumeVersion, Stage, Targets, User, Job,
} from "./types";
import { uid } from "./utils";

export interface AppState {
  hydrated: boolean;
  user: User | null;
  plan: Plan;
  billing: "monthly" | "annual";
  resumes: ResumeVersion[];
  activeResumeId: string | null;
  analyses: Record<string, Analysis>; // keyed by resumeId
  targets: Targets;
  pipeline: PipelineCard[];
  offers: OfferInput[];
  chat: ChatMessage[];
  displayNameOverride: string;

  setHydrated: (v: boolean) => void;
  signIn: (user: { name: string; email: string }) => void;
  signOut: () => void;
  setPlan: (plan: Plan) => void;
  setBilling: (b: "monthly" | "annual") => void;
  addResume: (r: Omit<ResumeVersion, "id" | "createdAt"> & { id?: string }) => ResumeVersion;
  removeResume: (id: string) => void;
  setActiveResume: (id: string) => void;
  setAnalysis: (resumeId: string, a: Analysis) => void;
  setTargets: (t: Partial<Targets>) => void;
  saveJob: (job: Job, fitScore: number, marketMedian: number) => PipelineCard;
  moveCard: (cardId: string, stage: Stage) => void;
  removeCard: (cardId: string) => void;
  setCardNotes: (cardId: string, notes: string) => void;
  addOffer: (o: Omit<OfferInput, "id"> & { id?: string }) => OfferInput;
  updateOffer: (id: string, o: Partial<OfferInput>) => void;
  removeOffer: (id: string) => void;
  pushChat: (m: Omit<ChatMessage, "id" | "createdAt">) => void;
  clearChat: () => void;
  setDisplayNameOverride: (n: string) => void;
  deleteAccount: () => void;
}

const initial = {
  hydrated: false,
  user: null,
  plan: "curious" as Plan,
  billing: "monthly" as const,
  resumes: [] as ResumeVersion[],
  activeResumeId: null as string | null,
  analyses: {} as Record<string, Analysis>,
  targets: {} as Targets,
  pipeline: [] as PipelineCard[],
  offers: [] as OfferInput[],
  chat: [] as ChatMessage[],
  displayNameOverride: "",
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,
      setHydrated: (v) => set({ hydrated: v }),
      signIn: ({ name, email }) => set({ user: { name, email, createdAt: new Date().toISOString() } }),
      signOut: () => set({ user: null }),
      setPlan: (plan) => set({ plan }),
      setBilling: (billing) => set({ billing }),
      addResume: (r) => {
        const rv: ResumeVersion = { id: r.id ?? uid("res"), name: r.name, text: r.text, isOther: r.isOther, createdAt: new Date().toISOString() };
        set((s) => ({ resumes: [rv, ...s.resumes], activeResumeId: s.activeResumeId ?? rv.id }));
        return rv;
      },
      removeResume: (id) =>
        set((s) => {
          const resumes = s.resumes.filter((r) => r.id !== id);
          const analyses = { ...s.analyses };
          delete analyses[id];
          const activeResumeId = s.activeResumeId === id ? resumes[0]?.id ?? null : s.activeResumeId;
          return { resumes, analyses, activeResumeId };
        }),
      setActiveResume: (id) => set({ activeResumeId: id }),
      setAnalysis: (resumeId, a) => set((s) => ({ analyses: { ...s.analyses, [resumeId]: a } })),
      setTargets: (t) => set((s) => ({ targets: { ...s.targets, ...t } })),
      saveJob: (job, fitScore, marketMedian) => {
        const existing = get().pipeline.find((c) => c.jobId === job.id);
        if (existing) return existing;
        const card: PipelineCard = { id: uid("card"), jobId: job.id, job, stage: "saved", fitScore, marketMedian, addedAt: new Date().toISOString() };
        set((s) => ({ pipeline: [card, ...s.pipeline] }));
        return card;
      },
      moveCard: (cardId, stage) => set((s) => ({ pipeline: s.pipeline.map((c) => (c.id === cardId ? { ...c, stage } : c)) })),
      removeCard: (cardId) => set((s) => ({ pipeline: s.pipeline.filter((c) => c.id !== cardId) })),
      setCardNotes: (cardId, notes) => set((s) => ({ pipeline: s.pipeline.map((c) => (c.id === cardId ? { ...c, notes } : c)) })),
      addOffer: (o) => {
        const offer: OfferInput = { ...o, id: o.id ?? uid("offer") };
        set((s) => ({ offers: [...s.offers, offer] }));
        return offer;
      },
      updateOffer: (id, o) => set((s) => ({ offers: s.offers.map((x) => (x.id === id ? { ...x, ...o } : x)) })),
      removeOffer: (id) => set((s) => ({ offers: s.offers.filter((x) => x.id !== id) })),
      pushChat: (m) => set((s) => ({ chat: [...s.chat, { ...m, id: uid("msg"), createdAt: new Date().toISOString() }] })),
      clearChat: () => set({ chat: [] }),
      setDisplayNameOverride: (displayNameOverride) => set({ displayNameOverride }),
      deleteAccount: () => set({ ...initial, hydrated: true }),
    }),
    {
      name: "paylens-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user, plan: s.plan, billing: s.billing, resumes: s.resumes, activeResumeId: s.activeResumeId,
        analyses: s.analyses, targets: s.targets, pipeline: s.pipeline, offers: s.offers, chat: s.chat,
        displayNameOverride: s.displayNameOverride,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

/** Active resume + its analysis (if any). */
export function useActiveAnalysis() {
  const activeResumeId = useApp((s) => s.activeResumeId);
  const resumes = useApp((s) => s.resumes);
  const analyses = useApp((s) => s.analyses);
  const resume = resumes.find((r) => r.id === activeResumeId) ?? null;
  const analysis = activeResumeId ? analyses[activeResumeId] ?? null : null;
  return { resume, analysis };
}

export function usePlan() {
  return useApp((s) => s.plan);
}
