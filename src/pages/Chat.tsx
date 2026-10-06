import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ElvixMark } from "@/components/elvix/Logo";
import { Markdown } from "@/components/elvix/Markdown";
import { copyText } from "@/components/elvix/ResultActions";
import {
  AI_CONFIG_MESSAGE,
  AiThinking,
  ErrorState,
  NotConfiguredCard,
} from "@/components/elvix/States";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLocalName } from "@/hooks/use-local-name";
import {
  ArrowUp,
  Check,
  Copy,
  Plus,
  RotateCcw,
  Square,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Newton ke laws simple words mein samjhao",
  "10th board exam ke liye 30 din ka plan banao",
  "Instagram Reels ke liye 5 viral hooks do — space facts",
  "Photosynthesis ko 5th class ke bacche ko samjhao",
];

export default function Chat() {
  const [name] = useLocalName();
  const [chatId, setChatId] = useState<Id<"chats"> | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chats = useQuery(api.data.listChats, {});
  const messages = useQuery(
    api.data.listMessages,
    chatId ? { chatId } : "skip",
  );
  const aiConfiguredAction = useAction(api.ai.aiConfigured);
  const sendChatMessage = useAction(api.ai.sendChatMessage);
  const regenerateResponse = useAction(api.ai.regenerateResponse);
  const deleteChat = useMutation(api.data.deleteChat);

  const [aiReady, setAiReady] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    aiConfiguredAction({})
      .then((res) => {
        if (live) setAiReady(res.configured);
      })
      .catch(() => {
        if (live) setAiReady(null);
      });
    return () => {
      live = false;
    };
  }, [aiConfiguredAction]);

  const busy = sending || regenerating;

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      setInput("");
      setError(null);
      setPendingUser(content);
      setSending(true);
      try {
        const res = await sendChatMessage({
          chatId: chatId ?? undefined,
          message: content,
        });
        setChatId(res.chatId);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Kuch galat ho gaya. Dobara try karein.",
        );
      } finally {
        setPendingUser(null);
        setSending(false);
      }
    },
    [busy, chatId, sendChatMessage],
  );

  const handleRegenerate = useCallback(async () => {
    if (!chatId || busy) return;
    setRegenerating(true);
    setError(null);
    try {
      await regenerateResponse({ chatId });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Regenerate fail ho gaya. Try again.",
      );
    } finally {
      setRegenerating(false);
    }
  }, [busy, chatId, regenerateResponse]);

  const handleClear = useCallback(async () => {
    if (!chatId) return;
    const id = chatId;
    setChatId(null);
    setError(null);
    try {
      await deleteChat({ chatId: id });
      toast.success("Chat clear ho gayi.");
    } catch {
      toast.error("Chat clear nahi ho payi.");
    }
  }, [chatId, deleteChat]);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages?.length, pendingUser, regenerating]);

  // Handoff from Home: auto-send the question typed there
  const sendRef = useRef<(text: string) => void>(() => {});
  useEffect(() => {
    sendRef.current = send;
  }, [send]);
  useEffect(() => {
    try {
      const ask = sessionStorage.getItem("elvix:ask");
      if (ask) {
        sessionStorage.removeItem("elvix:ask");
        void sendRef.current(ask);
      }
    } catch {
      // ignore
    }
  }, []);

  const display = [
    ...(messages ?? []),
    ...(pendingUser
      ? [{ _id: "pending", role: "user" as const, content: pendingUser }]
      : []),
  ];
  const assistants = messages?.filter((m) => m.role === "assistant") ?? [];
  const lastAssistantId = assistants[assistants.length - 1]?._id;

  const handleCopy = async (id: string, content: string) => {
    const ok = await copyText(content);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <ElvixMark className="size-9" />
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">
              ELVIX AI Chat
            </h1>
            <p className="text-xs text-muted-foreground">
              {name
                ? `Namaste, ${name.split(" ")[0]}!`
                : "Aapka AI dost"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {chats && chats.length > 0 && (
            <Select
              value={chatId ?? undefined}
              onValueChange={(v) => {
                setError(null);
                setChatId(v as Id<"chats">);
              }}
            >
              <SelectTrigger
                className="h-9 w-32 rounded-full text-xs sm:w-48"
                aria-label="Purani chat kholein"
              >
                <SelectValue placeholder="History" />
              </SelectTrigger>
              <SelectContent>
                {chats.map((c) => (
                  <SelectItem key={c._id} value={c._id} className="text-xs">
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5 rounded-full"
            onClick={() => {
              setError(null);
              setChatId(null);
            }}
          >
            <Plus className="size-4" />
            New
          </Button>
        </div>
      </div>

      {aiReady === false && <NotConfiguredCard />}

      {/* Messages */}
      <div className="flex min-h-[45dvh] flex-col gap-3">
        {error && (
          <ErrorState
            message={error}
            onRetry={
              error !== AI_CONFIG_MESSAGE ? () => setError(null) : undefined
            }
          />
        )}

        {display.length === 0 && !pendingUser && !busy && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="glass ring-soft flex flex-col items-center gap-2 rounded-3xl px-6 py-8">
              <ElvixMark className="size-14" />
              <p className="font-display text-base font-semibold">
                ELVIX se kuch bhi poochein
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Padhai, general knowledge, ideas — jo bhi soch rahe ho, seedha
                likh do.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {display.map((m) =>
          m.role === "user" ? (
            <div key={m._id} className="flex justify-end">
              <div className="bg-brand-gradient max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white shadow-sm">
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
              </div>
            </div>
          ) : (
            <div key={m._id} className="flex flex-col items-start gap-1.5">
              <div className="glass ring-soft max-w-[92%] rounded-2xl rounded-bl-md px-4 py-3 sm:max-w-[85%]">
                <Markdown content={m.content} />
              </div>
              <div className="flex items-center gap-1 pl-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 rounded-full px-2.5 text-xs text-muted-foreground"
                  onClick={() => void handleCopy(m._id, m.content)}
                >
                  {copiedId === m._id ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copiedId === m._id ? "Copied" : "Copy"}
                </Button>
                {m._id === lastAssistantId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 rounded-full px-2.5 text-xs text-muted-foreground"
                    onClick={() => void handleRegenerate()}
                    disabled={busy}
                  >
                    <RotateCcw className="size-3.5" />
                    Regenerate
                  </Button>
                )}
              </div>
            </div>
          ),
        )}

        {busy && (
          <div className="pl-1">
            <AiThinking
              label={
                regenerating
                  ? "Naya jawab ban raha hai…"
                  : "ELVIX AI soch raha hai…"
              }
            />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="sticky bottom-20 z-10 lg:bottom-2">
        <div className="glass ring-soft flex items-end gap-2 rounded-3xl p-2.5">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="ELVIX se poochein…"
            className="max-h-32 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm shadow-none focus-visible:ring-0"
            aria-label="Message likhein"
            rows={1}
          />
          <Button
            size="icon"
            onClick={() => void send(input)}
            disabled={!input.trim() || busy}
            className="bg-brand-gradient size-10 shrink-0 rounded-full text-white shadow-md"
            aria-label={busy ? "Chal raha hai" : "Bhejein"}
          >
            {busy ? (
              <Square className="size-4" />
            ) : (
              <ArrowUp className="size-5" />
            )}
          </Button>
        </div>
        {chatId && (
          <div className="mt-1.5 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 rounded-full px-2.5 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => void handleClear()}
            >
              <Trash2 className="size-3.5" />
              Clear chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
