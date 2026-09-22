import { Check, Copy, RotateCcw, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export function ResultActions({
  content,
  onRegenerate,
  onSave,
  onClear,
  saved,
  disabled,
  className,
}: {
  content: string;
  onRegenerate?: () => void;
  onSave?: () => void;
  onClear?: () => void;
  saved?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleCopy}
        disabled={disabled || !content}
        className="gap-1.5 rounded-full"
      >
        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy Karein"}
      </Button>
      {onSave && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onSave}
          disabled={disabled || saved}
          className="gap-1.5 rounded-full"
        >
          <Save className="size-3.5" />
          {saved ? "Saved" : "Save Karein"}
        </Button>
      )}
      {onRegenerate && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onRegenerate}
          disabled={disabled}
          className="gap-1.5 rounded-full"
        >
          <RotateCcw className="size-3.5" />
          Phir Se Banayein
        </Button>
      )}
      {onClear && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          disabled={disabled}
          className="gap-1.5 rounded-full text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
