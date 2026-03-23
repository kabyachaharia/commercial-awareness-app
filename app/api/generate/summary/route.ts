import { NextResponse } from "next/server";

import { createOpenAIClient, truncateTextForModel } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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
      messages: [
        {
          role: "system",
          content:
            "You are an expert commercial awareness tutor. Create a clear, structured summary highlighting: key facts and figures, industry/market implications, why this matters for commercial awareness, and key takeaways.",
        },
        {
          role: "user",
          content: `Source material:\n\n${sourceText}`,
        },
      ],
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    if (!summary) {
      return NextResponse.json({ error: "Failed to generate summary." }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("materials")
      .update({ summary })
      .eq("id", material.id)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate summary.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
