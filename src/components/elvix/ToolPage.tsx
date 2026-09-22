import { Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/elvix/Markdown";
import { copyText, ResultActions } from "@/components/elvix/ResultActions";
import {
  AI_CONFIG_MESSAGE,
  AiThinking,
  EmptyState,
  ErrorState,
  NotConfiguredCard,
} from "@/components/elvix/States";
import { downloadText } from "@/lib/download";
import { toolById } from "@/lib/tools";
import { cn } from "@/lib/utils";

/** Consistent header for every ELVIX tool page. */
export function ToolHeader({
  toolId,
  children,
  className,
}: {
  toolId: string;
  children?: ReactNode;
  className?: string;
}) {
  const tool = toolById(toolId);
  if (!tool) return null;
  const Icon = tool.icon as LucideIcon;
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-md">
          <Icon className="size-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            {tool.name}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">{tool.blurb}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * Shared result panel for all tools: handles not-configured, loading,
 * error, empty and success states with copy/save/regenerate/clear/download.
 */
export function ResultPanel({
  loading,
  error,
  result,
  emptyHint,
  onRetry,
  onRegenerate,
  onSave,
  saved,
  onClear,
  filenameBase,
  loadingLabel,
  className,
}: {
  loading: boolean;
  error: string | null;
  result: string | null;
  emptyHint: string;
  onRetry?: () => void;
  onRegenerate?: () => void;
  onSave?: () => void;
  saved?: boolean;
  onClear?: () => void;
  filenameBase?: string;
  loadingLabel?: string;
  className?: string;
}) {
  if (loading) {
    return <AiThinking label={loadingLabel} className={className} />;
  }
  if (error) {
    return error === AI_CONFIG_MESSAGE ? (
      <NotConfiguredCard className={className} />
    ) : (
      <ErrorState message={error} onRetry={onRetry} className={className} />
    );
  }
  if (!result) {
    return <EmptyState icon={<span>✨</span>} title="Result yahan aayega" hint={emptyHint} className={className} />;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="glass ring-soft rounded-2xl p-4 sm:p-5">
        <Markdown content={result} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <ResultActions
          content={result}
          onRegenerate={onRegenerate}
          onSave={onSave}
          saved={saved}
          onClear={onClear}
          disabled={loading}
        />
        <Button
          size="sm"
          variant="secondary"
          className="gap-1.5 rounded-full"
          onClick={() => downloadText(filenameBase ?? "elvix-result", result)}
        >
          <Download className="size-3.5" />
          Download
        </Button>
      </div>
    </div>
  );
}

export { copyText };
