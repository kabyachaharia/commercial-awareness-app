import type { ReactNode } from "react";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ArrowRight, Sparkles, Trophy, Upload } from "lucide-react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-500/20">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <div
      className={`${jakarta.variable} min-h-screen scroll-smooth bg-[#FFFBEB] text-[#1A1A1A] [font-family:var(--font-jakarta)]`}
    >
      {/* Subtle grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(0 0 0 / 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(0 0 0 / 0.04) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#FFFBEB]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:h-16 md:flex-row md:items-center md:justify-between md:gap-6 md:py-0 lg:px-8">
          <div className="flex items-center justify-between md:contents">
            <Link
              href="/"
              className="min-w-0 text-base font-bold tracking-tight text-[#1A1A1A] sm:text-lg"
            >
              Commercial Awareness
            </Link>
            <Link
              href="/signup"
              className="shrink-0 rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] md:hidden sm:px-5 sm:py-2.5"
            >
              Get Started
            </Link>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-black/[0.06] pt-3 text-sm font-semibold text-gray-600 md:flex-1 md:border-t-0 md:pt-0">
            <a className="transition-colors hover:text-[#1A1A1A]" href="#benefits">
              Benefits
            </a>
            <a className="transition-colors hover:text-[#1A1A1A]" href="#how-it-works">
              How it works
            </a>
            <a className="transition-colors hover:text-[#1A1A1A]" href="#features">
              Features
            </a>
          </nav>
          <Link
            href="/signup"
            className="hidden shrink-0 rounded-full bg-[#1A1A1A] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] md:inline-flex"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="relative px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="animate-landing-in flex justify-center">
              <Badge>Trusted by law students across the UK</Badge>
            </div>
            <h1 className="animate-landing-in animate-landing-delay-1 mt-6 text-4xl font-bold uppercase leading-[1.1] tracking-wide text-[#1A1A1A] sm:text-5xl md:text-6xl lg:text-[3.5rem] lg:leading-[1.08]">
              Master commercial awareness with ease
            </h1>
            <p className="animate-landing-in animate-landing-delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Everything you need to ace your training contract and vacation scheme interviews.
              Upload your materials, and let AI create summaries, quizzes, and flashcards so you
              can focus on learning.
            </p>
            <div className="animate-landing-in animate-landing-delay-3 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/signup"
                className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-[#1A1A1A] px-8 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started Free
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#1A1A1A] underline-offset-4 transition-colors hover:underline"
              >
                See how it works
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>

          <div
            id="features"
            className="animate-landing-in animate-landing-delay-4 mx-auto mt-14 max-w-5xl scroll-mt-28"
          >
            <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.12)] sm:p-6 md:p-8">
              <div className="mb-4 flex gap-2 sm:mb-6">
                <span className="size-3 rounded-full bg-red-400/90" />
                <span className="size-3 rounded-full bg-amber-300/90" />
                <span className="size-3 rounded-full bg-emerald-400/90" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="rounded-xl border border-gray-100 bg-amber-50/50 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Today&apos;s summary
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#1A1A1A] sm:text-base">
                    M&amp;A trends in tech sector
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-emerald-50/50 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Quiz progress
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#1A1A1A] sm:text-base">
                    8/10 correct
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-sky-50/40 p-4 sm:col-span-2 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Flashcard deck
                  </p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-bold text-[#1A1A1A] sm:text-base">
                      Bank of England policy updates
                    </p>
                    <span className="w-fit rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700">
                      24 cards
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-24 border-t border-black/[0.04] bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex justify-center">
                <Badge>How it works</Badge>
              </div>
              <h2 className="mt-6 text-3xl font-bold uppercase tracking-wide text-[#1A1A1A] sm:text-4xl md:text-[2.5rem]">
                Get started in three simple steps
              </h2>
              <p className="mt-4 text-gray-600 sm:text-lg">
                From upload to interview-ready in minutes
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Upload,
                  iconBg: "bg-amber-100 text-amber-700 ring-amber-200/80",
                  title: "Upload your materials",
                  body: "Drop in any PDF, article, report or lecture notes. We handle the rest.",
                },
                {
                  icon: Sparkles,
                  iconBg: "bg-sky-100 text-sky-700 ring-sky-200/80",
                  title: "AI creates study tools",
                  body: "Our AI reads your content and generates summaries, quizzes and flashcards instantly.",
                },
                {
                  icon: Trophy,
                  iconBg: "bg-emerald-100 text-emerald-700 ring-emerald-200/80",
                  title: "Ace your interviews",
                  body: "Study smarter with tailored materials. Build confidence for TCs and vacation schemes.",
                },
              ].map((card) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_20px_50px_-16px_rgba(0,0,0,0.12)] sm:p-8"
                >
                  <div
                    className={`inline-flex size-12 items-center justify-center rounded-2xl ring-2 ${card.iconBg}`}
                  >
                    <card.icon className="size-6" strokeWidth={2} aria-hidden />
                  </div>
                  <h3 className="mt-6 text-lg font-bold uppercase tracking-wide text-[#1A1A1A]">
                    {card.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-gray-600">{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits / features grid */}
        <section
          id="benefits"
          className="scroll-mt-24 border-t border-black/[0.04] bg-[#FFFBEB] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex justify-center">
                <Badge>Benefits</Badge>
              </div>
              <h2 className="mt-6 text-3xl font-bold uppercase tracking-wide text-[#1A1A1A] sm:text-4xl md:text-[2.5rem]">
                Everything is built to help you learn better
              </h2>
              <p className="mt-4 text-gray-600 sm:text-lg">
                From uploading content to testing your knowledge, the platform simplifies your
                commercial awareness prep.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {[
                {
                  title: "Smart summaries that work",
                  body: "Key insights extracted and organised so you understand what actually matters for commercial awareness interviews.",
                },
                {
                  title: "AI-generated quizzes",
                  body: "Multiple choice and true/false questions that test understanding, not just recall. With explanations for every answer.",
                },
                {
                  title: "Flashcard decks",
                  body: "Flip-card study sessions to memorise key facts, figures and industry implications.",
                },
                {
                  title: "Track your progress",
                  body: "See how you're improving over time with quiz scores and study streaks.",
                  soon: true,
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="relative rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.08)] sm:p-8"
                >
                  {item.soon ? (
                    <span className="absolute right-4 top-4 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-500/20">
                      Coming soon
                    </span>
                  ) : null}
                  <h3 className="pr-24 text-lg font-bold uppercase tracking-wide text-[#1A1A1A] sm:pr-0">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-gray-600">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="scroll-mt-24 border-t border-black/[0.04] bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex justify-center">
                <Badge>Built for law students</Badge>
              </div>
              <h2 className="mt-6 text-3xl font-bold uppercase tracking-wide text-[#1A1A1A] sm:text-4xl md:text-[2.5rem]">
                Your secret weapon for applications
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  emoji: "⚖️",
                  title: "Training contract prep",
                  body: "Stay on top of business news and market trends that firms ask about in interviews",
                },
                {
                  emoji: "📅",
                  title: "Vacation scheme interviews",
                  body: "Quickly digest firm-specific commercial updates before your assessment days",
                },
                {
                  emoji: "📚",
                  title: "Commercial law modules",
                  body: "Turn lecture notes and textbooks into bite-sized study materials",
                },
                {
                  emoji: "🤝",
                  title: "Pro bono & mooting",
                  body: "Understand the commercial context behind the cases you work on",
                },
              ].map((u) => (
                <article
                  key={u.title}
                  className="rounded-2xl border border-black/[0.06] bg-[#FFFBEB]/40 p-6 text-center shadow-sm transition-shadow hover:shadow-md sm:p-7"
                >
                  <span className="text-4xl" role="img" aria-hidden>
                    {u.emoji}
                  </span>
                  <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">
                    {u.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{u.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-black/[0.04] bg-[#FFFBEB] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold uppercase tracking-wide text-[#1A1A1A] sm:text-4xl">
              Start learning smarter today
            </h2>
            <p className="mt-4 text-gray-600 sm:text-lg">
              100% free. Upload your first document in 30 seconds.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex h-14 min-w-[220px] items-center justify-center rounded-full bg-[#1A1A1A] px-10 text-base font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#1A1A1A] px-4 py-12 text-sm text-gray-400 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-base font-bold text-white">Commercial Awareness</p>
              <p className="mt-4 text-gray-500">
                © 2026 Commercial Awareness. All rights reserved.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                ["Features", "#features"],
                ["How it works", "#how-it-works"],
                ["About", "#"],
                ["Privacy", "#"],
                ["Terms", "#"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="font-medium text-gray-400 transition-colors hover:text-white"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}
