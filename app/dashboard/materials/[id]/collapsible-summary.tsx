"use client";

import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CollapsibleSummaryProps = {
  summary: string;
};

export function CollapsibleSummary({ summary }: CollapsibleSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const normalizedSummary = summary.trim().replace(/\s+/g, " ");
  const sentenceMatches = normalizedSummary.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) ?? [normalizedSummary];
  const sentencePreview = sentenceMatches.slice(0, 3).join(" ").trim();
  const previewBase = sentencePreview || normalizedSummary;
  const maxPreviewLength = 180;
  const previewText =
    previewBase.length > maxPreviewLength ? `${previewBase.slice(0, maxPreviewLength).trimEnd()}...` : `${previewBase}...`;

  return (
    <Card className="overflow-hidden rounded-xl bg-white">
      <CardHeader className="space-y-2 border-b-2 border-black bg-[#FEF08A]/40 p-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-black">
              <FileText className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-lg font-bold uppercase">Summary</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Quick commercial-awareness focused overview.
              </CardDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Hide summary" : "Show summary"}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border-2 border-black bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-black transition-colors hover:bg-gray-100"
          >
            <span>{isExpanded ? "Hide" : "Show"}</span>
            <ChevronDown
              className={`size-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
              aria-hidden
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3">
        {isExpanded ? (
          <div className="space-y-3">
            <article className="whitespace-pre-wrap rounded-xl border-2 border-black bg-white px-5 py-5 text-[15px] leading-relaxed text-gray-800">
              {summary}
            </article>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-sm font-medium text-[#4F46E5] transition-colors hover:text-[#4338CA]"
            >
              Hide summary ↑
            </button>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border-2 border-black bg-white px-5 py-5">
            <p className="text-sm text-gray-600">{previewText}</p>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-sm font-medium text-[#4F46E5] transition-colors hover:text-[#4338CA]"
            >
              See full summary →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
