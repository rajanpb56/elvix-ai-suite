import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown, stripMarkdown } from "@/components/elvix/Markdown";
import { ElvixMark } from "@/components/elvix/Logo";
import {
  Bot,
  GraduationCap,
  History as HistoryIcon,
  Image as ImageIcon,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "General"];

const COMING_SOON = [
  "Notes Maker",
  "PDF Summarizer",
  "Study Planner",
  "Shorts Script",
  "Hook Generator",
  "Translator",
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ask, setAsk] = useState("");
  const recent = useQuery(api.data.listHistory, { limit: 3 });

  const handleAsk = () => {
    const text = ask.trim();
    if (!text) return;
    try {
      sessionStorage.setItem("elvix:ask", text);
    } catch {
      // ignore
    }
    navigate("/app/chat");
  };

  const firstName = user?.name?.split(" ")[0];

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
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="hidden text-xs text-muted-foreground sm:block">
            Shift + Enter = nayi line
          </span>
          <Button
            onClick={handleAsk}
            disabled={!ask.trim()}
            className="bg-brand-gradient ml-auto gap-2 rounded-full px-5 text-white shadow-md"
          >
            <Sparkles className="size-4" />
            Ask AI
          </Button>
        </div>
      </section>

      {/* Subject shortcuts */}
      <section aria-label="Doubt solver shortcuts">
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Subject se doubt poochein
        </p>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <Button
              key={s}
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => navigate(`/app/doubt-solver?subject=${encodeURIComponent(s)}`)}
            >
              <GraduationCap className="size-3.5" />
              {s}
            </Button>
          ))}
        </div>
      </section>

      {/* Popular tools */}
      <section aria-label="Popular tools">
        <h2 className="mb-3 font-display text-lg font-semibold">Popular Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/app/chat"
            className="group rounded-2xl border border-border/70 bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <div className="mb-2.5 flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Bot className="size-5" />
            </div>
            <p className="font-semibold">ELVIX AI Chat</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kisi bhi sawaal ka jawab — padhai ya general, sab kuch.
            </p>
            <span className="mt-2 inline-block text-xs font-medium text-primary group-hover:underline">
              Chat kholein →
            </span>
          </Link>

          <Link
            to="/app/doubt-solver"
            className="group rounded-2xl border border-border/70 bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <div className="mb-2.5 flex size-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500 dark:text-violet-400">
              <GraduationCap className="size-5" />
            </div>
            <p className="font-semibold">AI Doubt Solver</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Step-by-step solution + exam-ready answer, subject ke hisaab se.
            </p>
            <span className="mt-2 inline-block text-xs font-medium text-primary group-hover:underline">
              Solve karein →
            </span>
          </Link>
        </div>
      </section>

      {/* Coming soon (honest, non-interactive) */}
      <section aria-label="Coming soon tools">
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Coming soon
        </p>
        <div className="flex flex-wrap gap-2">
          {COMING_SOON.map((name) => (
            <span
              key={name}
              className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {name} · jald hi
            </span>
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
                <Wand2 className="hidden" aria-hidden />
                <ImageIcon className="hidden" aria-hidden />
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {item.toolName}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Preview of rendered markdown to warm up the module (hidden) */}
      <div className="hidden">
        <Markdown content="" />
      </div>
    </div>
  );
}
