import { NextResponse } from "next/server";

import { buildStoragePath, extractTextFromFile, validateUploadFile } from "@/lib/file-processing";
import { getUserTier } from "@/lib/subscription";
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

    const userTier = await getUserTier(user.id);
    if (userTier !== "pro") {
      return NextResponse.json({ error: "Uploads are available on the Pro plan." }, { status: 403 });
    }

    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const titleEntry = formData.get("title");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const title = typeof titleEntry === "string" ? titleEntry.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const validationError = validateUploadFile(fileEntry);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const storagePath = buildStoragePath(user.id, fileEntry.name);
    const fileBuffer = Buffer.from(await fileEntry.arrayBuffer());

    const { error: uploadError } = await supabase.storage.from("materials").upload(storagePath, fileBuffer, {
      contentType: fileEntry.type || undefined,
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from("materials").getPublicUrl(storagePath);
    const extractedText = await extractTextFromFile(fileEntry);

    const { data: material, error: insertError } = await supabase
      .from("materials")
      .insert({
        user_id: user.id,
        title,
        original_filename: fileEntry.name,
        file_url: publicUrlData.publicUrl,
        extracted_text: extractedText,
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ id: material.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
