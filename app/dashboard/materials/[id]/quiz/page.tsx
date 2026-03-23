import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { QuizPlayer, type QuizQuestion } from "./quiz-player";

type QuizPageProps = {
  params: Promise<{ id: string }>;
};

function normalizeQuestions(value: unknown): QuizQuestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const question = item as Partial<QuizQuestion>;
      if (
        typeof question.question !== "string" ||
        !Array.isArray(question.options) ||
        typeof question.correct_answer !== "string"
      ) {
        return null;
      }

      return {
        question: question.question,
        type: question.type === "true_false" ? "true_false" : "multiple_choice",
        options: question.options.filter((option): option is string => typeof option === "string"),
        correct_answer: question.correct_answer,
        explanation: typeof question.explanation === "string" ? question.explanation : "",
      } satisfies QuizQuestion;
    })
    .filter((question): question is QuizQuestion => question !== null);
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quizRows } = await supabase.from("quizzes").select("id, questions").eq("material_id", id).limit(1);

  const quiz = quizRows?.[0];
  if (!quiz) {
    notFound();
  }

  const questions = normalizeQuestions(quiz.questions);

  return <QuizPlayer materialId={id} questions={questions} />;
}
