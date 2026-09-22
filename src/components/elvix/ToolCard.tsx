import type { ToolDef } from "@/lib/tools";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

const TINTS: Record<ToolDef["category"], string> = {
  study: "bg-violet-500/15 text-violet-500 dark:text-violet-300",
  creator: "bg-pink-500/15 text-pink-500 dark:text-pink-300",
  ai: "bg-primary/12 text-primary",
  utilities: "bg-amber-500/15 text-amber-500 dark:text-amber-300",
};

export function ToolCard({ tool, className }: { tool: ToolDef; className?: string }) {
  const Icon = tool.icon;
  return (
    <Link
      to={tool.path}
      className={cn(
        "group rounded-2xl border border-border/70 bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
        className,
      )}
    >
      <div
        className={`mb-2.5 flex size-10 items-center justify-center rounded-xl ${TINTS[tool.category]}`}
      >
        <Icon className="size-5" />
      </div>
      <p className="font-semibold">{tool.name}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{tool.blurb}</p>
      <span className="mt-2 inline-block text-xs font-medium text-primary group-hover:underline">
        Kholein →
      </span>
    </Link>
  );
}
