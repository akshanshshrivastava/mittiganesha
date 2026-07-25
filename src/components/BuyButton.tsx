"use client";

import { useState } from "react";
import { buyNow } from "@/app/actions/checkout";

export function BuyButton({
  variantId,
  available,
}: {
  variantId: string;
  available: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const url = await buyNow(variantId);
      window.location.href = url;
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={!available || loading}
      className="btn-primary w-full rounded-2xl px-8 py-4 text-base font-semibold tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
    >
      {loading ? "Opening checkout…" : available ? "Buy now — शुभ लाभ" : "Out of stock"}
    </button>
  );
}
