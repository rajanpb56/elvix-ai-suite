import { AlertTriangle, Loader2, KeyRound, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const AI_CONFIG_MESSAGE =
  "AI service is not configured yet. Add the AI API key in the server environment to enable this feature.";

export function NotConfiguredCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4",
        className,
      )}
      role="status"
    >
      <KeyRound className="mt-0.5 size-5 shrink-0 text-amber-500" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{AI_CONFIG_MESSAGE}</p>
        <p className="text-xs text-muted-foreground">
          Baaki tools apni jagah kaam karenge. ELVIX team ko pata hai — jald
          enable ho jayega.
        </p>
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4",
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="flex-1 space-y-2">
        <p className="text-sm text-foreground">{message}</p>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5">
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

export function AiThinking({ label = "ELVIX AI soch raha hai…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground" role="status">
      <Loader2 className="size-4 animate-spin text-primary" />
      <span>{label}</span>
      <span className="flex gap-1">
        <span className="size-1.5 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-primary/70" />
      </span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 p-8 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="max-w-xs text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
