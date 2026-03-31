"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

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

export function QuizPlayer({ materialId, questions }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState(false);

  const total = questions.length;
  const isComplete = total > 0 && currentIndex >= total;
  const score = useMemo(() => {
    return questions.reduce((acc, question, index) => {
      return selectedAnswers[index] === question.correct_answer ? acc + 1 : acc;
    }, 0);
  }, [questions, selectedAnswers]);

  function selectAnswer(answer: string) {
    if (revealed) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: answer }));
    setRevealed(true);
  }

  function goNext() {
    if (!revealed) return;
    setRevealed(false);
    setCurrentIndex((prev) => prev + 1);
  }

  function goPrev() {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
    setRevealed(Boolean(selectedAnswers[currentIndex - 1]));
  }

  function retakeQuiz() {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setRevealed(false);
  }

  if (total === 0) {
    return (
      <section className="mx-auto w-full max-w-3xl space-y-4 px-4 pt-3 sm:px-6">
        <Button asChild variant="ghost" className="-ml-3 h-auto justify-start px-3 py-1 text-sm text-gray-600 hover:text-black">
          <Link href={`/dashboard/materials/${materialId}`}>← Back to Material</Link>
        </Button>
        <div className="overflow-hidden rounded-xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
          <p className="text-base text-gray-600">No quiz questions available for this material yet.</p>
        </div>
      </section>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / total) * 100);
    return (
      <section className="mx-auto w-full max-w-3xl space-y-4 px-4 pt-3 sm:px-6">
        <Button asChild variant="ghost" className="-ml-3 h-auto justify-start px-3 py-1 text-sm text-gray-600 hover:text-black">
          <Link href={`/dashboard/materials/${materialId}`}>← Back to Material</Link>
        </Button>
        <div className="overflow-hidden rounded-xl border-2 border-black bg-[#E8E4F7] p-6 shadow-[6px_6px_0_0_#000]">
          <p className="text-sm font-bold uppercase tracking-wider text-[#4A3D8F]">Quiz complete</p>
          <p className="mt-2 text-5xl font-black tabular-nums text-[#2D2459]">{percentage}%</p>
          <p className="mt-2 text-base text-[#4A3D8F]">
            You scored <span className="font-semibold text-[#2D2459]">{score}</span> out of{" "}
            <span className="font-semibold text-[#2D2459]">{total}</span>
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            onClick={retakeQuiz}
            className="h-11 rounded-full border-2 border-black bg-[#E8E4F7] text-sm font-bold text-black shadow-none hover:bg-[#DDD8F0]"
          >
            Retake Quiz
          </Button>
          <Button asChild className="h-11 rounded-full border-2 border-black bg-[#FCE8D9] text-sm font-bold text-black shadow-none hover:bg-[#F5D5C0]">
            <Link href={`/dashboard/materials/${materialId}`}>Back to Material</Link>
          </Button>
        </div>
      </section>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selected = selectedAnswers[currentIndex];
  const hasAnswered = revealed && Boolean(selected);
  const progressPct = ((currentIndex + 1) / total) * 100;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 px-4 pt-3 sm:px-6">
      <Button asChild variant="ghost" className="-ml-3 h-auto justify-start px-3 py-1 text-sm text-gray-600 hover:text-black">
        <Link href={`/dashboard/materials/${materialId}`}>← Back to Material</Link>
      </Button>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
          <span>
            Question <span className="font-semibold text-black">{currentIndex + 1}</span> of {total}
          </span>
          <span className="tabular-nums text-gray-500">Score {score}/{total}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full border-2 border-black bg-white">
          <div
            className="h-full rounded-full bg-[#FACC15] transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
        <div className="space-y-4 p-5">
          <p className="text-xs font-medium text-gray-500">Question {currentIndex + 1} of {total}</p>
          <h3 className="text-base font-black uppercase leading-snug text-black">{currentQuestion.question}</h3>
          <ul className="space-y-2">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correct_answer;
              const isSelected = option === selected;
              const showResult = hasAnswered;

              return (
                <li key={option}>
                  <button
                    type="button"
                    disabled={hasAnswered}
                    onClick={() => selectAnswer(option)}
                    className={[
                      "w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      !showResult ? "border-black bg-white cursor-pointer hover:bg-gray-50" : "",
                      showResult && isCorrect ? "border-black bg-[#DDF0D9]" : "",
                      showResult && isSelected && !isCorrect ? "border-black bg-[#FCE8D9]" : "",
                      showResult && !isCorrect && !isSelected ? "border-black/50 bg-gray-100 text-gray-500" : "",
                    ].join(" ")}
                  >
                    {option}
                  </button>
                </li>
              );
            })}
          </ul>

          {hasAnswered && (
            <div className="rounded-xl border-2 border-black bg-[#FEF9C3] px-3 py-2.5 text-sm text-gray-900">
              <p className="font-bold text-black">
                {selected === currentQuestion.correct_answer ? "Correct." : "Incorrect."}
              </p>
              <p className="mt-2 leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          )}

          {hasAnswered && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-black disabled:opacity-30"
                onClick={goPrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-black"
                onClick={goNext}
              >
                {currentIndex + 1 >= total ? "See results" : "Next"}
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
