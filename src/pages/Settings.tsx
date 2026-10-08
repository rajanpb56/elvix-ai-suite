import { api } from "@/convex/_generated/api";
import { ElvixMark } from "@/components/elvix/Logo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileText, Info, Mail, Moon, Sun, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { Link } from "react-router";
import { toast } from "sonner";

function useTheme() {
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true,
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch {
        // ignore
      }
    } else {
      root.classList.remove("dark");
      try {
        localStorage.setItem("theme", "light");
      } catch {
        // ignore
      }
    }
  }, [dark]);

  return { dark, setDark };
}

export default function Settings() {
  const { dark, setDark } = useTheme();
  const clearMyChats = useMutation(api.data.clearMyChats);
  const clearHistory = useMutation(api.data.clearHistory);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Set up ELVIX the way you like.
        </p>
      </header>

      <section className="glass ring-soft space-y-4 rounded-3xl p-5" aria-label="Appearance">
        <h2 className="font-display text-base font-semibold">Appearance</h2>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {dark ? (
              <Moon className="size-4.5 text-primary" />
            ) : (
              <Sun className="size-4.5 text-amber-500" />
            )}
            <div>
              <Label htmlFor="theme-toggle">Dark mode</Label>
              <p className="text-xs text-muted-foreground">
                Dark by default — switch off for light mode.
              </p>
            </div>
          </div>
          <Switch
            id="theme-toggle"
            checked={dark}
            onCheckedChange={setDark}
            aria-label="Dark mode toggle"
          />
        </div>
      </section>

      <section className="glass ring-soft space-y-4 rounded-3xl p-5" aria-label="Data">
        <h2 className="font-display text-base font-semibold">Data</h2>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Clear chat history</p>
            <p className="text-xs text-muted-foreground">
              All ELVIX AI conversations will be permanently deleted.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 rounded-full">
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Your entire chat history will
                  be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await clearMyChats({});
                      toast.success("All chats cleared.");
                    } catch {
                      toast.error("Couldn't clear chats.");
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <div>
            <p className="text-sm font-medium">Clear saved results</p>
            <p className="text-xs text-muted-foreground">
              Doubt answers, notes, scripts — the entire history will be
              deleted.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 rounded-full">
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All saved results will be
                  permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await clearHistory({});
                      toast.success("History cleared.");
                    } catch {
                      toast.error("Couldn't clear history.");
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      <section className="glass ring-soft space-y-3 rounded-3xl p-5" aria-label="About">
        <h2 className="font-display text-base font-semibold">About</h2>
        <div className="flex items-center gap-2.5">
          <ElvixMark className="size-9" />
          <div>
            <p className="text-sm font-semibold">ELVIX</p>
            <p className="text-xs text-muted-foreground">
              From Idea To Answer · v1.0
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-border/70 bg-card/60 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <p>
            AI responses can sometimes be wrong — verify important facts, and
            cross-check exam answers with your teacher.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="size-3.5 shrink-0" />
          Support:{" "}
          <a
            href="mailto:rajapbdb6699@gmail.com"
            className="text-primary underline underline-offset-2"
          >
            rajapbdb6699@gmail.com
          </a>
        </p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="size-3.5 shrink-0" />
          <Link
            to="/privacy-policy"
            className="text-primary underline underline-offset-2"
          >
            Privacy Policy
          </Link>
        </p>
      </section>
    </div>
  );
}
