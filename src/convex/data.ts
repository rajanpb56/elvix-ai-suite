import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ---------------------------------------------------------------- chats

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
      .withIndex("by_chat_order", (q) => eqChat(q, chatId))
      .order("asc")
      .collect();
  },
});

function eqChat(q: any, chatId: any) {
  return q.eq("chatId", chatId);
}

export const renameChat = mutation({
  args: { chatId: v.id("chats"), title: v.string() },
  handler: async (ctx, { chatId, title }) => {
    const userId = await getAuthUserId(ctx);
    const chat = await ctx.db.get(chatId);
    if (!userId || !chat || chat.userId !== userId) {
      throw new Error("Chat not found");
    }
    await ctx.db.patch(chatId, { title: title.trim().slice(0, 80) || chat.title });
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
      .withIndex("by_chat_order", (q) => q.eq("chatId", chatId))
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

// ---------------------------------------------------------------- profile

export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in required");
    const clean = name.trim().slice(0, 60);
    if (!clean) throw new Error("Naam khaali nahi ho sakta");
    await ctx.db.patch(userId, { name: clean });
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
        .withIndex("by_chat_order", (q) => q.eq("chatId", chat._id))
        .collect()) {
        await ctx.db.delete(m._id);
      }
      await ctx.db.delete(chat._id);
    }
  },
});
