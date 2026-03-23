import mammoth from "mammoth";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function normalizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

function getMimeTypeFromName(filename: string) {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (lower.endsWith(".txt")) {
    return "text/plain";
  }

  return null;
}

export function validateUploadFile(file: File) {
  if (file.size === 0) {
    return "Please select a non-empty file.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File size exceeds 10MB limit.";
  }

  const inferredType = file.type || getMimeTypeFromName(file.name);
  if (!inferredType || !ALLOWED_TYPES.has(inferredType)) {
    return "Unsupported file type. Please upload PDF, DOCX, or TXT.";
  }

  return null;
}

export async function extractTextFromFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (extension === "pdf" || file.type === "application/pdf") {
    const pdfParse = require("pdf-parse") as (dataBuffer: Buffer) => Promise<{ text: string }>;
    const parsed = await pdfParse(buffer);
    return parsed.text.trim();
  }

  if (
    extension === "docx" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (extension === "txt" || file.type === "text/plain") {
    return new TextDecoder("utf-8").decode(arrayBuffer).trim();
  }

  throw new Error("Unsupported file type.");
}

export function buildStoragePath(userId: string, originalName: string) {
  const timestamp = Date.now();
  return `${userId}/${timestamp}-${normalizeFilename(originalName)}`;
}
