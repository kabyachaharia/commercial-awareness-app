import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getUserTier } from "@/lib/subscription";
import { createClient } from "@/lib/supabase/server";

import { UploadForm } from "./upload-form";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userTier = await getUserTier(user.id);
  const canUpload = userTier === "pro";

  return (
    <section className="mx-auto w-full max-w-5xl space-y-10 pt-10">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
            Upload Document
          </h1>
          <p className="text-base text-gray-600">
            Upload a document and we'll generate summaries, quizzes, and flashcards automatically.
          </p>
        </div>

        {canUpload ? (
          <div className="mx-auto w-full max-w-2xl">
            <UploadForm />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl rounded-xl border-2 border-black bg-white px-6 py-10 text-center shadow-[8px_8px_0_0_#000]">
            <h2 className="text-xl font-black uppercase text-black">Pro feature</h2>
            <p className="mx-auto mt-3 max-w-lg text-gray-700">
              Upload your own documents and generate AI summaries, quizzes, and flashcards. This feature is
              available on the Pro plan.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/upgrade">Upgrade to Pro</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
