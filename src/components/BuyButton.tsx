"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyButton({
  handle,
  available,
  compact = false,
}: {
  handle: string;
  available: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    router.push(`/checkout?handle=${encodeURIComponent(handle)}`);
  }

  return (
    <button
      onClick={handleBuy}
      disabled={!available || loading}
      className={
        compact
          ? "btn-primary w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          : "btn-primary w-full rounded-2xl px-8 py-4 text-base font-semibold tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
      }
    >
      {loading ? "Redirecting…" : available ? (compact ? "Buy now" : "Buy now — शुभ लाभ") : "Out of stock"}
    </button>
  );
}
