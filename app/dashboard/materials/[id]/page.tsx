import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Layers, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { GenerateButton } from "./generate-button";

const ctaClassName =
  "rounded-lg bg-indigo-500 px-6 font-semibold text-white shadow-sm transition-all duration-300 hover:translate-y-[-1px] hover:bg-indigo-400";

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
    <section className="mx-auto w-full max-w-5xl space-y-10">
      <header className="space-y-2 border-b border-slate-200/80 pb-8">
        <h1 className="[font-family:var(--font-sora)] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {material.title}
        </h1>
        <p className="text-sm text-slate-500">Uploaded on {uploadDate}</p>
      </header>

      <div className="grid gap-6">
        <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <CardHeader className="space-y-3 border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FileText className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <CardTitle className="[font-family:var(--font-sora)] text-xl font-semibold text-slate-900">Summary</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Quick commercial-awareness focused overview.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {material.summary ? (
              <article className="rounded-xl border border-slate-100 bg-slate-50/80 px-5 py-6 text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                {material.summary}
              </article>
            ) : (
              <GenerateButton materialId={material.id} type="summary" label="Generate Summary" />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <CardHeader className="space-y-3 border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <ListChecks className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <CardTitle className="[font-family:var(--font-sora)] text-xl font-semibold text-slate-900">Quiz</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Test your understanding with AI-generated questions.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {quiz ? (
              <Button asChild className={ctaClassName}>
                <Link href={`/dashboard/materials/${material.id}/quiz`}>Take Quiz</Link>
              </Button>
            ) : (
              <GenerateButton materialId={material.id} type="quiz" label="Generate Quiz" />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <CardHeader className="space-y-3 border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Layers className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <CardTitle className="[font-family:var(--font-sora)] text-xl font-semibold text-slate-900">Flashcards</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Practice key ideas with rapid recall prompts.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {flashcards ? (
              <Button asChild className={ctaClassName}>
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
