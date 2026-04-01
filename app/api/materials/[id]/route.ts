import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the material belongs to the user
  const { data: material } = await supabase
    .from("materials")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!material) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete related quizzes and flashcards first
  await supabase.from("quizzes").delete().eq("material_id", id);
  await supabase.from("flashcards").delete().eq("material_id", id);

  // Delete the material itself
  const { error } = await supabase.from("materials").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Could not delete document" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
