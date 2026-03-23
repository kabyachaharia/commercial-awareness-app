"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type GenerateTarget = "summary" | "quiz" | "flashcards";

export function GenerateButton({ materialId, target }: { materialId: string; target: GenerateTarget }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/generate/${target}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ material_id: materialId }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrorMessage(data.error ?? "Generation failed.");
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
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
      <Button onClick={handleGenerate} disabled={loading}>
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
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
    </div>
  );
}
