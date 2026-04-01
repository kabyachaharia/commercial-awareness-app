"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GenerateButton } from "./generate-actions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MaterialDetailClientProps = {
  materialId: string;
  title: string;
  summary: string | null;
  uploadDate: string;
  hasQuiz: boolean;
  hasFlashcards: boolean;
};

export function MaterialDetailClient({
  materialId,
  title,
  summary,
  uploadDate,
  hasQuiz,
  hasFlashcards,
}: MaterialDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "quiz" | "flashcards">("summary");
  const [showFullSummary, setShowFullSummary] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Button asChild variant="ghost" className="-ml-3 h-auto justify-start px-3 py-1 text-sm text-gray-600 hover:text-black">
          <Link href="/dashboard/documents">← My Documents</Link>
        </Button>
        <h1 className="text-xl font-black tracking-tight text-black sm:text-2xl" style={{ textTransform: "none" }}>
          📄 {title}
        </h1>
        <p className="text-sm text-gray-500">Uploaded {uploadDate}</p>
      </div>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`flex-1 cursor-pointer rounded-full border-2 px-4 py-2.5 text-[15px] font-medium transition-colors ${
            activeTab === "summary"
              ? "border-black bg-[#FEF08A] text-[#854F0B]"
              : "border-black bg-white text-gray-400"
          }`}
        >
          Summary
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("quiz")}
          className={`flex-1 cursor-pointer rounded-full border-2 px-4 py-2.5 text-[15px] font-medium transition-colors ${
            activeTab === "quiz"
              ? "border-black bg-[#E8E4F7] text-[#6B5CE7]"
              : "border-black bg-white text-gray-400"
          }`}
        >
          Quiz
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("flashcards")}
          className={`flex-1 cursor-pointer rounded-full border-2 px-4 py-2.5 text-[15px] font-medium transition-colors ${
            activeTab === "flashcards"
              ? "border-black bg-[#DDF0D9] text-[#2E7D32]"
              : "border-black bg-white text-gray-400"
          }`}
        >
          Flashcards
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
        {activeTab === "summary" && (
          <div className="space-y-4 p-6">
            {summary ? (
              <>
                <article className="px-0 py-2">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="mt-6 mb-3 text-lg font-bold text-black first:mt-0">{children}</h1>,
                      h2: ({ children }) => <h2 className="mt-5 mb-2 text-base font-bold text-black first:mt-0">{children}</h2>,
                      h3: ({ children }) => <h3 className="mt-4 mb-2 text-base font-semibold text-black first:mt-0">{children}</h3>,
                      h4: ({ children }) => <h4 className="mt-3 mb-2 text-sm font-semibold text-black first:mt-0">{children}</h4>,
                      p: ({ children }) => <p className="mb-3 text-base text-gray-600 last:mb-0" style={{ lineHeight: "1.75" }}>{children}</p>,
                      ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 text-base text-gray-600">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 text-base text-gray-600">{children}</ol>,
                      li: ({ children }) => <li style={{ lineHeight: "1.75" }}>{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                    }}
                  >
                    {showFullSummary || summary.length <= 500 ? summary : summary.slice(0, 500) + "..."}
                  </ReactMarkdown>
                </article>
                {summary.length > 500 && (
                  <div className="flex justify-end border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowFullSummary((v) => !v)}
                      className="cursor-pointer rounded-full border-2 border-black bg-[#FACC15] px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-[#EAB308]"
                    >
                      {showFullSummary ? "Show less" : "Read full summary"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">No summary generated yet.</p>
                <GenerateButton materialId={materialId} target="summary" />
              </div>
            )}
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="space-y-4 p-6">
            {hasQuiz ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <p className="text-base text-gray-600">Test your understanding with AI-generated questions.</p>
                <Link
                  href={`/dashboard/materials/${materialId}/quiz`}
                  className="rounded-full border-2 border-black bg-[#FACC15] px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#EAB308]"
                >
                  Take Quiz
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">No quiz generated yet.</p>
                <GenerateButton materialId={materialId} target="quiz" />
              </div>
            )}
          </div>
        )}

        {activeTab === "flashcards" && (
          <div className="space-y-4 p-6">
            {hasFlashcards ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <p className="text-base text-gray-600">Practice key ideas with rapid recall prompts.</p>
                <Link
                  href={`/dashboard/materials/${materialId}/flashcards`}
                  className="rounded-full border-2 border-black bg-[#FACC15] px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#EAB308]"
                >
                  Study Flashcards
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">No flashcards generated yet.</p>
                <GenerateButton materialId={materialId} target="flashcards" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
