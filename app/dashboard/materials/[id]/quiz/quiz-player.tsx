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

const ctaClassName = "px-8";

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
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Quiz</CardTitle>
            <CardDescription>No quiz questions are available for this material yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
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
        <div className="overflow-hidden rounded-2xl border-2 border-black bg-white p-8 text-center shadow-[8px_8px_0_0_#000] sm:p-12">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-600">Quiz complete</p>
          <p className="mt-2 text-5xl font-black tabular-nums text-black sm:text-6xl">
            {percentage}%
          </p>
          <p className="mt-2 text-lg text-gray-600">
            You scored <span className="font-semibold text-black">{score}</span> out of{" "}
            <span className="font-semibold text-black">{total}</span>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={retakeQuiz} className={ctaClassName}>
              Retake Quiz
            </Button>
            <Button asChild variant="outline" className="px-6">
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
        <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
          <span>
            Question <span className="font-semibold text-black">{currentIndex + 1}</span> of{" "}
            <span className="font-semibold text-black">{total}</span>
          </span>
          <span className="tabular-nums text-gray-500">
            Score {score}/{total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full border-2 border-black bg-white">
          <div
            className="h-full rounded-full bg-[#FACC15] transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader className="space-y-3 pb-2">
          <CardTitle className="text-lg leading-snug text-black sm:text-xl">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="grid gap-3">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correct_answer;
              const isSelected = option === selected;

              let optionClass =
                "w-full rounded-xl border-2 p-4 text-left text-sm font-semibold transition-all duration-300 sm:p-5 sm:text-base ";

              if (!hasAnswered) {
                optionClass +=
                  "cursor-pointer border-black bg-white text-black hover:bg-[#FEF08A]/60 active:scale-[0.99]";
              } else if (isCorrect) {
                optionClass += "border-black bg-[#D1FAE5] text-black shadow-sm";
              } else if (isSelected) {
                optionClass += "border-black bg-[#FED7AA] text-black shadow-sm";
              } else {
                optionClass += "border-black/50 bg-gray-100 text-gray-500";
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
            <div className="space-y-4 rounded-xl border-2 border-black bg-white p-4 sm:p-5">
              <p className="text-sm font-semibold text-black">
                {selected === currentQuestion.correct_answer ? (
                  <span className="text-green-700">Correct!</span>
                ) : (
                  <span className="text-red-700">Not quite.</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                Correct answer:{" "}
                <span className="font-medium text-black">{currentQuestion.correct_answer}</span>
              </p>
              {currentQuestion.explanation ? (
                <p className="text-sm leading-relaxed text-gray-600">{currentQuestion.explanation}</p>
              ) : null}
              <div className="flex flex-wrap items-center justify-end gap-3 border-t-2 border-black/80 pt-4">
                <Button onClick={nextQuestion} className={ctaClassName}>
                  {currentIndex === total - 1 ? "See results" : "Next Question"}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Button asChild variant="ghost" className="text-gray-700 hover:text-black">
        <Link href={`/dashboard/materials/${materialId}`}>← Back to Material</Link>
      </Button>
    </section>
  );
}
