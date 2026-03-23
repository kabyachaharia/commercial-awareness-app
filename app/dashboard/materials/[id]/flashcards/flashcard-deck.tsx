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

const shuffleClassName =
  "rounded-lg border-0 bg-indigo-500 px-4 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-400";

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
        <Card className="rounded-2xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-sora)] text-xl">Flashcards</CardTitle>
            <CardDescription>No flashcards are available for this material yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-lg border-slate-200">
              <Link href={`/dashboard/materials/${materialId}`}>Back to Material</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-8">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-600">{progressLabel}</p>
        <div className="mx-auto mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="[font-family:var(--font-sora)] text-lg font-semibold text-slate-900">Study deck</CardTitle>
          <CardDescription className="text-slate-600">Tap the card to flip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-4 pb-8 sm:px-8">
          <div className="mx-auto w-full max-w-lg [perspective:1200px]">
            <button
              type="button"
              className="relative aspect-[4/3] w-full cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              onClick={() => setIsFlipped((prev) => !prev)}
              aria-label={isFlipped ? "Show question" : "Show answer"}
            >
              <div
                className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <div
                  className="absolute inset-0 flex h-full min-h-[240px] items-center justify-center overflow-hidden rounded-2xl border border-slate-800/20 bg-slate-900 px-6 py-8 text-center shadow-xl [backface-visibility:hidden] sm:min-h-[280px] sm:px-10"
                >
                  <p className="[font-family:var(--font-sora)] text-lg font-medium leading-relaxed text-white sm:text-xl">
                    {currentCard.front}
                  </p>
                </div>
                <div
                  className="absolute inset-0 flex h-full min-h-[240px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] sm:min-h-[280px] sm:px-10"
                >
                  <p className="text-base leading-relaxed text-slate-800 sm:text-lg">{currentCard.back}</p>
                </div>
              </div>
            </button>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="size-11 shrink-0 rounded-full border-slate-200 text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
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
                className="size-11 shrink-0 rounded-full border-slate-200 text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
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

      <Button asChild variant="ghost" className="w-full text-slate-600 hover:text-slate-900 sm:w-auto">
        <Link href={`/dashboard/materials/${materialId}`}>← Back to Material</Link>
      </Button>
    </section>
  );
}
