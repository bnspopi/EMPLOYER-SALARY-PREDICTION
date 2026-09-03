import type { Job, JobFit, JobMatch, JobQuery, Profile } from "../types";
// STUB — replaced by the engine implementation. Keep signatures.
const JOBS: Job[] = [];
export function listJobs(): Job[] { return JOBS; }
export function getJob(id: string): Job | undefined { return JOBS.find((j) => j.id === id); }
export function checkFit(job: Pick<Job, "title" | "description" | "requirements" | "skills"> & Partial<Job>, profile?: Profile): JobFit {
  void job; void profile;
  return { score: 80, matched: 3, partial: 1, gaps: 1, requirements: [], marketMedian: 148000, salaryContext: "At your market median" };
}
export function searchJobs(q: JobQuery, profile?: Profile): JobMatch[] {
  void q;
  return JOBS.map((job) => ({ job, fit: checkFit(job, profile) }));
}
