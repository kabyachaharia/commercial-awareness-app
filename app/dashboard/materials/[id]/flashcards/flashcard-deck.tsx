"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      <section className="mx-auto w-full max-w-3xl space-y-4 px-4 pt-3 sm:px-6">
        <Button
          asChild
          variant="ghost"
          className="-ml-3 h-auto justify-start px-3 py-1 text-sm text-gray-600 hover:text-black"
        >
          <Link href={`/dashboard/materials/${materialId}`}>← Back to Material</Link>
        </Button>
        <div className="overflow-hidden rounded-xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
          <p className="text-base text-gray-600">No flashcards available for this material yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 px-4 pt-3 sm:px-6">
      <Button
        asChild
        variant="ghost"
        className="-ml-3 h-auto justify-start px-3 py-1 text-sm text-gray-600 hover:text-black"
      >
        <Link href={`/dashboard/materials/${materialId}`}>← Back to Material</Link>
      </Button>

      <Card className="rounded-xl border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
        <CardContent className="space-y-2 px-3 py-3">
          <p className="text-center text-xs font-medium text-gray-600">
            Card {currentIndex + 1} of {total}
          </p>
          <div className="mx-auto h-1.5 max-w-xs overflow-hidden rounded-full border-2 border-black bg-white">
            <div
              className="h-full rounded-full bg-[#FACC15] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
          <div className="mx-auto w-full max-w-lg [perspective:1200px]">
            <button
              type="button"
              className="relative aspect-[2/1] w-full cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2"
              onClick={() => setIsFlipped((prev) => !prev)}
              aria-label={isFlipped ? "Show question" : "Show answer"}
            >
              <div
                className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <div className="absolute inset-0 flex min-h-[100px] items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-[#FACC15] px-4 py-4 text-center shadow-[6px_6px_0_0_#000] [backface-visibility:hidden] sm:min-h-[110px]">
                  <p
                    className="text-base font-black leading-relaxed text-black sm:text-lg"
                    style={{ textTransform: "none" }}
                  >
                    {currentCard.front}
                  </p>
                </div>
                <div className="absolute inset-0 flex min-h-[100px] items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-white px-4 py-4 text-center shadow-[6px_6px_0_0_#000] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:min-h-[110px]">
                  <p className="text-sm leading-relaxed text-gray-800 sm:text-base">{currentCard.back}</p>
                </div>
              </div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 cursor-pointer rounded-full border-2 border-black bg-white hover:bg-gray-50"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                aria-label="Previous card"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 cursor-pointer rounded-full border-2 border-black bg-white hover:bg-gray-50"
                onClick={goToNext}
                disabled={currentIndex >= total - 1}
                aria-label="Next card"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-black bg-[#FACC15] px-3 py-1.5 text-sm font-bold text-black transition-colors hover:bg-[#EAB308]"
              onClick={shuffleCards}
              aria-label="Shuffle cards"
            >
              <Shuffle className="size-4" />
              Shuffle
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
