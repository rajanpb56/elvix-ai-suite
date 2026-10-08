/**
 * GA4 event helpers. The gtag.js loader lives in index.html <head> and
 * defines window.gtag. We only ever send the tool name — never user text,
 * prompts, uploaded document contents or any other personal information.
 */
type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

/** Fire a GA4 "tool_used" event with only the tool's name. */
export function trackToolUsed(toolName: string): void {
  try {
    window.gtag?.("event", "tool_used", {
      tool_name: toolName,
    });
  } catch {
    // Analytics must never break a tool.
  }
}
