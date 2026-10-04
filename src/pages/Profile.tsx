import { api } from "@/convex/_generated/api";
import { ElvixMark } from "@/components/elvix/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setLocalName, useLocalName } from "@/hooks/use-local-name";
import {
  Bot,
  Check,
  Clapperboard,
  GraduationCap,
  Pencil,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Profile() {
  const [name] = useLocalName();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const chats = useQuery(api.data.listChats, {});
  const history = useQuery(api.data.listHistory, { limit: 1000 });

  const handleSave = () => {
    if (!draft.trim()) {
      toast.error("Naam khaali nahi ho sakta.");
      return;
    }
    setLocalName(draft.trim());
    setEditing(false);
    toast.success("Naam update ho gaya.");
  };

  const stats = [
    { label: "Chats", value: chats?.length ?? 0 },
    { label: "Saved results", value: history?.length ?? 0 },
  ];

  const quickLinks = [
    { to: "/app/chat", label: "ELVIX AI Chat", icon: Bot },
    { to: "/app/doubt-solver", label: "AI Doubt Solver", icon: GraduationCap },
    { to: "/app/shorts-script", label: "Shorts Script", icon: Clapperboard },
    { to: "/app/email-writer", label: "Email Writer", icon: Wrench },
  ];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Aapki ELVIX activity.
        </p>
      </header>

      <section className="glass ring-soft rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <div className="bg-brand-gradient flex size-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-md">
            {(name?.[0] ?? "E").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                  }}
                  className="h-9"
                  aria-label="Apna naam"
                  autoFocus
                />
                <Button size="icon" className="size-9 shrink-0" onClick={handleSave}>
                  <Check className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold">{name || "Dost"}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-muted-foreground"
                  onClick={() => {
                    setDraft(name);
                    setEditing(true);
                  }}
                  aria-label="Naam edit karein"
                >
                  <Pencil className="size-3.5" />
                </Button>
              </div>
            )}
            <p className="truncate text-sm text-muted-foreground">
              Aapka naam sirf aapke device par save hota hai.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/70 bg-card/60 p-3.5 text-center"
            >
              <p className="font-display text-2xl font-bold text-primary">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Quick links" className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Jaldi se kholein</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {quickLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 px-3.5 py-3 text-sm font-medium transition-colors hover:border-primary/40"
            >
              <Icon className="size-4 text-primary" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card/60 p-4">
        <div className="flex items-center gap-2.5">
          <ElvixMark className="size-8" />
          <div>
            <p className="text-sm font-semibold">ELVIX · Soch Se Solution Tak</p>
            <p className="text-xs text-muted-foreground">
              Madad chahiye?{" "}
              <a
                href="mailto:rajapbdb6699@gmail.com"
                className="text-primary underline underline-offset-2"
              >
                rajapbdb6699@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
