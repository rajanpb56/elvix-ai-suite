import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/convex/_generated/api";
import { ElvixLogo } from "@/components/elvix/Logo";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  History as HistoryIcon,
  House,
  LogOut,
  Settings as SettingsIcon,
  Sparkles,
  User,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

const NAV = [
  { to: "/app", label: "Home", icon: House, end: true },
  { to: "/app/chat", label: "AI Chat", icon: Sparkles },
  { to: "/app/doubt-solver", label: "Doubt Solver", icon: GraduationCap },
  { to: "/app/history", label: "History", icon: HistoryIcon },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
];

const BOTTOM_NAV = NAV.filter((n) =>
  ["/app", "/app/chat", "/app/history", "/app/profile"].includes(n.to),
);

const TITLES: Record<string, string> = {
  "/app": "Home",
  "/app/chat": "ELVIX AI",
  "/app/doubt-solver": "Doubt Solver",
  "/app/history": "History",
  "/app/profile": "Profile",
  "/app/settings": "Settings",
};

export function AppShell() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Sign out ho gaya. Phir milenge!");
  };

  const title =
    TITLES[location.pathname] ??
    (location.pathname.startsWith("/app/chat") ? "ELVIX AI" : "ELVIX");

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/70 bg-sidebar/80 px-4 py-5 backdrop-blur-xl lg:flex">
        <NavLink to="/app" className="mb-6 px-1" aria-label="ELVIX Home">
          <ElvixLogo tagline />
        </NavLink>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card/60 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
            {(user?.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.name || "Guest"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || "Guest account"}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      {isMobile && (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl">
          <NavLink to="/app" aria-label="ELVIX Home">
            <ElvixLogo />
          </NavLink>
          <span className="text-sm font-semibold text-muted-foreground">
            {title}
          </span>
        </header>
      )}

      {/* Main content */}
      <main className="pb-24 lg:pb-10 lg:pl-64">
        <div className="mx-auto w-full max-w-3xl px-4 pt-4 lg:px-8 lg:pt-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 pb-safe backdrop-blur-xl lg:hidden"
        aria-label="Bottom navigation"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 px-2">
          {BOTTOM_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
