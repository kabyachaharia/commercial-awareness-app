"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

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
    monthlyLabel: "£0",
    features: ["3 full topic packs", "Learn, Quiz, and Flashcards", "Progress tracking"],
  },
  {
    key: "student",
    name: "Student",
    monthlyLabel: "£7.99/mo",
    yearlyLabel: "£59.99/year",
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
    monthlyLabel: "£14.99/mo",
    yearlyLabel: "£119.99/year",
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
    <section className="mx-auto w-full max-w-5xl space-y-6 pt-6">
      <header className="text-center">
        <h1
          className="font-[family-name:var(--font-epilogue)] text-xl font-black text-black"
          style={{ textTransform: "none" }}
        >
          Upgrade your plan
        </h1>
        <p className="mx-auto mt-1 max-w-2xl text-sm text-gray-500">
          Choose the plan that matches your preparation style. Upgrade any time.
        </p>
      </header>

      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-full bg-gray-100 p-1">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${billingPeriod === "monthly" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}
            onClick={() => setBillingPeriod("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${billingPeriod === "yearly" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}
            onClick={() => setBillingPeriod("yearly")}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-3">
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
            actionLabel = "Current plan";
          } else if (isIncluded) {
            actionLabel = "Included";
          } else if (paidKey) {
            actionLabel = "Upgrade";
            actionDisabled = false;
            onClick = async () => startCheckout(paidKey);
          }

          const isStudent = plan.key === "student";
          const isPro = plan.key === "pro";

          const cardBg = isStudent ? "bg-[#E8E4F7]" : isPro ? "bg-[#FFF8E1]" : "bg-white";
          const cardBorder = isStudent ? "border-2 border-[#6B5CE7]" : "border border-gray-200";
          const labelColor = isStudent ? "text-[#4A3D8F]" : isPro ? "text-[#854F0B]" : "text-gray-500";
          const priceColor = isStudent ? "text-[#2D2459]" : isPro ? "text-[#633806]" : "text-black";
          const subColor = isStudent ? "text-[#6B5CE7]" : isPro ? "text-[#854F0B]" : "text-gray-500";
          const checkColor = isStudent ? "#6B5CE7" : isPro ? "#E07830" : "#4CAF50";
          const featureColor = isStudent ? "text-[#4A3D8F]" : isPro ? "text-[#854F0B]" : "text-gray-500";

          return (
            <div key={plan.key} className={`relative flex flex-col rounded-2xl ${cardBg} ${cardBorder} p-6`}>
              {isStudent ? (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#6B5CE7] px-3 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap">
                  Most popular
                </span>
              ) : null}

              <p className={`text-[11px] font-semibold uppercase tracking-wider ${labelColor}`}>{plan.name}</p>

              <div className="mt-1 mb-1">
                <span
                  className={`font-[family-name:var(--font-epilogue)] text-[32px] font-black ${priceColor}`}
                  style={{ textTransform: "none" }}
                >
                  {isPaidPlan && isYearly && plan.yearlyLabel
                    ? plan.yearlyLabel.split("/")[0]
                    : plan.monthlyLabel.split("/")[0]}
                </span>
                {isPaidPlan ? <span className={`text-sm ${subColor}`}>/{isYearly ? "year" : "mo"}</span> : null}
              </div>

              {isPaidPlan ? (
                <p className={`text-[12px] font-medium ${subColor} mb-4`}>
                  {isYearly ? `${plan.monthlyLabel} equivalent` : `${plan.yearlyLabel} (${plan.yearlySavings})`}
                </p>
              ) : (
                <p className="mb-4 text-[13px] font-medium text-gray-500">Get started</p>
              )}

              <div className="flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                      <path
                        d="M9 12l2 2 4-4"
                        stroke={checkColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={`text-[13px] ${featureColor}`}>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled={actionDisabled || isLoading || pricesLoading}
                onClick={onClick}
                className={`mt-5 w-full rounded-[10px] px-4 py-2.5 text-[13px] font-medium transition-colors ${
                  isStudent && !actionDisabled
                    ? "bg-[#6B5CE7] text-white hover:bg-[#534AB7]"
                    : isPro && !actionDisabled
                      ? "bg-[#FACC15] border-[1.5px] border-black text-black hover:bg-[#EAB308]"
                      : isStudent && actionDisabled
                        ? "bg-[#6B5CE7] text-white opacity-80"
                        : actionDisabled
                          ? "border border-gray-200 bg-white text-gray-500"
                          : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {isLoading ? "Redirecting..." : actionLabel}
              </button>
            </div>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
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
            className="h-auto text-sm font-medium underline underline-offset-2"
          >
            {portalLoading ? "Opening..." : "Manage Subscription"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
