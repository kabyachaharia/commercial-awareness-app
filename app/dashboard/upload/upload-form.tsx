"use client";

import { Check, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { DragEvent, FormEvent, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export function UploadForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringDrop, setIsHoveringDrop] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<{ id: string; title: string } | null>(null);

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
      return "File is too large. Please upload a file under 4MB.";
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

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("File is too large. Please upload a file under 4MB.");
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

      setUploadSuccess({ id: data.id, title: title.trim() });
    } catch {
      setErrorMessage("Something went wrong while uploading.");
    } finally {
      setIsUploading(false);
    }
  }

  const dropZoneInteractive = isDragging || isHoveringDrop;

  if (uploadSuccess) {
    return (
      <Card className="rounded-2xl border-[1.5px] border-black bg-white shadow-none">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-[#D1FAE5]">
            <Check className="size-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-black uppercase text-black">Upload Successful!</h2>
          <p className="max-w-md text-gray-600">
            &ldquo;{uploadSuccess.title}&rdquo; has been uploaded. Head to your document to generate summaries, quizzes, and
            flashcards.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => {
                router.push(`/dashboard/materials/${uploadSuccess.id}`);
                router.refresh();
              }}
              className="h-11 cursor-pointer rounded-xl border-[1.5px] border-black bg-[#FACC15] px-6 text-sm font-semibold text-black hover:bg-[#EAB308]"
            >
              Generate Study Materials
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setUploadSuccess(null);
                setTitle("");
                setFile(null);
              }}
              className="h-11 cursor-pointer rounded-xl border-[1.5px] border-black bg-white px-6 text-sm font-semibold text-black hover:bg-gray-50"
            >
              Upload Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-[1.5px] border-black bg-white shadow-none">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-base font-semibold">New material</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-black">
              Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. UK Banking Sector Update Q1"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isUploading}
              required
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-black">
              File
            </Label>
            <label
              htmlFor="file-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onMouseEnter={() => setIsHoveringDrop(true)}
              onMouseLeave={() => setIsHoveringDrop(false)}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-7 text-center transition-all duration-300 ${
                isDragging
                  ? "border-[1.5px] border-solid border-black bg-[#FEF08A] shadow-inner rounded-2xl"
                  : dropZoneInteractive
                    ? "border-[1.5px] border-solid border-black bg-[#FEF08A]/70 shadow-sm rounded-2xl"
                    : "border-[1.5px] border-dashed border-black bg-white hover:border-solid hover:bg-[#FEF08A]/50 rounded-2xl"
              }`}
            >
              <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-[#E8E4F7]">
                <UploadCloud className="size-5 text-[#6B5CE7]" />
              </div>
              <p className="text-sm font-bold text-black">{fileLabel}</p>
              <p className="mt-1 text-xs text-gray-500">PDF, DOCX, TXT up to 4MB</p>
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
              <Badge variant="secondary">Ready: {file.name}</Badge>
            </div>
          ) : null}

          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

          <Button
            type="submit"
            className="h-11 w-full cursor-pointer rounded-xl border-[1.5px] border-black bg-[#FACC15] text-sm font-semibold text-black hover:bg-[#EAB308] sm:text-base"
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2.5">
                <svg className="size-[18px] animate-spin" viewBox="0 0 18 18">
                  <circle cx="9" cy="9" r="7" fill="none" stroke="#D4D4D8" strokeWidth="3" />
                  <path
                    d="M9 2a7 7 0 0 1 7 7"
                    fill="none"
                    stroke="#000"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Uploading file...</span>
              </span>
            ) : (
              "Upload & Process"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
