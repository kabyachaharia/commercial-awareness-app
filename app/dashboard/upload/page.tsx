"use client";

import { Loader2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { DragEvent, FormEvent, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export default function UploadPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringDrop, setIsHoveringDrop] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileLabel = useMemo(() => {
    if (!file) {
      return "Drop your file here, or click to browse.";
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    return `${file.name} (${sizeInMb} MB)`;
  }, [file]);

  function validateSelectedFile(nextFile: File) {
    const lowerName = nextFile.name.toLowerCase();
    const hasAcceptedType =
      ACCEPTED_MIME_TYPES.includes(nextFile.type) ||
      ACCEPTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension));

    if (!hasAcceptedType) {
      return "Only PDF, DOCX, and TXT files are allowed.";
    }

    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      return "File exceeds 10MB limit.";
    }

    return null;
  }

  function handleFileSelection(nextFile: File | null) {
    if (!nextFile) {
      return;
    }

    const validationError = validateSelectedFile(nextFile);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setFile(nextFile);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    handleFileSelection(droppedFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!file) {
      setErrorMessage("Please select a file first.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Please enter a title.");
      return;
    }

    setIsUploading(true);
    try {
      const payload = new FormData();
      payload.append("title", title.trim());
      payload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: payload,
      });

      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        setErrorMessage(data.error ?? "Upload failed.");
        return;
      }

      router.push(`/dashboard/materials/${data.id}`);
      router.refresh();
    } catch {
      setErrorMessage("Something went wrong while uploading.");
    } finally {
      setIsUploading(false);
    }
  }

  const dropZoneInteractive = isDragging || isHoveringDrop;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="[font-family:var(--font-sora)] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Upload study material
        </h1>
        <p className="text-base text-slate-600">
          Add an article, report, or notes file and generate summaries, quizzes, and flashcards automatically.
        </p>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="[font-family:var(--font-sora)] text-xl font-semibold text-slate-900">New material</CardTitle>
          <CardDescription className="text-slate-600">
            Supported formats: PDF, DOCX, TXT (max 10MB).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700">
                Title
              </Label>
              <Input
                id="title"
                placeholder="e.g. UK Banking Sector Update Q1"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isUploading}
                required
                className="rounded-lg border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-slate-700">
                File
              </Label>
              <label
                htmlFor="file-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onMouseEnter={() => setIsHoveringDrop(true)}
                onMouseLeave={() => setIsHoveringDrop(false)}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-10 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-solid border-indigo-500 bg-indigo-50/90 shadow-inner"
                    : dropZoneInteractive
                      ? "border-solid border-indigo-500 bg-indigo-50/50 shadow-sm"
                      : "border-dashed border-indigo-300/80 bg-slate-50/80 hover:border-solid hover:border-indigo-500 hover:bg-indigo-50/40"
                }`}
              >
                <UploadCloud
                  className={`mb-3 size-10 ${
                    dropZoneInteractive ? "text-indigo-600" : "text-indigo-500/90"
                  }`}
                />
                <p className="text-sm font-medium text-slate-800">{fileLabel}</p>
                <p className="mt-1 text-xs text-slate-500">PDF, DOCX, TXT up to 10MB</p>
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.docx,.txt"
                  onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
                  disabled={isUploading}
                />
              </label>
            </div>

            {file ? (
              <div className="flex">
                <Badge variant="secondary" className="rounded-full border-0 bg-indigo-100 text-indigo-900">
                  Ready: {file.name}
                </Badge>
              </div>
            ) : null}

            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-lg bg-indigo-500 text-base font-semibold text-white shadow-sm transition-all duration-300 hover:translate-y-[-1px] hover:bg-indigo-400"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Uploading & Processing...
                </>
              ) : (
                "Upload & Process"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
