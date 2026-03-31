import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, CheckCircle2, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserTier } from "@/lib/subscription";
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
  is_free: boolean | null;
  total_sections: number | null;
  published_at: string | null;
};

type UserProgressRow = {
  topic_pack_id: string;
  sections_completed: number | null;
  quiz_best_score: number | null;
  last_studied_at: string | null;
};

function clampInt(value: unknown) {
  const n = typeof value === "number" ? value : 0;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function hasQuizScore(progress: UserProgressRow | null | undefined) {
  if (!progress) return false;
  const q = progress.quiz_best_score;
  return typeof q === "number" && Number.isFinite(q);
}

function isNotStarted(progress: UserProgressRow | null | undefined) {
  if (!progress) return true;
  const completed = clampInt(progress.sections_completed);
  return completed === 0 && !hasQuizScore(progress);
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

function sectionsCompletionRatio(pack: TopicPackRow, progress: UserProgressRow | null | undefined) {
  const total = clampInt(pack.total_sections);
  const completed = clampInt(progress?.sections_completed);
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, completed / total));
}

function isAllSectionsComplete(pack: TopicPackRow, progress: UserProgressRow | null | undefined) {
  const total = clampInt(pack.total_sections);
  const completed = clampInt(progress?.sections_completed);
  if (total <= 0) return false;
  return completed >= total;
}

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [userTier, { data: materials }, { data: packRows, error: packError }] = await Promise.all([
    getUserTier(user.id),
    supabase
      .from("materials")
      .select("id, title, created_at, summary")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("topic_packs")
      .select("id,title,slug,icon,is_free,total_sections,published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false }),
  ]);

  if (packError) {
    throw packError;
  }

  const allPacks = (packRows ?? []) as TopicPackRow[];
  const packs = userTier === "free" ? allPacks.filter((pack) => Boolean(pack.is_free)) : allPacks;
  const packIds = packs.map((p) => p.id);

  const progressByPackId = new Map<string, UserProgressRow>();
  if (packIds.length > 0) {
    const { data: progressRows } = await supabase
      .from("user_progress")
      .select("topic_pack_id,sections_completed,quiz_best_score,last_studied_at")
      .eq("user_id", user.id)
      .in("topic_pack_id", packIds);

    (progressRows ?? []).forEach((row) => {
      const typed = row as UserProgressRow;
      if (typeof typed.topic_pack_id === "string") {
        progressByPackId.set(typed.topic_pack_id, typed);
      }
    });
  }

  let packsStarted = 0;
  let packsCompleted = 0;
  let quizScoreSum = 0;
  let quizScoreCount = 0;
  let totalSectionsCompleted = 0;

  for (const pack of packs) {
    const progress = progressByPackId.get(pack.id);
    if (!isNotStarted(progress)) {
      packsStarted += 1;
    }
    if (isAllSectionsComplete(pack, progress)) {
      packsCompleted += 1;
    }
    if (hasQuizScore(progress)) {
      quizScoreSum += progress!.quiz_best_score as number;
      quizScoreCount += 1;
    }
    totalSectionsCompleted += clampInt(progressByPackId.get(pack.id)?.sections_completed);
  }

  const averageQuizScore = quizScoreCount > 0 ? quizScoreSum / quizScoreCount : null;

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

  const reviewPacks = packs
    .map((pack) => {
      const progress = progressByPackId.get(pack.id);
      if (!isAllSectionsComplete(pack, progress)) return null;
      if (!hasQuizScore(progress)) return null;
      const last = progress?.last_studied_at ?? null;
      if (!last) return null;

      const daysSinceStudy = Math.floor((Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24));
      if (!Number.isFinite(daysSinceStudy) || daysSinceStudy <= 7) return null;

      return { pack, progress, daysSinceStudy };
    })
    .filter((x): x is { pack: TopicPackRow; progress: UserProgressRow; daysSinceStudy: number } => x !== null)
    .sort((a, b) => b.daysSinceStudy - a.daysSinceStudy)
    .slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 pt-10">
      <CheckoutSuccessBanner />
      <div>
        <h1 className="text-[22px] font-medium text-black">Welcome back</h1>
        <p className="text-sm text-gray-500">Here&apos;s your study snapshot</p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#E8E4F7] px-5 py-5">
          <div className="mb-10 flex size-11 items-center justify-center rounded-xl bg-white">
            <BookOpen className="size-5 text-[#6B5CE7]" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-medium text-[#2D2459]">{packsStarted} packs started</p>
          <div className="mt-3 flex items-center gap-3.5 border-t border-[#6B5CE7]/20 pt-2.5">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[#6B5CE7]" />
              <span className="text-xs text-[#4A3D8F]">{totalSectionsCompleted} sections</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-[#6B5CE7]" />
              <span className="text-xs text-[#4A3D8F]">{quizScoreCount} quizzes</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#FCE8D9] px-5 py-5">
          <div className="mb-10 flex size-11 items-center justify-center rounded-xl bg-white">
            <CheckCircle2 className="size-5 text-[#E07830]" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-medium text-[#6B3A14]">{packsCompleted} packs completed</p>
          <div className="mt-3 flex items-center gap-3.5 border-t border-[#E07830]/20 pt-2.5">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[#E07830]" />
              <span className="text-xs text-[#8B4D22]">{packsCompleted * 12} sections</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-[#E07830]" />
              <span className="text-xs text-[#8B4D22]">
                {averageQuizScore != null ? `${Math.round(averageQuizScore)}% avg` : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#DDF0D9] px-5 py-5">
          <div className="mb-10 flex size-11 items-center justify-center rounded-xl bg-white">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22 12h-4l-3 9L9 3l-3 9H2"
                stroke="#4CAF50"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-[#1B5E20]">
            {averageQuizScore != null ? `${Math.round(averageQuizScore)}% avg quiz score` : "No quizzes yet"}
          </p>
          <div className="mt-3 flex items-center gap-3.5 border-t border-[#4CAF50]/20 pt-2.5">
            <div className="flex items-center gap-1.5">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 20V10M12 20V4M6 20v-6"
                  stroke="#4CAF50"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-xs text-[#2E7D32]">{quizScoreCount > 1 ? "Improving" : "Keep going"}</span>
            </div>
          </div>
        </div>
      </div>

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

              const totalSections = clampInt(pack.total_sections);
              const ratio = sectionsCompletionRatio(pack, progress);
              const barPercent =
                variant === "not_started" && !progress ? 0 : Math.round(Math.max(0, Math.min(100, ratio * 100)));

              const completedSections = clampInt(progress?.sections_completed);
              const quizScore = hasQuizScore(progress)
                ? Math.max(0, Math.min(100, Math.round(progress!.quiz_best_score as number)))
                : null;

              let primaryLabel = status;
              let secondaryLabel: string | null = null;
              let completedState = false;

              if (isNotStarted(progress)) {
                primaryLabel = totalSections > 0 ? "Not started" : "Not started";
                secondaryLabel = totalSections > 0 ? `0 of ${totalSections} sections` : null;
              } else if (totalSections > 0 && completedSections < totalSections) {
                const currentSection = Math.min(completedSections + 1, totalSections);
                primaryLabel = "In progress";
                secondaryLabel = `Section ${currentSection} of ${totalSections}`;
              } else if (totalSections > 0 && completedSections >= totalSections && !hasQuizScore(progress)) {
                primaryLabel = "Ready to quiz";
                secondaryLabel = "All sections complete — take the quiz!";
              } else if (quizScore != null) {
                primaryLabel = "Completed";
                secondaryLabel = `Quiz: ${quizScore}%`;
                completedState = true;
              }

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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {completedState ? (
                              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden />
                            ) : null}
                            <p className="text-sm font-semibold text-black">{primaryLabel}</p>
                          </div>
                          {secondaryLabel ? (
                            <p className="text-xs font-medium text-gray-700">{secondaryLabel}</p>
                          ) : null}
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full border-2 border-black bg-white">
                            <div
                              className="h-full rounded-full bg-[#FACC15] transition-all duration-300"
                              style={{ width: `${barPercent}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {reviewPacks.length > 0 ? (
        <div className="space-y-6">
          <header className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">Time to Review</h2>
            <p className="max-w-xl text-base text-gray-600">
              These packs are due for revision to lock in your knowledge
            </p>
          </header>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviewPacks.map(({ pack, progress, daysSinceStudy }) => {
              const title = pack.title ?? "Untitled pack";
              const slug = pack.slug ?? "";
              const quizScore = Math.max(0, Math.min(100, Math.round(progress.quiz_best_score as number)));

              return (
                <li key={pack.id}>
                  <Link href={slug ? `/dashboard/library/${slug}` : "/dashboard/library"} className="group block h-full">
                    <Card className="h-full rounded-xl border-2 border-black bg-white shadow-[6px_6px_0_0_#000] transition-all duration-200 group-hover:-translate-y-0.5">
                      <CardHeader className="space-y-2 border-b-2 border-black p-4 pb-3">
                        <CardTitle className="text-lg font-black uppercase text-black">
                          {pack.icon ? `${pack.icon} ` : ""}
                          {title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="size-4 shrink-0 text-amber-700" aria-hidden />
                            <p className="text-sm font-semibold text-amber-700">Studied {daysSinceStudy} days ago</p>
                          </div>
                          <p className="text-xs text-gray-600">Last quiz: {quizScore}%</p>
                          <div className="flex justify-end pt-2">
                            <p className="text-xs font-bold uppercase text-amber-600">Review now</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

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
