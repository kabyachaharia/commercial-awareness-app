import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      student: {
        monthly: process.env.STRIPE_STUDENT_MONTHLY_PRICE_ID ?? "",
        yearly: process.env.STRIPE_STUDENT_YEARLY_PRICE_ID ?? "",
      },
      pro: {
        monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
        yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load Stripe prices.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
