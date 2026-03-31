import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

export default async function DocumentsPage() {
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
    <section className="mx-auto w-full max-w-5xl space-y-6 pt-6">
      <header>
        <h1
          className="font-[family-name:var(--font-epilogue)] text-xl font-black text-black"
          style={{ textTransform: "none" }}
        >
          My documents
        </h1>
        <p className="text-sm text-gray-500">
          All your uploaded documents in one place. Open a document to review summaries, quizzes, and
          flashcards.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-[#E8E4F7]">
            <BookOpen className="size-6 text-[#6B5CE7]" strokeWidth={1.5} />
          </div>
          <h2 className="text-base font-medium text-black">No documents yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Upload your first document and we&apos;ll generate summaries, quizzes, and flashcards
            automatically.
          </p>
          <Button
            asChild
            className="mt-5 rounded-xl bg-black px-5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Link href="/dashboard/upload">Upload your first document</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((material) => {
            const hasSummary = Boolean(material.summary?.trim());
            const hasQuiz = quizIds.has(material.id);
            const hasFlashcards = flashIds.has(material.id);

            return (
              <li key={material.id}>
                <Link href={`/dashboard/materials/${material.id}`} className="group block h-full">
                  <div className="h-full rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm">
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#E8E4F7]">
                        <svg
                          className="size-4 text-[#6B5CE7]"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-black">
                          {material.title}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {formatDate(material.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {hasSummary ? (
                        <span className="rounded-md bg-[#DDF0D9] px-2 py-0.5 text-[10px] font-medium text-[#2E7D32]">
                          Summary
                        </span>
                      ) : (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                          No summary
                        </span>
                      )}
                      {hasQuiz ? (
                        <span className="rounded-md bg-[#DDF0D9] px-2 py-0.5 text-[10px] font-medium text-[#2E7D32]">
                          Quiz
                        </span>
                      ) : (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                          No quiz
                        </span>
                      )}
                      {hasFlashcards ? (
                        <span className="rounded-md bg-[#DDF0D9] px-2 py-0.5 text-[10px] font-medium text-[#2E7D32]">
                          Flashcards
                        </span>
                      ) : (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                          No flashcards
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
          <li>
            <Link href="/dashboard/upload" className="group block h-full">
              <div
                className="flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-4 transition-all duration-200 hover:border-gray-400 hover:shadow-sm"
                style={{ minHeight: "100px" }}
              >
                <div className="text-center">
                  <div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-[10px] bg-gray-100">
                    <svg
                      className="size-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className="text-[12px] text-gray-500">Upload a document</p>
                </div>
              </div>
            </Link>
          </li>
        </ul>
      )}
    </section>
  );
}

