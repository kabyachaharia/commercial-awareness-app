import { NextResponse } from "next/server";

import { createOpenAIClient, truncateTextForModel } from "@/lib/ai";
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

    const body = (await request.json()) as { material_id?: string; source_text?: string };
    const materialId = body.material_id;
    const rawSourceText = body.source_text;

    const material = materialId
      ? await supabase
          .from("materials")
          .select("id, extracted_text")
          .eq("id", materialId)
          .eq("user_id", user.id)
          .single()
      : null;

    if (materialId) {
      if (!material || material.error || !material.data) {
        return NextResponse.json({ error: "Material not found." }, { status: 404 });
      }
    }

    const sourceText = truncateTextForModel(
      rawSourceText ?? material?.data?.extracted_text ?? ""
    );
    if (!sourceText.trim()) {
      return NextResponse.json({ error: "No source text provided." }, { status: 400 });
    }

    const openai = createOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
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

    if (!materialId) {
      return NextResponse.json({ flashcards });
    }

    await supabase.from("flashcards").delete().eq("material_id", material!.data!.id);

    const { data: savedFlashcards, error: insertError } = await supabase
      .from("flashcards")
      .insert({
        material_id: material!.data!.id,
        cards: flashcards,
      })
      .select("*");

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ flashcards: savedFlashcards });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate flashcards.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
