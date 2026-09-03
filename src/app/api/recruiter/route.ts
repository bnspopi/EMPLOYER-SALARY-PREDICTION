import { benchmarkJobDescription } from "@/lib/engine";

interface RecruiterBody {
  title?: unknown;
  description?: unknown;
  location?: unknown;
  industry?: unknown;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export async function POST(req: Request) {
  let body: RecruiterBody;
  try {
    body = (await req.json()) as RecruiterBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const description = typeof body.description === "string" ? body.description : "";
  if (description.trim().length < 30) {
    return Response.json(
      { error: "Paste at least a couple of sentences of the job description to benchmark it." },
      { status: 422 },
    );
  }

  const report = benchmarkJobDescription({
    title: asString(body.title),
    description,
    location: asString(body.location),
    industry: asString(body.industry),
  });

  return Response.json(report);
}
