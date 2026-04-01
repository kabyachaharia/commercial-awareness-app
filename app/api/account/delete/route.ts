import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  // Delete all user data in order (child tables first)
  const materialIds = await supabase
    .from("materials")
    .select("id")
    .eq("user_id", userId);

  const ids = (materialIds.data ?? []).map((m) => m.id as string);

  if (ids.length > 0) {
    await supabase.from("quizzes").delete().in("material_id", ids);
    await supabase.from("flashcards").delete().in("material_id", ids);
  }

  await supabase.from("materials").delete().eq("user_id", userId);
  await supabase.from("user_progress").delete().eq("user_id", userId);
  await supabase.from("user_subscriptions").delete().eq("user_id", userId);
  await supabase.from("profiles").delete().eq("id", userId);

  // Delete the auth user using admin client
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteError) {
    return NextResponse.json({ error: "Could not delete account" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
