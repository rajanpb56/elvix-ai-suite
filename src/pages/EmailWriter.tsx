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

const TONES = ["Formal", "Friendly", "Persuasive", "Apologetic", "Follow-up"];

export default function EmailWriter() {
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState("Formal");
  const [recipient, setRecipient] = useState("");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const writeEmail = useAction(api.ai.writeEmail);
  const saveHistoryItem = useMutation(api.data.saveHistoryItem);

  const run = async () => {
    if (!purpose.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await writeEmail({
        purpose,
        tone,
        recipient: recipient.trim() || undefined,
        details: details.trim() || undefined,
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
        toolName: "Email Writer",
        title: purpose.slice(0, 80),
        preview: result.slice(0, 140),
        content: result,
      });
      setSaved(true);
      toast.success("Email history mein save ho gaya.");
    } catch {
      toast.error("Save nahi ho paya.");
    }
  };

  return (
    <div className="space-y-5">
      <ToolHeader toolId="email-writer" />

      <div className="glass ring-soft space-y-4 rounded-3xl p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ew-purpose">Email ka purpose *</Label>
            <Input
              id="ew-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Jaise: Leave application / Complaint / College admission inquiry"
            />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ew-recipient">Kis ko (optional)</Label>
            <Input
              id="ew-recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Jaise: Principal sir / HR manager"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ew-details">Key points (optional)</Label>
            <Textarea
              id="ew-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Jo baatein email mein zaroor honi chahiye — ek line mein likh dein."
              className="min-h-20 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => void run()}
            disabled={!purpose.trim() || loading}
            className="bg-brand-gradient gap-2 rounded-full px-5 text-white shadow-md"
          >
            <Sparkles className="size-4" />
            {loading ? "Email likha ja raha hai…" : "Email Banayein"}
          </Button>
        </div>
      </div>

      <ResultPanel
        loading={loading}
        error={error}
        result={result}
        emptyHint="Purpose aur tone choose karein — subject line options aur ready-to-copy email body milegi."
        onRetry={() => void run()}
        onRegenerate={() => void run()}
        onSave={handleSave}
        saved={saved}
        onClear={() => {
          setResult(null);
          setError(null);
        }}
        filenameBase={`elvix-email-${purpose || "draft"}`}
      />
    </div>
  );
}
