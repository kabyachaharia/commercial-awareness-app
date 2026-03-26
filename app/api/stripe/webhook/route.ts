import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type SubscriptionTier = "free" | "student" | "pro";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }
  return value;
}

function mapTierFromPriceId(priceId: string | null | undefined): SubscriptionTier {
  if (!priceId) return "free";

  const studentMonthly = process.env.STRIPE_STUDENT_MONTHLY_PRICE_ID;
  const studentYearly = process.env.STRIPE_STUDENT_YEARLY_PRICE_ID;
  const proMonthly = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const proYearly = process.env.STRIPE_PRO_YEARLY_PRICE_ID;

  if (priceId === studentMonthly || priceId === studentYearly) {
    return "student";
  }

  if (priceId === proMonthly || priceId === proYearly) {
    return "pro";
  }

  return "free";
}

function getServiceRoleSupabaseClient() {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey);
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.metadata?.userId;
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price?.id;
  const tier = mapTierFromPriceId(priceId);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const updatedAt = new Date().toISOString();

  const supabase = getServiceRoleSupabaseClient();

  const { error } = await supabase.from("user_subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      tier,
      status: "active",
      current_period_end: currentPeriodEnd,
      updated_at: updatedAt,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(`Failed to upsert user subscription: ${error.message}`);
  }
}

async function updateSubscriptionFromEvent(
  subscription: Stripe.Subscription,
  options: { forceTier?: SubscriptionTier } = {},
): Promise<void> {
  const stripeSubscriptionId = subscription.id;
  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price?.id;

  const tier = options.forceTier ?? mapTierFromPriceId(priceId);
  const status = options.forceTier === "free" ? "canceled" : subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const updatedAt = new Date().toISOString();

  const supabase = getServiceRoleSupabaseClient();

  const { data: existing, error: lookupError } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Failed to look up subscription row: ${lookupError.message}`);
  }

  if (!existing) {
    return;
  }

  const { error: updateError } = await supabase
    .from("user_subscriptions")
    .update({
      status,
      current_period_end: currentPeriodEnd,
      tier,
      updated_at: updatedAt,
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (updateError) {
    throw new Error(`Failed to update user subscription: ${updateError.message}`);
  }
}

export async function POST(request: Request) {
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeWebhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET environment variable." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionFromEvent(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionFromEvent(subscription, { forceTier: "free" });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process Stripe webhook event.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
