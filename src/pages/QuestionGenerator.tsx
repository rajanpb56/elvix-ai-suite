import { api } from "@/convex/_generated/api";
import { ToolHeader, ResultPanel } from "@/components/elvix/ToolPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_CONFIG_MESSAGE } from "@/components/elvix/States";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";
import { trackToolUsed } from "@/lib/analytics";

const SUBJECTS = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "English",
  "History",
  "Geography",
  "General",
];

export default function QuestionGenerator() {
  const [subject, setSubject] = useState("Mathematics");
  const [className, setClassName] = useState("");
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [count, setCount] = useState("10");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const generateQuestions = useAction(api.ai.generateQuestions);
  const saveHistoryItem = useMutation(api.data.saveHistoryItem);

  const run = async () => {
    if (!chapter.trim() || loading) return;
    trackToolUsed("Question Generator");
    setLoading(true);
    setError(null);
    try {
      const res = await generateQuestions({
        subject,
        className: className.trim(),
        chapter,
        difficulty: difficulty as "easy" | "medium" | "hard",
        count: Number(count) || 10,
      });
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
        toolName: "Question Generator",
        title: `${subject} — ${chapter.slice(0, 50)}`,
        preview: result.slice(0, 140),
        content: `**Subject:** ${subject}\n**Class:** ${className || "-"}\n**Chapter:** ${chapter}\n**Difficulty:** ${difficulty}\n\n${result}`,
      });
      setSaved(true);
      toast.success("Questions saved to history.");
    } catch {
      toast.error("Couldn't save.");
    }
  };

  return (
    <div className="space-y-5">
      <ToolHeader toolId="question-generator" />

      <div className="glass ring-soft space-y-4 rounded-3xl p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-full rounded-xl">
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
            <Label htmlFor="qg-class">Class</Label>
            <Input
              id="qg-class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Grade 10"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="qg-chapter">Chapter *</Label>
            <Input
              id="qg-chapter"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g. Light — Reflection and Refraction"
            />
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qg-count">Number of questions</Label>
            <Input
              id="qg-count"
              type="number"
              min={1}
              max={30}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => void run()}
            disabled={!chapter.trim() || loading}
            className="bg-brand-gradient gap-2 rounded-full px-5 text-white shadow-md"
          >
            <Sparkles className="size-4" />
            {loading ? "Generating questions…" : "Generate Questions"}
          </Button>
        </div>
      </div>

      <ResultPanel
        loading={loading}
        error={error}
        result={result}
        emptyHint="Pick a subject and chapter — you'll get MCQs, short and long questions with an answer key, all in one paper."
        onRetry={() => void run()}
        onRegenerate={() => void run()}
        onSave={handleSave}
        saved={saved}
        onClear={() => {
          setResult(null);
          setError(null);
        }}
        filenameBase={`elvix-questions-${subject}-${chapter || "chapter"}`}
      />
    </div>
  );
}
