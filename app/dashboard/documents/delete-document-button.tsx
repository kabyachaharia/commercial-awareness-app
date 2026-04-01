"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type DeleteDocumentButtonProps = {
  materialId: string;
  materialTitle: string;
};

export function DeleteDocumentButton({ materialId, materialTitle }: DeleteDocumentButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/materials/${materialId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      router.refresh();
    } catch {
      alert("Could not delete document. Please try again.");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowConfirm(true);
        }}
        className="absolute top-3 right-3 z-10 flex size-7 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 transition-colors hover:border-red-300 hover:text-red-500"
        aria-label="Delete document"
      >
        <Trash2 className="size-3.5" />
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowConfirm(false);
          }}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl border-2 border-black bg-white p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[15px] font-black text-black">Delete document?</p>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
              This will permanently delete &ldquo;{materialTitle}&rdquo; and all its generated summaries, quizzes, and flashcards.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirm(false);
                }}
                className="cursor-pointer rounded-full border-2 border-black bg-white px-5 py-2 text-[13px] font-bold text-black transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete();
                }}
                className="cursor-pointer rounded-full border-2 border-[#991b1b] bg-[#FCEBEB] px-5 py-2 text-[13px] font-bold text-[#991b1b] transition-colors hover:bg-[#F7C1C1]"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
