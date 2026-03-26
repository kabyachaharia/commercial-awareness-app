import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { UpgradePricing } from "./upgrade-pricing";

export const dynamic = "force-dynamic";

type SubscriptionTier = "free" | "student" | "pro";

type UserSubscriptionRow = {
  tier: SubscriptionTier | null;
  status: string | null;
};

function normalizeTier(value: string | null | undefined): SubscriptionTier {
  if (value === "student" || value === "pro") return value;
  return "free";
}

export default async function UpgradePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscriptionRow } = await supabase
    .from("user_subscriptions")
    .select("tier,status")
    .eq("user_id", user.id)
    .maybeSingle();

  const subscription = (subscriptionRow ?? null) as UserSubscriptionRow | null;
  const currentTier = normalizeTier(subscription?.tier);
  const hasActivePaidSubscription =
    (currentTier === "student" || currentTier === "pro") && subscription?.status === "active";

  return (
    <UpgradePricing
      currentTier={currentTier}
      hasActivePaidSubscription={hasActivePaidSubscription}
    />
  );
}
