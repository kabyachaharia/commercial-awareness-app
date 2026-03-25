import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { TopicPackClient, type FlashcardItem, type QuizQuestionItem } from "./topic-pack-client";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type TopicPackRow = {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  key_takeaways: string[] | null;
  icon: string | null;
};

type TopicSectionRow = {
  id: string;
  title: string | null;
  content: string | null;
  section_number: number | null;
};

type TopicQuizRow = {
  questions: unknown;
};

type TopicFlashcardsRow = {
  cards: unknown;
};

type UserProgressRow = {
  sections_completed: number | null;
  quiz_best_score: number | null;
  quiz_attempts: number | null;
};

function normalizeQuizQuestions(value: unknown): QuizQuestionItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      const q = raw as Partial<QuizQuestionItem>;
      if (
        typeof q.question !== "string" ||
        typeof q.correct_answer !== "string" ||
        typeof q.explanation !== "string" ||
        (q.type !== "multiple_choice" && q.type !== "true_false") ||
        !Array.isArray(q.options)
      ) {
        return null;
      }
      const options = q.options.filter((o): o is string => typeof o === "string");
      if (options.length === 0) return null;
      return {
        question: q.question,
        type: q.type,
        options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
      } satisfies QuizQuestionItem;
    })
    .filter((x): x is QuizQuestionItem => x !== null);
}

function normalizeFlashcards(value: unknown): FlashcardItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      const c = raw as Partial<FlashcardItem>;
      if (typeof c.front !== "string" || typeof c.back !== "string") return null;
      return { front: c.front, back: c.back } satisfies FlashcardItem;
    })
    .filter((x): x is FlashcardItem => x !== null);
}

function clampInt(value: unknown) {
  const n = typeof value === "number" ? value : 0;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export default async function TopicPackPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: packRow, error: packError } = await supabase
    .from("topic_packs")
    .select("id,title,slug,description,key_takeaways,icon")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (packError) {
    throw packError;
  }

  if (!packRow || typeof (packRow as TopicPackRow).id !== "string") {
    notFound();
  }

  const pack = packRow as TopicPackRow;
  const packId = pack.id;

  const [sectionsRes, quizRes, flashRes, progressRes] = await Promise.all([
    supabase
      .from("topic_sections")
      .select("id,title,content,section_number")
      .eq("topic_pack_id", packId)
      .order("section_number", { ascending: true }),
    supabase.from("topic_quizzes").select("questions").eq("topic_pack_id", packId).maybeSingle(),
    supabase.from("topic_flashcards").select("cards").eq("topic_pack_id", packId).maybeSingle(),
    supabase
      .from("user_progress")
      .select("sections_completed,quiz_best_score,quiz_attempts")
      .eq("user_id", user.id)
      .eq("topic_pack_id", packId)
      .maybeSingle(),
  ]);

  if (sectionsRes.error) throw sectionsRes.error;
  if (quizRes.error) throw quizRes.error;
  if (flashRes.error) throw flashRes.error;
  if (progressRes.error) throw progressRes.error;

  const rawSections = (sectionsRes.data ?? []) as TopicSectionRow[];
  const sections = rawSections.map((row, index) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    section_number: clampInt(row.section_number) > 0 ? clampInt(row.section_number) : index + 1,
  }));

  const quizQuestions = normalizeQuizQuestions((quizRes.data as TopicQuizRow | null)?.questions);
  const flashcards = normalizeFlashcards((flashRes.data as TopicFlashcardsRow | null)?.cards);

  const progressRow = progressRes.data as UserProgressRow | null;
  const initialProgress = {
    sections_completed: clampInt(progressRow?.sections_completed),
    quiz_best_score:
      typeof progressRow?.quiz_best_score === "number" && Number.isFinite(progressRow.quiz_best_score)
        ? progressRow.quiz_best_score
        : null,
    quiz_attempts: clampInt(progressRow?.quiz_attempts),
  };

  return (
    <section className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-16 pt-12 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="-ml-3 h-auto justify-start px-3 py-1 text-sm text-gray-600 hover:text-black">
            <Link href="/dashboard/library">← Topic Library</Link>
          </Button>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
            {pack.icon ? `${pack.icon} ` : ""}
            {pack.title?.trim() ? pack.title : "Topic pack"}
          </h1>
          {pack.description?.trim() ? (
            <p className="max-w-2xl text-base leading-relaxed text-gray-600">{pack.description}</p>
          ) : null}
        </div>
      </div>

      <TopicPackClient
        packId={packId}
        packTitle={pack.title}
        keyTakeaways={pack.key_takeaways ?? []}
        sections={sections}
        quizQuestions={quizQuestions}
        flashcards={flashcards}
        initialProgress={initialProgress}
      />
    </section>
  );
}
