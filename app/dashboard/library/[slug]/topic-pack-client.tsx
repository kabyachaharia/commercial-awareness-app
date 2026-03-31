"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Lock, Shuffle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type QuizQuestionItem = {
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correct_answer: string;
  explanation: string;
};

export type FlashcardItem = {
  front: string;
  back: string;
};

export type TopicSectionItem = {
  id: string;
  title: string | null;
  content: string | null;
  section_number: number;
};

type ProgressState = {
  sections_completed: number;
  quiz_best_score: number | null;
  quiz_attempts: number;
};

type TopicPackClientProps = {
  packId: string;
  packTitle: string | null;
  keyTakeaways: string[];
  sections: TopicSectionItem[];
  quizQuestions: QuizQuestionItem[];
  flashcards: FlashcardItem[];
  initialProgress: ProgressState;
};

const markdownComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ children }) => <h1 className="mt-6 mb-3 text-2xl font-bold text-black first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-5 mb-2 text-xl font-bold text-black first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-4 mb-2 text-lg font-semibold text-black first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="mb-3 text-base leading-relaxed text-gray-800 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 text-base text-gray-800">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 text-base text-gray-800">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a href={href} className="font-medium text-[#4F46E5] underline-offset-2 hover:underline">
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.includes("language-"));
    if (isBlock) {
      return (
        <code
          className={cn("my-3 block overflow-x-auto rounded-lg border-2 border-black bg-gray-50 p-4 text-sm", className)}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className="rounded border border-gray-300 bg-gray-100 px-1 py-0.5 font-mono text-[0.9em]" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="mb-3 overflow-x-auto">{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-4 border-black pl-4 text-gray-700 italic">{children}</blockquote>
  ),
  hr: () => <hr className="my-6 border-t-2 border-gray-200" />,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse border-2 border-black text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-black bg-gray-100 px-3 py-2 text-left font-semibold text-black">{children}</th>
  ),
  td: ({ children }) => <td className="border border-gray-300 px-3 py-2 text-gray-800">{children}</td>,
};

export function TopicPackClient({
  packId,
  packTitle,
  keyTakeaways,
  sections,
  quizQuestions,
  flashcards,
  initialProgress,
}: TopicPackClientProps) {
  const supabase = React.useMemo(() => createClient(), []);

  const [progress, setProgress] = React.useState<ProgressState>(initialProgress);
  const [takeawaysOpen, setTakeawaysOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"learn" | "quiz" | "flashcards">("learn");
  const [sectionSaveError, setSectionSaveError] = React.useState<string | null>(null);

  const totalSections = sections.length;
  const allSectionsComplete = totalSections > 0 && progress.sections_completed >= totalSections;

  const [learnViewIndex, setLearnViewIndex] = React.useState(() =>
    totalSections === 0 ? 0 : Math.min(initialProgress.sections_completed, Math.max(0, totalSections - 1))
  );

  const viewingSection =
    totalSections > 0 ? sections[Math.min(learnViewIndex, Math.max(0, totalSections - 1))] : null;

  const atProgressFrontier =
    !allSectionsComplete && learnViewIndex === progress.sections_completed && progress.sections_completed < totalSections;

  function canNavigateToSection(i: number) {
    if (totalSections === 0) return false;
    if (i < 0 || i >= totalSections) return false;
    return allSectionsComplete || i <= progress.sections_completed;
  }

  const [quizQuestionIndex, setQuizQuestionIndex] = React.useState(0);
  const [quizSelected, setQuizSelected] = React.useState<string | null>(null);
  const [quizSelectedByIndex, setQuizSelectedByIndex] = React.useState<Record<number, string>>({});
  const [quizRevealed, setQuizRevealed] = React.useState(false);
  const [quizCorrectCount, setQuizCorrectCount] = React.useState(0);
  const [quizFinished, setQuizFinished] = React.useState(false);
  const [quizSaveError, setQuizSaveError] = React.useState<string | null>(null);
  const [quizSaving, setQuizSaving] = React.useState(false);
  const [quizSavedOnce, setQuizSavedOnce] = React.useState(false);
  const [quizFinishedScorePct, setQuizFinishedScorePct] = React.useState<number | null>(null);
  const [quizSaveConfirmation, setQuizSaveConfirmation] = React.useState<string | null>(null);
  const [quizReviewIndex, setQuizReviewIndex] = React.useState(0);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(`quiz-progress-${packId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.questionIndex === "number") {
          setQuizQuestionIndex(parsed.questionIndex);
        }
        if (parsed && typeof parsed.selectedByIndex === "object") {
          setQuizSelectedByIndex(parsed.selectedByIndex);
        }
        if (parsed && typeof parsed.correctCount === "number") {
          setQuizCorrectCount(parsed.correctCount);
        }
      }
    } catch {
      // ignore
    }
  }, [packId]);

  const [cardIndex, setCardIndex] = React.useState(0);
  const [cardFlipped, setCardFlipped] = React.useState(false);

  const quizTotal = quizQuestions.length;

  async function persistProgress(next: ProgressState) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      topic_pack_id: packId,
      sections_completed: next.sections_completed,
      quiz_best_score: next.quiz_best_score,
      quiz_attempts: next.quiz_attempts,
      last_studied_at: new Date().toISOString(),
    };

    let res = await supabase.from("user_progress").upsert(payload, { onConflict: "user_id,topic_pack_id" });
    if (res.error) {
      const { quiz_attempts: _qa, ...withoutAttempts } = payload;
      void _qa;
      res = await supabase.from("user_progress").upsert(withoutAttempts, { onConflict: "user_id,topic_pack_id" });
      if (res.error) throw res.error;
    }
  }

  async function handleContinueSection() {
    if (!viewingSection || totalSections === 0) return;
    if (!atProgressFrontier) return;
    setSectionSaveError(null);
    const prevSnapshot = progress;
    const nextCompleted = prevSnapshot.sections_completed + 1;
    const next: ProgressState = {
      ...prevSnapshot,
      sections_completed: nextCompleted,
    };
    setProgress(next);
    setLearnViewIndex(Math.min(nextCompleted, Math.max(0, totalSections - 1)));
    try {
      await persistProgress(next);
    } catch {
      setSectionSaveError("Could not save progress. Check your connection and try again.");
      setProgress(prevSnapshot);
      setLearnViewIndex(
        Math.min(prevSnapshot.sections_completed, Math.max(0, totalSections - 1))
      );
    }
  }

  function resetQuizSession() {
    localStorage.removeItem(`quiz-progress-${packId}`);
    setQuizQuestionIndex(0);
    setQuizSelected(null);
    setQuizSelectedByIndex({});
    setQuizRevealed(false);
    setQuizCorrectCount(0);
    setQuizFinished(false);
    setQuizSaveError(null);
    setQuizSaving(false);
    setQuizSavedOnce(false);
    setQuizFinishedScorePct(null);
    setQuizSaveConfirmation(null);
    setQuizReviewIndex(0);
  }

  function handleSelectAnswer(option: string) {
    if (quizRevealed || quizFinished) return;
    setQuizSelected(option);
    setQuizSelectedByIndex((prev) => ({ ...prev, [quizQuestionIndex]: option }));
    setQuizRevealed(true);
    const q = quizQuestions[quizQuestionIndex];
    if (q && option === q.correct_answer) {
      setQuizCorrectCount((c) => c + 1);
    }
  }

  async function handleQuizNext() {
    if (!quizRevealed) return;

    if (quizQuestionIndex < quizTotal - 1) {
      setQuizQuestionIndex((i) => i + 1);
      setQuizSelected(null);
      setQuizRevealed(false);
      return;
    }

    const pct = quizTotal > 0 ? Math.round((quizCorrectCount / quizTotal) * 100) : 0;
    setQuizFinished(true);
    setQuizFinishedScorePct(pct);
    setQuizSaveError(null);
    setQuizSaveConfirmation(null);
  }

  async function handleSaveAttempt() {
    if (!quizFinished || quizFinishedScorePct == null) return;
    setQuizSaveError(null);
    setQuizSaveConfirmation(null);
    setQuizSaving(true);

    let committed: ProgressState | null = null;
    setProgress((prev) => {
      const attempts = prev.quiz_attempts + 1;
      const best = Math.max(prev.quiz_best_score ?? 0, quizFinishedScorePct);
      committed = { ...prev, quiz_best_score: best, quiz_attempts: attempts };
      return committed;
    });

    if (committed) {
      try {
        await persistProgress(committed);
        setQuizSavedOnce(true);
        setQuizSaveConfirmation("Score saved!");
      } catch {
        setQuizSaveError("Could not save your score. You can try again in a moment.");
      }
    }

    setQuizSaving(false);
  }

  const goNextCard = () => {
    setCardIndex((i) => Math.min(i + 1, Math.max(0, flashcards.length - 1)));
    setCardFlipped(false);
  };

  const goPrevCard = () => {
    setCardIndex((i) => Math.max(i - 1, 0));
    setCardFlipped(false);
  };

  const currentCard = flashcards[cardIndex];
  const title = packTitle?.trim() ? packTitle : "Topic pack";
  const quizPercentage = quizTotal > 0 ? Math.round((quizCorrectCount / quizTotal) * 100) : 0;
  const quizPerformanceMessage =
    quizPercentage >= 90
      ? "Excellent!"
      : quizPercentage >= 70
        ? "Great job!"
        : quizPercentage >= 50
          ? "Good effort. Review the sections you missed."
          : "Keep studying. Try re-reading the Learn sections.";

  return (
    <div className="space-y-8">
      {allSectionsComplete && keyTakeaways.length > 0 ? (
        <Card className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
          <button
            type="button"
            onClick={() => setTakeawaysOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 border-b-2 border-black bg-[#FEF08A]/35 px-5 py-4 text-left transition-colors hover:bg-[#FEF08A]/50"
            aria-expanded={takeawaysOpen}
          >
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-black">Key takeaways</p>
              <p className="text-sm text-gray-600">Review the essentials from {title}</p>
            </div>
            <ChevronDown
              className={cn("size-5 shrink-0 text-black transition-transform duration-300", takeawaysOpen && "rotate-180")}
              aria-hidden
            />
          </button>
          {takeawaysOpen ? (
            <CardContent className="px-5 py-5">
              <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-gray-800">
                {keyTakeaways.map((line, idx) => (
                  <li key={`${idx}-${line.slice(0, 48)}`}>{line}</li>
                ))}
              </ul>
            </CardContent>
          ) : null}
        </Card>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "learn" | "quiz" | "flashcards")}
        className="w-full gap-6"
      >
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("learn")}
            className={`flex-1 rounded-full border-2 px-4 py-2.5 text-[15px] font-medium transition-colors ${
              activeTab === "learn"
                ? "border-black bg-[#FCE8D9] text-[#E07830]"
                : "border-black bg-white text-gray-400"
            }`}
          >
            Learn
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quiz")}
            disabled={!allSectionsComplete}
            className={`flex-1 rounded-full border-2 px-4 py-2.5 text-[15px] font-medium transition-colors ${
              activeTab === "quiz"
                ? "border-black bg-[#E8E4F7] text-[#6B5CE7]"
                : "border-black bg-white text-gray-400"
            } ${!allSectionsComplete ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Quiz
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("flashcards")}
            className={`flex-1 rounded-full border-2 px-4 py-2.5 text-[15px] font-medium transition-colors ${
              activeTab === "flashcards"
                ? "border-black bg-[#DDF0D9] text-[#2E7D32]"
                : "border-black bg-white text-gray-400"
            }`}
          >
            Flashcards
          </button>
        </div>

        <TabsContent value="learn" className="mt-0 text-base">
          <Card className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
            {totalSections === 0 ? (
              <CardHeader className="space-y-4 border-b-2 border-black px-6 py-6">
                <CardDescription className="text-base text-gray-600">
                  No learning sections are available for this pack yet.
                </CardDescription>
              </CardHeader>
            ) : (
              <div>
                <nav
                  className="flex gap-2 overflow-x-auto border-b-2 border-black px-4 py-4 [scrollbar-width:thin]"
                  aria-label="Sections"
                >
                  {sections.map((s, i) => {
                    const done = i < progress.sections_completed;
                    const current = i === learnViewIndex;
                    const navigable = canNavigateToSection(i);
                    const num = s.section_number ?? i + 1;
                    const label = `Section ${num}${done ? ", completed" : ""}${current ? ", current" : ""}${navigable ? "" : ", locked"}`;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={!navigable}
                        onClick={() => navigable && setLearnViewIndex(i)}
                        aria-label={label}
                        aria-current={current ? "step" : undefined}
                        className={cn(
                          "flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full border-2 border-black px-2 text-sm font-bold tabular-nums transition-[box-shadow,opacity,background-color,color]",
                          current
                            ? "bg-[#FCE8D9] border-2 border-black text-[#E07830]"
                            : done
                              ? "bg-[#DDF0D9] text-[#2E7D32]"
                              : "bg-gray-200 text-gray-600",
                          current && "ring-2 ring-black ring-offset-2 ring-offset-white",
                          !navigable && "cursor-not-allowed opacity-40"
                        )}
                      >
                        {num}
                      </button>
                    );
                  })}
                </nav>
                <div className="min-w-0">
                  <CardHeader className="space-y-4 border-b-2 border-black px-6 py-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                        <span>
                          Section {learnViewIndex + 1} of {totalSections}
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full border-2 border-black bg-white">
                        <div
                          className="h-full rounded-full bg-[#FACC15] transition-all duration-300"
                          style={{ width: `${((learnViewIndex + 1) / totalSections) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {viewingSection ? (
                    <CardContent className="space-y-6 px-6 py-8">
                      <div className="space-y-4">
                        <CardTitle className="text-2xl font-bold text-black">{viewingSection.title ?? "Section"}</CardTitle>
                        <article className="rounded-xl border-2 border-gray-200 bg-gray-50/50 px-5 py-6">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {viewingSection.content ?? ""}
                          </ReactMarkdown>
                        </article>
                      </div>
                      {allSectionsComplete && learnViewIndex === totalSections - 1 ? (
                        <div className="space-y-4 rounded-xl border-2 border-dashed border-black bg-[#D1FAE5]/40 px-5 py-8 text-center">
                          <p className="text-lg font-black uppercase text-black">Congratulations</p>
                          <p className="text-base text-gray-700">You have completed every section in this topic pack.</p>
                          <p className="text-sm text-gray-600">Try the quiz when you are ready, or revisit any tab above.</p>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-12 rounded-xl border-2 border-black bg-white px-6 text-base font-bold text-black shadow-[4px_4px_0_0_#000] hover:bg-gray-50"
                            onClick={() => setLearnViewIndex(0)}
                          >
                            Review Sections
                          </Button>
                        </div>
                      ) : null}
                      {sectionSaveError ? <p className="text-sm text-red-700">{sectionSaveError}</p> : null}
                      {!allSectionsComplete && learnViewIndex < progress.sections_completed ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 w-full rounded-xl border-2 border-black bg-white px-6 text-base font-bold text-black shadow-[4px_4px_0_0_#000] hover:bg-gray-50 sm:w-auto"
                          onClick={() =>
                            setLearnViewIndex(Math.min(progress.sections_completed, Math.max(0, totalSections - 1)))
                          }
                        >
                          Resume where you left off
                        </Button>
                      ) : null}
                      {atProgressFrontier ? (
                        <Button
                          type="button"
                          onClick={handleContinueSection}
                          className="h-12 w-full rounded-xl border-2 border-black bg-black px-6 text-base font-bold text-white shadow-[4px_4px_0_0_#000] hover:bg-gray-900 sm:w-auto"
                        >
                          {learnViewIndex + 1 >= totalSections ? "Finish" : "Continue"}
                        </Button>
                      ) : null}
                    </CardContent>
                  ) : null}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="mt-0">
          <Card className="rounded-xl border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
            <CardContent className="space-y-6 px-6 py-10">
              {!allSectionsComplete ? (
                <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-400 bg-gray-50 px-6 py-12 text-center">
                  <Lock className="size-10 text-gray-600" aria-hidden />
                  <p className="max-w-md text-lg font-semibold text-black">Complete all learning sections to unlock the quiz</p>
                  <p className="max-w-sm text-base text-gray-600">Finish the Learn tab to test your knowledge here.</p>
                </div>
              ) : quizTotal === 0 ? (
                <p className="text-center text-base text-gray-600">No quiz has been published for this pack yet.</p>
              ) : quizFinished ? (
                <div className="mx-auto w-full space-y-6">
                  <div className="rounded-xl border-2 border-black bg-[#E8E4F7] px-6 py-6 text-center">
                    <p className="text-sm font-semibold text-black">RESULTS SUMMARY</p>
                    <h3
                      className="mt-3 font-[family-name:var(--font-epilogue)] text-3xl font-black text-black"
                      style={{ textTransform: "none" }}
                    >
                      {quizCorrectCount} out of {quizTotal} ({quizPercentage}%)
                    </h3>
                    <p className="mt-2 text-base font-semibold text-black">{quizPerformanceMessage}</p>
                    {progress.quiz_best_score != null ? (
                      <p className="mt-3 text-sm text-black">
                        Best score recorded: {Math.min(100, Math.round(progress.quiz_best_score))}%{" "}
                        {progress.quiz_attempts > 0 ? ` · Attempts: ${progress.quiz_attempts}` : null}
                      </p>
                    ) : null}
                  {quizSaveError ? <p className="mt-3 text-sm text-red-700">{quizSaveError}</p> : null}
                  {quizSaveConfirmation ? (
                    <p className="mt-3 text-sm font-semibold text-emerald-700">{quizSaveConfirmation}</p>
                  ) : null}
                  </div>

                  {quizTotal > 0 ? (
                    <div className="space-y-4" aria-label="Question review">
                      <div className="flex items-center justify-center text-sm font-semibold text-gray-700">
                        <p>
                          Question <span className="font-bold text-black">{quizReviewIndex + 1}</span> of{" "}
                          <span className="font-bold text-black">{quizTotal}</span>
                        </p>
                      </div>

                      {(() => {
                        const index = Math.min(Math.max(quizReviewIndex, 0), quizTotal - 1);
                        const q = quizQuestions[index];
                        const userAnswer = quizSelectedByIndex[index];
                        const isCorrect = userAnswer === q.correct_answer;

                        const icon = isCorrect ? (
                          <Check className="size-3 text-[#2E7D32]" aria-hidden />
                        ) : (
                          <X className="size-3 text-[#E07830]" aria-hidden />
                        );

                        const answerBg = isCorrect ? "bg-[#DDF0D9]" : "bg-[#FCE8D9]";

                        return (
                          <div>
                            <article className="flex-1 rounded-xl border-2 border-black bg-white px-5 py-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`flex size-6 items-center justify-center rounded-full ${
                                      isCorrect ? "bg-[#DDF0D9]" : "bg-[#FCE8D9]"
                                    }`}
                                  >
                                    {icon}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-black">Question {index + 1}</p>
                                    <p className="mt-1 text-lg font-medium leading-snug text-black">{q.question}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 space-y-3">
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-black">Your selected answer</p>
                                  <div className={`inline-block rounded-lg ${answerBg} px-3 py-2`}>
                                    <span className="text-base font-medium text-black">
                                      {userAnswer ?? "No answer"}
                                    </span>
                                  </div>
                                </div>

                                {!isCorrect ? (
                                  <div className="space-y-1">
                                    <p className="text-sm font-semibold text-black">Correct answer</p>
                                    <div className="inline-block rounded-lg bg-[#DDF0D9] px-3 py-2">
                                      <span className="text-base font-medium text-black">{q.correct_answer}</span>
                                    </div>
                                  </div>
                                ) : null}

                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-black">Explanation</p>
                                  <p className="text-base leading-relaxed text-black">{q.explanation}</p>
                                </div>
                              </div>

                              <div className="mt-6 flex items-center justify-between">
                                <button
                                  type="button"
                                  className="flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors hover:text-black disabled:opacity-30"
                                  onClick={() => setQuizReviewIndex((i) => Math.max(i - 1, 0))}
                                  disabled={quizReviewIndex <= 0}
                                  aria-label="Previous question"
                                >
                                  <ChevronLeft className="size-4" />
                                  Previous
                                </button>
                                <button
                                  type="button"
                                  className="flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors hover:text-black disabled:opacity-30"
                                  onClick={() => setQuizReviewIndex((i) => Math.min(i + 1, quizTotal - 1))}
                                  disabled={quizReviewIndex >= quizTotal - 1}
                                  aria-label="Next question"
                                >
                                  Next
                                  <ChevronRight className="size-4" />
                                </button>
                              </div>
                            </article>
                          </div>
                        );
                      })()}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mx-auto max-w-xl space-y-6">
                  <p className="text-sm font-semibold text-gray-600">
                    Question {quizQuestionIndex + 1} of {quizTotal}
                  </p>
                  {(() => {
                    const q = quizQuestions[quizQuestionIndex];
                    if (!q) return null;
                    return (
                      <>
                        <h3
                          className="text-lg font-bold leading-snug text-black"
                          style={{ textTransform: "none" }}
                        >
                          {q.question}
                        </h3>
                        <ul className="space-y-3">
                          {q.options.map((opt) => {
                            const picked = quizSelected === opt;
                            const isCorrect = opt === q.correct_answer;
                            const showResult = quizRevealed;
                            return (
                              <li key={opt}>
                                <button
                                  type="button"
                                  disabled={quizRevealed}
                                  onClick={() => handleSelectAnswer(opt)}
                                  className={cn(
                                    "w-full rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition-colors",
                                    !showResult && "border-black bg-white hover:bg-gray-50",
                                    showResult && isCorrect && "border-black bg-[#DDF0D9]",
                                    showResult && picked && !isCorrect && "border-black bg-[#FCE8D9]"
                                  )}
                                >
                                  {opt}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                        {quizRevealed ? (
                          <>
                            <div className="rounded-xl border-2 border-black bg-[#FEF9C3] px-4 py-3 text-base text-gray-900">
                              <p className="font-bold text-black">
                                {quizSelected === q.correct_answer ? "Correct." : "Incorrect."}
                              </p>
                              <p className="mt-2 leading-relaxed">{q.explanation}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <button
                                type="button"
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-black disabled:opacity-30"
                                onClick={() => setQuizQuestionIndex((i) => Math.max(0, i - 1))}
                                disabled={quizQuestionIndex === 0}
                              >
                                <ChevronLeft className="size-4" />
                                Previous
                              </button>
                              <button
                                type="button"
                                className="rounded-full border-2 border-black bg-[#FACC15] px-5 py-1.5 text-sm font-medium text-black transition-colors hover:bg-[#EAB308]"
                                onClick={() => {
                                  try {
                                    const quizState = {
                                      packId,
                                      questionIndex: quizQuestionIndex,
                                      selectedByIndex: quizSelectedByIndex,
                                      correctCount: quizCorrectCount,
                                      timestamp: Date.now(),
                                    };
                                    localStorage.setItem(`quiz-progress-${packId}`, JSON.stringify(quizState));
                                    alert("Quiz progress saved! You can resume later.");
                                  } catch {
                                    alert("Could not save progress.");
                                  }
                                }}
                              >
                                Save quiz
                              </button>
                              <button
                                type="button"
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-black"
                                onClick={handleQuizNext}
                              >
                                {quizQuestionIndex + 1 >= quizTotal ? "See results" : "Next"}
                                <ChevronRight className="size-4" />
                              </button>
                            </div>
                          </>
                        ) : null}
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
          {quizFinished ? (
            <section className="mt-4 flex items-center justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={resetQuizSession}
                className="h-11 flex-1 rounded-full border-2 border-black bg-[#E8E4F7] text-sm font-bold text-black hover:bg-[#DDD8F0] shadow-none sm:w-auto"
              >
                Retake Quiz
              </Button>
              <Button
                type="button"
                onClick={handleSaveAttempt}
                disabled={quizSaving || quizSavedOnce}
                className="h-11 flex-1 rounded-full border-2 border-black bg-[#FACC15] text-sm font-bold text-black hover:bg-[#EAB308] shadow-none sm:w-auto"
              >
                {quizSavedOnce ? "Attempt Saved ✓" : quizSaving ? "Saving..." : "Save Attempt"}
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab("learn")}
                className="h-11 flex-1 rounded-full border-2 border-black bg-[#FCE8D9] text-sm font-bold text-black hover:bg-[#F5D5C0] shadow-none sm:w-auto"
              >
                Back to Topic
              </Button>
            </section>
          ) : null}
        </TabsContent>

        <TabsContent value="flashcards" className="mt-0">
          <Card className="rounded-xl border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
            <CardHeader className="border-b-2 border-black px-6 py-5 text-center">
              <CardTitle className="text-lg font-black uppercase">Flashcards</CardTitle>
              <CardDescription className="text-base text-gray-600">Tap a card to flip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 py-8">
              {flashcards.length === 0 ? (
                <p className="text-center text-base text-gray-600">No flashcards for this pack yet.</p>
              ) : currentCard ? (
                <>
                  <p className="text-center text-sm font-medium text-gray-600">
                    Card {cardIndex + 1} of {flashcards.length}
                  </p>
                  <div className="mx-auto h-2 max-w-xs overflow-hidden rounded-full border-2 border-black bg-white">
                    <div
                      className="h-full rounded-full bg-[#FACC15] transition-all duration-300"
                      style={{ width: `${((cardIndex + 1) / flashcards.length) * 100}%` }}
                    />
                  </div>
                  <div className="mx-auto w-full max-w-lg [perspective:1200px]">
                    <button
                      type="button"
                      className="relative aspect-[4/3] w-full cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2"
                      onClick={() => setCardFlipped((f) => !f)}
                      aria-label={cardFlipped ? "Show front" : "Show answer"}
                    >
                      <div
                        className={cn(
                          "relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]",
                          cardFlipped && "[transform:rotateY(180deg)]"
                        )}
                      >
                        <div className="absolute inset-0 flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-[#FACC15] px-6 py-6 text-center shadow-[6px_6px_0_0_#000] [backface-visibility:hidden] sm:min-h-[260px]">
                          <p className="text-lg font-black uppercase leading-relaxed text-black sm:text-xl">{currentCard.front}</p>
                        </div>
                        <div className="absolute inset-0 flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-white px-6 py-6 text-center shadow-[6px_6px_0_0_#000] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:min-h-[260px]">
                          <p className="text-base leading-relaxed text-gray-800 sm:text-lg">{currentCard.back}</p>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-10 rounded-full border-2 border-black bg-white hover:bg-gray-50"
                        onClick={goPrevCard}
                        disabled={cardIndex === 0}
                        aria-label="Previous card"
                      >
                        <ChevronLeft className="size-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-10 rounded-full border-2 border-black bg-white hover:bg-gray-50"
                        onClick={goNextCard}
                        disabled={cardIndex >= flashcards.length - 1}
                        aria-label="Next card"
                      >
                        <ChevronRight className="size-5" />
                      </Button>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg border-2 border-black bg-[#FACC15] px-4 py-2 text-sm font-bold text-black hover:bg-[#EAB308] transition-colors"
                      onClick={() => {
                        if (flashcards.length <= 1) return;
                        let next = cardIndex;
                        while (next === cardIndex) {
                          next = Math.floor(Math.random() * flashcards.length);
                        }
                        setCardIndex(next);
                        setCardFlipped(false);
                      }}
                      aria-label="Shuffle cards"
                    >
                      <Shuffle className="size-4" />
                      Shuffle
                    </button>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
