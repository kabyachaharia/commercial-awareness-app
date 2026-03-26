import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <section className="mx-auto w-full max-w-5xl space-y-10 pt-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
          Topic Library
        </h1>
        <p className="max-w-3xl text-base text-gray-600">
          Master key commercial awareness topics with guided lessons, quizzes, and flashcards
        </p>
      </header>

      {packs.length === 0 ? (
        <div className="rounded-xl border-2 border-black bg-white px-6 py-12 text-center shadow-[8px_8px_0_0_#000]">
          <h2 className="text-xl font-black uppercase text-black">No published topic packs yet</h2>
          <p className="mx-auto mt-3 max-w-md text-gray-600">
            Check back soon — new packs will appear here once published.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {(Object.keys(CATEGORY_LABELS) as TopicPackCategory[]).map((category) => {
            const list = byCategory[category];
            if (list.length === 0) return null;

            return (
              <section key={category} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black uppercase tracking-tight text-black">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <div className="h-0.5 w-full bg-black" />
                </div>

                <ul className="grid gap-4 sm:grid-cols-2">
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
                        <Link
                          href={href}
                          className="group block h-full"
                        >
                          <Card
                            className={`relative h-full rounded-xl border-2 border-black bg-white shadow-[6px_6px_0_0_#000] transition-all duration-200 group-hover:-translate-y-0.5 ${
                              showLock ? "opacity-80" : ""
                            }`}
                          >
                            {showLock ? (
                              <div className="pointer-events-none absolute right-3 top-3 rounded-full border-2 border-black bg-white p-1.5">
                                <Lock className="size-4 text-gray-700" aria-hidden />
                              </div>
                            ) : null}
                            <CardHeader className="space-y-2 border-b-2 border-black p-4 pb-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <CardTitle className="truncate text-lg font-black uppercase text-black">
                                    {pack.icon ? `${pack.icon} ` : ""}
                                    {title}
                                  </CardTitle>
                                  <CardDescription className="text-sm text-gray-600">
                                    {pack.description?.trim()
                                      ? pack.description
                                      : "Guided lessons, quizzes, and flashcards."}
                                  </CardDescription>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                  {isFree ? (
                                    <Badge variant="secondary" className="border-2 border-black bg-[#D1FAE5] text-black">
                                      Free
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-3">
                              <p className="text-sm font-semibold text-black">
                                {formatProgressLabel(pack, progress)}
                              </p>
                              {showLock ? (
                                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-gray-700">
                                  Upgrade to unlock
                                </p>
                              ) : null}
                            </CardContent>
                          </Card>
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

