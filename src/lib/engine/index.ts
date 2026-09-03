/**
 * Engine entry point. Pure TypeScript, no React.
 * The implementations live in sibling files; this module re-exports the public contract used by the UI and API routes.
 */
export { analyzeResume, parseResume } from "./analyze";
export { evaluateOffer, compareOffers } from "./offer";
export { searchJobs, checkFit, getJob, listJobs } from "./jobs";
export { buildApplicationPack } from "./pack";
export { buildGrowthPlan } from "./roadmap";
export { getInsights } from "./insights";
export { benchmarkJobDescription } from "./recruiter";
export { rewriteBullet, rewriteBullets } from "./rewrite";
export { coachReply } from "./coach";
export { listRoles, listLocations, findLocation, findRole } from "./catalog";
export { listGuides, getGuide } from "./guides";
