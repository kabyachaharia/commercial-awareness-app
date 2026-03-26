"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function CheckoutSuccessBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(searchParams.get("checkout") === "success");

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;

    const next = new URLSearchParams(searchParams.toString());
    next.delete("checkout");

    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 4500);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="rounded-xl border-2 border-black bg-[#D1FAE5] px-4 py-3 text-sm font-bold text-black shadow-[4px_4px_0_0_#000]">
      Welcome! Your subscription is now active.
    </div>
  );
}
