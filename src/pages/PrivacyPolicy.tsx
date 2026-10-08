import { ElvixLogo } from "@/components/elvix/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router";

const LAST_UPDATED = "October 4, 2026";
const SUPPORT_EMAIL = "rajapbdb6699@gmail.com";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const SECTIONS: Section[] = [
  {
    title: "Overview",
    paragraphs: [
      `ELVIX ("we", "our", "us") is an AI-powered platform for students and creators. It offers AI chat, doubt solving, notes making, PDF summarising, study planning, question generation, scripts, hooks, translation, email writing and other utilities (together, the "Service").`,
      `This Privacy Policy explains what information we collect when you use ELVIX, how we use and protect it, and the choices you have. By using ELVIX, you agree to this policy.`,
    ],
  },
  {
    title: "Information we collect",
    bullets: [
      "No sign-up data — ELVIX works without any account. We never ask for your email address, phone number, password or OTP, and we do not create user profiles.",
      "Content you submit — messages you type in AI chat, doubts or questions you ask, text or PDF content you upload for summarising or notes, study plan details, scripts, hooks, translations and email drafts, along with the AI-generated results saved to your history.",
      "Anonymous device identifier — to save your chats and results without an account, a random identifier is created automatically in your browser. It contains no personal details and is not linked to your name, email or phone number.",
      "Usage information — basic usage records (which AI feature was used, how often, and when) that help us keep the Service reliable and prevent misuse.",
      "Local preferences — small settings such as your dark/light theme choice, stored in your browser's local storage on your device.",
    ],
  },
  {
    title: "How we use your information",
    bullets: [
      "To operate the Service — process your inputs, generate AI responses, and save them to your history so you can revisit them.",
      "To keep your content available — your chats, saved results and study plans stay linked to your device so you can pick up where you left off.",
      "To keep ELVIX safe and reliable — monitor usage, prevent abuse, and diagnose technical issues.",
      "To support you — respond to questions or requests you send to our support email.",
    ],
  },
  {
    title: "AI processing and third-party services",
    paragraphs: [
      "ELVIX does not generate AI responses on its own. When you use an AI feature, the text needed to fulfil your request is sent through a secure integration gateway to a trusted third-party AI model provider, which generates the response. That response is then shown to you and, where applicable, saved in your history.",
      `Please avoid sharing highly sensitive personal information (such as government ID numbers, financial details or passwords) in chats or tool inputs.`,
    ],
  },
  {
    title: "Data storage and security",
    paragraphs: [
      "Your data is stored in a managed cloud database and transmitted over encrypted connections (HTTPS). API keys and AI provider credentials are kept strictly on the server and are never exposed to your browser.",
      "No system is completely secure, but we apply reasonable technical and organisational safeguards to protect your information.",
    ],
  },
  {
    title: "Data sharing",
    paragraphs: [
      "We do not sell your personal information. We do not share it with advertising networks or data brokers.",
      "We share information only with: the AI model provider, to generate the responses you request; infrastructure providers (hosting and database) as needed to operate ELVIX; and authorities, where required by applicable law.",
    ],
  },
  {
    title: "Data retention and deletion",
    bullets: [
      "We keep your data for as long as you use ELVIX or as needed to provide the Service.",
      "You can delete your AI conversations anytime from the chat screen, or from Settings → Data → \"Clear chat history\".",
      "You can delete all saved tool results from Settings → Data → \"Clear saved results\".",
      `To have all data stored for your device deleted from our servers, email us at ${SUPPORT_EMAIL} and we will process the request.`,
    ],
  },
  {
    title: "Local storage and cookies",
    paragraphs: [
      "ELVIX uses only essential local storage on your device — for example, remembering your theme preference and the display name you set in your Profile. We do not use third-party advertising or tracking cookies.",
    ],
  },
  {
    title: "Children's privacy",
    paragraphs: [
      "ELVIX is designed for learners, including school-age students. If you are under 13 (or under the minimum age required by your local law), please use ELVIX only with permission from a parent or guardian.",
      "If you believe a child has provided us personal information without appropriate consent, contact us and we will delete it.",
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. The latest version will always be posted on this page with an updated \"Last updated\" date, and significant changes will be highlighted within the app.",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      `Questions about this policy or your data? Email us at ${SUPPORT_EMAIL} — we are happy to help.`,
    ],
  },
];

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <ElvixLogo tagline className="hidden sm:flex" />
          <ElvixLogo className="sm:hidden" />
          <Button asChild variant="outline" className="gap-2 rounded-full">
            <Link to="/">
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </header>

      {/* Title */}
      <section className="hero-glow relative overflow-hidden border-b border-border/60">
        <div className="mx-auto max-w-3xl px-4 pt-12 pb-10 sm:pt-16">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy <span className="text-brand-gradient">Policy</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED} · Applies to ELVIX (elvix.freebuff.app)
            and the ELVIX app.
          </p>
        </div>
      </section>

      {/* Body */}
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <h2 className="font-display text-lg font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="mt-2 space-y-2.5">
                {section.paragraphs?.map((p) => (
                  <p key={p} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-2 space-y-1.5">
                    {section.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span
                          className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary/70"
                          aria-hidden
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center">
          <ElvixLogo tagline />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ELVIX · Questions?{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary underline underline-offset-2"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
