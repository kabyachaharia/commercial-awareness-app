import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen text-black">
      <header className="sticky top-0 z-40 border-b-2 border-black bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-base font-black uppercase tracking-tight sm:text-lg">
            Commercial Awareness
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-bold text-gray-700 md:flex">
            <a href="#benefits">Benefits</a>
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
          </nav>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-lg border-2 border-black bg-[#FACC15] px-4 text-sm font-bold text-black sm:px-5"
          >
            Start for free
          </Link>
        </div>
      </header>

      <main>
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <span className="inline-flex rounded-full border-2 border-black bg-black px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Trusted by law students across the UK
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black uppercase leading-[1.05] sm:text-5xl lg:text-7xl">
              Master Commercial Awareness With Ease
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Everything you need is in one place, so you can focus on acing your training contract
              and vacation scheme interviews.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-black bg-[#FACC15] px-7 text-sm font-bold"
              >
                Start for free
              </Link>
              <a href="#how-it-works" className="inline-flex items-center gap-1 text-sm font-bold">
                See how it works <ArrowRight className="size-4" />
              </a>
            </div>

            <div id="features" className="mt-12 rounded-2xl border-[3px] border-black bg-[#FEF08A] p-4 shadow-[8px_8px_0_0_#000] sm:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border-2 border-black bg-white p-4 text-left">
                  <p className="text-xs font-bold uppercase text-gray-500">Today&apos;s Summary</p>
                  <p className="mt-2 text-lg font-black uppercase">FTSE and Inflation Update</p>
                </div>
                <div className="rounded-xl border-2 border-black bg-white p-4 text-left">
                  <p className="text-xs font-bold uppercase text-gray-500">Quiz Score</p>
                  <p className="mt-2 text-lg font-black uppercase">8/10 Correct</p>
                </div>
                <div className="rounded-xl border-2 border-black bg-white p-4 text-left">
                  <p className="text-xs font-bold uppercase text-gray-500">Flashcards</p>
                  <p className="mt-2 text-lg font-black uppercase">24 Cards Ready</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="border-t-2 border-black bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-3xl text-3xl font-black uppercase leading-tight sm:text-5xl">
              Everything Is Built To Help You Learn Better
            </h2>
            <p className="mt-4 max-w-3xl text-gray-600">
              From uploading content to testing your knowledge, the platform simplifies your prep
              and improves results.
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <article className="rounded-xl border-2 border-black bg-[#FEF08A] p-6 shadow-[6px_6px_0_0_#000] md:col-span-2">
                <h3 className="text-2xl font-black uppercase">Smart Summaries That Work</h3>
                <p className="mt-3 max-w-2xl text-gray-700">
                  Key insights extracted and organised so you understand what matters for commercial
                  awareness.
                </p>
                <div className="mt-5 rounded-lg border-2 border-black bg-white p-4">
                  <p className="text-sm font-bold uppercase">Summary Preview</p>
                </div>
              </article>
              <article className="rounded-xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
                <h3 className="text-xl font-black uppercase">AI-Generated Quizzes</h3>
                <p className="mt-3 text-gray-700">
                  Multiple choice and true/false questions that test understanding, not just recall.
                </p>
              </article>
              <article className="rounded-xl border-2 border-black bg-[#D1FAE5] p-6 shadow-[6px_6px_0_0_#000]">
                <h3 className="text-xl font-black uppercase">Flashcard Decks</h3>
                <p className="mt-3 text-gray-700">
                  Flip-card study sessions to memorise key facts, figures and industry implications.
                </p>
              </article>
              <article className="relative rounded-xl border-2 border-black bg-[#FED7AA] p-6 shadow-[6px_6px_0_0_#000] md:col-span-2">
                <span className="absolute right-4 top-4 rounded-full border-2 border-black bg-black px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                  Coming soon
                </span>
                <h3 className="text-2xl font-black uppercase">Track Your Progress</h3>
                <p className="mt-3 max-w-2xl text-gray-700">
                  See how you&apos;re improving over time with quiz scores and study streaks.
                </p>
                <div className="mt-5 rounded-lg border-2 border-black bg-white p-4">
                  <div className="h-3 w-2/3 rounded-full bg-[#FACC15]" />
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t-2 border-black bg-[#F5F5F5] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-black uppercase sm:text-5xl">Get Started In Three Simple Steps</h2>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {[
                ["01 Upload", "Drop in any PDF, article, or lecture notes"],
                ["02 Generate", "AI creates summaries, quizzes and flashcards"],
                ["03 Learn", "Study smarter and ace your interviews"],
              ].map(([title, text]) => (
                <article key={title} className="rounded-xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
                  <h3 className="text-lg font-black uppercase">{title}</h3>
                  <p className="mt-3 text-gray-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t-2 border-black bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-black uppercase sm:text-5xl">Your Secret Weapon For Law Applications</h2>
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  "Training Contract Prep",
                  "Stay on top of business news and market trends that firms ask about",
                ],
                [
                  "Vacation Scheme Interviews",
                  "Quickly digest firm-specific commercial updates before assessment days",
                ],
                [
                  "Commercial Law Modules",
                  "Turn lecture notes and textbooks into bite-sized study materials",
                ],
                [
                  "Pro Bono and Mooting",
                  "Understand the commercial context behind the cases you work on",
                ],
              ].map(([title, text]) => (
                <article key={title} className="rounded-xl border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000]">
                  <h3 className="text-base font-black uppercase">{title}</h3>
                  <p className="mt-3 text-sm text-gray-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t-2 border-black bg-[#FED7AA] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-black uppercase sm:text-5xl">Start Learning Smarter Today</h2>
            <p className="mt-4 text-gray-700">100% free. Upload your first document in 30 seconds.</p>
            <Link
              href="/signup"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-lg border-2 border-black bg-[#FACC15] px-8 text-base font-black"
            >
              Start for free
            </Link>
          </div>
        </section>

        <footer className="border-t-2 border-black bg-black px-4 py-12 text-sm text-gray-400 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:justify-between">
            <div>
              <p className="text-base font-bold text-white">Commercial Awareness</p>
              <p className="mt-4 text-gray-500">© 2026 Commercial Awareness. All rights reserved.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-gray-400">
              <a href="#benefits">Benefits</a>
              <a href="#how-it-works">How it works</a>
              <a href="#features">Features</a>
              <Link href="/signup">Start for free</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
