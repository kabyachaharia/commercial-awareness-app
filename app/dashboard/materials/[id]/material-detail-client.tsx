"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GenerateButton } from "./generate-actions";

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
                <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                  {showFullSummary || summary.length <= 500 ? summary : summary.slice(0, 500) + "..."}
                </p>
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
