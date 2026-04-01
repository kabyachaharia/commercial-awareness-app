import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, CheckCircle2, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
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

  const completedPackSections = packs
    .filter((pack) => isAllSectionsComplete(pack, progressByPackId.get(pack.id)))
    .reduce((sum, pack) => sum + clampInt(pack.total_sections), 0);

  const averageQuizScore = quizScoreCount > 0 ? quizScoreSum / quizScoreCount : null;

  const barChartPacks = packs
    .filter((p) => !isNotStarted(progressByPackId.get(p.id)))
    .slice(0, 5)
    .map((p) => {
      const pr = progressByPackId.get(p.id);
      const completed = clampInt(pr?.sections_completed);
      const total = clampInt(p.total_sections);
      const score = hasQuizScore(pr) ? Math.round(pr!.quiz_best_score as number) : 0;
      const shortName = (p.title ?? "Pack").split(" ").slice(0, 2).join(" ");
      return { shortName, completed, total, score };
    });

  const maxBarValue = Math.max(1, ...barChartPacks.map((b) => b.completed));

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
    <section className="mx-auto w-full max-w-5xl space-y-5 pt-6">
      <CheckoutSuccessBanner />
      <div>
        <h1
          className="font-[family-name:var(--font-epilogue)] text-xl font-black text-black"
          style={{ textTransform: "none" }}
        >
          Welcome back
        </h1>
        <p className="text-sm text-gray-500">Here&apos;s your study snapshot</p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#E8E4F7] px-5 py-3.5">
          <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-white">
            <BookOpen className="size-5 text-[#6B5CE7]" strokeWidth={1.5} />
          </div>
          <p className="font-[family-name:var(--font-epilogue)] text-[13px] font-medium text-[#2D2459]">
            {packsStarted} packs started
          </p>
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

        <div className="rounded-2xl bg-[#FCE8D9] px-5 py-3.5">
          <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-white">
            <CheckCircle2 className="size-5 text-[#E07830]" strokeWidth={1.5} />
          </div>
          <p className="font-[family-name:var(--font-epilogue)] text-[13px] font-medium text-[#6B3A14]">
            {packsCompleted} packs completed
          </p>
          <div className="mt-3 flex items-center gap-3.5 border-t border-[#E07830]/20 pt-2.5">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[#E07830]" />
              <span className="text-xs text-[#8B4D22]">{completedPackSections} sections</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-[#E07830]" />
              <span className="text-xs text-[#8B4D22]">
                {averageQuizScore != null ? `${Math.round(averageQuizScore)}% avg` : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#DDF0D9] px-5 py-3.5">
          <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-white">
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
          <p className="font-[family-name:var(--font-epilogue)] text-[13px] font-medium text-[#1B5E20]">
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

      <div className="grid gap-3.5 sm:grid-cols-[1.25fr_0.75fr]">
        {/* Study Activity Bar Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-[family-name:var(--font-epilogue)] text-[15px] font-black text-black">Study activity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-sm bg-[#E07830]" />
                <span className="text-[11px] text-gray-500">Sections</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-sm bg-[#FCE8D9]" />
                <span className="text-[11px] text-gray-500">Quizzes</span>
              </div>
            </div>
          </div>
          {barChartPacks.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-gray-400">Complete your first pack to see activity</p>
            </div>
          ) : (
            <div className="flex items-end gap-3 pt-4" style={{ height: "120px" }}>
              {barChartPacks.map((bar, i) => {
                const sectionHeight = Math.max(8, (bar.completed / maxBarValue) * 80);
                const quizHeight = bar.score > 0 ? Math.max(6, (bar.score / 100) * 40) : 0;
                return (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-0.5"
                    style={{ paddingBottom: "24px", position: "relative" }}
                  >
                    <div className="flex w-[60%] flex-col items-stretch gap-px">
                      <div className="rounded-t bg-[#E07830]" style={{ height: `${sectionHeight}px` }} />
                      {quizHeight > 0 ? (
                        <div className="rounded-b bg-[#FCE8D9]" style={{ height: `${quizHeight}px` }} />
                      ) : null}
                    </div>
                    <span className="absolute bottom-0 text-[10px] text-gray-400">{bar.shortName}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Performance Gauge */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-4">
          <p className="mb-1 self-start font-[family-name:var(--font-epilogue)] text-[15px] font-black text-black">
            Performance
          </p>
          <div className="relative mb-2" style={{ width: "120px", height: "120px" }}>
            <svg viewBox="0 0 120 120" width="120" height="120">
              <circle cx="60" cy="60" r="48" fill="none" stroke="#E8E4F7" strokeWidth="12" />
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="#6B5CE7"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${
                  2 * Math.PI * 48 * (1 - (averageQuizScore != null ? averageQuizScore / 100 : 0))
                }`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[26px] font-medium text-black">
                {averageQuizScore != null ? `${Math.round(averageQuizScore)}%` : "—"}
              </p>
              <p className="text-[11px] text-gray-500">Avg score</p>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-4">
            <div className="text-center">
              <p className="text-base font-medium text-black">{quizScoreCount}</p>
              <p className="text-[11px] text-gray-500">Quizzes</p>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-base font-medium text-black">{totalSectionsCompleted}</p>
              <p className="text-[11px] text-gray-500">Sections</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Continue Studying - left side */}
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <h2
              className="font-[family-name:var(--font-epilogue)] text-[15px] font-black text-black"
              style={{ textTransform: "none" }}
            >
              Continue studying
            </h2>
            <Link href="/dashboard/library" className="text-[13px] font-bold text-gray-500 hover:text-gray-700">
              View library →
            </Link>
          </div>

          {!anyPackStarted ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-[#E8E4F7]">
                <BookOpen className="size-6 text-[#6B5CE7]" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-medium text-black">Start your first topic</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Explore guided topic packs in the library — lessons, quizzes, and flashcards in one place.
              </p>
              <Button
                asChild
                className="mt-5 rounded-xl bg-black px-5 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Link href="/dashboard/library">Browse topic library</Link>
              </Button>
            </div>
          ) : continueCards.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-[#DDF0D9]">
                <CheckCircle2 className="size-6 text-[#2E7D32]" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-medium text-black">All caught up</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                You&apos;re up to date on your topic packs. Explore the library for more.
              </p>
              <Button
                asChild
                className="mt-5 rounded-xl bg-black px-5 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Link href="/dashboard/library">Go to topic library</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {continueCards.map(({ pack, variant }, index) => {
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

                const iconBgClasses = ["bg-[#FCE8D9]", "bg-[#E8E4F7]", "bg-[#DDF0D9]"];
                const iconBgClass = iconBgClasses[index % iconBgClasses.length] ?? "bg-[#FCE8D9]";

                return (
                  <li key={pack.id}>
                    <Link href={slug ? `/dashboard/library/${slug}` : "/dashboard/library"} className="group block">
                      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-gray-300 hover:shadow-sm">
                        <div className={`flex size-9 items-center justify-center rounded-[10px] ${iconBgClass} text-base`}>
                          {pack.icon ?? "📚"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-black">{title}</p>
                          <p
                            className={`text-[11px] ${
                              completedState
                                ? "text-[#2E7D32]"
                                : primaryLabel === "Ready to quiz"
                                  ? "text-[#E07830]"
                                  : primaryLabel === "In progress"
                                    ? "text-[#1565C0]"
                                    : "text-gray-500"
                            }`}
                          >
                            {primaryLabel}
                            {secondaryLabel && !completedState ? ` · ${secondaryLabel}` : ""}
                            {completedState && quizScore != null ? ` · Quiz: ${quizScore}%` : ""}
                          </p>
                        </div>

                        <div className="flex w-[42%] min-w-[140px] items-center gap-2">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${barPercent}%`,
                                backgroundColor: completedState
                                  ? "#4CAF50"
                                  : primaryLabel === "Ready to quiz"
                                    ? "#E07830"
                                    : primaryLabel === "In progress"
                                      ? "#1565C0"
                                      : "#E0E0E0",
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {clampInt(progress?.sections_completed)}/{totalSections}
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

        {/* Your Documents - right side */}
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <p className="font-[family-name:var(--font-epilogue)] text-[15px] font-black text-black">Your documents</p>
            <Link href="/dashboard/documents" className="text-[13px] font-bold text-gray-500 hover:text-gray-700">
              View all →
            </Link>
          </div>

          {list.length === 0 ? (
            <div className="space-y-2">
              <Link
                href="/dashboard/upload"
                className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center transition-all hover:border-gray-400 hover:shadow-sm"
              >
                <div>
                  <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-[10px] bg-gray-100">
                    <svg
                      className="size-4.5 text-gray-400"
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
                  <p className="text-[13px] text-gray-500">Upload a document</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {list.slice(0, 2).map((material) => {
                const hasSummary = Boolean(material.summary?.trim());
                const hasQuiz = quizIds.has(material.id);
                const hasFlashcards = flashIds.has(material.id);

                return (
                  <Link
                    key={material.id}
                    href={`/dashboard/materials/${material.id}`}
                    className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#E8E4F7]">
                      <svg
                        className="size-4.5 text-[#6B5CE7]"
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
                      <p className="truncate text-[14px] font-medium text-black">{material.title}</p>
                      <p className="text-[12px] text-gray-500">{formatDate(material.created_at)}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {hasSummary ? (
                          <span className="rounded-md bg-[#DDF0D9] px-2 py-0.5 text-[10px] font-medium text-[#2E7D32]">
                            Summary
                          </span>
                        ) : null}
                        {hasQuiz ? (
                          <span className="rounded-md bg-[#DDF0D9] px-2 py-0.5 text-[10px] font-medium text-[#2E7D32]">
                            Quiz
                          </span>
                        ) : null}
                        {hasFlashcards ? (
                          <span className="rounded-md bg-[#DDF0D9] px-2 py-0.5 text-[10px] font-medium text-[#2E7D32]">
                            Flashcards
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
              {list.length < 2 ? (
                <Link
                  href="/dashboard/upload"
                  className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center transition-all hover:border-gray-400 hover:shadow-sm"
                >
                  <div>
                    <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-[10px] bg-gray-100">
                      <svg
                        className="size-4.5 text-gray-400"
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
                    <p className="text-[13px] text-gray-500">Upload a document</p>
                  </div>
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {reviewPacks.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[15px] font-medium text-black">Time to review</p>
          <div className="space-y-2.5">
            {reviewPacks.map(({ pack, progress, daysSinceStudy }) => {
              const title = pack.title ?? "Untitled pack";
              const slug = pack.slug ?? "";
              const quizScore = Math.max(0, Math.min(100, Math.round(progress.quiz_best_score as number)));

              return (
                <Link
                  key={pack.id}
                  href={slug ? `/dashboard/library/${slug}` : "/dashboard/library"}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#FCE8D9] text-base">
                      {pack.icon ?? "📚"}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-black">{title}</p>
                      <p className="text-[12px] text-[#854F0B]">
                        Studied {daysSinceStudy} days ago · Quiz: {quizScore}%
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#FAEEDA] px-3.5 py-1.5 text-[12px] font-medium text-[#854F0B]">
                    Review now
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
