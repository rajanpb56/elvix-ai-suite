import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Markdown } from "@/components/elvix/Markdown";
import { ToolHeader } from "@/components/elvix/ToolPage";
import {
  AI_CONFIG_MESSAGE,
  AiThinking,
  EmptyState,
  ErrorState,
} from "@/components/elvix/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { trackToolUsed } from "@/lib/analytics";

const list = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const today = () => new Date().toISOString().slice(0, 10);

export default function StudyPlanner() {
  const [course, setCourse] = useState("");
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyHours, setDailyHours] = useState("4");
  const [weak, setWeak] = useState("");
  const [strong, setStrong] = useState("");

  const [result, setResult] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<Id<"studyPlans"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<Id<"studyPlans"> | null>(null);

  const makeStudyPlan = useAction(api.ai.makeStudyPlan);
  const saveStudyPlan = useMutation(api.data.saveStudyPlan);
  const deleteStudyPlan = useMutation(api.data.deleteStudyPlan);
  const plans = useQuery(api.data.listStudyPlans, {});

  const currentSubjects = list(subjects);
  const canGenerate =
    currentSubjects.length > 0 && examDate && Number(dailyHours) > 0;

  const run = async () => {
    if (!canGenerate || loading) return;
    trackToolUsed("AI Study Planner");
    setLoading(true);
    setError(null);
    try {
      const res = await makeStudyPlan({
        course: course.trim(),
        subjects: currentSubjects,
        examDate,
        dailyHours: Number(dailyHours),
        weakSubjects: list(weak),
        strongSubjects: list(strong),
      });
      setResult(res.text);
      toast.info(
        editingId
          ? "New plan ready — saving will update the existing plan."
          : "Plan ready! Tap 'Save Plan' to keep it.",
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg.includes("not configured") ? AI_CONFIG_MESSAGE : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await saveStudyPlan({
        id: editingId ?? undefined,
        title:
          `${course.trim() || "Study Plan"} — Exam ${examDate}`.slice(0, 80),
        course: course.trim() || "Student",
        subjects: currentSubjects,
        examDate,
        dailyHours: Number(dailyHours),
        weakSubjects: list(weak),
        strongSubjects: list(strong),
        plan: result,
      });
      toast.success(editingId ? "Plan updated." : "Plan saved.");
      setEditingId(null);
    } catch {
      toast.error("Couldn't save the plan.");
    }
  };

  const handleEdit = (plan: NonNullable<typeof plans>[number]) => {
    setEditingId(plan._id);
    setCourse(plan.course);
    setSubjects(plan.subjects.join(", "));
    setExamDate(plan.examDate);
    setDailyHours(String(plan.dailyHours));
    setWeak(plan.weakSubjects.join(", "));
    setStrong(plan.strongSubjects.join(", "));
    setResult(plan.plan);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: Id<"studyPlans">) => {
    try {
      await deleteStudyPlan({ id });
      if (editingId === id) setEditingId(null);
      toast.success("Plan deleted.");
    } catch {
      toast.error("Couldn't delete.");
    }
  };

  return (
    <div className="space-y-5">
      <ToolHeader toolId="study-planner" />

      <div className="glass ring-soft space-y-4 rounded-3xl p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pl-course">Class / Course</Label>
            <Input
              id="pl-course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. Grade 10 CBSE / B.Sc 1st year"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pl-date">Exam date *</Label>
            <Input
              id="pl-date"
              type="date"
              min={today()}
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pl-subjects">Subjects * (comma separated)</Label>
            <Input
              id="pl-subjects"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="Maths, Science, English, SST"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pl-hours">Daily available hours *</Label>
            <Input
              id="pl-hours"
              type="number"
              min={1}
              max={16}
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pl-weak">Weak subjects</Label>
            <Input
              id="pl-weak"
              value={weak}
              onChange={(e) => setWeak(e.target.value)}
              placeholder="e.g. Maths, Physics"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pl-strong">Strong subjects</Label>
            <Input
              id="pl-strong"
              value={strong}
              onChange={(e) => setStrong(e.target.value)}
              placeholder="e.g. English"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => void run()}
            disabled={!canGenerate || loading}
            className="bg-brand-gradient gap-2 rounded-full px-5 text-white shadow-md"
          >
            <Sparkles className="size-4" />
            {loading
              ? "Creating your plan…"
              : editingId
                ? "Regenerate"
                : "Create Plan"}
          </Button>
        </div>
      </div>

      {loading &&      <AiThinking label="ELVIX is building your schedule…" />}
      {error && <ErrorState message={error} onRetry={() => void run()} />}

      {result && !loading && (
        <div className="space-y-3">
          <div className="glass ring-soft rounded-2xl p-4 sm:p-5">
            <Markdown content={result} />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 rounded-full"
              onClick={() => void handleSave()}
            >
              <Save className="size-3.5" />
              {editingId ? "Update Plan" : "Save Plan"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 rounded-full"
              onClick={() => void run()}
              disabled={loading}
            >
              <RefreshCw className="size-3.5" />
              Regenerate
            </Button>
            {editingId && (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full text-muted-foreground"
                onClick={() => setEditingId(null)}
              >
                New plan
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Saved plans */}
      <section className="space-y-2" aria-label="Saved plans">
        <h2 className="font-display text-lg font-semibold">Saved Plans</h2>
        {plans && plans.length === 0 && (
          <EmptyState
            icon={<Sparkles className="size-5" />}
            title="No saved plans yet"
            hint="Fill the form to create your first plan — it will be saved here."
          />
        )}
        {plans?.map((plan) => (
          <div
            key={plan._id}
            className="rounded-2xl border border-border/70 bg-card/60 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{plan.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {plan.subjects.join(", ")} · {plan.dailyHours}h/day · updated{" "}
                  {new Date(plan.updatedAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-muted-foreground"
                  aria-label="Edit plan"
                  onClick={() => handleEdit(plan)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  aria-label="Delete plan"
                  onClick={() => void handleDelete(plan._id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-muted-foreground"
                  aria-label={expandedId === plan._id ? "Close" : "View plan"}
                  onClick={() =>
                    setExpandedId(expandedId === plan._id ? null : plan._id)
                  }
                >
                  {expandedId === plan._id ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            {expandedId === plan._id && (
              <div className="mt-3 border-t border-border/60 pt-3">
                <Markdown content={plan.plan} />
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
