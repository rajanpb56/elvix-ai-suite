import { ElvixLogo, ElvixMark } from "@/components/elvix/Logo";
import { Button } from "@/components/ui/button";
import { TOOLS, CATEGORY_META } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools";
import {
  ArrowRight,
  Bot,
  GraduationCap,
  Menu,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const CATEGORY_TINT: Record<ToolCategory, string> = {
  study: "bg-violet-500/15 text-violet-500 dark:text-violet-300",
  creator: "bg-pink-500/15 text-pink-500 dark:text-pink-300",
  ai: "bg-primary/12 text-primary",
  utilities: "bg-amber-500/15 text-amber-500 dark:text-amber-300",
};

const FEATURES = [
  {
    icon: Zap,
    title: "Fast & Mobile-First",
    desc: "Android pe jaisa native app feel — seedha browser mein, install bhi ho sakta hai.",
  },
  {
    icon: ShieldCheck,
    title: "Aapka data, aapke paas",
    desc: "API keys sirf server par. Aapke chats aur results aapke device par safe.",
  },
  {
    icon: Bot,
    title: "Ek AI, sab kaam",
    desc: "Chat, doubts, notes, PDFs, planner, scripts — sab ek hi ELVIX AI se.",
  },
];

const STEPS = [
  { n: "1", title: "App kholein", desc: "Koi sign-up ya OTP nahi — seedha shuru." },
  { n: "2", title: "Tool chunein", desc: "Padhai, content ya daily utilities — jo chahiye." },
  { n: "3", title: "Result pao", desc: "Copy, save ya download — sab kuch ek tap mein." },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const primaryCta = "/app";

  return (
    <div className="min-h-dvh">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <ElvixLogo tagline className="hidden sm:flex" />
          <ElvixLogo className="sm:hidden" />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#tools" className="hover:text-foreground">Tools</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">Kaise kaam karta hai</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild className="bg-brand-gradient gap-2 rounded-full text-white shadow-md">
              <Link to={primaryCta}>
                Free mein shuru karein
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="mt-6 flex flex-col gap-1">
                  {TOOLS.map((t) => (
                    <Link
                      key={t.id}
                      to={t.path}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent"
                    >
                      <t.icon className="size-4 text-primary" />
                      {t.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-glow relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-14 text-center sm:pt-24 sm:pb-20">
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Soch Se Solution Tak — AI ke saath
          </div>
          <h1 className="font-display mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Har sawaal ka <span className="text-brand-gradient">solution</span>,
            ek hi app mein
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            ELVIX aapka all-in-one AI platform hai — padhai, content creation
            aur rozmarra ke kaam. Students, creators aur sab ke liye.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand-gradient gap-2 rounded-full px-7 text-white shadow-lg"
            >
              <Link to={primaryCta}>
                Free shuru karein
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 rounded-full px-7">
              <Link to="#tools" aria-label="Tools dekhein">
                Tools dekhein
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No login · No OTP · Kholte hi shuru · Installable PWA
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <section id="tools" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            11 AI tools, ek jagah
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Har tool ka ek hi kaam — aur woh perfect tarike se.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              className="group glass rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div
                className={`mb-3 flex size-10 items-center justify-center rounded-xl ${CATEGORY_TINT[tool.category]}`}
              >
                <tool.icon className="size-5" />
              </div>
              <p className="font-semibold">{tool.name}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{tool.blurb}</p>
              <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                Try karein <ArrowRight className="size-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(Object.keys(CATEGORY_META) as ToolCategory[]).map((cat) => (
            <Link
              key={cat}
              to={primaryCta}
              className="glass rounded-2xl p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="block text-3xl" aria-hidden>
                {CATEGORY_META[cat].emoji}
              </span>
              <span className="mt-2 block font-semibold">{CATEGORY_META[cat].label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {CATEGORY_META[cat].blurb}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-y border-border/60 bg-sidebar/40 py-14">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center sm:text-left">
              <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary sm:ml-0 sm:mr-auto">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Teen step mein shuru
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="glass rounded-2xl p-5 text-center"
            >
              <span className="bg-brand-gradient mx-auto flex size-9 items-center justify-center rounded-full text-sm font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="hero-glow glass ring-soft rounded-3xl px-6 py-12 text-center">
          <ElvixMark className="mx-auto size-14" />
          <h2 className="font-display mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Aaj se padhai aur content — dono easy
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            ELVIX free hai. Koi login nahi — app kholein aur kaam shuru karein.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-brand-gradient mt-6 gap-2 rounded-full px-7 text-white shadow-lg"
          >
            <Link to={primaryCta}>
              ELVIX try karein — free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center">
          <ElvixLogo tagline />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ELVIX · Madad chahiye?{" "}
            <a
              href="mailto:rajapbdb6699@gmail.com"
              className="text-primary underline underline-offset-2"
            >
              rajapbdb6699@gmail.com
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            <Link
              to="/privacy-policy"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <GraduationCap className="size-3.5" />
            Made for Indian students & creators
          </p>
        </div>
      </footer>
    </div>
  );
}
