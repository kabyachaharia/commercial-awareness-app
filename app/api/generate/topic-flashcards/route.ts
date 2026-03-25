import { NextResponse } from "next/server";

import { createOpenAIClient, truncateTextForModel } from "@/lib/ai";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Flashcard = {
  front: string;
  back: string;
};

function parseFlashcardsPayload(content: string) {
  const parsed = JSON.parse(content) as { flashcards?: Flashcard[] } | Flashcard[];
  const items = Array.isArray(parsed) ? parsed : parsed.flashcards;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Invalid flashcards payload from AI.");
  }

  return items;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as { topic_pack_id?: string };
    const topicPackId = body.topic_pack_id;

    if (!topicPackId) {
      return NextResponse.json({ error: "topic_pack_id is required." }, { status: 400 });
    }

    const { data: sections, error: sectionsError } = await supabase
      .from("topic_sections")
      .select("title, content, position")
      .eq("topic_pack_id", topicPackId)
      .order("position", { ascending: true });

    if (sectionsError) {
      return NextResponse.json({ error: sectionsError.message }, { status: 500 });
    }

    if (!sections?.length) {
      return NextResponse.json({ error: "No sections found for this topic pack." }, { status: 404 });
    }

    const combined = sections
      .map((s, idx) => `Section ${idx + 1}: ${s.title ?? ""}\n\n${s.content ?? ""}`.trim())
      .join("\n\n---\n\n");

    const sourceText = truncateTextForModel(combined);
    if (!sourceText.trim()) {
      return NextResponse.json({ error: "Topic pack has no usable content." }, { status: 400 });
    }

    const openai = createOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert commercial awareness tutor. Create 20 concise flashcards from the material. Respond only as valid JSON in this shape: {\"flashcards\":[{\"front\":\"\",\"back\":\"\"}]}.",
        },
        {
          role: "user",
          content: `Create flashcards from this material:\n\n${sourceText}`,
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ error: "Failed to generate flashcards." }, { status: 500 });
    }

    const flashcards = parseFlashcardsPayload(rawContent);

    await supabase.from("topic_flashcards").delete().eq("topic_pack_id", topicPackId);

    const { data: savedFlashcards, error: insertError } = await supabase
      .from("topic_flashcards")
      .insert({
        topic_pack_id: topicPackId,
        cards: flashcards,
      })
      .select("*");

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ flashcards: savedFlashcards });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate topic flashcards.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
