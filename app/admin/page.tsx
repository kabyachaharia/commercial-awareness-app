import { redirect } from "next/navigation"

import { ADMIN_EMAIL, isAdminEmail } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"

import { AdminPageClient } from "./page-client"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) {
    redirect("/dashboard")
  }

  return <AdminPageClient adminEmail={ADMIN_EMAIL} />
}
