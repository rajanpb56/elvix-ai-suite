"use node";

import { v } from "convex/values";
import { internalMutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
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

/** Internal log write (never throws to the caller). */
export const logUsageInternal = internalMutation({
  args: {
    userId: v.id("users"),
    tool: v.string(),
    model: v.optional(v.string()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    ok: v.boolean(),
    errorKind: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("usageLogs", { ...args, createdAt: Date.now() });
  },
});

async function safeLog(
  ctx: Parameters<typeof runAI>[0] extends never ? never : any,
  args: {
    userId: any;
    tool: string;
    model?: string;
    ok: boolean;
    errorKind?: string;
  },
) {
  try {
    await ctx.runMutation(internal.ai.logUsageInternal, {
      userId: args.userId,
      tool: args.tool,
      model: args.model,
      ok: args.ok,
      errorKind: args.errorKind,
    });
  } catch {
    // logging must never break a user request
  }
}

function truncate(text: string, max = MAX_INPUT_CHARS) {
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
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("UNAUTHORIZED");
    }

    const content = args.message.trim();
    if (!content) throw new Error("Message khaali hai. Kuch likhein.");
    if (content.length > MAX_INPUT_CHARS) {
      throw new Error("Message bahut lamba hai. Chhota message bhejein.");
    }

    // Resolve or create chat (always owned by this user)
    let chatId = args.chatId ?? null;
    if (chatId) {
      const chat = await ctx.db.get(chatId);
      if (!chat || chat.userId !== userId) throw new Error("Chat not found");
    } else {
      chatId = await ctx.db.insert("chats", {
        userId,
        title: content.slice(0, 60) || "New chat",
        updatedAt: Date.now(),
      });
    }

    // Load this chat's recent history
    const history = await ctx.db
      .query("messages")
      .withIndex("by_chat_order", (q) => q.eq("chatId", chatId!))
      .order("desc")
      .take(HISTORY_LIMIT);

    const priorMessages: AIMessage[] = history
      .reverse()
      .map((m) => ({ role: m.role, content: truncate(m.content, 4000) }));

    const model = args.model ?? undefined;

    const aiMessages: AIMessage[] = [
      {
        role: "system",
        content:
          "You are ELVIX AI, a friendly and highly capable study + general assistant for Indian students. " +
          "Answer in the same language/Hinglish style the user writes in. Be clear, correct and to the point. " +
          "Use Markdown with short sections and bullet points. For numerical problems show the steps. " +
          "Keep answers concise unless the user asks for more depth.",
      },
      ...priorMessages,
      { role: "user", content },
    ];

    const result = await runAI(aiMessages, { model });

    await safeLog(ctx, {
      userId,
      tool: "chat",
      model: "ok" in result && result.ok ? result.model : model,
      ok: result.ok,
      errorKind: result.ok ? undefined : result.kind,
    });

    if (!result.ok) {
      // Persist the user's message so they can retry later without losing it
      const alreadySaved = history.some(
        (m) => m.role === "user" && m.content === content,
      );
      if (!alreadySaved) {
        await ctx.db.insert("messages", {
          chatId,
          userId,
          role: "user",
          content,
        });
        await ctx.db.patch(chatId, { updatedAt: Date.now() });
      }
      throw new Error(result.message);
    }

    await ctx.db.insert("messages", { chatId, userId, role: "user", content });
    const assistantId = await ctx.db.insert("messages", {
      chatId,
      userId,
      role: "assistant",
      content: result.text,
      model: result.model,
    });
    await ctx.db.patch(chatId, { updatedAt: Date.now() });

    return {
      chatId: chatId as string,
      userMessageId: `local-${Date.now()}`,
      assistantMessageId: assistantId as string,
      model: result.model,
    };
  },
});

/**
 * Doubt Solver: structured exam-ready answer with steps, concept and formula.
 */
export const solveDoubt = action({
  args: {
    question: v.string(),
    subject: v.string(),
    mode: v.union(v.literal("full"), v.literal("explain"), v.literal("exam")),
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

    const prompts: Record<typeof args.mode, string> = {
      full: `Solve this student doubt. ${subjectLine}.\nReturn Markdown with exactly these sections:\n## ✅ Final Answer\n## 📝 Step-by-Step Explanation\n## 💡 Important Concept\n## 🧮 Formula (only if relevant, else omit)\n## 🎯 Exam-Ready Answer`,
      explain: `Explain this in more depth for a student. ${subjectLine}.\nUse simpler language, real-life examples and cover common mistakes. Markdown allowed.`,
      exam: `Rewrite the answer to this question as a crisp exam-ready answer. ${subjectLine}.\nFormat: a 2–5 line direct answer plus key points a student can memorize. Markdown allowed.`,
    };

    const result = await runAI(
      [
        {
          role: "system",
          content:
            "You are ELVIX Doubt Solver, an expert Indian-curriculum tutor (Physics, Chemistry, Mathematics, Biology, English). " +
            "Always answer in the language/Hinglish style of the question. Be accurate and exam-oriented. Use Markdown.",
        },
        { role: "user", content: `${prompts[args.mode]}\n\nQuestion: ${question}` },
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
