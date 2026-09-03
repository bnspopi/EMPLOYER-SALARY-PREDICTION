/**
 * Salary Brief PDF export (A4, brand header, jspdf text APIs — no html2canvas).
 * Signature is stable across callers: exportBriefPdf(brief, estimate, profile).
 * A full MarketEstimate / Profile satisfy the Pick'd param types, so the
 * market-value page can call this with its analysis objects unchanged.
 */
import type { MarketEstimate, NegotiationBrief, Profile } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { BRAND } from "@/lib/brand";

export type BriefEstimate = Pick<
  MarketEstimate,
  "currency" | "floor" | "median" | "ceiling" | "percentile" | "percentileLabel" | "role" | "location"
>;
export type BriefProfile = Pick<Profile, "displayName" | "role" | "level" | "location" | "yearsExperience">;

function today(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/**
 * Build and download an A4 salary brief. Returns the generated file name.
 * `titleOverride` lets the offer evaluator label it "Offer Salary Brief".
 */
export async function exportBriefPdf(
  brief: NegotiationBrief,
  estimate: BriefEstimate,
  profile: BriefProfile,
  titleOverride?: string,
): Promise<string> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  const cur = brief.currency;
  const money = (n: number) => formatMoney(n, cur);

  // ---- Brand header band ----
  doc.setFillColor(6, 7, 8); // brand bg #060708
  doc.rect(0, 0, pageW, 92, "F");
  doc.setFillColor(74, 217, 255); // cyan mark
  doc.rect(margin, 34, 24, 24, "F");
  doc.setTextColor(6, 7, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("P", margin + 12, 51, { align: "center" });
  doc.setTextColor(236, 235, 230); // fg
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(BRAND.name.toUpperCase(), margin + 36, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(154, 156, 163); // muted
  doc.text(titleOverride ?? "Salary Brief", pageW - margin, 44, { align: "right" });
  doc.text(`Prepared ${today()}`, pageW - margin, 58, { align: "right" });

  let y = 128;

  const heading = (text: string) => {
    if (y > pageH - margin - 40) {
      doc.addPage();
      y = margin + 16;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(74, 217, 255);
    doc.text(text.toUpperCase(), margin, y);
    doc.setDrawColor(31, 36, 48);
    doc.line(margin, y + 6, margin + contentW, y + 6);
    y += 22;
  };

  const paragraph = (text: string, opts: { bold?: boolean; size?: number; color?: [number, number, number] } = {}) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size ?? 10.5);
    doc.setTextColor(...(opts.color ?? [40, 42, 48]));
    const wrapped = doc.splitTextToSize(text, contentW) as string[];
    for (const line of wrapped) {
      if (y > pageH - margin) {
        doc.addPage();
        y = margin + 16;
      }
      doc.text(line, margin, y);
      y += 15;
    }
  };

  const row = (label: string, value: string, tone?: [number, number, number]) => {
    if (y > pageH - margin) {
      doc.addPage();
      y = margin + 16;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(90, 92, 98);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(tone ?? [24, 26, 30]));
    doc.text(value, margin + contentW, y, { align: "right" });
    y += 17;
  };

  const bullets = (items: string[]) => {
    for (const item of items) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(40, 42, 48);
      const wrapped = doc.splitTextToSize(item, contentW - 16) as string[];
      wrapped.forEach((line, i) => {
        if (y > pageH - margin) {
          doc.addPage();
          y = margin + 16;
        }
        if (i === 0) {
          doc.setTextColor(217, 180, 90);
          doc.text("•", margin, y);
          doc.setTextColor(40, 42, 48);
        }
        doc.text(line, margin + 16, y);
        y += 15;
      });
      y += 3;
    }
  };

  // ---- Title block ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(20, 22, 26);
  doc.text(titleOverride ? "OFFER SALARY BRIEF" : "SALARY BRIEF", margin, y);
  y += 24;
  paragraph(
    `${profile.displayName || "Candidate"} · ${estimate.role} · ${estimate.location.label} · ${estimate.percentileLabel}`,
    { bold: true, size: 11, color: [40, 42, 48] },
  );
  y += 12;

  heading("Market range");
  row("Floor (P25)", money(estimate.floor));
  row("Median", money(estimate.median));
  row("Ceiling (P75)", money(estimate.ceiling), [217, 180, 90]);
  y += 10;

  heading("Negotiation targets");
  row("Your floor — don't go below", money(brief.floor));
  row("Target ask", money(brief.target), [74, 140, 90]);
  row("Stretch goal", money(brief.stretch), [217, 180, 90]);
  row("Total potential gain", money(brief.totalPotentialGain));
  y += 10;

  heading("Opening script");
  paragraph(brief.openingScript);
  y += 12;

  if (brief.talkingPoints.length) {
    heading("Talking points");
    bullets(brief.talkingPoints);
    y += 8;
  }

  heading("Counter-tactics");
  bullets(brief.counterTactics);
  y += 8;

  heading("Leverage");
  bullets(brief.leverage);

  // ---- Footer on every page ----
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(154, 156, 163);
    doc.text(`${BRAND.name} · ${BRAND.domain} · Career intelligence powered by real market data.`, margin, pageH - 24);
    doc.text(`Page ${p} of ${pages}`, pageW - margin, pageH - 24, { align: "right" });
  }

  const fileName = `${titleOverride ? "offer-" : ""}salary-brief-${estimate.role.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.pdf`;
  doc.save(fileName);
  return fileName;
}
