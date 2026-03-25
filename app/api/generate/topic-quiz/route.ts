import { NextResponse } from "next/server";

import { createOpenAIClient, truncateTextForModel } from "@/lib/ai";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type QuizQuestion = {
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correct_answer: string;
  explanation: string;
};

function parseTopicQuizPayload(content: string) {
  const parsed = JSON.parse(content) as { quiz?: QuizQuestion[]; questions?: QuizQuestion[] } | QuizQuestion[];
  const items = Array.isArray(parsed) ? parsed : (parsed.quiz ?? parsed.questions);

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Invalid quiz payload from AI.");
  }

  return items;
}

function topicQuizPrompt(content: string) {
  return `You are an expert commercial awareness tutor preparing law students for vacation scheme and training contract interviews at UK law firms.

Based on the following study material, generate 30 quiz questions that test the student's ability to APPLY the concepts, not just recall definitions.

Requirements:
- At least 20 questions should present a short practical scenario (2-3 sentences) and ask what the student should advise or what concept applies
- Include 'why' questions that test understanding (e.g. 'Why would a PE seller prefer a locked box mechanism?')
- Include questions that compare two concepts (e.g. 'What is the key difference between a warranty claim and an indemnity claim?')
- Mix of multiple choice (4 options) and true/false
- Each question must have a correct answer and a clear explanation
- Questions should be at the level expected in a law firm interview, not a law exam

Return only valid JSON with this exact shape: {"quiz":[{"question":"...","type":"multiple_choice","options":["A","B","C","D"],"correct_answer":"...","explanation":"..."}, ...]}. Use type "multiple_choice" or "true_false". For true/false, options must be ["True","False"].

STUDY MATERIAL:
${content}`;
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
          role: "user",
          content: topicQuizPrompt(sourceText),
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return NextResponse.json({ error: "Failed to generate quiz." }, { status: 500 });
    }

    const quiz = parseTopicQuizPayload(rawContent);

    await supabase.from("topic_quizzes").delete().eq("topic_pack_id", topicPackId);

    const { data: savedQuiz, error: insertError } = await supabase
      .from("topic_quizzes")
      .insert({
        topic_pack_id: topicPackId,
        questions: quiz,
      })
      .select("*");

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ quiz: savedQuiz });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate topic quiz.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
