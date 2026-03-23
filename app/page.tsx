import Link from "next/link";
import { BookOpenCheck, BrainCircuit, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const features = [
    {
      title: "Smart Summaries",
      description: "Key insights extracted from your materials.",
      icon: Sparkles,
    },
    {
      title: "AI Quizzes",
      description: "Test your knowledge with auto-generated questions.",
      icon: BrainCircuit,
    },
    {
      title: "Flashcards",
      description: "Memorise key concepts with spaced repetition.",
      icon: BookOpenCheck,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14">
        <section className="flex flex-col items-center text-center">
          <div className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-1 text-sm text-slate-300">
            AI Study Assistant for Aspiring Commercial Lawyers
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Master Commercial Awareness with AI
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
            Upload your study materials and get AI-powered summaries, quizzes, and flashcards in
            seconds.
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-500">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-slate-800/80 bg-slate-900/70 text-slate-100 ring-0"
            >
              <CardHeader className="space-y-3">
                <feature.icon className="size-5 text-blue-400" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">{feature.description}</CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
