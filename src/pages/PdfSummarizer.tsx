import { api } from "@/convex/_generated/api";
import { ToolHeader, ResultPanel } from "@/components/elvix/ToolPage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_CONFIG_MESSAGE } from "@/components/elvix/States";
import { FileText, RefreshCw, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";
import { trackToolUsed } from "@/lib/analytics";

const MAX_SIZE_MB = 10;
const MAX_CHARS = 60000;

export default function PdfSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [detail, setDetail] = useState<string>("medium");
  const [progress, setProgress] = useState<number | null>(null); // 0-100 while extracting
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);

  const summarizeContent = useAction(api.ai.summarizeContent);
  const saveHistoryItem = useMutation(api.data.saveHistoryItem);

  const pickFile = (f: File | null) => {
    setError(null);
    setResult(null);
    setSaved(false);
    setPageCount(null);
    setProgress(null);
    if (!f) {
      setFile(null);
      return;
    }
    const isPdf =
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Please upload a PDF file only.");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`The PDF must be smaller than ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const extractText = async (f: File): Promise<string> => {
    const pdfjs = await import("pdfjs-dist");
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url"))
      .default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

    const buffer = await f.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buffer }).promise;
    setPageCount(doc.numPages);
    const chunks: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      chunks.push(pageText);
      setProgress(Math.round((i / doc.numPages) * 100));
    }
    return chunks.join("\n\n").replace(/\s+/g, " ").trim();
  };

  const run = async () => {
    if (!file || processing || progress !== null) return;
    trackToolUsed("PDF Summarizer");
    setError(null);
    setResult(null);
    setSaved(false);
    setProgress(0);
    try {
      const text = await extractText(file);
      setProgress(100);
      if (!text || text.length < 40) {
        throw new Error(
          "No text found in this PDF (it may be scanned images). Please try a text-based PDF.",
        );
      }
      setProcessing(true);
      const res = await summarizeContent({
        title: file.name.replace(/\.pdf$/i, ""),
        text: text.slice(0, MAX_CHARS),
        detail: detail as "short" | "medium" | "detailed",
      });
      setResult(res.text);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't process the PDF.";
      setError(msg.includes("not configured") ? AI_CONFIG_MESSAGE : msg);
    } finally {
      setProcessing(false);
      setProgress(null);
    }
  };

  const handleSave = async () => {
    if (!result || saved || !file) return;
    try {
      await saveHistoryItem({
        category: "study",
        toolName: "PDF Summarizer",
        title: file.name.replace(/\.pdf$/i, "").slice(0, 80),
        preview: result.slice(0, 140),
        content: result,
      });
      setSaved(true);
      toast.success("Summary saved to history.");
    } catch {
      toast.error("Couldn't save.");
    }
  };

  return (
    <div className="space-y-5">
      <ToolHeader toolId="pdf-summarizer" />

      <div className="glass ring-soft space-y-4 rounded-3xl p-4 sm:p-5">
        {!file ? (
          <label
            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border/80 p-8 text-center transition-colors hover:border-primary/50 hover:bg-accent/30"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pickFile(e.dataTransfer.files?.[0] ?? null);
            }}
          >
            <FileText className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Tap to choose a PDF or drag it here
            </p>
            <p className="text-xs text-muted-foreground">
              Max {MAX_SIZE_MB} MB · text-based PDF (not scanned)
            </p>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </label>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
                {pageCount ? ` · ${pageCount} pages` : ""}
              </p>
              {progress !== null && progress < 100 && (
                <Progress value={progress} className="mt-2 h-1.5" />
              )}
              {progress !== null && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {progress < 100
                    ? `Reading… ${progress}%`
                    : "Text extracted — AI is summarising…"}
                </p>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => pickFile(null)}
              aria-label="Remove file"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label>Summary length</Label>
          <Select value={detail} onValueChange={setDetail}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short — 2 min revision</SelectItem>
              <SelectItem value="medium">Medium — balanced</SelectItem>
              <SelectItem value="detailed">Detailed — full coverage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => void run()}
            disabled={!file || processing || (progress !== null && progress < 100)}
            className="bg-brand-gradient gap-2 rounded-full px-5 text-white shadow-md"
          >
            {processing ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {processing ? "Summarising…" : "Summarize"}
          </Button>
        </div>
      </div>

      <ResultPanel
        loading={processing}
        error={error}
        result={result}
        emptyHint="Upload a PDF and tap Summarize — you'll get a summary, key points, definitions, important questions and quick revision."
        onRetry={() => void run()}
        onRegenerate={() => void run()}
        onSave={handleSave}
        saved={saved}
        onClear={() => {
          setResult(null);
          setError(null);
        }}
        filenameBase={`elvix-summary-${file?.name.replace(/\.pdf$/i, "") ?? "pdf"}`}
      />
    </div>
  );
}
