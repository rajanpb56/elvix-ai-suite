import { ToolCard } from "@/components/elvix/ToolCard";
import { CATEGORY_META, toolsByCategory } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools";
import { EmptyState } from "@/components/elvix/States";

export function Hub({ category }: { category: ToolCategory }) {
  const meta = CATEGORY_META[category];
  const tools = toolsByCategory(category);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          <span aria-hidden>{meta.emoji}</span> {meta.label} Hub
        </h1>
        <p className="text-sm text-muted-foreground">{meta.blurb}</p>
      </header>

      {tools.length === 0 ? (
        <EmptyState
          icon={<span>{meta.emoji}</span>}
          title="Is category mein abhi tools nahi hain"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
