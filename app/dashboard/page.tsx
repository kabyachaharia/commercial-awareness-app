import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { CheckoutSuccessBanner } from "./checkout-success-banner";

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

type TopicPackRow = {
  id: string;
  title: string | null;
  slug: string | null;
  icon: string | null;
  total_sections: number | null;
  published_at: string | null;
};

type UserProgressRow = {
  topic_pack_id: string;
  sections_completed: number | null;
  quiz_best_score: number | null;
};

function clampInt(value: unknown) {
  const n = typeof value === "number" ? value : 0;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function isNotStarted(progress: UserProgressRow | null | undefined) {
  if (!progress) return true;
  const completed = clampInt(progress.sections_completed);
  const quiz = progress.quiz_best_score;
  const hasQuizScore = typeof quiz === "number" && Number.isFinite(quiz);
  return completed === 0 && !hasQuizScore;
}

function isPackStudyingFinished(pack: TopicPackRow, progress: UserProgressRow | null | undefined) {
  if (!progress) return false;
  const total = clampInt(pack.total_sections);
  const completed = clampInt(progress.sections_completed);
  if (total <= 0 || completed < total) return false;
  const q = progress.quiz_best_score;
  return typeof q === "number" && Number.isFinite(q) && Math.round(q) >= 100;
}

function continueCardStatus(
  pack: TopicPackRow,
  progress: UserProgressRow | null | undefined,
  variant: "in_progress" | "not_started"
): string {
  if (variant === "not_started") {
    return "Start learning";
  }
  const total = clampInt(pack.total_sections);
  const completed = clampInt(progress?.sections_completed);
  if (total > 0 && completed < total) {
    const currentSection = Math.min(completed + 1, total);
    return `Section ${currentSection} of ${total}`;
  }
  if (typeof progress?.quiz_best_score === "number" && Number.isFinite(progress.quiz_best_score)) {
    const pct = Math.max(0, Math.min(100, Math.round(progress.quiz_best_score)));
    return `Quiz: ${pct}%`;
  }
  if (total > 0 && completed >= total) {
    return "Ready to quiz";
  }
  return "Continue";
}

function progressSortKey(pack: TopicPackRow, progress: UserProgressRow | null | undefined) {
  const completed = clampInt(progress?.sections_completed);
  const q = typeof progress?.quiz_best_score === "number" && Number.isFinite(progress.quiz_best_score)
    ? progress.quiz_best_score
    : 0;
  const pub = pack.published_at ? new Date(pack.published_at).getTime() : 0;
  return completed * 1000 + q + pub / 1e12;
}

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: materials }, { data: packRows, error: packError }] = await Promise.all([
    supabase
      .from("materials")
      .select("id, title, created_at, summary")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("topic_packs")
      .select("id,title,slug,icon,total_sections,published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false }),
  ]);

  if (packError) {
    throw packError;
  }

  const packs = (packRows ?? []) as TopicPackRow[];
  const packIds = packs.map((p) => p.id);

  const progressByPackId = new Map<string, UserProgressRow>();
  if (packIds.length > 0) {
    const { data: progressRows } = await supabase
      .from("user_progress")
      .select("topic_pack_id,sections_completed,quiz_best_score")
      .eq("user_id", user.id)
      .in("topic_pack_id", packIds);

    (progressRows ?? []).forEach((row) => {
      const typed = row as UserProgressRow;
      if (typeof typed.topic_pack_id === "string") {
        progressByPackId.set(typed.topic_pack_id, typed);
      }
    });
  }

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

  const anyPackStarted = packs.some((p) => !isNotStarted(progressByPackId.get(p.id)));

  const inProgressPacks = packs.filter((p) => {
    const pr = progressByPackId.get(p.id);
    return !isNotStarted(pr) && !isPackStudyingFinished(p, pr);
  });
  const notStartedPacks = packs.filter((p) => isNotStarted(progressByPackId.get(p.id)));

  inProgressPacks.sort(
    (a, b) => progressSortKey(b, progressByPackId.get(b.id)) - progressSortKey(a, progressByPackId.get(a.id))
  );
  notStartedPacks.sort((a, b) => {
    const ta = a.published_at ? new Date(a.published_at).getTime() : 0;
    const tb = b.published_at ? new Date(b.published_at).getTime() : 0;
    return tb - ta;
  });

  const continueCards: { pack: TopicPackRow; variant: "in_progress" | "not_started" }[] = [];
  for (const pack of inProgressPacks) {
    if (continueCards.length >= 3) break;
    continueCards.push({ pack, variant: "in_progress" });
  }
  for (const pack of notStartedPacks) {
    if (continueCards.length >= 3) break;
    continueCards.push({ pack, variant: "not_started" });
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-12 pt-16">
      <CheckoutSuccessBanner />

      <div className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
            Continue Studying
          </h2>
          <p className="max-w-xl text-base text-gray-600">Pick up where you left off</p>
        </header>

        {!anyPackStarted ? (
          <div className="rounded-xl border-2 border-black bg-white px-6 py-12 text-center shadow-[8px_8px_0_0_#000]">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-xl border-2 border-black bg-[#BBF7D0]">
              <BookOpen className="size-9 text-black" strokeWidth={1.5} aria-hidden />
            </div>
            <h3 className="text-xl font-black uppercase text-black">Start your first topic</h3>
            <p className="mx-auto mt-3 max-w-md text-gray-600">
              Explore guided topic packs in the library — lessons, quizzes, and flashcards in one place.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/library">Browse topic library</Link>
            </Button>
          </div>
        ) : continueCards.length === 0 ? (
          <div className="rounded-xl border-2 border-black bg-white px-6 py-10 text-center shadow-[8px_8px_0_0_#000]">
            <p className="text-gray-600">
              You&apos;re up to date on your topic packs. Explore the library for more.
            </p>
            <Button asChild className="mt-5">
              <Link href="/dashboard/library">Go to topic library</Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {continueCards.map(({ pack, variant }) => {
              const title = pack.title ?? "Untitled pack";
              const slug = pack.slug ?? "";
              const progress = progressByPackId.get(pack.id);
              const status = continueCardStatus(pack, progress, variant);

              return (
                <li key={pack.id}>
                  <Link
                    href={slug ? `/dashboard/library/${slug}` : "/dashboard/library"}
                    className="group block h-full"
                  >
                    <Card className="h-full rounded-xl border-2 border-black bg-white shadow-[6px_6px_0_0_#000] transition-all duration-200 group-hover:-translate-y-0.5">
                      <CardHeader className="space-y-2 border-b-2 border-black p-4 pb-3">
                        <CardTitle className="text-lg font-black uppercase text-black">
                          {pack.icon ? `${pack.icon} ` : ""}
                          {title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-3">
                        <p className="text-sm font-semibold text-black">{status}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
            Your Materials
          </h1>
          <p className="max-w-xl text-base text-gray-600">
            Open a document to review summaries, take quizzes, and study flashcards.
          </p>
        </header>

        {list.length === 0 ? (
          <div className="rounded-xl border-2 border-black bg-white px-6 py-12 text-center shadow-[8px_8px_0_0_#000]">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-xl border-2 border-black bg-[#FEF08A]">
              <BookOpen className="size-9 text-black" strokeWidth={1.5} aria-hidden />
            </div>
            <h2 className="text-xl font-black uppercase text-black">No materials yet</h2>
            <p className="mx-auto mt-3 max-w-md text-gray-600">
              Upload your first PDF, article, or notes. We&apos;ll generate summaries, quizzes, and flashcards
              automatically.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/upload">Upload your first document</Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {list.map((material) => {
              const hasSummary = Boolean(material.summary?.trim());
              const hasQuiz = quizIds.has(material.id);
              const hasFlashcards = flashIds.has(material.id);

              return (
                <li key={material.id}>
                  <Link
                    href={`/dashboard/materials/${material.id}`}
                    className="group block h-full rounded-xl border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="space-y-1">
                        <h2 className="text-lg font-black uppercase text-black">{material.title}</h2>
                        <p className="text-sm text-gray-500">{formatDate(material.created_at)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full border-2 border-black px-2.5 py-0.5 text-xs font-bold uppercase ${
                            hasSummary ? "bg-[#D1FAE5] text-black" : "bg-gray-100 text-gray-600"
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
                            hasFlashcards ? "bg-[#D1FAE5] text-black" : "bg-gray-100 text-gray-600"
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
      </div>
    </section>
  );
}
