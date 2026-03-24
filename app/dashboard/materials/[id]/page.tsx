import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Layers, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { GenerateButton } from "./generate-actions";

const ctaClassName = "px-6";

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
  const uploadDate = material.created_at ? new Date(material.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "Unknown";

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8">
      <header className="space-y-2 border-b-2 border-black pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
          {material.title}
        </h1>
        <p className="text-sm text-gray-500">Uploaded on {uploadDate}</p>
      </header>

      <div className="grid gap-4">
        <Card className="overflow-hidden rounded-xl bg-white">
          <CardHeader className="space-y-3 border-b-2 border-black bg-[#FEF08A]/40 pb-3">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-black">
                <FileText className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-xl">Summary</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Quick commercial-awareness focused overview.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {material.summary ? (
              <article className="whitespace-pre-wrap rounded-xl border-2 border-black bg-white px-5 py-5 text-[15px] leading-relaxed text-gray-800">
                {material.summary}
              </article>
            ) : (
              <GenerateButton materialId={material.id} target="summary" />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl bg-white">
          <CardHeader className="space-y-3 border-b-2 border-black bg-[#D1FAE5]/40 pb-3">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-black">
                <ListChecks className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-xl">Quiz</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Test your understanding with AI-generated questions.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {quiz ? (
              <Button asChild className={ctaClassName}>
                <Link href={`/dashboard/materials/${material.id}/quiz`}>Take Quiz</Link>
              </Button>
            ) : (
              <GenerateButton materialId={material.id} target="quiz" />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl bg-white">
          <CardHeader className="space-y-3 border-b-2 border-black bg-[#FED7AA]/40 pb-3">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-black">
                <Layers className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-xl">Flashcards</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Practice key ideas with rapid recall prompts.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {flashcards ? (
              <Button asChild className={ctaClassName}>
                <Link href={`/dashboard/materials/${material.id}/flashcards`}>Study Flashcards</Link>
              </Button>
            ) : (
              <GenerateButton materialId={material.id} target="flashcards" />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
