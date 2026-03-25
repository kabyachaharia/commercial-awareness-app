"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type GenerateButtonProps = {
  materialId: string;
  type: "summary" | "quiz" | "flashcards";
  label: string;
};

const ctaClassName =
  "rounded-lg bg-indigo-500 px-6 font-semibold text-white shadow-sm transition-all duration-300 hover:translate-y-[-1px] hover:bg-indigo-400";

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
        body: JSON.stringify({ material_id: materialId }),
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
      <Button onClick={onClick} disabled={isLoading} className={ctaClassName}>
        {isLoading ? "Generating…" : label}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
