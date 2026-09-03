import type { LocationOption } from "../types";
// STUB — replaced by the engine implementation. Keep signatures.
const LOCS: LocationOption[] = [
  { city: "Los Angeles", country: "US", currency: "USD", label: "Los Angeles, US", multiplier: 1.08 },
  { city: "Remote", country: "US", currency: "USD", label: "Remote (US)", multiplier: 1, remote: true },
];
export function listRoles(): string[] { return ["Software Engineer", "Product Manager"]; }
export function listLocations(): LocationOption[] { return LOCS; }
export function findLocation(q: string): LocationOption { return LOCS.find((l) => l.label.toLowerCase().includes(q.toLowerCase())) ?? LOCS[1]; }
export function findRole(q: string): string { return q || "Software Engineer"; }
