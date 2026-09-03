"use client";
import { useCallback, useRef, useState } from "react";
import { FileText, Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

/** Extract plain text from every page of a PDF using pdfjs-dist (worker from /public). */
async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+\n/g, "\n");
    pages.push(line);
  }
  return pages.join("\n\n").replace(/[ \t]+/g, " ").trim();
}

export function PdfDrop({
  onExtracted,
  onError,
  disabled = false,
  className,
}: {
  onExtracted: (text: string, fileName: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file || disabled) return;
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        onError?.("That file isn't a PDF. Upload a .pdf or paste your resume text instead.");
        return;
      }
      setBusy(true);
      setFileName(file.name);
      try {
        const text = await extractPdfText(file);
        if (text.trim().length < 40) {
          onError?.("Couldn't read enough text from that PDF (it may be a scanned image). Paste the text instead.");
          return;
        }
        onExtracted(text, file.name);
      } catch {
        onError?.("Something went wrong reading that PDF. Try pasting the text instead.");
      } finally {
        setBusy(false);
      }
    },
    [disabled, onError, onExtracted],
  );

  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        aria-label="Upload a PDF resume"
        className={cn(
          "group flex w-full flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-cyan/60 bg-cyan/5" : "border-line-2 hover:border-cyan/40 hover:bg-white/[0.02]",
          (disabled || busy) && "pointer-events-none opacity-60",
        )}
      >
        <span
          className={cn(
            "grid h-12 w-12 place-items-center rounded-full border transition-colors",
            dragging ? "border-cyan/50 bg-cyan/10 text-cyan" : "border-line-2 bg-white/5 text-muted group-hover:text-cyan",
          )}
          aria-hidden
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : fileName ? <FileText className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
        </span>
        <span className="text-sm font-medium text-fg">
          {busy ? "Reading your PDF…" : fileName ? fileName : "Drop your resume PDF here"}
        </span>
        <span className="text-xs text-dim">{busy ? "Extracting text from every page" : "or click to browse · PDF only · stays in your browser"}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
