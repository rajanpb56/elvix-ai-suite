import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLocalName } from "@/hooks/use-local-name";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolCard } from "@/components/elvix/ToolCard";
import { stripMarkdown } from "@/components/elvix/Markdown";
import { ElvixMark } from "@/components/elvix/Logo";
import { CATEGORY_META, toolById } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools";
import {
  FileText,
  History as HistoryIcon,
  ImagePlus,
  Sparkles,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const POPULAR = [
  "doubt-solver",
  "notes-maker",
  "pdf-summarizer",
  "shorts-script",
  "hook-generator",
  "study-planner",
];

const CATEGORIES: ToolCategory[] = ["study", "creator", "ai", "utilities"];

export default function Home() {
  const [name] = useLocalName();
  const navigate = useNavigate();
  const [ask, setAsk] = useState("");
  const recent = useQuery(api.data.listHistory, { limit: 3 });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  const handleAsk = () => {
    const text = ask.trim();
    if (!text) return;
    try {
      sessionStorage.setItem("elvix:ask", text);
    } catch {
      // ignore
    }
    navigate("/app/ai-chat");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isPdf =
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      navigate("/app/pdf-summarizer");
      return;
    }
    if (f.type.startsWith("image/")) {
      setUploadedName(f.name);
      toast.info(
        "Image ke andar ka text AI ko nahi dikhta abhi — question chat mein type karein.",
      );
      navigate("/app/ai-chat");
      return;
    }
    toast.error("Sirf PDF ya image file support hoti hai.");
  };

  const firstName = name?.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <header className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Namaste {firstName ? `${firstName} 👋` : "👋"}
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Aaj kya solve karna hai?
        </h1>
        <p className="text-sm text-muted-foreground">
          Soch se solution tak — AI ke saath.
        </p>
      </header>

      {/* Big ask box */}
      <section
        className="glass ring-soft rounded-3xl p-4 sm:p-5"
        aria-label="Ask ELVIX"
      >
        <div className="mb-3 flex items-center gap-2">
          <ElvixMark className="size-7" />
          <span className="text-sm font-semibold">Ask ELVIX anything…</span>
        </div>
        <Textarea
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
          placeholder="Yahan apna question likhein… jaise: Newton ka second law simple words mein samjhao"
          className="min-h-24 resize-none border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
          aria-label="Apna question likhein"
        />
        <div className="mt-3 flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
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
            <ImagePlus className="size-4" />
            Upload Image
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full"
            onClick={() => navigate("/app/pdf-summarizer")}
          >
            <FileText className="size-4" />
            Upload PDF
          </Button>
          <Button
            onClick={handleAsk}
            disabled={!ask.trim()}
            className="bg-brand-gradient ml-auto gap-2 rounded-full px-5 text-white shadow-md"
          >
            <Sparkles className="size-4" />
            Ask AI
          </Button>
        </div>
        {uploadedName && (
          <p className="mt-2 text-xs text-muted-foreground">
            📎 {uploadedName} — chat mein question ke saath mention karein.
          </p>
        )}
      </section>

      {/* Popular tools */}
      <section aria-label="Popular tools">
        <h2 className="mb-3 font-display text-lg font-semibold">Popular Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {POPULAR.map((id) => {
            const tool = toolById(id);
            return tool ? <ToolCard key={id} tool={tool} /> : null;
          })}
        </div>
      </section>

      {/* Explore categories */}
      <section aria-label="Explore ELVIX">
        <h2 className="mb-3 font-display text-lg font-semibold">Explore ELVIX</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/app/${cat === "ai" ? "tools" : cat}`}
              className="group rounded-2xl border border-border/70 bg-card/70 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <span className="block text-2xl" aria-hidden>
                {CATEGORY_META[cat].emoji}
              </span>
              <span className="mt-1.5 block text-sm font-semibold">
                {CATEGORY_META[cat].label}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                {CATEGORY_META[cat].blurb}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent history */}
      {recent && recent.length > 0 && (
        <section aria-label="Recent results">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent</h2>
            <Link
              to="/app/history"
              className="text-xs font-medium text-primary hover:underline"
            >
              Sab dekhein →
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map((item) => (
              <Link
                key={item._id}
                to="/app/history"
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-3.5 py-2.5 transition-colors hover:border-primary/40"
              >
                <HistoryIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {stripMarkdown(item.preview)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {item.toolName}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
