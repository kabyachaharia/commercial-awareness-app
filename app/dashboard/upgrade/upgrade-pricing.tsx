"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

type SubscriptionTier = "free" | "student" | "pro";
type PaidSubscriptionTier = Exclude<SubscriptionTier, "free">;
type BillingPeriod = "monthly" | "yearly";

type UpgradePricingProps = {
  currentTier: SubscriptionTier;
  hasActivePaidSubscription: boolean;
};

type PlanConfig = {
  key: SubscriptionTier;
  name: string;
  monthlyLabel: string;
  yearlyLabel?: string;
  yearlySavings?: string;
  features: string[];
  highlighted?: boolean;
};

const PLAN_ORDER: SubscriptionTier[] = ["free", "student", "pro"];

const PLANS: PlanConfig[] = [
  {
    key: "free",
    name: "Free",
    monthlyLabel: "GBP0",
    features: ["3 full topic packs", "Learn, Quiz, and Flashcards", "Progress tracking"],
  },
  {
    key: "student",
    name: "Student",
    monthlyLabel: "GBP7.99/mo",
    yearlyLabel: "GBP59.99/year",
    yearlySavings: "Save 37%",
    highlighted: true,
    features: [
      "All 15+ topic packs",
      "New packs as they are added",
      "Full progress tracking",
      "Priority access to new content",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    monthlyLabel: "GBP14.99/mo",
    yearlyLabel: "GBP119.99/year",
    yearlySavings: "Save 33%",
    features: [
      "Everything in Student",
      "Upload your own documents",
      "AI-generated summaries, quizzes, and flashcards",
      "Perfect for custom revision",
    ],
  },
];

function compareTier(plan: SubscriptionTier, currentTier: SubscriptionTier) {
  return PLAN_ORDER.indexOf(plan) - PLAN_ORDER.indexOf(currentTier);
}

export function UpgradePricing({ currentTier, hasActivePaidSubscription }: UpgradePricingProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionTier | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [priceIds, setPriceIds] = useState<{
    student: { monthly: string; yearly: string };
    pro: { monthly: string; yearly: string };
  }>({
    student: { monthly: "", yearly: "" },
    pro: { monthly: "", yearly: "" },
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPriceIds() {
      setPricesLoading(true);
      try {
        const response = await fetch("/api/stripe/prices");
        const data = (await response.json()) as {
          student?: { monthly?: string; yearly?: string };
          pro?: { monthly?: string; yearly?: string };
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load pricing.");
        }

        if (!cancelled) {
          setPriceIds({
            student: {
              monthly: data.student?.monthly?.trim() ?? "",
              yearly: data.student?.yearly?.trim() ?? "",
            },
            pro: {
              monthly: data.pro?.monthly?.trim() ?? "",
              yearly: data.pro?.yearly?.trim() ?? "",
            },
          });
        }
      } catch (pricesError) {
        if (!cancelled) {
          setError(pricesError instanceof Error ? pricesError.message : "Could not load pricing.");
        }
      } finally {
        if (!cancelled) {
          setPricesLoading(false);
        }
      }
    }

    void loadPriceIds();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPriceId = useMemo(
    () => ({
      student: priceIds.student[billingPeriod],
      pro: priceIds.pro[billingPeriod],
    }),
    [billingPeriod, priceIds]
  );

  async function startCheckout(plan: PaidSubscriptionTier) {
    const priceId = selectedPriceId[plan];
    if (!priceId) {
      setError("This plan is not configured yet. Please contact support.");
      return;
    }

    setError(null);
    setLoadingPlan(plan);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Could not start checkout.");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    setError(null);
    setPortalLoading(true);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not open billing portal.");
      }

      window.location.href = data.url;
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : "Could not open billing portal.");
      setPortalLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 pt-8">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">Upgrade your plan</h1>
        <p className="mx-auto max-w-2xl text-base text-gray-600">
          Choose the plan that matches your preparation style. Upgrade any time.
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-md items-center justify-center gap-3 rounded-xl border-2 border-black bg-white px-4 py-3 shadow-[4px_4px_0_0_#000]">
        <span className={`text-xs font-bold uppercase ${billingPeriod === "monthly" ? "text-black" : "text-gray-500"}`}>
          Monthly
        </span>
        <Switch
          checked={billingPeriod === "yearly"}
          onCheckedChange={(checked) => setBillingPeriod(checked ? "yearly" : "monthly")}
          aria-label="Toggle billing period"
        />
        <span className={`text-xs font-bold uppercase ${billingPeriod === "yearly" ? "text-black" : "text-gray-500"}`}>
          Yearly
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const relation = compareTier(plan.key, currentTier);
          const isCurrentPlan = relation === 0;
          const isIncluded = relation < 0;

          const isPaidPlan = plan.key === "student" || plan.key === "pro";
          const paidKey: PaidSubscriptionTier | null = plan.key === "free" ? null : plan.key;
          const isYearly = billingPeriod === "yearly";
          const isLoading = loadingPlan === plan.key;

          let actionLabel = "";
          let actionDisabled = true;
          let onClick: (() => Promise<void>) | undefined;

          if (isCurrentPlan) {
            actionLabel = "Current Plan";
          } else if (isIncluded) {
            actionLabel = "Included";
          } else if (paidKey) {
            actionLabel = "Upgrade";
            actionDisabled = false;
            onClick = async () => startCheckout(paidKey);
          }

          return (
            <Card
              key={plan.key}
              className={`border-2 border-black ${
                plan.highlighted ? "bg-[#DBEAFE] shadow-[8px_8px_0_0_#000]" : "bg-white shadow-[6px_6px_0_0_#000]"
              }`}
            >
              <CardHeader className="space-y-2">
                {plan.highlighted ? (
                  <span className="w-fit rounded-full border-2 border-black bg-black px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                    Most Popular
                  </span>
                ) : null}
                <CardTitle className="text-lg font-black uppercase">{plan.name}</CardTitle>
                <p className="text-3xl font-black uppercase text-black">
                  {isPaidPlan && isYearly && plan.yearlyLabel ? plan.yearlyLabel : plan.monthlyLabel}
                </p>
                {isPaidPlan ? (
                  <p className="text-sm font-bold text-gray-700">
                    {isYearly
                      ? `${plan.monthlyLabel} equivalent`
                      : `${plan.yearlyLabel} (${plan.yearlySavings})`}
                  </p>
                ) : (
                  <p className="text-sm font-bold text-gray-600">Get started</p>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {isPaidPlan && isYearly && plan.yearlySavings ? (
                  <div className="w-fit rounded-lg border-2 border-black bg-[#D1FAE5] px-2.5 py-1 text-xs font-bold uppercase text-black">
                    {plan.yearlySavings}
                  </div>
                ) : null}

                <ul className="space-y-2 text-sm text-gray-700">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                <Button
                  type="button"
                  className="w-full"
                  variant={actionDisabled ? "outline" : "default"}
                  disabled={actionDisabled || isLoading || pricesLoading}
                  onClick={onClick}
                >
                  {isLoading ? "Redirecting..." : actionLabel}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-lg border-2 border-black bg-[#FEE2E2] px-4 py-3 text-sm font-semibold text-black">
          {error}
        </div>
      ) : null}

      {hasActivePaidSubscription ? (
        <div className="text-center">
          <Button
            type="button"
            variant="link"
            disabled={portalLoading}
            onClick={openPortal}
            className="h-auto text-sm font-bold uppercase"
          >
            {portalLoading ? "Opening..." : "Manage Subscription"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
