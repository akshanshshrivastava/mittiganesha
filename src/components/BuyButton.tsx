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
      className="w-full rounded-xl bg-amber-900 px-6 py-3.5 text-base font-medium text-white transition hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {loading ? "Redirecting…" : available ? "Buy now" : "Out of stock"}
    </button>
  );
}
