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
import { Textarea } from "@/components/ui/textarea";
import { AI_CONFIG_MESSAGE } from "@/components/elvix/States";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";
import { trackToolUsed } from "@/lib/analytics";

const STYLES = [
  { value: "quick", label: "Quick Notes" },
  { value: "detailed", label: "Detailed Notes" },
  { value: "revision", label: "Revision Notes" },
  { value: "exam", label: "Exam Notes" },
] as const;

const STYLE_LABEL: Record<string, string> = {
  quick: "Quick Notes",
  detailed: "Detailed Notes",
  revision: "Revision Notes",
  exam: "Exam Notes",
};

export default function NotesMaker() {
  const [topic, setTopic] = useState("");
  const [chapter, setChapter] = useState("");
  const [text, setText] = useState("");
  const [style, setStyle] = useState<string>("detailed");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const makeNotes = useAction(api.ai.makeNotes);
  const saveHistoryItem = useMutation(api.data.saveHistoryItem);

  const run = async () => {
    if (!topic.trim() || loading) return;
    trackToolUsed("AI Notes Maker");
    setLoading(true);
    setError(null);
    try {
      const res = await makeNotes({
        topic,
        chapter: chapter.trim() || undefined,
        text: text.trim() || undefined,
        style: style as "quick" | "detailed" | "revision" | "exam",
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
        toolName: "AI Notes Maker",
        title: `${STYLE_LABEL[style]}: ${topic.slice(0, 60)}`,
        preview: result.slice(0, 140),
        content: result,
      });
      setSaved(true);
      toast.success("Notes saved to history.");
    } catch {
      toast.error("Couldn't save.");
    }
  };

  return (
    <div className="space-y-5">
      <ToolHeader toolId="notes-maker" />

      <div className="glass ring-soft space-y-4 rounded-3xl p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="notes-topic">Topic *</Label>
            <Input
              id="notes-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes-chapter">Chapter (optional)</Label>
            <Input
              id="notes-chapter"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g. Life Processes — Ch 5"
            />
          </div>
        </div>

        <div className="space-y-2">            <Label htmlFor="notes-text">Your text (optional)</Label>
          <Textarea
            id="notes-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your book notes or a paragraph — the AI will build the notes from it."
            className="min-h-24 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label>Notes type</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => void run()}
            disabled={!topic.trim() || loading}
            className="bg-brand-gradient gap-2 rounded-full px-5 text-white shadow-md"
          >
            <Sparkles className="size-4" />
            {loading ? "Creating notes…" : "Create Notes"}
          </Button>
        </div>
      </div>

      <ResultPanel
        loading={loading}
        error={error}
        result={result}
        emptyHint="Enter a topic (plus chapter or text if you like) — you'll get organised notes with definitions, concepts, examples, formulas and important questions."
        onRetry={() => void run()}
        onRegenerate={() => void run()}
        onSave={handleSave}
        saved={saved}
        onClear={() => {
          setResult(null);
          setError(null);
        }}
        filenameBase={`elvix-notes-${topic || "topic"}`}
      />
    </div>
  );
}
