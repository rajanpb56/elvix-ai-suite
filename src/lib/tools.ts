import {
  Bot,
  CalendarDays,
  Clapperboard,
  FileQuestion,
  FileText,
  GraduationCap,
  Languages,
  Lightbulb,
  Mail,
  NotebookPen,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ToolCategory = "study" | "creator" | "ai" | "utilities";

export type ToolDef = {
  id: string;
  name: string;
  path: string;
  category: ToolCategory;
  icon: LucideIcon;
  blurb: string;
};

export const TOOLS: ToolDef[] = [
  {
    id: "chat",
    name: "ELVIX AI Chat",
    path: "/app/chat",
    category: "ai",
    icon: Bot,
    blurb: "Kisi bhi sawaal ka jawab — padhai ya general, sab kuch.",
  },
  {
    id: "doubt-solver",
    name: "AI Doubt Solver",
    path: "/app/doubt-solver",
    category: "study",
    icon: GraduationCap,
    blurb: "Step-by-step solution + exam-ready answer, subject ke hisaab se.",
  },
  {
    id: "notes-maker",
    name: "AI Notes Maker",
    path: "/app/notes-maker",
    category: "study",
    icon: NotebookPen,
    blurb: "Topic se quick, detailed ya revision notes — copy & download ready.",
  },
  {
    id: "pdf-summarizer",
    name: "PDF Summarizer",
    path: "/app/pdf-summarizer",
    category: "study",
    icon: ScrollText,
    blurb: "PDF upload karo — summary, key points aur revision milega.",
  },
  {
    id: "study-planner",
    name: "AI Study Planner",
    path: "/app/study-planner",
    category: "study",
    icon: CalendarDays,
    blurb: "Exam date aur daily hours se realistic day-wise schedule.",
  },
  {
    id: "question-generator",
    name: "Question Generator",
    path: "/app/question-generator",
    category: "study",
    icon: FileQuestion,
    blurb: "MCQs, short & long questions + answer key, chapter-wise.",
  },
  {
    id: "shorts-script",
    name: "Shorts Script",
    path: "/app/shorts-script",
    category: "creator",
    icon: Clapperboard,
    blurb: "Hook se CTA tak — timestamped script captions ke saath.",
  },
  {
    id: "hook-generator",
    name: "Hook Generator",
    path: "/app/hook-generator",
    category: "creator",
    icon: Lightbulb,
    blurb: "Scroll-stopping hooks jo viewer ko 3 second mein pakad lein.",
  },
  {
    id: "text-summarizer",
    name: "Text Summarizer",
    path: "/app/text-summarizer",
    category: "utilities",
    icon: FileText,
    blurb: "Lambi article ya notes ko crisp summary mein badlein.",
  },
  {
    id: "translator",
    name: "Translator",
    path: "/app/translator",
    category: "utilities",
    icon: Languages,
    blurb: "Text ko kisi bhi language mein translate karein.",
  },
  {
    id: "email-writer",
    name: "Email Writer",
    path: "/app/email-writer",
    category: "utilities",
    icon: Mail,
    blurb: "Professional email — subject line aur body ready-to-copy.",
  },
];

export function toolsByCategory(category: ToolCategory): ToolDef[] {
  return TOOLS.filter((t) => t.category === category);
}

export const CATEGORY_META: Record<
  ToolCategory,
  { label: string; emoji: string; blurb: string }
> = {
  study: { label: "Study", emoji: "🎓", blurb: "Doubts, notes, planner, questions" },
  creator: { label: "Creator", emoji: "🎬", blurb: "Scripts aur hooks jo viral ho sakein" },
  ai: { label: "AI", emoji: "🤖", blurb: "ELVIX AI se seedha baat karein" },
  utilities: { label: "Utilities", emoji: "🛠", blurb: "Rozmarra ke kaam — fast aur clean" },
};

export function toolByPath(path: string): ToolDef | undefined {
  return TOOLS.find((t) => t.path === path);
}

export function toolById(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}
