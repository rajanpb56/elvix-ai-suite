import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    // A chat conversation with ELVIX AI
    chats: defineTable({
      userId: v.id("users"),
      title: v.string(),
      updatedAt: v.number(),
    }).index("by_user_updated", ["userId", "updatedAt"]),

    // One message inside a chat
    messages: defineTable({
      chatId: v.id("chats"),
      userId: v.id("users"),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      // which AI model produced an assistant message
      model: v.optional(v.string()),
    }).index("by_chat", ["chatId"]),

    // Saved results from AI tools (doubt solver etc.)
    historyItems: defineTable({
      userId: v.id("users"),
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
      createdAt: v.number(),
    })
      .index("by_user_created", ["userId", "createdAt"])
      .index("by_user_category_created", [
        "userId",
        "category",
        "createdAt",
      ]),

    // Server-side usage log (no secrets, counts only)
    usageLogs: defineTable({
      userId: v.id("users"),
      tool: v.string(),
      model: v.optional(v.string()),
      promptTokens: v.optional(v.number()),
      completionTokens: v.optional(v.number()),
      ok: v.boolean(),
      errorKind: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_user_created", ["userId", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
