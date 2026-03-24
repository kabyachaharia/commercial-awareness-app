import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

function formatDate(iso: string | null) {
  if (!iso) {
    return "Unknown date";
  }
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: materials } = await supabase
    .from("materials")
    .select("id, title, created_at, summary")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = materials ?? [];
  const ids = list.map((m) => m.id);

  let quizIds = new Set<string>();
  let flashIds = new Set<string>();
  if (ids.length > 0) {
    const [{ data: quizRows }, { data: flashRows }] = await Promise.all([
      supabase.from("quizzes").select("material_id").in("material_id", ids),
      supabase.from("flashcards").select("material_id").in("material_id", ids),
    ]);
    quizIds = new Set((quizRows ?? []).map((r) => r.material_id as string));
    flashIds = new Set((flashRows ?? []).map((r) => r.material_id as string));
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
          Your Materials
        </h1>
        <p className="max-w-xl text-base text-gray-600">
          Open a document to review summaries, take quizzes, and study flashcards.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="rounded-2xl border-2 border-black bg-white px-8 py-16 text-center shadow-[8px_8px_0_0_#000]">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border-2 border-black bg-[#FEF08A]">
            <BookOpen className="size-9 text-black" strokeWidth={1.5} aria-hidden />
          </div>
          <h2 className="text-xl font-black uppercase text-black">
            No materials yet
          </h2>
          <p className="mx-auto mt-3 max-w-md text-gray-600">
            Upload your first PDF, article, or notes. We&apos;ll generate summaries, quizzes, and flashcards
            automatically.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/dashboard/upload">Upload your first document</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {list.map((material) => {
            const hasSummary = Boolean(material.summary?.trim());
            const hasQuiz = quizIds.has(material.id);
            const hasFlashcards = flashIds.has(material.id);

            return (
              <li key={material.id}>
                <Link
                  href={`/dashboard/materials/${material.id}`}
                  className="group block h-full rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000] transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                      <h2 className="text-lg font-black uppercase text-black">
                        {material.title}
                      </h2>
                      <p className="text-sm text-gray-500">{formatDate(material.created_at)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border-2 border-black px-2.5 py-0.5 text-xs font-bold uppercase ${
                          hasSummary
                            ? "bg-[#D1FAE5] text-black"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {hasSummary ? "Has summary" : "No summary"}
                      </span>
                      <span
                        className={`inline-flex rounded-full border-2 border-black px-2.5 py-0.5 text-xs font-bold uppercase ${
                          hasQuiz ? "bg-[#D1FAE5] text-black" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {hasQuiz ? "Has quiz" : "No quiz"}
                      </span>
                      <span
                        className={`inline-flex rounded-full border-2 border-black px-2.5 py-0.5 text-xs font-bold uppercase ${
                          hasFlashcards
                            ? "bg-[#D1FAE5] text-black"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {hasFlashcards ? "Has flashcards" : "No flashcards"}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
