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
    <section className="mx-auto flex w-full max-w-2xl flex-col justify-center space-y-6 pt-6" style={{ minHeight: "calc(100vh - 120px)" }}>
      <div className="space-y-6">
        <div className="text-center">
          <h1
            className="font-[family-name:var(--font-epilogue)] text-xl font-black text-black"
            style={{ textTransform: "none" }}
          >
            Upload document
          </h1>
          <p className="text-sm text-gray-500">
            Upload a document and we&apos;ll generate summaries, quizzes, and flashcards automatically.
          </p>
        </div>

        {canUpload ? (
          <div className="mx-auto w-full max-w-2xl">
            <UploadForm />
          </div>
        ) : (
          <div className="mx-auto w-full rounded-2xl border-[1.5px] border-black bg-white px-6 py-10 text-center">
            <h2 className="text-base font-semibold text-black">Pro feature</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
              Upload your own documents and generate AI summaries, quizzes, and flashcards. This feature is available
              on the Pro plan.
            </p>
            <Button
              asChild
              className="mt-5 rounded-xl border-[1.5px] border-black bg-[#FACC15] px-6 text-sm font-semibold text-black hover:bg-[#EAB308]"
            >
              <Link href="/dashboard/upgrade">Upgrade to Pro</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
