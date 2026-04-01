"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAccountButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      router.push("/login");
    } catch {
      alert("Could not delete your account. Please try again.");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <div className="border-t border-gray-200 pt-6">
        <p className="text-center text-[13px] font-bold text-[#991b1b]">Danger zone</p>
        <p className="mx-auto mt-1 max-w-sm text-center text-[12px] text-gray-500">
          Permanently delete your account and all associated data.
        </p>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="cursor-pointer rounded-full border-2 border-[#991b1b] bg-[#FCEBEB] px-5 py-2 text-[12px] font-bold text-[#991b1b] hover:bg-[#F7C1C1]"
          >
            Delete my account
          </button>
        </div>
      </div>
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl border-2 border-black bg-white p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[16px] font-black text-[#991b1b]">Delete your account?</p>
            <p className="mt-3 text-[13px] text-gray-600">
              This will permanently delete all your documents, study progress, quizzes, flashcards,
              and your account login.
            </p>
            <p className="mt-3 text-[12px] font-semibold text-[#991b1b]">
              This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="cursor-pointer rounded-full border-2 border-black bg-white px-5 py-2 text-[13px] font-bold text-black hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="cursor-pointer rounded-full border-2 border-[#991b1b] bg-[#FCEBEB] px-5 py-2 text-[13px] font-bold text-[#991b1b] hover:bg-[#F7C1C1]"
              >
                {deleting ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
