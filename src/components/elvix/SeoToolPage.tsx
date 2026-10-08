import { useEffect } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TOOLS, toolById } from "@/lib/tools";
import { SEO_CONTENT } from "@/lib/seoContent";

const SITE_URL = "https://elvix.freebuff.app";

/** Defaults from index.html — restored when leaving a tool page. */
const DEFAULT_TITLE = "ELVIX AI Suite";
const DEFAULT_DESCRIPTION =
  "ELVIX — from idea to answer. Free AI tools for students and creators: chat, doubts, notes, summaries and more.";

/**
 * Public SEO wrapper for every tool page. Renders the working tool first
 * (kept unchanged via children), then adds explanation, "How to use", FAQ
 * and cross-links to the other tools — styled with the existing design.
 */
export function SeoToolPage({
  toolId,
  children,
}: {
  toolId: string;
  children: ReactNode;
}) {
  const tool = toolById(toolId);
  const seo = SEO_CONTENT[toolId];

  useEffect(() => {
    if (!tool || !seo) return;

    const previousTitle = document.title;
    document.title = seo.title;

    const metaDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const previousDescription = metaDescription?.getAttribute("content") ?? null;
    metaDescription?.setAttribute("content", seo.description);

    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    const previousCanonical = canonical?.getAttribute("href") ?? null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${tool.path}`;

    const jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.id = "elvix-seo-faq";
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
    document.head.appendChild(jsonLd);

    return () => {
      document.title = previousTitle;
      if (metaDescription) {
        if (previousDescription) {
          metaDescription.setAttribute("content", previousDescription);
        }
      }
      if (canonical) {
        if (previousCanonical) canonical.href = previousCanonical;
        else canonical.remove();
      }
      document.getElementById("elvix-seo-faq")?.remove();
    };
  }, [tool, seo]);

  if (!tool || !seo) return <>{children}</>;

  const otherTools = TOOLS.filter((t) => t.id !== tool.id);

  return (
    <div className="space-y-8">
      {/* The working tool, unchanged and on top */}
      {children}

      {/* What it does */}
      <section className="glass ring-soft rounded-3xl p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold">
          What is {tool.name}?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {seo.intro}
        </p>
      </section>

      {/* How to use */}
      <section className="glass ring-soft rounded-3xl p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold">
          How to use {tool.name}
        </h2>
        <ol className="mt-3 space-y-2.5">
          {seo.howTo.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="bg-primary/12 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="leading-relaxed text-muted-foreground">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="glass ring-soft rounded-3xl p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold">
          {tool.name} — FAQs
        </h2>
        <Accordion type="single" collapsible className="mt-1">
          {seo.faq.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Cross-links to the other tools */}
      <section className="glass ring-soft rounded-3xl p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold">
          Explore more free ELVIX tools
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {otherTools.map((t) => (
            <Link
              key={t.id}
              to={t.path}
              className="rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {t.name}
            </Link>
          ))}
        </div>
        <Link
          to="/app"
          className="text-primary mt-4 inline-block text-xs font-medium hover:underline"
        >
          View all tools →
        </Link>
      </section>
    </div>
  );
}
