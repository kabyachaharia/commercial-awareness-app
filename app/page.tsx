import Link from "next/link";
import { ArrowRight, Lock, Quote, Star } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";

function Stars() {
  return (
    <div className="flex items-center gap-1 text-black">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star key={idx} className="size-4 fill-black" />
      ))}
    </div>
  );
}

export default function Home() {
  const topicPacks = [
    {
      title: "What is Commercial Awareness?",
      sections: "10 sections",
      category: "Foundations",
      locked: false,
    },
    {
      title: "M&A Fundamentals",
      sections: "12 sections",
      category: "Foundations",
      locked: false,
    },
    {
      title: "Private Equity Essentials",
      sections: "12 sections",
      category: "Foundations",
      locked: true,
    },
    {
      title: "Banking and Finance Basics",
      sections: "10 sections",
      category: "Foundations",
      locked: true,
    },
    {
      title: "UK Economic Outlook 2026",
      sections: "8 sections",
      category: "Current Affairs",
      locked: true,
    },
    {
      title: "ESG and the Legal Sector",
      sections: "10 sections",
      category: "Foundations",
      locked: true,
    },
  ];

  const faqItems = [
    {
      q: "What is commercial awareness?",
      a: "Commercial awareness means understanding how businesses operate, how they make money, and how legal, economic, and political developments affect them. Law firms test it because they need lawyers who understand their clients' commercial context, not just the law.",
    },
    {
      q: "Who is this for?",
      a: "Primarily UK law students preparing for training contract applications, vacation scheme interviews, and assessment days. It's also useful for LPC/SQE students, paralegals, and anyone who wants to understand commercial topics better.",
    },
    {
      q: "How is this different from just reading the FT?",
      a: "Reading the news is important, but it doesn't teach you the underlying concepts. Our topic packs explain how M&A deals work, what private equity firms actually do, how banks make money — the structural knowledge that lets you make sense of the news and talk about it intelligently in interviews.",
    },
    {
      q: "Can I use this on my phone?",
      a: "Yes, the platform is fully responsive and works on mobile, tablet, and desktop.",
    },
    {
      q: "What topics are covered?",
      a: "We cover M&A, private equity, banking and finance, IPOs, joint ventures, ESG, tech and AI, UK regulation, the economic outlook, global trade, energy, property, and healthcare — with new packs added regularly.",
    },
    {
      q: "Do I need to pay to start?",
      a: "No. The free tier gives you full access to 3 complete topic packs with Learn, Quiz, and Flashcards. You can upgrade any time to unlock the full library.",
    },
    {
      q: "What's the difference between Student and Pro?",
      a: "Student gives you access to all topic packs in the library. Pro adds the ability to upload your own documents (PDFs, notes, articles) and have the AI generate custom summaries, quizzes, and flashcards from your uploads.",
    },
  ];

  return (
    <div className="min-h-screen scroll-smooth text-black">
      <header className="sticky top-0 z-40 border-b-2 border-black bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-base font-black uppercase tracking-tight sm:text-lg">
            Commercial Awareness
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-bold text-gray-700 md:flex">
            <a href="#benefits">Benefits</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
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
        {/* SECTION 1: HERO */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="mb-6 flex justify-center lg:justify-start">
                <span className="inline-block w-fit rounded-full border-2 border-black bg-[#FED7AA] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black">
                  Built for UK law students
                </span>
              </div>
              <h1 className="mx-auto mb-4 max-w-3xl text-5xl font-black uppercase leading-[1.05] lg:mx-0">
                Master Commercial Awareness — One Topic at a Time
              </h1>
              <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg lg:mx-0">
                Guided topic packs that teach you what law firms actually care about. Learn the
                concepts, test yourself with scenario-based quizzes, and lock in key terms with
                flashcards.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
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
              <p className="mt-6 text-sm font-bold text-gray-600">
                Join hundreds of law students preparing for vacation schemes and training contracts
              </p>
            </div>

            <div className="mx-auto w-full max-w-xl rounded-xl border-[3px] border-black bg-[#DBEAFE] p-6 shadow-[8px_8px_0_0_#000]">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border-2 border-black bg-white p-4 text-left">
                  <p className="text-xs font-bold uppercase text-gray-500">M&A Fundamentals</p>
                  <p className="mt-2 text-lg font-black uppercase">12 sections</p>
                  <div className="mt-4 rounded-full border-2 border-black bg-white p-1">
                    <div className="h-2 w-3/5 rounded-full bg-[#FACC15]" />
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase text-gray-500">60% complete</p>
                </div>
                <div className="rounded-xl border-2 border-black bg-white p-4 text-left">
                  <p className="text-xs font-bold uppercase text-gray-500">Quiz Score</p>
                  <p className="mt-2 text-lg font-black uppercase">24/30 Correct</p>
                  <p className="mt-2 text-sm text-gray-600">Scenario-based questions</p>
                </div>
                <div className="rounded-xl border-2 border-black bg-white p-4 text-left">
                  <p className="text-xs font-bold uppercase text-gray-500">Flashcards</p>
                  <p className="mt-2 text-lg font-black uppercase">20 Ready</p>
                  <p className="mt-2 text-sm text-gray-600">Quick-fire revision</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SOCIAL PROOF / TRUST BAR */}
        <section className="border-y-2 border-black bg-white px-4 py-6 sm:px-6 lg:px-8">
          <p className="mx-auto max-w-5xl text-center text-sm font-bold text-gray-700">
            Covering the topics that come up in interviews at Magic Circle, Silver Circle, and US
            firms in London
          </p>
        </section>

        {/* SECTION 3: BENEFITS */}
        <section id="benefits" className="border-t-2 border-black bg-white px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 max-w-4xl text-3xl font-black uppercase leading-tight sm:text-4xl">
              Everything You Need to Walk Into Interviews With Confidence
            </h2>
            <p className="max-w-3xl text-gray-600">
              Each topic pack is a complete learning journey — structured content, real-world
              scenarios, and quick-fire revision.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                [
                  "Structured Topic Packs",
                  "Each pack breaks a complex topic into 8–15 short sections with practical examples. No walls of text — just clear, digestible learning.",
                  "bg-[#FEF08A]",
                ],
                [
                  "Scenario-Based Quizzes",
                  "Questions that present realistic situations and ask what you'd advise. The same style of thinking firms test in interviews.",
                  "bg-white",
                ],
                [
                  "Flashcards for Recall",
                  "Lock in key terms, definitions, and concepts. Flip through them before an interview or assessment day.",
                  "bg-[#D1FAE5]",
                ],
                [
                  "Track Your Progress",
                  "See which packs you've completed, where you left off, and your quiz scores. Pick up exactly where you stopped.",
                  "bg-[#FED7AA]",
                ],
              ].map(([title, text, background]) => (
                <article
                  key={title}
                  className={`rounded-xl border-2 border-black p-6 shadow-[6px_6px_0_0_#000] ${background}`}
                >
                  <h3 className="text-lg font-black uppercase">{title}</h3>
                  <p className="mt-3 text-sm text-gray-700">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: HOW IT WORKS */}
        <section id="how-it-works" className="border-t-2 border-black bg-[#F5F5F5] px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-black uppercase sm:text-4xl">
              Three Stages. One Complete Learning Journey.
            </h2>
            <p className="mx-auto max-w-3xl text-center text-gray-600">
              Every topic pack follows the same proven structure.
            </p>
            <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
              {[
                ["01", "Learn", "Work through each section at your own pace. Every concept is explained clearly with a real-world example."],
                ["02", "Quiz", "Once you've finished learning, unlock a scenario-based quiz that tests whether you can apply the concepts."],
                ["03", "Revise", "Use flashcards to lock in the key terms and definitions. Come back any time for a quick refresh."],
              ].map(([number, title, text]) => (
                <article
                  key={number}
                  className="rounded-xl border-2 border-black bg-white p-6 text-center shadow-[6px_6px_0_0_#000]"
                >
                  <p className="text-2xl font-black uppercase text-black">{number}</p>
                  <h3 className="mt-2 text-lg font-black uppercase">{title}</h3>
                  <p className="mt-3 text-gray-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: TOPIC PACK PREVIEW */}
        <section id="features" className="border-t-2 border-black bg-white px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-black uppercase sm:text-4xl">
              What&apos;s Inside the Library
            </h2>
            <p className="mx-auto max-w-3xl text-center text-gray-600">
              15 expert-written topic packs covering the areas law firms care about most.
            </p>

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topicPacks.map((pack) => (
                <article
                  key={pack.title}
                  className="rounded-xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-black uppercase">{pack.title}</h3>
                    {pack.locked ? <Lock className="mt-0.5 size-5" /> : null}
                  </div>
                  <p className="mt-3 text-sm font-bold uppercase text-gray-500">{pack.sections}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border-2 border-black bg-[#DBEAFE] px-2.5 py-1 text-[10px] font-bold uppercase text-black">
                      {pack.category}
                    </span>
                    <span className="text-xs font-bold uppercase text-gray-500">
                      {pack.locked ? "Locked" : "Free"}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <p className="mx-auto mt-10 max-w-4xl text-center text-gray-700">
              Plus 9 more packs covering IPOs, joint ventures, tech and AI, regulation, trade,
              energy, property, and healthcare.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-black bg-[#FACC15] px-7 text-sm font-bold"
              >
                Explore the full library
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 6: USE CASES */}
        <section className="border-t-2 border-black bg-white px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-black uppercase sm:text-4xl">
              Your Secret Weapon for Law Applications
            </h2>
            <p className="mx-auto max-w-3xl text-center text-gray-600">
              Designed for the moments where commercial awareness depth makes the difference.
            </p>
            <div className="mx-auto mt-10 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  "Training Contract Applications",
                  "Demonstrate genuine commercial awareness in your written answers and cover letters with up-to-date knowledge.",
                  "bg-[#FEF9C3]",
                ],
                [
                  "Vacation Scheme Interviews",
                  "Walk into interviews knowing the key deals, market trends, and legal issues that partners actually discuss.",
                  "bg-[#D1FAE5]",
                ],
                [
                  "Assessment Days",
                  "Contribute confidently to group exercises and case studies with structured knowledge across multiple practice areas.",
                  "bg-[#FED7AA]",
                ],
                [
                  "Commercial Law Modules",
                  "Supplement your studies with practical, industry-focused content that goes beyond the textbook.",
                  "bg-[#DBEAFE]",
                ],
              ].map(([title, text, background]) => (
                <article
                  key={title}
                  className={`rounded-xl border-2 border-black p-6 shadow-[6px_6px_0_0_#000] ${background}`}
                >
                  <h3 className="text-base font-black uppercase">{title}</h3>
                  <p className="mt-3 text-sm text-gray-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7: TESTIMONIALS PLACEHOLDER */}
        <section className="border-t-2 border-black bg-[#F5F5F5] px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-black uppercase sm:text-4xl">
              What Students Are Saying
            </h2>
            <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
              {[
                [
                  "I used the M&A pack before my Clifford Chance vac scheme interview and felt genuinely prepared for the partner conversation.",
                  "Law student, University of Bristol",
                ],
                [
                  "The scenario-based quizzes are brilliant — they test you the same way firms do in interviews. Way better than just reading the news.",
                  "LPC student, BPP London",
                ],
                [
                  "I went from dreading commercial awareness questions to actually enjoying them. The topic packs break everything down perfectly.",
                  "Law student, University of Manchester",
                ],
              ].map(([quote, name]) => (
                <article
                  key={name}
                  className="rounded-xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Quote className="size-5" />
                    <Stars />
                  </div>
                  <p className="mt-4 text-sm text-gray-700">{quote}</p>
                  <p className="mt-5 text-xs font-bold uppercase text-gray-500">{name}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8: PRICING */}
        <section id="pricing" className="border-t-2 border-black bg-white px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-black uppercase sm:text-4xl">
              Simple, Student-Friendly Pricing
            </h2>
            <p className="mx-auto max-w-3xl text-center text-gray-600">
              Start free. Upgrade when you&apos;re ready for the full library.
            </p>

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 lg:grid-cols-3">
              <article className="rounded-xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
                <h3 className="text-lg font-black uppercase">Free</h3>
                <p className="mt-2 text-4xl font-black uppercase">£0</p>
                <p className="mt-2 text-sm font-bold text-gray-600">Get started</p>
                <ul className="mt-6 space-y-2 text-sm text-gray-700">
                  <li>3 full topic packs</li>
                  <li>Learn, Quiz, and Flashcards</li>
                  <li>Progress tracking</li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg border-2 border-black bg-[#FACC15] px-7 text-sm font-bold"
                >
                  Start for free
                </Link>
              </article>

              <article className="relative rounded-xl border-2 border-black bg-[#DBEAFE] p-7 shadow-[8px_8px_0_0_#000]">
                <span className="absolute right-4 top-4 rounded-full border-2 border-black bg-black px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                  Most Popular
                </span>
                <h3 className="text-lg font-black uppercase">Student</h3>
                <p className="mt-2 text-4xl font-black uppercase">£7.99/mo</p>
                <p className="mt-2 text-sm font-bold text-gray-700">or £59.99/year (save 37%)</p>
                <ul className="mt-6 space-y-2 text-sm text-gray-800">
                  <li>All 15+ topic packs</li>
                  <li>New packs as they&apos;re added</li>
                  <li>Full progress tracking</li>
                  <li>Priority access to new content</li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg border-2 border-black bg-[#FACC15] px-7 text-sm font-bold"
                >
                  Start free trial
                </Link>
              </article>

              <article className="rounded-xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
                <h3 className="text-lg font-black uppercase">Pro</h3>
                <p className="mt-2 text-4xl font-black uppercase">£14.99/mo</p>
                <p className="mt-2 text-sm font-bold text-gray-600">or £119.99/year</p>
                <ul className="mt-6 space-y-2 text-sm text-gray-700">
                  <li>Everything in Student</li>
                  <li>Upload your own documents</li>
                  <li>AI-generated summaries, quizzes, and flashcards from your uploads</li>
                  <li>Perfect for custom revision</li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg border-2 border-black bg-[#FACC15] px-7 text-sm font-bold"
                >
                  Start free trial
                </Link>
              </article>
            </div>

            <p className="mx-auto mt-6 max-w-5xl text-center text-xs font-bold uppercase text-gray-500">
              Note: Pricing buttons link to signup for now. Stripe coming soon.
            </p>
          </div>
        </section>

        {/* SECTION 9: FAQ */}
        <section id="faq" className="border-t-2 border-black bg-[#F5F5F5] px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-black uppercase sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <div className="mx-auto mt-10 max-w-4xl rounded-xl border-2 border-black bg-white p-2 shadow-[6px_6px_0_0_#000]">
              <Accordion.Root type="single" collapsible className="w-full">
                {faqItems.map((item, idx) => (
                  <Accordion.Item
                    key={item.q}
                    value={`item-${idx}`}
                    className="border-b-2 border-black last:border-b-0"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-black uppercase transition-colors hover:bg-gray-50">
                        <span>{item.q}</span>
                        <ArrowRight className="size-4 shrink-0 transition-transform data-[state=open]:rotate-90" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="px-4 pb-4 text-sm leading-relaxed text-gray-700">
                      {item.a}
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </div>
          </div>
        </section>

        {/* SECTION 10: FINAL CTA */}
        <section className="border-t-2 border-black bg-[#FED7AA] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-black uppercase sm:text-5xl">Start Learning Smarter Today</h2>
            <p className="mt-4 text-gray-700">Free to start. No credit card required.</p>
            <Link
              href="/signup"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-lg border-2 border-black bg-[#FACC15] px-8 text-base font-black"
            >
              Create your free account
            </Link>
          </div>
        </section>

        <footer className="border-t-2 border-black bg-black px-4 py-12 text-sm text-gray-400 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-8 sm:flex-row sm:justify-between">
            <div>
              <p className="text-base font-bold text-white">Commercial Awareness</p>
              <p className="mt-4 text-gray-500">© 2026 Commercial Awareness. All rights reserved.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-gray-400">
              <a href="#benefits">Benefits</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
              <Link href="/signup">Start for free</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
