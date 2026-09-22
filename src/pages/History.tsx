import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Markdown, stripMarkdown } from "@/components/elvix/Markdown";
import { copyText } from "@/components/elvix/ResultActions";
import { EmptyState } from "@/components/elvix/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Filter = "all" | "study" | "creator" | "ai" | "utilities";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "study", label: "🎓 Study" },
  { value: "creator", label: "🎬 Creator" },
  { value: "ai", label: "🤖 AI" },
  { value: "utilities", label: "🛠 Utilities" },
];

export default function History() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<Id<"historyItems"> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const category = filter === "all" ? undefined : filter;
  const items = useQuery(api.data.listHistory, {
    category,
    search: search.trim() || undefined,
    limit: 200,
  });
  const deleteHistoryItem = useMutation(api.data.deleteHistoryItem);
  const clearHistory = useMutation(api.data.clearHistory);

  const handleCopy = async (id: string, content: string) => {
    const ok = await copyText(content);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const handleDelete = async (id: Id<"historyItems">) => {
    try {
      await deleteHistoryItem({ id });
      toast.success("Item delete ho gaya.");
    } catch {
      toast.error("Delete nahi hua.");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearHistory({});
      toast.success("Poori history clear ho gayi.");
    } catch {
      toast.error("History clear nahi hui.");
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            History
          </h1>
          <p className="text-sm text-muted-foreground">
            Aapke saare saved AI results ek jagah.
          </p>
        </div>
        {items && items.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 rounded-full text-muted-foreground hover:text-destructive"
            onClick={() => void handleClearAll()}
          >
            <Trash2 className="size-3.5" />
            Clear all
          </Button>
        )}
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search karein — title, tool ya preview…"
            className="pl-9"
          />
        </div>
        <div className="scrollbar-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                filter === f.value
                  ? "border-primary/50 bg-primary/12 text-primary"
                  : "border-border/80 text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {items === undefined ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Load ho raha hai…</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<span>🗂️</span>}
          title="Koi history nahi hai"
          hint="Tools se result save karte hi yahan dikhega."
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <article
              key={item._id}
              className="rounded-2xl border border-border/70 bg-card/60 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {item.toolName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-sm font-semibold">
                    {item.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {stripMarkdown(item.preview)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground"
                    aria-label="Copy"
                    onClick={() => void handleCopy(item._id, item.content)}
                  >
                    {copiedId === item._id ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label="Delete"
                    onClick={() => void handleDelete(item._id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground"
                    aria-label={expandedId === item._id ? "Close" : "View"}
                    onClick={() =>
                      setExpandedId(expandedId === item._id ? null : item._id)
                    }
                  >
                    {expandedId === item._id ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
              {expandedId === item._id && (
                <div className="mt-3 border-t border-border/60 pt-3">
                  <Markdown content={item.content} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
