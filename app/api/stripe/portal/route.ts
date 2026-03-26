import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type UserSubscriptionRow = {
  stripe_customer_id: string | null;
  status: string | null;
  tier: string | null;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id,status,tier")
      .eq("user_id", user.id)
      .maybeSingle();

    const subscription = (data ?? null) as UserSubscriptionRow | null;
    const isPaidTier = subscription?.tier === "student" || subscription?.tier === "pro";

    if (!subscription?.stripe_customer_id || !isPaidTier || subscription.status !== "active") {
      return NextResponse.json({ error: "No active paid subscription found." }, { status: 400 });
    }

    const origin = request.headers.get("origin") ?? new URL(request.url).origin;

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/dashboard/upgrade`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create portal session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
