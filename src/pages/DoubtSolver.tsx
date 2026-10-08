import { api } from "@/convex/_generated/api";
import { ToolHeader, ResultPanel } from "@/components/elvix/ToolPage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AI_CONFIG_MESSAGE } from "@/components/elvix/States";
import { FileImage, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { trackToolUsed } from "@/lib/analytics";

const SUBJECTS = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "English",
  "General",
];

export default function DoubtSolver() {
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get("subject") ?? "General";
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState(
    SUBJECTS.includes(initialSubject) ? initialSubject : "General",
  );
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const solveDoubt = useAction(api.ai.solveDoubt);
  const saveHistoryItem = useMutation(api.data.saveHistoryItem);

  const run = async (mode: "full" | "explain" | "exam") => {
    if (!question.trim() || loading) return;
    trackToolUsed("AI Doubt Solver");
    setLoading(true);
    setError(null);
    if (mode === "full") setResult(null);
    try {
      const res = await solveDoubt({ question, subject, mode });
      setResult(res.text);
      setSaved(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg.includes("not configured") ? AI_CONFIG_MESSAGE : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || saved) return;
    try {
      await saveHistoryItem({
        category: "study",
        toolName: "AI Doubt Solver",
        title: question.slice(0, 80),
        preview: result.slice(0, 140),
        content: `**Subject:** ${subject}\n\n**Question:** ${question}\n\n${result}`,
      });
      setSaved(true);
      toast.success("Saved to history.");
    } catch {
      toast.error("Couldn't save.");
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    toast.info(
      "AI can't read text inside images yet — type the question below; the image stays attached for reference.",
    );
  };

  return (
    <div className="space-y-5">
      <ToolHeader toolId="doubt-solver" />

      <div className="glass ring-soft space-y-4 rounded-3xl p-4 sm:p-5">
        <div className="space-y-2">
          <Label htmlFor="doubt-subject">Subject</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger id="doubt-subject" className="w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doubt-question">Type your question</Label>
          <Textarea
            id="doubt-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. A stone is thrown upward at 20 m/s. After how many seconds does it return to the throw point? (g = 10 m/s²)"
            className="min-h-28 resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            aria-hidden
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full"
            onClick={() => fileRef.current?.click()}
          >
            <FileImage className="size-4" />
            {fileName ? fileName.slice(0, 24) : "Attach image"}
          </Button>
          <Button
            onClick={() => void run("full")}
            disabled={!question.trim() || loading}
            className="bg-brand-gradient ml-auto gap-2 rounded-full px-5 text-white shadow-md"
          >
            <Sparkles className="size-4" />
            {loading ? "Solving…" : "Solve"}
          </Button>
        </div>
      </div>

      {result && !loading && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => void run("explain")}
            disabled={loading}
          >
            Explain More
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => void run("exam")}
            disabled={loading}
          >
            Make Exam Answer
          </Button>
        </div>
      )}

      <ResultPanel
        loading={loading && !result}
        error={error}
        result={result}
        emptyHint="Type your question and let ELVIX solve it — final answer, steps, concept and an exam-ready answer, all in one."
        onRetry={() => void run("full")}
        onRegenerate={() => void run("full")}
        onSave={handleSave}
        saved={saved}
        onClear={() => {
          setResult(null);
          setError(null);
        }}
        filenameBase="elvix-doubt-answer"
      />
    </div>
  );
}
