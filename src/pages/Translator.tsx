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
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useAction } from "convex/react";
import { trackToolUsed } from "@/lib/analytics";

const LANGUAGES = [
  "Hindi",
  "English",
  "Hinglish",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Urdu",
  "Spanish",
  "French",
  "German",
  "Arabic",
];

export default function Translator() {
  const [text, setText] = useState("");
  const [source, setSource] = useState<string>("auto");
  const [target, setTarget] = useState<string>("English");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateText = useAction(api.ai.translateText);

  const run = async () => {
    if (!text.trim() || loading) return;
    trackToolUsed("Translator");
    setLoading(true);
    setError(null);
    try {
      const res = await translateText({
        text,
        targetLanguage: target,
        sourceLanguage: source === "auto" ? undefined : source,
      });
      setResult(res.text);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg.includes("not configured") ? AI_CONFIG_MESSAGE : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <ToolHeader toolId="translator" />

      <div className="glass ring-soft space-y-4 rounded-3xl p-4 sm:p-5">
        <div className="space-y-2">
          <Label htmlFor="tr-text">Enter text *</Label>
          <Textarea
            id="tr-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste whatever you'd like to translate…"
            className="min-h-28 resize-none"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>From</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Select value={target} onValueChange={setTarget}>
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
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => void run()}
            disabled={!text.trim() || loading}
            className="bg-brand-gradient gap-2 rounded-full px-5 text-white shadow-md"
          >
            <Sparkles className="size-4" />
            {loading ? "Translating…" : "Translate"}
          </Button>
        </div>
      </div>

      <ResultPanel
        loading={loading}
        error={error}
        result={result}
        emptyHint="Paste your text and choose a language — you'll get a clean translation instantly."
        onRetry={() => void run()}
        onRegenerate={() => void run()}
        onClear={() => {
          setResult(null);
          setError(null);
        }}
        filenameBase="elvix-translation"
      />
    </div>
  );
}
