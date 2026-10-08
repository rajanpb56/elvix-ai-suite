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

const LANGUAGES = ["Hinglish", "Hindi", "English"];
const DURATIONS = ["15s", "30s", "45s", "60s"];
const STYLES = [
  { value: "facts", label: "Facts" },
  { value: "educational", label: "Educational" },
  { value: "suspense", label: "Suspense" },
  { value: "story", label: "Story" },
  { value: "fun", label: "Fun" },
];

export default function ShortsScript() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("Hinglish");
  const [duration, setDuration] = useState("30s");
  const [style, setStyle] = useState("facts");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const shortsScript = useAction(api.ai.shortsScript);
  const saveHistoryItem = useMutation(api.data.saveHistoryItem);

  const run = async () => {
    if (!topic.trim() || loading) return;
    trackToolUsed("Shorts Script");
    setLoading(true);
    setError(null);
    try {
      const res = await shortsScript({
        topic,
        language,
        duration,
        style: style as "facts" | "educational" | "suspense" | "story" | "fun",
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
        category: "creator",
        toolName: "Shorts Script",
        title: topic.slice(0, 80),
        preview: result.slice(0, 140),
        content: `**Topic:** ${topic}\n**Language:** ${language}\n**Duration:** ${duration}\n**Style:** ${style}\n\n${result}`,
      });
      setSaved(true);
      toast.success("Script saved to history.");
    } catch {
      toast.error("Couldn't save.");
    }
  };

  return (
    <div className="space-y-5">
      <ToolHeader toolId="shorts-script" />

      <div className="glass ring-soft space-y-4 rounded-3xl p-4 sm:p-5">
        <div className="space-y-2">
          <Label htmlFor="ss-topic">Video topic *</Label>
          <Input
            id="ss-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. 5 facts about black holes"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Style</Label>
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
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => void run()}
            disabled={!topic.trim() || loading}
            className="bg-brand-gradient gap-2 rounded-full px-5 text-white shadow-md"
          >
            <Sparkles className="size-4" />
            {loading ? "Writing your script…" : "Create Script"}
          </Button>
        </div>
      </div>

      <ResultPanel
        loading={loading}
        error={error}
        result={result}
        emptyHint="Enter a topic and tap Create Script — hook, timestamped script, captions, hashtags and CTA in one place."
        onRetry={() => void run()}
        onRegenerate={() => void run()}
        onSave={handleSave}
        saved={saved}
        onClear={() => {
          setResult(null);
          setError(null);
        }}
        filenameBase={`elvix-shorts-${topic || "script"}`}
      />
    </div>
  );
}
