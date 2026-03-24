"use client";

import { Fragment, type ReactNode, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CollapsibleSummaryProps = {
  summary: string;
};

function renderInlineBoldText(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }

      return <Fragment key={index}>{part}</Fragment>;
    });
}

function renderFormattedSummary(summary: string): ReactNode[] {
  const lines = summary.split(/\r?\n/);

  return lines.map((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return <div key={`space-${index}`} className="h-2" aria-hidden />;
    }

    if (trimmedLine.startsWith("###")) {
      const headingText = trimmedLine.replace(/^###\s*/, "").replace(/\*\*/g, "");

      return (
        <h3 key={`heading-${index}`} className="mt-6 mb-2 text-lg font-bold text-gray-900">
          {headingText}
        </h3>
      );
    }

    const isBulletLine = trimmedLine.startsWith("-");
    const bodyText = isBulletLine ? trimmedLine.replace(/^-+\s*/, "") : trimmedLine;

    return (
      <p
        key={`paragraph-${index}`}
        className={`text-sm leading-relaxed text-gray-700 ${isBulletLine ? "mb-2" : "mb-4"}`}
      >
        {renderInlineBoldText(bodyText)}
      </p>
    );
  });
}

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
            <article className="rounded-xl border-2 border-black bg-white px-5 py-5">
              {renderFormattedSummary(summary)}
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
