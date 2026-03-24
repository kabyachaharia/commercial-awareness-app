"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

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

const shuffleClassName = "px-4";

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
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Flashcards</CardTitle>
            <CardDescription>No flashcards are available for this material yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={`/dashboard/materials/${materialId}`}>Back to Material</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600">{progressLabel}</p>
        <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full border-2 border-black bg-white">
          <div
            className="h-full rounded-full bg-[#FACC15] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <Card className="rounded-xl bg-white">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-lg">Study deck</CardTitle>
          <CardDescription className="text-gray-600">Tap the card to flip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 pb-6 sm:px-6">
          <div className="mx-auto w-full max-w-lg [perspective:1200px]">
            <button
              type="button"
              className="relative aspect-[4/3] w-full cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2"
              onClick={() => setIsFlipped((prev) => !prev)}
              aria-label={isFlipped ? "Show question" : "Show answer"}
            >
              <div
                className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <div className="absolute inset-0 flex h-full min-h-[220px] items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-[#FACC15] px-5 py-6 text-center shadow-[8px_8px_0_0_#000] [backface-visibility:hidden] sm:min-h-[250px] sm:px-8">
                  <p className="text-lg font-black uppercase leading-relaxed text-black sm:text-xl">
                    {currentCard.front}
                  </p>
                </div>
                <div className="absolute inset-0 flex h-full min-h-[220px] items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-white px-5 py-6 text-center shadow-[8px_8px_0_0_#000] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:min-h-[250px] sm:px-8">
                  <p className="text-base leading-relaxed text-gray-800 sm:text-lg">{currentCard.back}</p>
                </div>
              </div>
            </button>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="size-11 shrink-0 rounded-full text-black"
                aria-label="Previous card"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goToNext}
                disabled={currentIndex === total - 1}
                className="size-11 shrink-0 rounded-full text-black"
                aria-label="Next card"
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
            <Button type="button" onClick={shuffleCards} className={`${shuffleClassName} inline-flex items-center gap-2`}>
              <Shuffle className="size-4" aria-hidden />
              Shuffle
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button asChild variant="ghost" className="w-full text-gray-700 hover:text-black sm:w-auto">
        <Link href={`/dashboard/materials/${materialId}`}>← Back to Material</Link>
      </Button>
    </section>
  );
}
