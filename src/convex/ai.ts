"use node";

import { v } from "convex/values";
import { action, type ActionCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { runAI, isAIConfigured, type AIMessage } from "./aiService";

const HISTORY_LIMIT = 16;
const MAX_INPUT_CHARS = 8000;

/** Honest config check for the UI (no secrets exposed). */
export const aiConfigured = action({
  args: {},
  handler: async () => {
    return { configured: isAIConfigured() };
  },
});

async function safeLog(
  ctx: ActionCtx,
  args: {
    userId: Id<"users">;
    tool: string;
    model?: string;
    ok: boolean;
    errorKind?: string;
  },
) {
  try {
    await ctx.runMutation(internal.data.logUsageInternal, args);
  } catch {
    // logging must never break a user request
  }
}

function truncate(text: string, max = 4000) {
  return text.length > max ? text.slice(0, max) : text;
}

/**
 * ELVIX AI chat. Persists user + assistant messages in the caller's own chat.
 */
export const sendChatMessage = action({
  args: {
    chatId: v.optional(v.id("chats")),
    message: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ chatId: Id<"chats">; model: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const content = args.message.trim();
    if (!content) throw new Error("Message khaali hai. Kuch likhein.");
    if (content.length > MAX_INPUT_CHARS) {
      throw new Error("Message bahut lamba hai. Chhota message bhejein.");
    }

    // Resolve or create chat (always owned by this user)
    const chatId = await ctx.runMutation(internal.data.internalEnsureChat, {
      userId,
      chatId: args.chatId,
      title: content,
    });

    // Load this chat's recent history
    const priorMessages = (await ctx.runQuery(
      internal.data.internalRecentMessages,
      { chatId, limit: HISTORY_LIMIT },
    )) as { role: "user" | "assistant"; content: string }[];

    const aiMessages: AIMessage[] = [
      {
        role: "system",
        content:
          "You are ELVIX AI, a friendly and highly capable study + general assistant for Indian students. " +
          "Answer in the same language/Hinglish style the user writes in. Be clear, correct and to the point. " +
          "Use Markdown with short sections and bullet points. For numerical problems show the steps. " +
          "Keep answers concise unless the user asks for more depth.",
      },
      ...priorMessages.map((m) => ({
        role: m.role,
        content: truncate(m.content),
      })),
      { role: "user", content },
    ];

    const result = await runAI(aiMessages, { model: args.model });

    await safeLog(ctx, {
      userId,
      tool: "chat",
      model: result.ok ? result.model : args.model,
      ok: result.ok,
      errorKind: result.ok ? undefined : result.kind,
    });

    if (!result.ok) throw new Error(result.message);

    await ctx.runMutation(internal.data.internalSaveExchange, {
      userId,
      chatId,
      userContent: content,
      assistantContent: result.text,
      model: result.model,
    });

    return { chatId, model: result.model };
  },
});

/**
 * Doubt Solver: structured exam-ready answer with steps, concept and formula.
 */
export const solveDoubt = action({
  args: {
    question: v.string(),
    subject: v.string(),
    mode: v.union(
      v.literal("full"),
      v.literal("explain"),
      v.literal("exam"),
    ),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const question = args.question.trim();
    if (!question) throw new Error("Pehle apna question likhein.");
    if (question.length > MAX_INPUT_CHARS) {
      throw new Error("Question bahut lamba hai. Thoda chhota likhein.");
    }

    const subjectLine =
      args.subject === "General"
        ? "the question is general"
        : `subject: ${args.subject}`;

    const prompts: Record<string, string> = {
      full: `Solve this student doubt. ${subjectLine}.\nReturn Markdown with exactly these sections:\n## ✅ Final Answer\n## 📝 Step-by-Step Explanation\n## 💡 Important Concept\n## 🧮 Formula (only if relevant, else omit this section)\n## 🎯 Exam-Ready Answer`,
      explain:
        `Explain this doubt in more depth for a student. ${subjectLine}.\n` +
        "Use simpler language, real-life examples and cover common mistakes. Markdown allowed.",
      exam:
        `Rewrite the answer to this question as a crisp exam-ready answer. ${subjectLine}.\n` +
        "Format: a 2–5 line direct answer plus key points a student can memorize. Markdown allowed.",
    };

    const result = await runAI(
      [
        {
          role: "system",
          content:
            "You are ELVIX Doubt Solver, an expert Indian-curriculum tutor (Physics, Chemistry, Mathematics, Biology, English). " +
            "Always answer in the language/Hinglish style of the question. Be accurate and exam-oriented. Use Markdown.",
        },
        {
          role: "user",
          content: `${prompts[args.mode]}\n\nQuestion: ${question}`,
        },
      ],
      { model: args.model, temperature: 0.4, maxTokens: 3000 },
    );

    await safeLog(ctx, {
      userId,
      tool: "doubt-solver",
      model: result.ok ? result.model : args.model,
      ok: result.ok,
      errorKind: result.ok ? undefined : result.kind,
    });

    if (!result.ok) throw new Error(result.message);
    return { text: result.text, model: result.model };
  },
});
