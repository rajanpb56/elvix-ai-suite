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
import { FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";

const MAX_CHARS = 60000;

export default function TextSummarizer() {
  const [text, setText] = useState("");
  const [detail, setDetail] = useState<string>("medium");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const summarizeContent = useAction(api.ai.summarizeContent);
  const saveHistoryItem = useMutation(api.data.saveHistoryItem);

  const run = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await summarizeContent({
        text: text.slice(0, MAX_CHARS),
        detail: detail as "short" | "medium" | "detailed",
      });
      setResult(res.text);
      setSaved(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kuch galat ho gaya.";
      setError(msg.includes("not configured") ? AI_CONFIG_MESSAGE : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || saved) return;
    try {
      await saveHistoryItem({
        category: "utilities",
        toolName: "Text Summarizer",
        title: `Summary — ${text.slice(0, 50)}…`,
        preview: result.slice(0, 140),
        content: result,
      });
      setSaved(true);
      toast.success("Summary history mein save ho gayi.");
    } catch {
      toast.error("Save nahi ho paya.");
    }
  };

  return (
    <div className="space-y-5">
      <ToolHeader toolId="text-summarizer" />

      <div className="glass ring-soft space-y-4 rounded-3xl p-4 sm:p-5">
        <div className="space-y-2">
          <Label htmlFor="ts-text">
            Lamba text paste karein * ({text.length.toLocaleString()} chars)
          </Label>
          <Textarea
            id="ts-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Article, chapter ya notes yahan paste karein — ELVIX crisp summary banayega."
            className="min-h-36 resize-none"
          />
          {text.length > MAX_CHARS && (
            <p className="text-xs text-destructive">
              Pehle {MAX_CHARS.toLocaleString()} characters use honge.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Summary length</Label>
          <Select value={detail} onValueChange={setDetail}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short — seedha point</SelectItem>
              <SelectItem value="medium">Medium — balanced</SelectItem>
              <SelectItem value="detailed">Detailed — full coverage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => void run()}
            disabled={!text.trim() || loading}
            className="bg-brand-gradient gap-2 rounded-full px-5 text-white shadow-md"
          >
            <Sparkles className="size-4" />
            {loading ? "Summarize ho raha hai…" : "Summarize Karein"}
          </Button>
        </div>
      </div>

      <ResultPanel
        loading={loading}
        error={error}
        result={result}
        emptyHint="Text paste karke Summarize dabayein — summary, key points aur quick revision milega."
        onRetry={() => void run()}
        onRegenerate={() => void run()}
        onSave={handleSave}
        saved={saved}
        onClear={() => {
          setResult(null);
          setError(null);
        }}
        filenameBase="elvix-text-summary"
      />
    </div>
  );
}
