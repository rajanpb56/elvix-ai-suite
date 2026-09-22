"use node";

import { v } from "convex/values";
import { action, type ActionCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { runAI, isAIConfigured, type AIMessage } from "./aiService";

const HISTORY_LIMIT = 16;
const MAX_INPUT_CHARS = 8000;

const CHAT_SYSTEM_PROMPT =
  "You are ELVIX AI, a friendly and highly capable study + general assistant for Indian students. " +
  "Answer in the same language/Hinglish style the user writes in. Be clear, correct and to the point. " +
  "Use Markdown with short sections and bullet points. For numerical problems show the steps. " +
  "Keep answers concise unless the user asks for more depth.";

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
      { role: "system", content: CHAT_SYSTEM_PROMPT },
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

// ---------------------------------------------------------------- shared tool runner

async function runTool(
  ctx: ActionCtx,
  userId: Id<"users">,
  tool: string,
  messages: AIMessage[],
  opts: { model?: string; temperature?: number; maxTokens?: number } = {},
): Promise<{ text: string; model: string }> {
  const result = await runAI(messages, opts);
  await safeLog(ctx, {
    userId,
    tool,
    model: result.ok ? result.model : opts.model,
    ok: result.ok,
    errorKind: result.ok ? undefined : result.kind,
  });
  if (!result.ok) throw new Error(result.message);
  return { text: result.text, model: result.model };
}

const SYSTEM = {
  student:
    "You are ELVIX, an expert AI tutor for Indian students (CBSE/ICSE/state boards). Always answer in the language/Hinglish style of the user's input. Be accurate and exam-oriented. Use clean Markdown with short sections and bullets.",
  creator:
    "You are ELVIX Creator Studio, a viral content strategist for Indian creators (YouTube Shorts, Instagram Reels). Always write in the language the user asks for. Punchy, natural spoken lines. Use clean Markdown.",
  utility:
    "You are ELVIX Utility AI. Be precise and helpful. Use clean Markdown when structure helps.",
};

// ---------------------------------------------------------------- chat regenerate

/** Regenerate the last assistant response: drops trailing assistant messages and re-answers. */
export const regenerateResponse = action({
  args: { chatId: v.id("chats"), model: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const lastUser = await ctx.runQuery(internal.data.internalLastUserMessage, {
      chatId: args.chatId,
      userId,
    });
    if (!lastUser) throw new Error("Phir se banane ke liye koi message nahi hai.");

    await ctx.runMutation(internal.data.internalResetTrailingAssistant, {
      chatId: args.chatId,
      userId,
    });

    const priorMessages = (await ctx.runQuery(
      internal.data.internalRecentMessages,
      { chatId: args.chatId, limit: HISTORY_LIMIT },
    )) as { role: "user" | "assistant"; content: string }[];

    const result = await runAI(
      [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        ...priorMessages.map((m) => ({
          role: m.role,
          content: truncate(m.content),
        })),
      ],
      { model: args.model },
    );

    await safeLog(ctx, {
      userId,
      tool: "chat-regenerate",
      model: result.ok ? result.model : args.model,
      ok: result.ok,
      errorKind: result.ok ? undefined : result.kind,
    });
    if (!result.ok) throw new Error(result.message);

    await ctx.runMutation(internal.data.internalSaveAssistant, {
      userId,
      chatId: args.chatId,
      assistantContent: result.text,
      model: result.model,
    });
    return { model: result.model };
  },
});

// ---------------------------------------------------------------- study tools

/** AI Notes Maker */
export const makeNotes = action({
  args: {
    topic: v.string(),
    chapter: v.optional(v.string()),
    text: v.optional(v.string()),
    style: v.union(
      v.literal("quick"),
      v.literal("detailed"),
      v.literal("revision"),
      v.literal("exam"),
    ),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const topic = args.topic.trim();
    if (!topic) throw new Error("Topic likhna zaroori hai.");

    const chapter = args.chapter?.trim()
      ? ` (Chapter: ${args.chapter.trim()})`
      : "";
    const extra = args.text?.trim()
      ? `\n\nReference material:\n${truncate(args.text.trim(), 6000)}`
      : "";

    const styleLines: Record<string, string> = {
      quick: "Quick Notes: short, skimmable bullets only.",
      detailed:
        "Detailed Notes: thorough coverage with explanations and examples.",
      revision:
        "Revision Notes: ultra-condensed facts, formulas and one-liners for last-minute revision.",
      exam:
        "Exam Notes: focused on what exams ask — definitions, expected questions and model answers.",
    };

    return runTool(
      ctx,
      userId,
      "notes-maker",
      [
        {
          role: "system",
          content: SYSTEM.student,
        },
        {
          role: "user",
          content:
            `Create ${styleLines[args.style]}\nTopic: ${topic}${chapter}${extra}\n\n` +
            "Return Markdown with exactly these sections:\n" +
            "## 📖 Definition\n## 🧠 Main Concepts\n## ⭐ Important Points\n## 💡 Examples\n## 🧮 Formulas (only if relevant, else omit this section)\n## ❓ Important Questions",
        },
      ],
      { model: args.model, maxTokens: 6000, temperature: 0.4 },
    );
  },
});

/** Summarizer shared by PDF Summarizer and Text Summarizer */
export const summarizeContent = action({
  args: {
    title: v.optional(v.string()),
    text: v.string(),
    detail: v.union(
      v.literal("short"),
      v.literal("medium"),
      v.literal("detailed"),
    ),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const text = args.text.trim();
    if (!text) throw new Error("Koi text nahi mila summarize karne ke liye.");

    const lengthLine = {
      short: "a short overview (max ~150 words)",
      medium: "a medium-length overview (max ~350 words)",
      detailed: "a detailed overview",
    }[args.detail];
    const titleLine = args.title?.trim()
      ? `Document: "${args.title.trim()}"\n\n`
      : "";

    return runTool(
      ctx,
      userId,
      "summarizer",
      [
        {
          role: "system",
          content:
            "You are ELVIX Summarizer. Be accurate — never invent facts. Answer in the language/Hinglish style of the content. Use clean Markdown.",
        },
        {
          role: "user",
          content:
            `${titleLine}Summarize this content. Give ${lengthLine}.\n\n` +
            "Return Markdown with exactly these sections:\n" +
            "## 📄 Summary\n## 🔑 Key Points\n## 📚 Important Definitions\n## ❓ Important Questions\n## ⚡ Quick Revision\n\nContent:\n" +
            truncate(text, 60000),
        },
      ],
      { model: args.model, maxTokens: 6000, temperature: 0.3 },
    );
  },
});

/** AI Study Planner */
export const makeStudyPlan = action({
  args: {
    course: v.string(),
    subjects: v.array(v.string()),
    examDate: v.string(),
    dailyHours: v.number(),
    weakSubjects: v.array(v.string()),
    strongSubjects: v.array(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    if (!args.subjects.length)
      throw new Error("Kam se kam ek subject likhein.");
    if (args.dailyHours <= 0 || args.dailyHours > 16)
      throw new Error("Daily hours 1 se 16 ke beech honi chahiye.");

    const examMs = new Date(args.examDate).getTime();
    const daysLeft = Number.isFinite(examMs)
      ? Math.max(1, Math.ceil((examMs - Date.now()) / 86_400_000))
      : 30;

    return runTool(
      ctx,
      userId,
      "study-planner",
      [
        { role: "system", content: SYSTEM.student },
        {
          role: "user",
          content:
            `Create a realistic day-wise study schedule.\n` +
            `- Student: ${args.course.trim() || "Student"}\n` +
            `- Subjects: ${args.subjects.join(", ")}\n` +
            `- Exam date: ${args.examDate} (${daysLeft} days left)\n` +
            `- Daily study time: ${args.dailyHours} hours\n` +
            `- Weak subjects (need more time): ${args.weakSubjects.join(", ") || "none"}\n` +
            `- Strong subjects (lighter revision): ${args.strongSubjects.join(", ") || "none"}\n\n` +
            `Rules: give weak subjects more time; include weekly revision and buffer days before the exam; each day must fit inside ${args.dailyHours} hours with short breaks.\n\n` +
            "Return Markdown with sections:\n" +
            `## 🗓️ Plan Overview\n## 📅 Week-by-Week Schedule (day-wise: date, subjects, focus, hours)\n## 🔁 Daily Routine (how to split the ${args.dailyHours} hours)\n## ✅ Weekly Targets\n## 💡 Tips`,
        },
      ],
      { model: args.model, maxTokens: 6000, temperature: 0.5 },
    );
  },
});

/** Question Generator */
export const generateQuestions = action({
  args: {
    subject: v.string(),
    className: v.string(),
    chapter: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
    ),
    count: v.number(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const count = Math.min(30, Math.max(1, Math.round(args.count)));
    if (!args.subject.trim()) throw new Error("Subject likhein.");
    if (!args.chapter.trim()) throw new Error("Chapter likhein.");

    const mcqCount = Math.ceil(count / 2);
    const shortCount = Math.max(1, Math.round(count * 0.3));
    const longCount = Math.max(1, count - mcqCount - shortCount);

    return runTool(
      ctx,
      userId,
      "question-generator",
      [
        { role: "system", content: SYSTEM.student },
        {
          role: "user",
          content:
            `Generate exam questions.\n` +
            `- Subject: ${args.subject.trim()}\n` +
            `- Class: ${args.className.trim() || "any"}\n` +
            `- Chapter: ${args.chapter.trim()}\n` +
            `- Difficulty: ${args.difficulty}\n\n` +
            `Mix: ${mcqCount} MCQs (4 options A-D each), ${shortCount} short-answer questions, ${longCount} long-answer questions.\n\n` +
            "Return Markdown with sections:\n" +
            "## 📘 Section A — MCQs\n## 📝 Section B — Short Questions\n## 📄 Section C — Long Questions\n## 🔑 Answer Key (correct MCQ options + brief model answers)",
        },
      ],
      { model: args.model, maxTokens: 6000, temperature: 0.6 },
    );
  },
});

// ---------------------------------------------------------------- creator tools

/** Shorts Script Generator */
export const shortsScript = action({
  args: {
    topic: v.string(),
    language: v.string(),
    duration: v.string(),
    style: v.union(
      v.literal("facts"),
      v.literal("educational"),
      v.literal("suspense"),
      v.literal("story"),
      v.literal("fun"),
    ),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const topic = args.topic.trim();
    if (!topic) throw new Error("Topic likhein.");

    return runTool(
      ctx,
      userId,
      "shorts-script",
      [
        { role: "system", content: SYSTEM.creator },
        {
          role: "user",
          content:
            `Write a ${args.duration} vertical short-video script about "${topic}" in ${args.language}. Style: ${args.style}.\n\n` +
            "Return Markdown with exactly these sections:\n" +
            "## 🎬 Hook (first 3 seconds) — exact spoken lines\n## 📜 Full Script — shot-by-shot with timestamps like [0-3s], [3-10s]; each shot: spoken lines + on-screen text suggestion\n## 📝 3 Caption Options\n## #️⃣ Hashtags (10-15 relevant)\n## 📣 CTA (spoken + caption)\n\nKeep spoken lines natural, punchy and easy to read aloud.",
        },
      ],
      { model: args.model, maxTokens: 6000, temperature: 0.8 },
    );
  },
});

/** Hook Generator */
export const hookGenerator = action({
  args: {
    topic: v.string(),
    platform: v.string(),
    count: v.number(),
    language: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const topic = args.topic.trim();
    if (!topic) throw new Error("Topic likhein.");
    const count = Math.min(20, Math.max(3, Math.round(args.count)));

    return runTool(
      ctx,
      userId,
      "hook-generator",
      [
        { role: "system", content: SYSTEM.creator },
        {
          role: "user",
          content:
            `Generate ${count} scroll-stopping hooks about "${topic}" for ${args.platform} in ${args.language}.\n\n` +
            'Return Markdown: a numbered list, each item formatted as **"hook line"** — one short line on why it works (curiosity, shock, benefit, question, etc.). Vary the techniques.',
        },
      ],
      { model: args.model, temperature: 0.9 },
    );
  },
});

// ---------------------------------------------------------------- utilities

/** Translator */
export const translateText = action({
  args: {
    text: v.string(),
    targetLanguage: v.string(),
    sourceLanguage: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const text = args.text.trim();
    if (!text) throw new Error("Translate karne ke liye text likhein.");
    const sourceLine = args.sourceLanguage?.trim()
      ? `from ${args.sourceLanguage.trim()} `
      : "";

    return runTool(
      ctx,
      userId,
      "translator",
      [
        { role: "system", content: SYSTEM.utility },
        {
          role: "user",
          content:
            `Translate this text ${sourceLine}into ${args.targetLanguage}. Keep the tone, formatting and meaning exactly. Return only the translation — no explanations.\n\nText:\n${truncate(text, 8000)}`,
        },
      ],
      { model: args.model, temperature: 0.2 },
    );
  },
});

/** Email Writer */
export const writeEmail = action({
  args: {
    purpose: v.string(),
    tone: v.string(),
    recipient: v.optional(v.string()),
    details: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const purpose = args.purpose.trim();
    if (!purpose) throw new Error("Email ka purpose likhein.");

    return runTool(
      ctx,
      userId,
      "email-writer",
      [
        { role: "system", content: SYSTEM.utility },
        {
          role: "user",
          content:
            `Write an email.\n` +
            `- Purpose: ${purpose}\n` +
            `- Tone: ${args.tone}\n` +
            `- To: ${args.recipient?.trim() || "generic recipient"}\n` +
            (args.details?.trim()
              ? `- Key points to include: ${truncate(args.details.trim(), 3000)}\n`
              : "") +
            "\nReturn Markdown with sections:\n## 📧 Subject Lines (2 options)\n## ✉️ Email (ready to copy; end with [Your Name] placeholder)\nKeep it clear, natural and not robotic.",
        },
      ],
      { model: args.model, temperature: 0.6 },
    );
  },
});
