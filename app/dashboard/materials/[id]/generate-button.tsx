"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type GenerateButtonProps = {
  materialId: string;
  type: "summary" | "quiz" | "flashcards";
  label: string;
};

export function GenerateButton({ materialId, type, label }: GenerateButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onClick() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/generate/${type}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ materialId }),
      });

      if (!res.ok) {
        const message = (await res.text()) || "Failed to generate content.";
        throw new Error(message);
      }

      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={onClick} disabled={isLoading}>
        {isLoading ? "Generating…" : label}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

