import { api } from "@/convex/_generated/api";
import { ElvixMark } from "@/components/elvix/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  Bot,
  Check,
  Clapperboard,
  GraduationCap,
  Pencil,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const chats = useQuery(api.data.listChats, {});
  const history = useQuery(api.data.listHistory, { limit: 1000 });
  const updateProfile = useMutation(api.data.updateProfile);

  // Adjust state during render when the source of truth (user.name) changes.
  const [prevUserName, setPrevUserName] = useState<string | null>(null);
  if (user?.name !== prevUserName) {
    setPrevUserName(user?.name ?? null);
    setName(user?.name ?? "");
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Naam khaali nahi ho sakta.");
      return;
    }
    try {
      await updateProfile({ name: name.trim() });
      setEditing(false);
      toast.success("Naam update ho gaya.");
    } catch {
      toast.error("Naam update nahi hua.");
    }
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

  const isGuest = !user?.email;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Aapki ELVIX identity aur activity.
        </p>
      </header>

      <section className="glass ring-soft rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <div className="bg-brand-gradient flex size-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-md">
            {(user?.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9"
                  aria-label="Apna naam"
                />
                <Button size="icon" className="size-9 shrink-0" onClick={() => void handleSave()}>
                  <Check className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold">{user?.name || "Guest"}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-muted-foreground"
                  onClick={() => setEditing(true)}
                  aria-label="Naam edit karein"
                >
                  <Pencil className="size-3.5" />
                </Button>
              </div>
            )}
            <p className="truncate text-sm text-muted-foreground">
              {user?.email || "Guest account — koi email linked nahi"}
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

        {isGuest && (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground">
            Aap guest mode mein hain — data isi browser mein save rahega. Email
            se sign-in karne par data aapke account se jud jayega.
          </p>
        )}
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

      <Button
        variant="outline"
        className="w-full gap-2 text-destructive hover:text-destructive"
        onClick={async () => {
          await signOut();
          window.location.href = "/";
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
