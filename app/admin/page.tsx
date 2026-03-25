import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

import { AdminPageClient } from "./page-client"

export const dynamic = "force-dynamic"

const ADMIN_EMAIL = "kchaharia@gmail.com"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const email = user?.email?.toLowerCase() ?? null
  if (!email || email !== ADMIN_EMAIL.toLowerCase()) {
    redirect("/dashboard")
  }

  return <AdminPageClient adminEmail={ADMIN_EMAIL} />
}
