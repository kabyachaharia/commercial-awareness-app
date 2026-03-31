import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { getUserTier } from "@/lib/subscription";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TopicPackCategory = "foundation" | "current_affairs" | "sector_deep_dive";

type TopicPackRow = {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  category: TopicPackCategory | null;
  icon: string | null;
  is_free: boolean | null;
  total_sections: number | null;
  is_published: boolean | null;
  published_at: string | null;
};

type UserProgressRow = {
  topic_pack_id: string;
  sections_completed: number | null;
  quiz_best_score: number | null;
};

const CATEGORY_LABELS: Record<TopicPackCategory, string> = {
  foundation: "Foundations",
  current_affairs: "Current Affairs",
  sector_deep_dive: "Sector Deep Dives",
};

function clampInt(value: unknown) {
  const n = typeof value === "number" ? value : 0;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function formatProgressLabel(pack: TopicPackRow, progress: UserProgressRow | null) {
  const total = clampInt(pack.total_sections);
  const completed = clampInt(progress?.sections_completed);

  if (!progress || (completed === 0 && progress.quiz_best_score == null)) {
    return "Not started";
  }

  if (total > 0 && completed < total) {
    return `Learning: ${completed} of ${total} sections`;
  }

  // If we don't know total sections, fall back to quiz readiness messaging.
  const allSectionsComplete = total === 0 ? completed > 0 : completed >= total;

  if (allSectionsComplete) {
    if (typeof progress.quiz_best_score === "number" && Number.isFinite(progress.quiz_best_score)) {
      const pct = Math.max(0, Math.min(100, Math.round(progress.quiz_best_score)));
      return `Quiz: ${pct}%`;
    }
    return "Ready to quiz";
  }

  return `Learning: ${completed} of ${total} sections`;
}

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: packRows, error: packError } = await supabase
    .from("topic_packs")
    .select("id,title,slug,description,category,icon,is_free,total_sections,is_published,published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

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

  const byCategory = packs.reduce(
    (acc, pack) => {
      const cat = pack.category;
      if (cat && cat in acc) {
        acc[cat as TopicPackCategory].push(pack);
      }
      return acc;
    },
    {
      foundation: [] as TopicPackRow[],
      current_affairs: [] as TopicPackRow[],
      sector_deep_dive: [] as TopicPackRow[],
    }
  );

  const userTier = await getUserTier(user.id);
  const isFreeTierUser = userTier === "free";

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 pt-6">
      <header>
        <h1
          className="font-[family-name:var(--font-epilogue)] text-xl font-black text-black"
          style={{ textTransform: "none" }}
        >
          Topic library
        </h1>
        <p className="text-sm text-gray-500">
          Master key commercial awareness topics with guided lessons, quizzes, and flashcards
        </p>
      </header>

      {packs.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <h2 className="text-base font-medium text-black">No published topic packs yet</h2>
          <p className="mx-auto mt-3 max-w-md text-gray-600">
            Check back soon — new packs will appear here once published.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.keys(CATEGORY_LABELS) as TopicPackCategory[]).map((category) => {
            const list = byCategory[category];
            if (list.length === 0) return null;

            return (
              <section key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div
                    className="h-5 w-1 rounded-sm"
                    style={{
                      backgroundColor:
                        category === "foundation"
                          ? "#6B5CE7"
                          : category === "current_affairs"
                            ? "#E07830"
                            : "#1565C0",
                    }}
                  />
                  <h2
                    className="font-[family-name:var(--font-epilogue)] text-[15px] font-black text-black"
                    style={{ textTransform: "none" }}
                  >
                    {CATEGORY_LABELS[category]}
                  </h2>
                </div>

                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((pack) => {
                    const progress = progressByPackId.get(pack.id) ?? null;
                    const title = pack.title ?? "Untitled pack";
                    const slug = pack.slug ?? "";
                    const isFree = Boolean(pack.is_free);
                    const showLock = !isFree && isFreeTierUser;
                    const href = showLock
                      ? "/dashboard/upgrade"
                      : slug
                        ? `/dashboard/library/${slug}`
                        : "/dashboard/library";

                    return (
                      <li key={pack.id}>
                        <Link href={href} className="group block h-full">
                          <div
                            className={`h-full rounded-2xl border-2 border-black bg-white p-4 transition-all duration-200 hover:shadow-[4px_4px_0_0_#000] ${
                              showLock ? "opacity-70" : ""
                            }`}
                          >
                            <div className="mb-2.5 flex items-center gap-2.5">
                              <div
                                className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-base"
                                style={{
                                  backgroundColor: ["#E8E4F7", "#FCE8D9", "#DDF0D9"][Math.abs(title.charCodeAt(0)) % 3],
                                }}
                              >
                                {pack.icon ?? "📚"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-black text-black">{title}</p>
                              </div>
                              {isFree ? (
                                <span className="shrink-0 rounded-md bg-[#DDF0D9] px-2 py-0.5 text-[9px] font-semibold text-[#2E7D32]">
                                  Free
                                </span>
                              ) : null}
                              {showLock ? <Lock className="size-3.5 shrink-0 text-gray-400" aria-hidden /> : null}
                            </div>
                            <p className="mb-2.5 line-clamp-2 text-[11px] leading-relaxed text-gray-500">
                              {pack.description?.trim() ? pack.description : "Guided lessons, quizzes, and flashcards."}
                            </p>
                            <div className="flex items-center justify-between">
                              {(() => {
                                const total = clampInt(pack.total_sections);
                                const completed = clampInt(progress?.sections_completed);
                                const label = formatProgressLabel(pack, progress);
                                const isComplete = label.startsWith("Quiz:");
                                const isReadyToQuiz = label === "Ready to quiz";
                                const isInProgress = label.startsWith("Learning:");
                                const barWidth = total > 0 ? Math.round((completed / total) * 100) : 0;
                                const barColor = isComplete
                                  ? "#4CAF50"
                                  : isReadyToQuiz
                                    ? "#E07830"
                                    : isInProgress
                                      ? "#1565C0"
                                      : "#E0E0E0";
                                const textColor = isComplete
                                  ? "#2E7D32"
                                  : isReadyToQuiz
                                    ? "#E07830"
                                    : isInProgress
                                      ? "#1565C0"
                                      : "var(--color-text-tertiary)";

                                return (
                                  <>
                                    <div className="flex items-center gap-1.5">
                                      {barWidth > 0 || isReadyToQuiz || isComplete ? (
                                        <div className="h-[4px] w-[60px] overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                                          <div
                                            className="h-full rounded-full"
                                            style={{
                                              width: `${isReadyToQuiz || isComplete ? 100 : barWidth}%`,
                                              backgroundColor: barColor,
                                            }}
                                          />
                                        </div>
                                      ) : null}
                                      <span className="text-[10px] font-medium" style={{ color: textColor }}>
                                        {showLock ? "Upgrade to unlock" : label}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">{total > 0 ? `${total} sections` : ""}</span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

