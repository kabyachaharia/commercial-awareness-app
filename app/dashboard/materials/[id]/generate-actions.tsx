"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type GenerateTarget = "summary" | "quiz" | "flashcards";

export function GenerateButton({ materialId, target }: { materialId: string; target: GenerateTarget }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => prev + (95 - prev) * 0.04);
      }, 500);

      return () => clearInterval(interval);
    }

    setProgress(100);
    const timeout = setTimeout(() => setProgress(0), 400);
    return () => clearTimeout(timeout);
  }, [loading]);

  async function handleGenerate() {
    setLoading(true);
    setErrorMessage(null);
    let succeeded = false;

    try {
      const response = await fetch(`/api/generate/${target}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ material_id: materialId }),
      });

      const raw = await response.text();
      let data: { error?: string } | null = null;

      if (raw) {
        try {
          data = JSON.parse(raw) as { error?: string };
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        setErrorMessage((data?.error ?? raw) || `Generation failed (${response.status}).`);
        return;
      }

      succeeded = true;
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      if (succeeded) {
        setProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
      setLoading(false);
    }
  }

  const labels: Record<GenerateTarget, string> = {
    summary: "Generate Summary",
    quiz: "Generate Quiz",
    flashcards: "Generate Flashcards",
  };

  return (
    <div className="space-y-2">
      <Button onClick={handleGenerate} disabled={loading} className="cursor-pointer text-sm">
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            {labels[target]}
          </>
        )}
      </Button>
      {loading ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#854F0B]">
              <svg
                className="size-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span className="text-sm">{`Generating ${target}...`}</span>
            </div>
            <span className="text-sm text-gray-500">{`${Math.round(progress)}%`}</span>
          </div>
          <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#FEF08A]">
            <div
              className="h-full rounded-full bg-[#FACC15] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">Please don&apos;t close the page</p>
        </div>
      ) : null}
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
