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

    const body = (await request.json()) as { material_id?: string };
    const materialId = body.material_id;

    if (!materialId) {
      return NextResponse.json({ error: "material_id is required." }, { status: 400 });
    }

    const { data: material, error: fetchError } = await supabase
      .from("materials")
      .select("id, extracted_text")
      .eq("id", materialId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !material) {
      return NextResponse.json({ error: "Material not found." }, { status: 404 });
    }

    const sourceText = truncateTextForModel(material.extracted_text ?? "");
    if (!sourceText.trim()) {
      return NextResponse.json({ error: "No extracted text available for this material." }, { status: 400 });
    }

    const openai = createOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert commercial awareness tutor. Create 15 to 20 concise flashcards from the material. Respond only as valid JSON in this shape: {\"flashcards\":[{\"front\":\"\",\"back\":\"\"}]}.",
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

    await supabase.from("flashcards").delete().eq("material_id", material.id);

    const { data: savedFlashcards, error: insertError } = await supabase
      .from("flashcards")
      .insert({
        material_id: material.id,
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
