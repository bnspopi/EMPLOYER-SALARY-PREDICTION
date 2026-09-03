import { searchJobs } from "@/lib/engine";
import type { JobQuery, Profile } from "@/lib/types";

function parseNumber(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseBool(v: string | null): boolean {
  return v === "1" || v === "true" || v === "yes";
}

function queryFromParams(params: URLSearchParams): JobQuery {
  return {
    role: params.get("role")?.trim() || undefined,
    location: params.get("location")?.trim() || undefined,
    minSalary: parseNumber(params.get("min")),
    remoteOnly: parseBool(params.get("remote")),
    query: params.get("q")?.trim() || undefined,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = queryFromParams(searchParams);
  return Response.json(searchJobs(query));
}

interface JobsBody {
  role?: unknown;
  location?: unknown;
  min?: unknown;
  minSalary?: unknown;
  remote?: unknown;
  remoteOnly?: unknown;
  q?: unknown;
  query?: unknown;
  profile?: unknown;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function asNumber(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(/[^0-9.]/g, "")) : NaN;
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export async function POST(req: Request) {
  let body: JobsBody;
  try {
    body = (await req.json()) as JobsBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const query: JobQuery = {
    role: asString(body.role),
    location: asString(body.location),
    minSalary: asNumber(body.minSalary ?? body.min),
    remoteOnly: body.remoteOnly === true || body.remote === true,
    query: asString(body.query ?? body.q),
  };

  const profile =
    body.profile && typeof body.profile === "object" ? (body.profile as Profile) : undefined;

  return Response.json(searchJobs(query, profile));
}
