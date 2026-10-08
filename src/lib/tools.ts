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
    path: "/app/ai-chat",
    category: "ai",
    icon: Bot,
    blurb: "Ask anything — studies, general knowledge or everyday questions.",
  },
  {
    id: "doubt-solver",
    name: "AI Doubt Solver",
    path: "/app/ai-doubt-solver",
    category: "study",
    icon: GraduationCap,
    blurb: "Step-by-step solutions and exam-ready answers, subject by subject.",
  },
  {
    id: "notes-maker",
    name: "AI Notes Maker",
    path: "/app/ai-notes-maker",
    category: "study",
    icon: NotebookPen,
    blurb: "Quick, detailed or revision notes from any topic — ready to copy and download.",
  },
  {
    id: "pdf-summarizer",
    name: "PDF Summarizer",
    path: "/app/pdf-summarizer",
    category: "study",
    icon: ScrollText,
    blurb: "Upload a PDF and get a summary, key points and quick revision.",
  },
  {
    id: "study-planner",
    name: "AI Study Planner",
    path: "/app/ai-study-planner",
    category: "study",
    icon: CalendarDays,
    blurb: "A realistic day-wise schedule from your exam date and daily hours.",
  },
  {
    id: "question-generator",
    name: "Question Generator",
    path: "/app/question-generator",
    category: "study",
    icon: FileQuestion,
    blurb: "MCQs, short and long questions with an answer key, chapter-wise.",
  },
  {
    id: "shorts-script",
    name: "Shorts Script",
    path: "/app/shorts-script",
    category: "creator",
    icon: Clapperboard,
    blurb: "From hook to CTA — a timestamped script with captions.",
  },
  {
    id: "hook-generator",
    name: "Hook Generator",
    path: "/app/hook-generator",
    category: "creator",
    icon: Lightbulb,
    blurb: "Scroll-stopping hooks that grab viewers in the first 3 seconds.",
  },
  {
    id: "text-summarizer",
    name: "Text Summarizer",
    path: "/app/text-summarizer",
    category: "utilities",
    icon: FileText,
    blurb: "Turn long articles or notes into a crisp summary.",
  },
  {
    id: "translator",
    name: "Translator",
    path: "/app/translator",
    category: "utilities",
    icon: Languages,
    blurb: "Translate text into any supported language.",
  },
  {
    id: "email-writer",
    name: "Email Writer",
    path: "/app/email-writer",
    category: "utilities",
    icon: Mail,
    blurb: "Professional emails — subject line and body, ready to copy.",
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
  creator: { label: "Creator", emoji: "🎬", blurb: "Scripts and hooks built to go viral" },
  ai: { label: "AI", emoji: "🤖", blurb: "Talk directly with ELVIX AI" },
  utilities: { label: "Utilities", emoji: "🛠", blurb: "Everyday tasks — fast and clean" },
};

export function toolByPath(path: string): ToolDef | undefined {
  return TOOLS.find((t) => t.path === path);
}

export function toolById(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}
