import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { FlashcardDeck, type Flashcard } from "./flashcard-deck";

export const dynamic = 'force-dynamic';

type FlashcardsPageProps = {
  params: Promise<{ id: string }>;
};

function normalizeCards(value: unknown): Flashcard[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const card = item as Partial<Flashcard>;
      if (typeof card.front !== "string" || typeof card.back !== "string") {
        return null;
      }

      return { front: card.front, back: card.back } satisfies Flashcard;
    })
    .filter((card): card is Flashcard => card !== null);
}

export default async function FlashcardsPage({ params }: FlashcardsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: flashcardRows } = await supabase.from("flashcards").select("id, cards").eq("material_id", id).limit(1);

  const flashcardSet = flashcardRows?.[0];
  if (!flashcardSet) {
    notFound();
  }

  const cards = normalizeCards(flashcardSet.cards);

  return <FlashcardDeck materialId={id} cards={cards} />;
}
