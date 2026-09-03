import type { Analysis, ChatMessage, Profile } from "../types";
// STUB — replaced by the engine implementation. Keep signatures.
export function coachReply(message: string, ctx: { profile?: Profile; analysis?: Analysis; history: ChatMessage[] }): string { void ctx; return `Coach stub: ${message}`; }
