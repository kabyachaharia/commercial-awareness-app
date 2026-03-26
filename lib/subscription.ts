import { createClient } from "@/lib/supabase/server";

export type SubscriptionTier = "free" | "student" | "pro";

type UserSubscriptionRow = {
  tier: SubscriptionTier | null;
  status: string | null;
};

function normalizeTier(value: string | null | undefined): SubscriptionTier {
  if (value === "student" || value === "pro") return value;
  return "free";
}

export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_subscriptions")
    .select("tier,status")
    .eq("user_id", userId)
    .maybeSingle();

  const subscription = (data ?? null) as UserSubscriptionRow | null;
  if (!subscription || subscription.status !== "active") {
    return "free";
  }

  return normalizeTier(subscription.tier);
}
