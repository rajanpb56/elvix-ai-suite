/**
 * SEO content for the public tool pages (/app/<tool>).
 * All copy describes what each tool actually does — no exaggerated claims.
 */
export type SeoContent = {
  title: string;
  description: string;
  intro: string;
  howTo: string[];
  faq: { q: string; a: string }[];
};

export const SEO_CONTENT: Record<string, SeoContent> = {
  chat: {
    title: "ELVIX AI Chat — Free AI Chatbot for Study & Everyday Questions",
    description:
      "Chat free with ELVIX AI. Ask study doubts, get explanations, ideas and answers in seconds — no login, works great on mobile.",
    intro:
      "ELVIX AI Chat is a free chatbot for quick questions and longer conversations. Students use it to understand concepts, get examples and practise explanations; creators use it for ideas. Type your question in your own words and ELVIX answers in simple language.",
    howTo: [
      "Open the page and type your question in the box at the bottom.",
      "Press the send button (or Enter) and wait a few seconds for the answer.",
      "Ask follow-up questions in the same chat to go deeper.",
      "Copy any answer with the Copy button, or start a New chat anytime.",
    ],
    faq: [
      {
        q: "Is ELVIX AI Chat free?",
        a: "Yes. ELVIX is free to use and you don't need to create an account — the chat works as soon as you open the page.",
      },
      {
        q: "What can I ask ELVIX?",
        a: "Anything — school and college subjects, exam concepts, general knowledge, writing help or content ideas. Questions in Hindi, English or Hinglish all work.",
      },
      {
        q: "Are my chats saved?",
        a: "Your chats are stored in the app's History so you can reopen them from the chat selector. You can also clear a chat whenever you want.",
      },
      {
        q: "Are the answers always correct?",
        a: "ELVIX gives AI-generated answers, which are usually helpful but not perfect. For anything important — exams, marks, health or legal matters — verify with your textbook or teacher.",
      },
    ],
  },
  "doubt-solver": {
    title: "AI Doubt Solver — Step-by-Step Answers for Any Question | ELVIX",
    description:
      "Stuck on a question? Get a clear step-by-step solution, the concept behind it and an exam-ready answer with ELVIX AI Doubt Solver. Free, no login.",
    intro:
      "ELVIX AI Doubt Solver turns a confusing question into a clear solution. Pick your subject, type the doubt, and get the final answer with the steps in between, plus a short concept explanation. One tap converts it into an exam-style answer.",
    howTo: [
      "Choose the subject — Physics, Chemistry, Mathematics, Biology, English or General.",
      "Type your doubt in the question box (you can attach an image for reference).",
      "Tap Solve and read the step-by-step solution.",
      "Use Explain More for a deeper explanation, or Make Exam Answer for an exam-ready version.",
    ],
    faq: [
      {
        q: "Can ELVIX read the question from my photo?",
        a: "You can attach an image for your own reference, but the AI cannot read text inside images yet. Type the question as text so ELVIX can solve it.",
      },
      {
        q: "Which subjects are supported?",
        a: "Physics, Chemistry, Mathematics, Biology, English and General — for school and early college level.",
      },
      {
        q: "Does it show the full solution or just the answer?",
        a: "You get the final answer plus the working steps and the concept behind them, so you can learn the method — not just copy the result.",
      },
      {
        q: "Is the Doubt Solver free?",
        a: "Yes, it's free and needs no login. Answers are AI-generated, so double-check important results against your textbook.",
      },
    ],
  },
  "notes-maker": {
    title: "AI Notes Maker — Instant Study Notes from Any Topic | ELVIX",
    description:
      "Turn any topic or your own text into organised study notes. Pick Quick, Detailed, Revision or Exam notes with the free ELVIX AI Notes Maker.",
    intro:
      "ELVIX AI Notes Maker writes clean, organised study notes for any topic. Add a topic (and optionally a chapter or your own text), choose the style you need — quick reading, full detail, last-minute revision or exam-focused — and get notes with definitions, concepts, examples and important questions.",
    howTo: [
      "Type the topic, e.g. Photosynthesis.",
      "Optionally add the chapter name or paste your own book text to base the notes on.",
      "Pick a notes type: Quick, Detailed, Revision or Exam.",
      "Tap Create Notes, then copy, download or save the notes to History.",
    ],
    faq: [
      {
        q: "What is the difference between the notes types?",
        a: "Quick Notes cover only the essentials, Detailed Notes explain everything with examples, Revision Notes are compressed for last-minute reading, and Exam Notes are organised the way answers are expected in exams.",
      },
      {
        q: "Can I make notes from my own textbook text?",
        a: "Yes. Paste the paragraph or chapter into the optional text field and ELVIX will turn that exact content into structured notes.",
      },
      {
        q: "Can I download the notes?",
        a: "Yes — every result can be copied, downloaded as a text file, or saved to your History inside the app.",
      },
      {
        q: "Do I need an account?",
        a: "No. The AI Notes Maker is free and works without login.",
      },
    ],
  },
  "pdf-summarizer": {
    title: "PDF Summarizer — Summarize Any PDF Online for Free | ELVIX",
    description:
      "Upload a PDF and get a clear summary with key points and quick revision notes. Choose short, medium or detailed. Free ELVIX PDF Summarizer, no login.",
    intro:
      "ELVIX PDF Summarizer reads a text-based PDF, shows how many pages it found, and writes a summary with the key points, definitions and important questions. Pick a short 2-minute revision, a balanced medium, or a detailed summary that covers everything.",
    howTo: [
      "Tap the upload area (or drag a file in) and choose your PDF — up to 10 MB.",
      "Choose the summary length: Short, Medium or Detailed.",
      "Tap Summarize and wait while the pages are read and summarised.",
      "Copy, download or save the summary to History when it's ready.",
    ],
    faq: [
      {
        q: "Does it work with scanned PDFs?",
        a: "No. The PDF needs selectable text — scanned image-only PDFs have nothing to read. If no text is found, ELVIX will tell you and you can try a text-based version.",
      },
      {
        q: "What is the file size limit?",
        a: "PDFs up to 10 MB work. The page count is shown after upload so you know what you're summarising.",
      },
      {
        q: "Is my PDF uploaded to a server?",
        a: "Text is extracted from the PDF in your browser; only the extracted text is sent to the AI for summarising. The file itself is not stored.",
      },
      {
        q: "Is the PDF Summarizer free?",
        a: "Yes — free and without login.",
      },
    ],
  },
  "study-planner": {
    title: "AI Study Planner — Free Day-Wise Exam Study Schedule | ELVIX",
    description:
      "Enter your subjects, exam date and daily study hours to get a realistic day-wise study plan you can save and update. Free ELVIX AI Study Planner.",
    intro:
      "ELVIX AI Study Planner builds a day-wise schedule from your real situation: your subjects, your exam date and the hours you can actually study each day. Mark your weak and strong subjects and the plan gives them the right weightage, with revision time before the exam.",
    howTo: [
      "Enter your class or course and your exam date.",
      "List your subjects (comma separated) and your daily available hours.",
      "Optionally add your weak and strong subjects so the plan balances them.",
      "Tap Create Plan, then Save Plan to keep it — you can edit and regenerate anytime.",
    ],
    faq: [
      {
        q: "Can I edit or update a saved plan?",
        a: "Yes. Saved plans are listed on the page — open one, change your subjects, hours or exam date, regenerate and update it.",
      },
      {
        q: "How is the plan decided?",
        a: "ELVIX spreads your subjects across the days left before your exam, gives more time to weak subjects, and reserves the final days for revision — based on the details you enter.",
      },
      {
        q: "What if I can't study one day?",
        a: "Regenerate the plan with your new exam date or hours, or adjust the remaining days yourself — the plan is a guide, not a strict rule.",
      },
      {
        q: "Is the Study Planner free?",
        a: "Yes — free, no login needed.",
      },
    ],
  },
  "question-generator": {
    title: "Question Generator — Create MCQs & Test Papers with Answers | ELVIX",
    description:
      "Generate practice questions from any chapter — MCQs, short and long questions with an answer key. Choose difficulty and count. Free ELVIX tool.",
    intro:
      "ELVIX Question Generator makes practice papers from any chapter. Choose the subject and chapter, set difficulty and how many questions you want, and get MCQs plus short and long questions with an answer key — ready to attempt or print.",
    howTo: [
      "Pick the subject and optionally your class.",
      "Type the chapter name, e.g. Light — Reflection and Refraction.",
      "Choose the difficulty (Easy, Medium or Hard) and the number of questions (up to 30).",
      "Tap Generate Questions, then save, download or copy the paper with its answer key.",
    ],
    faq: [
      {
        q: "Does it include answers?",
        a: "Yes — the set comes with an answer key so you can check yourself after attempting the questions.",
      },
      {
        q: "How many questions can I generate at once?",
        a: "Between 1 and 30 per set. Generate again for a fresh set on the same chapter.",
      },
      {
        q: "Which subjects are supported?",
        a: "Physics, Chemistry, Mathematics, Biology, English, History, Geography and General.",
      },
      {
        q: "Is it free?",
        a: "Yes — the Question Generator is free and needs no account.",
      },
    ],
  },
  "shorts-script": {
    title: "Shorts Script Generator — YouTube Shorts & Reels Scripts | ELVIX",
    description:
      "Get a ready-to-film Shorts or Reels script with hook, timestamps, captions, hashtags and CTA. Pick language, length and style. Free ELVIX tool.",
    intro:
      "ELVIX Shorts Script writes a complete script for a short video: the opening hook, a timestamped shot-by-shot script, on-screen captions, hashtags and a closing call-to-action. Choose Hinglish, Hindi or English, a 15–60 second length, and the style that fits your video.",
    howTo: [
      "Type your video topic, e.g. 5 facts about black holes.",
      "Choose the language (Hinglish, Hindi or English).",
      "Pick the duration — 15s, 30s, 45s or 60s — and the style: Facts, Educational, Suspense, Story or Fun.",
      "Tap Create Script, then copy it and start filming.",
    ],
    faq: [
      {
        q: "What does the script include?",
        a: "A hook for the first seconds, a timestamped script you can follow while filming, caption suggestions, hashtags and a CTA for the end.",
      },
      {
        q: "Which durations are supported?",
        a: "15, 30, 45 and 60 seconds — the script's pacing matches the length you pick.",
      },
      {
        q: "Can I write scripts in Hindi or Hinglish?",
        a: "Yes — choose Hinglish, Hindi or English and the script (including captions and CTA) comes in that language.",
      },
      {
        q: "Is it free?",
        a: "Yes — free, no login required.",
      },
    ],
  },
  "hook-generator": {
    title: "Hook Generator — Scroll-Stopping Hooks for Reels & Shorts | ELVIX",
    description:
      "Generate scroll-stopping hooks for YouTube Shorts, Instagram Reels or long videos, with a note on why each hook works. Free ELVIX Hook Generator.",
    intro:
      "The first three seconds decide whether people keep watching. ELVIX Hook Generator writes multiple opening hooks for your topic, each with a short note on why it works, tuned for YouTube Shorts, Instagram Reels or long-form YouTube.",
    howTo: [
      "Type your topic — study motivation, tech facts, cricket, anything.",
      "Choose the platform: YouTube Shorts, Instagram Reels or YouTube Long.",
      "Pick how many hooks you want (5, 10 or 15) and the language.",
      "Tap Generate Hooks and pick the hook that fits your video best.",
    ],
    faq: [
      {
        q: "What makes a good hook?",
        a: "It creates curiosity, tension or a promise in the first line so viewers stop scrolling. Each hook from ELVIX comes with a short 'why it works' note so you can learn the pattern.",
      },
      {
        q: "How many hooks do I get per run?",
        a: "5, 10 or 15 — your choice. Tap Regenerate for a fresh batch anytime.",
      },
      {
        q: "Does it work for long YouTube videos too?",
        a: "Yes — choose YouTube Long as the platform and the hooks are written for that format.",
      },
      {
        q: "Is the Hook Generator free?",
        a: "Yes — free and no account needed.",
      },
    ],
  },
  "text-summarizer": {
    title: "Text Summarizer — Summarize Articles & Notes Online | ELVIX",
    description:
      "Paste long articles, chapters or notes and get a crisp summary with key points. Choose short, medium or detailed. Free ELVIX Text Summarizer.",
    intro:
      "ELVIX Text Summarizer condenses long text into something you can actually revise from. Paste an article, chapter, notes or any text up to 60,000 characters, pick the length, and get a summary with the key points pulled out.",
    howTo: [
      "Paste your long text into the box (up to 60,000 characters).",
      "Choose the summary length: Short, Medium or Detailed.",
      "Tap Summarize and wait a few seconds.",
      "Copy, download or save the summary to History.",
    ],
    faq: [
      {
        q: "How long can my text be?",
        a: "Up to 60,000 characters per run — that's roughly 20–30 pages. For longer documents, summarise in parts.",
      },
      {
        q: "What's the difference between the lengths?",
        a: "Short gives you the bare points for a 2-minute read, Medium balances coverage and brevity, and Detailed keeps almost all the important detail.",
      },
      {
        q: "Can I summarise a PDF here?",
        a: "This tool works on pasted text. For PDF files, use the separate ELVIX PDF Summarizer.",
      },
      {
        q: "Is it free?",
        a: "Yes — the Text Summarizer is free and works without login.",
      },
    ],
  },
  translator: {
    title: "Translator — Translate Text Between 16 Languages | ELVIX",
    description:
      "Translate text between Hindi, English and 14 more languages with auto-detect. Clean, natural translations in seconds. Free ELVIX Translator.",
    intro:
      "ELVIX Translator converts text between 16 languages, including Hindi, English, Hinglish and major Indian languages like Marathi, Tamil, Bengali and Punjabi, plus Spanish, French, German and Arabic. Source language is auto-detected, so you can just paste and go.",
    howTo: [
      "Paste or type the text you want to translate.",
      "Choose the target language from the To list.",
      "Optionally set the From language, or leave Auto-detect on.",
      "Tap Translate and copy the translation.",
    ],
    faq: [
      {
        q: "Which languages are supported?",
        a: "Hindi, English, Hinglish, Marathi, Gujarati, Bengali, Tamil, Telugu, Kannada, Malayalam, Punjabi, Urdu, Spanish, French, German and Arabic.",
      },
      {
        q: "Do I need to pick the source language?",
        a: "No — Auto-detect usually figures it out. You can set it manually if the text mixes languages.",
      },
      {
        q: "Is it a word-for-word translation?",
        a: "ELVIX aims for natural, meaningful translation rather than literal word-swapping, so sentences read the way a person would say them.",
      },
      {
        q: "Is the Translator free?",
        a: "Yes — free, with no login.",
      },
    ],
  },
  "email-writer": {
    title: "Email Writer — Professional Emails in Any Tone | ELVIX",
    description:
      "Describe the purpose and pick a tone to get a ready-to-send email with subject lines. Formal, friendly, persuasive and more. Free ELVIX tool.",
    intro:
      "ELVIX Email Writer drafts complete emails for you: describe the purpose — a leave application, a complaint, an admission inquiry — pick a tone, add the recipient and key points if you want, and get a subject line plus a ready-to-copy email body.",
    howTo: [
      "Type the purpose of your email, e.g. leave application for two days.",
      "Pick a tone: Formal, Friendly, Persuasive, Apologetic or Follow-up.",
      "Optionally add the recipient and the key points that must be included.",
      "Tap Create Email, then copy the subject and body and send it.",
    ],
    faq: [
      {
        q: "Which tones can I choose?",
        a: "Formal, Friendly, Persuasive, Apologetic and Follow-up — the wording and structure change to match the tone.",
      },
      {
        q: "Does it write the subject line too?",
        a: "Yes — you get subject line options along with the email body.",
      },
      {
        q: "Can I control what goes in the email?",
        a: "Yes — add your key points in the optional field and ELVIX will work them into the email.",
      },
      {
        q: "Is the Email Writer free?",
        a: "Yes — free and no account required.",
      },
    ],
  },
};
