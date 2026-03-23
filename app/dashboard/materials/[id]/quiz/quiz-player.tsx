"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type QuizQuestion = {
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correct_answer: string;
  explanation: string;
};

type QuizPlayerProps = {
  materialId: string;
  questions: QuizQuestion[];
};

const ctaClassName =
  "rounded-lg bg-indigo-500 px-8 font-semibold text-white shadow-sm transition-all duration-300 hover:translate-y-[-1px] hover:bg-indigo-400";

export function QuizPlayer({ materialId, questions }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const total = questions.length;
  const isComplete = total > 0 && currentIndex >= total;
  const score = useMemo(() => {
    return questions.reduce((acc, question, index) => {
      return selectedAnswers[index] === question.correct_answer ? acc + 1 : acc;
    }, 0);
  }, [questions, selectedAnswers]);

  function selectAnswer(answer: string) {
    if (selectedAnswers[currentIndex]) {
      return;
    }

    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: answer }));
  }

  function nextQuestion() {
    setCurrentIndex((prev) => prev + 1);
  }

  function retakeQuiz() {
    setCurrentIndex(0);
    setSelectedAnswers({});
  }

  if (total === 0) {
    return (
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <Card className="rounded-2xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-sora)] text-xl">Quiz</CardTitle>
            <CardDescription>No quiz questions are available for this material yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-lg border-slate-200">
              <Link href={`/dashboard/materials/${materialId}`}>Back to Material</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / total) * 100);
    return (
      <section className="mx-auto w-full max-w-3xl space-y-8">
        <div className="overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50 to-white p-8 text-center shadow-lg shadow-indigo-500/10 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Quiz complete</p>
          <p className="[font-family:var(--font-sora)] mt-2 text-5xl font-bold tabular-nums text-slate-900 sm:text-6xl">
            {percentage}%
          </p>
          <p className="mt-2 text-lg text-slate-600">
            You scored <span className="font-semibold text-slate-900">{score}</span> out of{" "}
            <span className="font-semibold text-slate-900">{total}</span>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={retakeQuiz} className={ctaClassName}>
              Retake Quiz
            </Button>
            <Button asChild variant="outline" className="rounded-lg border-slate-200 px-6">
              <Link href={`/dashboard/materials/${materialId}`}>Back to Material</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selected = selectedAnswers[currentIndex];
  const hasAnswered = Boolean(selected);
  const progressPct = ((currentIndex + 1) / total) * 100;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
          <span>
            Question <span className="font-semibold text-slate-900">{currentIndex + 1}</span> of{" "}
            <span className="font-semibold text-slate-900">{total}</span>
          </span>
          <span className="tabular-nums text-slate-500">
            Score {score}/{total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        <CardHeader className="space-y-3 pb-2">
          <CardTitle className="[font-family:var(--font-sora)] text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="grid gap-3">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correct_answer;
              const isSelected = option === selected;

              let optionClass =
                "w-full rounded-xl border-2 p-4 text-left text-sm font-medium transition-all duration-300 sm:p-5 sm:text-base ";

              if (!hasAnswered) {
                optionClass +=
                  "cursor-pointer border-slate-200 bg-white text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/60 active:scale-[0.99]";
              } else if (isCorrect) {
                optionClass += "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm";
              } else if (isSelected) {
                optionClass += "border-red-500 bg-red-50 text-red-950 shadow-sm";
              } else {
                optionClass += "border-slate-100 bg-slate-50 text-slate-500";
              }

              return (
                <button
                  key={option}
                  type="button"
                  className={optionClass}
                  disabled={hasAnswered}
                  onClick={() => selectAnswer(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {hasAnswered ? (
            <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/90 p-4 sm:p-5">
              <p className="text-sm font-semibold text-slate-900">
                {selected === currentQuestion.correct_answer ? (
                  <span className="text-emerald-700">Correct!</span>
                ) : (
                  <span className="text-red-700">Not quite.</span>
                )}
              </p>
              <p className="text-sm text-slate-600">
                Correct answer:{" "}
                <span className="font-medium text-slate-900">{currentQuestion.correct_answer}</span>
              </p>
              {currentQuestion.explanation ? (
                <p className="text-sm leading-relaxed text-slate-600">{currentQuestion.explanation}</p>
              ) : null}
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200/80 pt-4">
                <Button onClick={nextQuestion} className={ctaClassName}>
                  {currentIndex === total - 1 ? "See results" : "Next Question"}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900">
        <Link href={`/dashboard/materials/${materialId}`}>← Back to Material</Link>
      </Button>
    </section>
  );
}
