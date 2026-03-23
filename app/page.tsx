import Link from "next/link";
import { Inter, Sora } from "next/font/google";
import {
  Award,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Scale,
  Sparkles,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const steps = [
  {
    number: "1",
    icon: Upload,
    title: "Upload Your Materials",
    description: "Drop in any PDF, article, or notes document",
  },
  {
    number: "2",
    icon: Sparkles,
    title: "AI Does the Work",
    description: "Our AI reads your content and generates study materials instantly",
  },
  {
    number: "3",
    icon: Award,
    title: "Learn & Ace Interviews",
    description: "Study with quizzes and flashcards tailored to your content",
  },
];

const features = [
  {
    icon: BrainCircuit,
    title: "Smart Summaries",
    description:
      "Key insights extracted and organised so you understand what matters for commercial awareness",
  },
  {
    icon: Sparkles,
    title: "AI-Generated Quizzes",
    description:
      "Multiple choice and true/false questions that test your understanding, not just recall",
  },
  {
    icon: GraduationCap,
    title: "Flashcard Decks",
    description:
      "Flip-card study sessions to memorise key facts, figures, and industry implications",
  },
];

const audiences = [
  {
    icon: Scale,
    title: "Law Students",
    description: "TC applications and vacation scheme interviews",
  },
  {
    icon: Building2,
    title: "Finance Applicants",
    description: "Investment banking and asset management prep",
  },
  {
    icon: BriefcaseBusiness,
    title: "Consulting Candidates",
    description: "Case interviews and market awareness",
  },
  {
    icon: GraduationCap,
    title: "Business Students",
    description: "Exam prep and coursework research",
  },
];

export default function Home() {
  return (
    <main
      className={`${inter.variable} ${sora.variable} scroll-smooth bg-white text-slate-900 [font-family:var(--font-inter)]`}
    >
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 px-4 pb-20 pt-20 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <p className="inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-1 text-sm text-slate-200 backdrop-blur">
              Commercial awareness, accelerated with AI
            </p>
            <h1 className="[font-family:var(--font-sora)] text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Master Commercial Awareness with AI
            </h1>
            <p className="max-w-xl text-base text-slate-200 sm:text-lg">
              Upload articles, reports, and notes. Get AI-powered summaries, quizzes, and
              flashcards in seconds. Perfect for law, finance, and consulting interview prep.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-lg bg-indigo-500 px-8 text-base font-semibold text-white transition-all duration-300 hover:translate-y-[-1px] hover:bg-indigo-400"
              >
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-lg border-white/30 bg-transparent px-8 text-base font-semibold text-white transition-all duration-300 hover:translate-y-[-1px] hover:bg-white/10"
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-slate-900/60 p-4 shadow-2xl backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-indigo-500/20">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 p-4">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-300/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-indigo-300/20 bg-slate-900/70 p-3">
                  <p className="text-xs text-slate-300">Today&apos;s Summary</p>
                  <p className="mt-2 text-sm font-semibold text-white">M&A trends in tech sector</p>
                </div>
                <div className="rounded-lg border border-cyan-300/20 bg-slate-900/70 p-3">
                  <p className="text-xs text-slate-300">Quiz Progress</p>
                  <p className="mt-2 text-sm font-semibold text-white">8/10 correct</p>
                </div>
                <div className="sm:col-span-2 rounded-lg border border-violet-300/20 bg-slate-900/70 p-3">
                  <p className="text-xs text-slate-300">Flashcard Deck</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Bank of England policy updates</p>
                    <span className="rounded bg-indigo-500/20 px-2 py-1 text-xs text-indigo-200">
                      24 cards
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="[font-family:var(--font-sora)] text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            How It Works
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {step.number}
                  </span>
                  <step.icon className="size-5 text-indigo-600" />
                </div>
                <h3 className="[font-family:var(--font-sora)] text-xl font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="[font-family:var(--font-sora)] text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            Everything You Need to Prepare
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <feature.icon className="size-6 text-indigo-600" />
                <h3 className="[font-family:var(--font-sora)] mt-4 text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="[font-family:var(--font-sora)] text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            Built for Ambitious Students
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {audiences.map((audience) => (
              <article
                key={audience.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <audience.icon className="size-6 text-indigo-600" />
                <h3 className="[font-family:var(--font-sora)] mt-4 text-xl font-semibold text-slate-900">
                  {audience.title}
                </h3>
                <p className="mt-2 text-slate-600">{audience.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <h2 className="[font-family:var(--font-sora)] text-3xl font-bold sm:text-4xl">
            Start Learning Smarter Today
          </h2>
          <p className="mt-4 text-slate-300">
            Join for free and upload your first document in 30 seconds.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-lg bg-indigo-500 px-8 text-base font-semibold text-white transition-all duration-300 hover:translate-y-[-1px] hover:bg-indigo-400"
          >
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© 2026 CommAware. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a className="transition-colors hover:text-slate-900" href="#">
              About
            </a>
            <a className="transition-colors hover:text-slate-900" href="#">
              Privacy
            </a>
            <a className="transition-colors hover:text-slate-900" href="#">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
