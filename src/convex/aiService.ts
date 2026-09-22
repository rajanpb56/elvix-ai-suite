"use node";

import { vly } from "../lib/vly-integrations";
import type { AICompletionRequest } from "@vly-ai/integrations";

/**
 * ELVIX AI service — the single server-side entry point for every AI tool.
 * The provider can be swapped later by only changing this file.
 */

export const DEFAULT_MODEL = "gpt-5-mini";

export function isAIConfigured(): boolean {
  return Boolean(process.env.VLY_INTEGRATION_KEY);
}

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIResult =
  | { ok: true; text: string; model: string; totalTokens: number }
  | { ok: false; kind: "not_configured" | "timeout" | "provider" | "empty"; message: string };

const TIMEOUT_MS = 90_000;

function friendlyError(raw: string): { kind: "timeout" | "provider"; message: string } {
  const lower = (raw || "").toLowerCase();
  if (lower.includes("abort") || lower.includes("timeout") || lower.includes("timed out")) {
    return {
      kind: "timeout",
      message: "AI ne jawab dene mein zyada time le liya. Please try again.",
    };
  }
  if (
    lower.includes("rate limit") ||
    lower.includes("429") ||
    lower.includes("quota") ||
    lower.includes("credit") ||
    lower.includes("billing")
  ) {
    return {
      kind: "provider",
      message: "AI service ki limit reach ho gayi hai. Thodi der baad try karein.",
    };
  }
  if (lower.includes("unauthorized") || lower.includes("401") || lower.includes("403")) {
    return {
      kind: "provider",
      message: "AI service access issue. Please contact ELVIX support.",
    };
  }
  return {
    kind: "provider",
    message: "AI service se connect nahi ho paya. Please try again in a moment.",
  };
}

export async function runAI(
  messages: AIMessage[],
  opts: { model?: string; temperature?: number; maxTokens?: number } = {},
): Promise<AIResult> {
  if (!isAIConfigured()) {
    return {
      ok: false,
      kind: "not_configured",
      message:
        "AI service is not configured yet. Add the AI API key in the server environment to enable this feature.",
    };
  }

  const request: AICompletionRequest = {
    model: opts.model || DEFAULT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    maxTokens: opts.maxTokens ?? 4096,
  };

  try {
    const result = await Promise.race([
      vly.ai.completion(request),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS),
      ),
    ]);

    if (!result || !result.success) {
      const friendly = friendlyError(result?.error || "unknown provider error");
      return { ok: false, ...friendly };
    }

    const text = result.data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return {
        ok: false,
        kind: "empty",
        message: "AI ne khaali jawab diya. Please try again.",
      };
    }

    return {
      ok: true,
      text,
      model: request.model!,
      totalTokens: result.data?.usage?.totalTokens ?? 0,
    };
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    const friendly = friendlyError(raw);
    return { ok: false, ...friendly };
  }
}
