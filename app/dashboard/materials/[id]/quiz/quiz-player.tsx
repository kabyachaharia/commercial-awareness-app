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
      <section className="mx-auto w-full max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quiz</CardTitle>
            <CardDescription>No quiz questions are available for this material yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
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
      <section className="mx-auto w-full max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Complete</CardTitle>
            <CardDescription>
              You scored {score} out of {total} ({percentage}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={retakeQuiz}>Retake Quiz</Button>
            <Button asChild variant="outline">
              <Link href={`/dashboard/materials/${materialId}`}>Back to Material</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selected = selectedAnswers[currentIndex];
  const hasAnswered = Boolean(selected);

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Question {currentIndex + 1} of {total}
          </CardTitle>
          <CardDescription>{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isCorrect = option === currentQuestion.correct_answer;
            const isSelected = option === selected;

            let variant: "default" | "outline" | "destructive" = "outline";
            if (hasAnswered && isCorrect) {
              variant = "default";
            } else if (hasAnswered && isSelected && !isCorrect) {
              variant = "destructive";
            }

            return (
              <Button
                key={option}
                variant={variant}
                className="w-full justify-start text-left whitespace-normal"
                disabled={hasAnswered}
                onClick={() => selectAnswer(option)}
              >
                {option}
              </Button>
            );
          })}

          {hasAnswered ? (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <p className="text-sm font-medium">
                {selected === currentQuestion.correct_answer ? "Correct!" : "Incorrect."}
              </p>
              <p className="text-sm text-muted-foreground">
                Correct answer: <span className="font-medium text-foreground">{currentQuestion.correct_answer}</span>
              </p>
              {currentQuestion.explanation ? (
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              ) : null}
              <div className="flex items-center justify-between pt-1">
                <p className="text-sm text-muted-foreground">
                  Score: {score} / {total}
                </p>
                <Button onClick={nextQuestion}>
                  {currentIndex === total - 1 ? "Finish Quiz" : "Next Question"}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Button asChild variant="ghost">
        <Link href={`/dashboard/materials/${materialId}`}>Back to Material</Link>
      </Button>
    </section>
  );
}
