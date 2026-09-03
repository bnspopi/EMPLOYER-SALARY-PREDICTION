import type { ApplicationPack, Job, Profile } from "../types";
import { checkFit } from "./jobs";
// STUB — replaced by the engine implementation. Keep signatures.
export function buildApplicationPack(job: Job, profile: Profile): ApplicationPack {
  return { jobId: job.id, tailoredSummary: "", tailoredBullets: [], coverLetter: "", interviewPrep: [], fit: checkFit(job, profile) };
}
