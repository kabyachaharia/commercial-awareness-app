import OpenAI from "openai";

const DEFAULT_MAX_INPUT_TOKENS = 12_000;

export function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  return new OpenAI({ apiKey });
}

export function truncateTextForModel(text: string, maxTokens = DEFAULT_MAX_INPUT_TOKENS) {
  const maxChars = maxTokens * 4;
  return text.length > maxChars ? text.slice(0, maxChars) : text;
}
