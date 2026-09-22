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

const PLATFORMS = ["YouTube Shorts", "Instagram Reels", "YouTube Long"];
const COUNTS = ["5", "10", "15"];

export default function HookGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("YouTube Shorts");
  const [count, setCount] = useState("10");
  const [language, setLanguage] = useState("Hinglish");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const hookGenerator = useAction(api.ai.hookGenerator);
  const saveHistoryItem = useMutation(api.data.saveHistoryItem);

  const run = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await hookGenerator({
        topic,
        platform,
        count: Number(count) || 10,
        language,
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
        category: "creator",
        toolName: "Hook Generator",
        title: topic.slice(0, 80),
        preview: result.slice(0, 140),
        content: `**Topic:** ${topic}\n**Platform:** ${platform}\n\n${result}`,
      });
      setSaved(true);
      toast.success("Hooks history mein save ho gaye.");
    } catch {
      toast.error("Save nahi ho paya.");
    }
  };

  return (
    <div className="space-y-5">
      <ToolHeader toolId="hook-generator" />

      <div className="glass ring-soft space-y-4 rounded-3xl p-4 sm:p-5">
        <div className="space-y-2">
          <Label htmlFor="hg-topic">Topic *</Label>
          <Input
            id="hg-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Jaise: study motivation, tech facts, cricket"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kitne hooks</Label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Hinglish", "Hindi", "English"].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
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
            {loading ? "Hooks ban rahe hain…" : "Hooks Banayein"}
          </Button>
        </div>
      </div>

      <ResultPanel
        loading={loading}
        error={error}
        result={result}
        emptyHint="Topic likhein — pehli 3 second mein viewer ko rok dene wale hooks, har ek ke saath 'why it works' note."
        onRetry={() => void run()}
        onRegenerate={() => void run()}
        onSave={handleSave}
        saved={saved}
        onClear={() => {
          setResult(null);
          setError(null);
        }}
        filenameBase={`elvix-hooks-${topic || "topic"}`}
      />
    </div>
  );
}
