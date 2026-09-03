import { evaluateOffer, parseResume } from "@/lib/engine";
import type { Currency, OfferInput } from "@/lib/types";

interface OfferBody {
  title?: unknown;
  company?: unknown;
  label?: unknown;
  location?: unknown;
  base?: unknown;
  bonus?: unknown;
  equity?: unknown;
  signOn?: unknown;
  description?: unknown;
  currency?: unknown;
  profile?: unknown; // optional resume / profile text to level the estimate
  id?: unknown;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

const CURRENCIES: Currency[] = ["USD", "CAD", "GBP"];
function asCurrency(v: unknown): Currency | undefined {
  return typeof v === "string" && (CURRENCIES as string[]).includes(v) ? (v as Currency) : undefined;
}

export async function POST(req: Request) {
  let body: OfferBody;
  try {
    body = (await req.json()) as OfferBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = asString(body.title);
  const location = asString(body.location);
  const base = asNumber(body.base);

  if (!title) return Response.json({ error: "A job title is required." }, { status: 422 });
  if (!location) return Response.json({ error: "A location is required." }, { status: 422 });
  if (!base) return Response.json({ error: "A valid base salary is required." }, { status: 422 });

  const offer: OfferInput = {
    id: asString(body.id) ?? "offer",
    title,
    company: asString(body.company),
    label: asString(body.label),
    location,
    base,
    bonus: asNumber(body.bonus),
    equity: asNumber(body.equity),
    signOn: asNumber(body.signOn),
    description: asString(body.description),
    currency: asCurrency(body.currency),
  };

  const profileText = asString(body.profile);
  const profile = profileText && profileText.length >= 40 ? parseResume(profileText) : undefined;

  const verdict = evaluateOffer(offer, profile);
  return Response.json(verdict);
}
