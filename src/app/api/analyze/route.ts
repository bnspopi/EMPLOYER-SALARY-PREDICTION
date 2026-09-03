import { analyzeResume } from "@/lib/engine";

interface AnalyzeBody {
  text?: unknown;
  displayName?: unknown;
  targetRole?: unknown;
  targetLocation?: unknown;
  resumeId?: unknown;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export async function POST(req: Request) {
  let body: AnalyzeBody;
  try {
    body = (await req.json()) as AnalyzeBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text : "";
  if (text.trim().length < 40) {
    return Response.json(
      { error: "Provide at least a few sentences of resume or job-description text." },
      { status: 422 },
    );
  }

  const analysis = analyzeResume({
    text,
    displayName: asString(body.displayName),
    targetRole: asString(body.targetRole),
    targetLocation: asString(body.targetLocation),
    resumeId: asString(body.resumeId),
  });

  return Response.json(analysis);
}
