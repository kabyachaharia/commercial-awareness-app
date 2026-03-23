import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { GenerateButton } from "./generate-actions";

type MaterialDetailPageProps = {
  params: Promise<{ id: string }>;
};

type QuizRecord = {
  id: string;
  question: string;
  type: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
};

type FlashcardRecord = {
  id: string;
  front: string;
  back: string;
};

export default async function MaterialDetailPage({ params }: MaterialDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: material } = await supabase
    .from("materials")
    .select("id, title, summary, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!material) {
    notFound();
  }

  const { data: quizRows } = await supabase
    .from("quizzes")
    .select("id, question, type, options, correct_answer, explanation")
    .eq("material_id", material.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const { data: flashcardRows } = await supabase
    .from("flashcards")
    .select("id, front, back")
    .eq("material_id", material.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const quizzes = (quizRows ?? []) as QuizRecord[];
  const flashcards = (flashcardRows ?? []) as FlashcardRecord[];
  const uploadDate = material.created_at ? new Date(material.created_at).toLocaleDateString() : "Unknown";

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">{material.title}</h1>
        <p className="text-sm text-slate-600">Uploaded on {uploadDate}</p>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Quick commercial-awareness focused overview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {material.summary ? (
              <article className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{material.summary}</article>
            ) : (
              <GenerateButton materialId={material.id} target="summary" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiz</CardTitle>
            <CardDescription>Test your understanding with AI-generated questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizzes.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-700">
                  {quizzes.length} questions are ready. Continue to the quiz interface to attempt them.
                </p>
                <Button asChild>
                  <Link href={`/dashboard/materials/${material.id}/quiz`}>Take Quiz</Link>
                </Button>
              </div>
            ) : (
              <GenerateButton materialId={material.id} target="quiz" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flashcards</CardTitle>
            <CardDescription>Practice key ideas with rapid recall prompts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {flashcards.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-700">{flashcards.length} flashcards are ready for revision.</p>
                <Button asChild>
                  <Link href={`/dashboard/materials/${material.id}/flashcards`}>Study Flashcards</Link>
                </Button>
              </div>
            ) : (
              <GenerateButton materialId={material.id} target="flashcards" />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
