import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { GenerateButton } from "./generate-button";

type MaterialDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MaterialDetailPage({ params }: MaterialDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: material } = await supabase.from("materials").select("id, title, summary, created_at").eq("id", id).single();

  if (!material) {
    notFound();
  }

  const { data: quizRows } = await supabase.from("quizzes").select("id").eq("material_id", material.id).limit(1);

  const { data: flashcardRows } = await supabase.from("flashcards").select("id").eq("material_id", material.id).limit(1);

  const quiz = quizRows?.[0] ?? null;
  const flashcards = flashcardRows?.[0] ?? null;
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
              <GenerateButton materialId={material.id} type="summary" label="Generate Summary" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiz</CardTitle>
            <CardDescription>Test your understanding with AI-generated questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz ? (
              <Button asChild>
                <Link href={`/dashboard/materials/${material.id}/quiz`}>Take Quiz</Link>
              </Button>
            ) : (
              <GenerateButton materialId={material.id} type="quiz" label="Generate Quiz" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flashcards</CardTitle>
            <CardDescription>Practice key ideas with rapid recall prompts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {flashcards ? (
              <Button asChild>
                <Link href={`/dashboard/materials/${material.id}/flashcards`}>Study Flashcards</Link>
              </Button>
            ) : (
              <GenerateButton materialId={material.id} type="flashcards" label="Generate Flashcards" />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
