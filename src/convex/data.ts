import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

// ---------------------------------------------------------------- usage logs

/** Internal usage-log write (called from Node AI actions, never throws). */
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

// ---------------------------------------------------------------- chats (internal, for AI actions)

export const internalEnsureChat = internalMutation({
  args: {
    userId: v.id("users"),
    chatId: v.optional(v.id("chats")),
    title: v.string(),
  },
  handler: async (ctx, { userId, chatId, title }) => {
    if (chatId) {
      const chat = await ctx.db.get(chatId);
      if (!chat || chat.userId !== userId) throw new Error("Chat not found");
      return chatId;
    }
    return await ctx.db.insert("chats", {
      userId,
      title: title.slice(0, 60) || "New chat",
      updatedAt: Date.now(),
    });
  },
});

export const internalRecentMessages = internalQuery({
  args: { chatId: v.id("chats"), limit: v.number() },
  handler: async (ctx, { chatId, limit }) => {
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .order("desc")
      .take(limit);
    return rows.reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  },
});

export const internalSaveExchange = internalMutation({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
    userContent: v.string(),
    assistantContent: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== args.userId) throw new Error("Chat not found");
    await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: args.userId,
      role: "user",
      content: args.userContent,
    });
    await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: args.userId,
      role: "assistant",
      content: args.assistantContent,
      model: args.model,
    });
    await ctx.db.patch(args.chatId, { updatedAt: Date.now() });
  },
});

export const internalSaveAssistant = internalMutation({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
    assistantContent: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== args.userId) throw new Error("Chat not found");
    await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: args.userId,
      role: "assistant",
      content: args.assistantContent,
      model: args.model,
    });
    await ctx.db.patch(args.chatId, { updatedAt: Date.now() });
  },
});

export const internalResetTrailingAssistant = internalMutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, { chatId, userId }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) throw new Error("Chat not found");
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .order("desc")
      .collect();
    for (const m of rows) {
      if (m.role !== "assistant") break;
      await ctx.db.delete(m._id);
    }
  },
});

export const internalLastUserMessage = internalQuery({
  args: { chatId: v.id("chats"), userId: v.id("users") },
  handler: async (ctx, { chatId, userId }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) return null;
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .order("desc")
      .collect();
    for (const m of rows) {
      if (m.role === "user") return m.content;
    }
    return null;
  },
});

// ---------------------------------------------------------------- chats (public)

export const listChats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("chats")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
  },
});

export const listMessages = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) return [];
    return ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .order("asc")
      .collect();
  },
});

export const renameChat = mutation({
  args: { chatId: v.id("chats"), title: v.string() },
  handler: async (ctx, { chatId, title }) => {
    const userId = await getAuthUserId(ctx);
    const chat = await ctx.db.get(chatId);
    if (!userId || !chat || chat.userId !== userId) {
      throw new Error("Chat not found");
    }
    await ctx.db.patch(chatId, {
      title: title.trim().slice(0, 80) || chat.title,
    });
  },
});

export const deleteChat = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }) => {
    const userId = await getAuthUserId(ctx);
    const chat = await ctx.db.get(chatId);
    if (!userId || !chat || chat.userId !== userId) {
      throw new Error("Chat not found");
    }
    for (const m of await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .collect()) {
      await ctx.db.delete(m._id);
    }
    await ctx.db.delete(chatId);
  },
});

// ---------------------------------------------------------------- history

export const listHistory = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("study"),
        v.literal("creator"),
        v.literal("ai"),
        v.literal("utilities"),
      ),
    ),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, search, limit }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    let items;
    if (category) {
      items = await ctx.db
        .query("historyItems")
        .withIndex("by_user_category_created", (q) =>
          q.eq("userId", userId).eq("category", category),
        )
        .order("desc")
        .collect();
    } else {
      items = await ctx.db
        .query("historyItems")
        .withIndex("by_user_created", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }
    if (search?.trim()) {
      const s = search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(s) ||
          i.toolName.toLowerCase().includes(s) ||
          i.preview.toLowerCase().includes(s),
      );
    }
    return items.slice(0, limit ?? 200);
  },
});

export const saveHistoryItem = mutation({
  args: {
    category: v.union(
      v.literal("study"),
      v.literal("creator"),
      v.literal("ai"),
      v.literal("utilities"),
    ),
    toolName: v.string(),
    title: v.string(),
    preview: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to save");
    const id = await ctx.db.insert("historyItems", {
      userId,
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const deleteHistoryItem = mutation({
  args: { id: v.id("historyItems") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    const item = await ctx.db.get(id);
    if (!userId || !item || item.userId !== userId) {
      throw new Error("Item not found");
    }
    await ctx.db.delete(id);
  },
});

export const clearHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in required");
    for (const item of await ctx.db
      .query("historyItems")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .collect()) {
      await ctx.db.delete(item._id);
    }
  },
});

export const clearMyChats = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in required");
    for (const chat of await ctx.db
      .query("chats")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .collect()) {
      for (const m of await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
        .collect()) {
        await ctx.db.delete(m._id);
      }
      await ctx.db.delete(chat._id);
    }
  },
});

// ---------------------------------------------------------------- study plans

export const listStudyPlans = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("studyPlans")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const saveStudyPlan = mutation({
  args: {
    id: v.optional(v.id("studyPlans")),
    title: v.string(),
    course: v.string(),
    subjects: v.array(v.string()),
    examDate: v.string(),
    dailyHours: v.number(),
    weakSubjects: v.array(v.string()),
    strongSubjects: v.array(v.string()),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in required");
    const { id, ...fields } = args;
    if (id) {
      const existing = await ctx.db.get(id);
      if (!existing || existing.userId !== userId) throw new Error("Plan not found");
      await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
      return id;
    }
    const now = Date.now();
    return await ctx.db.insert("studyPlans", {
      userId,
      ...fields,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteStudyPlan = mutation({
  args: { id: v.id("studyPlans") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    const plan = await ctx.db.get(id);
    if (!userId || !plan || plan.userId !== userId) {
      throw new Error("Plan not found");
    }
    await ctx.db.delete(id);
  },
});

// ---------------------------------------------------------------- profile

export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in required");
    const clean = name.trim().slice(0, 60);
    if (!clean) throw new Error("Name cannot be empty");
    await ctx.db.patch(userId, { name: clean });
  },
});
