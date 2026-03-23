"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type Flashcard = {
  front: string;
  back: string;
};

type FlashcardDeckProps = {
  materialId: string;
  cards: Flashcard[];
};

function shuffled<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function FlashcardDeck({ materialId, cards }: FlashcardDeckProps) {
  const [orderedCards, setOrderedCards] = useState(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const total = orderedCards.length;
  const currentCard = orderedCards[currentIndex];
  const progressLabel = useMemo(() => {
    if (total === 0) {
      return "No cards";
    }
    return `Card ${currentIndex + 1} of ${total}`;
  }, [currentIndex, total]);

  function goToNext() {
    setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
    setIsFlipped(false);
  }

  function goToPrevious() {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setIsFlipped(false);
  }

  function shuffleCards() {
    setOrderedCards((prev) => shuffled(prev));
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  if (total === 0 || !currentCard) {
    return (
      <section className="mx-auto w-full max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Flashcards</CardTitle>
            <CardDescription>No flashcards are available for this material yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/dashboard/materials/${materialId}`}>Back to Material</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Flashcard Deck</CardTitle>
          <CardDescription>{progressLabel}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            className="h-72 w-full cursor-pointer rounded-xl [perspective:1000px]"
            onClick={() => setIsFlipped((prev) => !prev)}
            aria-label="Flip flashcard"
          >
            <div
              className={`relative h-full w-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d] ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <div className="absolute inset-0 flex h-full items-center justify-center rounded-xl border bg-background p-6 text-center [backface-visibility:hidden]">
                <p className="text-base font-medium">{currentCard.front}</p>
              </div>
              <div className="absolute inset-0 flex h-full items-center justify-center rounded-xl border bg-muted p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <p className="text-base">{currentCard.back}</p>
              </div>
            </div>
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={goToPrevious} disabled={currentIndex === 0}>
                &lt;
              </Button>
              <Button variant="outline" onClick={goToNext} disabled={currentIndex === total - 1}>
                &gt;
              </Button>
            </div>
            <Button variant="secondary" onClick={shuffleCards}>
              Shuffle
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button asChild variant="ghost">
        <Link href={`/dashboard/materials/${materialId}`}>Back to Material</Link>
      </Button>
    </section>
  );
}
