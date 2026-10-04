import { useLocalName } from "@/hooks/use-local-name";
import { useIsMobile } from "@/hooks/use-mobile";
import { ElvixLogo } from "@/components/elvix/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bot,
  Clapperboard,
  GraduationCap,
  History as HistoryIcon,
  House,
  Menu,
  Settings as SettingsIcon,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router";
import { useState } from "react";

const NAV = [
  { to: "/app", label: "Home", icon: House, end: true },
  { to: "/app/chat", label: "AI Chat", icon: Sparkles },
  { to: "/app/tools", label: "AI Tools", icon: Bot },
  { to: "/app/study", label: "Study", icon: GraduationCap },
  { to: "/app/creator", label: "Creator", icon: Clapperboard },
  { to: "/app/utilities", label: "Utilities", icon: Wrench },
  { to: "/app/history", label: "History", icon: HistoryIcon },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
];

const BOTTOM_NAV = [
  { to: "/app", label: "Home", icon: House, end: true },
  { to: "/app/chat", label: "AI Tools", icon: Sparkles },
  { to: "/app/history", label: "History", icon: HistoryIcon, end: false },
  { to: "/app/profile", label: "Profile", icon: User, end: false },
];

const TITLES: Record<string, string> = {
  "/app": "Home",
  "/app/chat": "ELVIX AI",
  "/app/tools": "AI Tools",
  "/app/study": "Study Hub",
  "/app/creator": "Creator Hub",
  "/app/utilities": "Utilities",
  "/app/history": "History",
  "/app/profile": "Profile",
  "/app/settings": "Settings",
};

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
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
    </>
  );
}

export function AppShell() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [name] = useLocalName();
  const [menuOpen, setMenuOpen] = useState(false);

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

        <nav className="scrollbar-thin flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Main">
          <NavItems />
        </nav>

        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card/60 p-3">
          <div className="bg-brand-gradient flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
            {(name?.[0] ?? "E").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name || "Dost"}</p>
            <p className="truncate text-xs text-muted-foreground">
              No login · No tension
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      {isMobile && (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  aria-label="Menu kholein"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 px-3 py-5">
                <SheetHeader className="px-1">
                  <SheetTitle>
                    <ElvixLogo tagline />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-2 flex flex-col gap-1" aria-label="Sidebar">
                  <NavItems onNavigate={() => setMenuOpen(false)} />
                </nav>
              </SheetContent>
            </Sheet>
            <NavLink to="/app" aria-label="ELVIX Home">
              <ElvixLogo />
            </NavLink>
          </div>
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
