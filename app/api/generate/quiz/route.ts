import { NextResponse } from "next/server";

import { createOpenAIClient, truncateTextForModel } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type QuizQuestion = {
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correct_answer: string;
  explanation: string;
};

function parseQuizPayload(content: string) {
  const parsed = JSON.parse(content) as { quiz?: QuizQuestion[] } | QuizQuestion[];
  const items = Array.isArray(parsed) ? parsed : parsed.quiz;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Invalid quiz payload from AI.");
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
            "You are an expert commercial awareness tutor. Generate exactly 10 quiz questions based on the material. Mix multiple choice and true/false. Respond only as valid JSON with the shape: {\"quiz\":[{\"question\":\"\",\"type\":\"multiple_choice|true_false\",\"options\":[\"\"],\"correct_answer\":\"\",\"explanation\":\"\"}]}.",
        },
        {
          role: "user",
          content: `Create the quiz from this material:\n\n${sourceText}`,
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ error: "Failed to generate quiz." }, { status: 500 });
    }

    const quiz = parseQuizPayload(rawContent);

    await supabase.from("quizzes").delete().eq("material_id", material.id);

    const { data: savedQuiz, error: insertError } = await supabase
      .from("quizzes")
      .insert({
        material_id: material.id,
        questions: quiz,
      })
      .select("*");

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ quiz: savedQuiz });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate quiz.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
