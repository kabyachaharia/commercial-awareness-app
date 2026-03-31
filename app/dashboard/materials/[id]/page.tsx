import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { MaterialDetailClient } from "./material-detail-client";

export const dynamic = "force-dynamic";

type MaterialDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MaterialDetailPage({ params }: MaterialDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: material } = await supabase
    .from("materials")
    .select("id, title, summary, created_at")
    .eq("id", id)
    .single();

  if (!material) {
    notFound();
  }

  const { data: quizRows } = await supabase.from("quizzes").select("id").eq("material_id", material.id).limit(1);
  const { data: flashcardRows } = await supabase.from("flashcards").select("id").eq("material_id", material.id).limit(1);

  const uploadDate = material.created_at
    ? new Date(material.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 px-4 pb-2 pt-3 sm:px-6">
      <MaterialDetailClient
        materialId={material.id}
        title={material.title}
        summary={material.summary}
        uploadDate={uploadDate}
        hasQuiz={Boolean(quizRows?.[0])}
        hasFlashcards={Boolean(flashcardRows?.[0])}
      />
    </section>
  );
}
