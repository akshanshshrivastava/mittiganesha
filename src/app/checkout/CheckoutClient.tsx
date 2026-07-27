"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState } from "react";
import { OrnamentDivider } from "@/components/Ornament";
import { formatPrice, type Product } from "@/lib/shopify";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type CheckoutClientProps = {
  product: Product;
  razorpayKeyId: string;
  session: {
    type?: "customer" | "guest";
    name?: string;
    email?: string;
    phone?: string;
  };
};

export function CheckoutClient({ product, razorpayKeyId, session }: CheckoutClientProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState(session.name || "");
  const [email, setEmail] = useState(session.email || "");
  const [phone, setPhone] = useState(session.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scriptReady, setScriptReady] = useState(false);

  const total = parseFloat(product.price) * quantity;

  async function handlePay() {
    if (!scriptReady || !window.Razorpay) {
      setError("Payment system is still loading. Please try again.");
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in your name, email, and phone number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: product.handle, quantity }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Could not start payment");

      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Mitti Ganesha",
        description: product.title,
        order_id: orderData.orderId,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
        theme: { color: "#6b2d22" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              productTitle: product.title,
              amount: total,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setError(verifyData.error || "Payment verification failed");
            setLoading(false);
            return;
          }

          const params = new URLSearchParams({
            payment_id: response.razorpay_payment_id,
            product: product.title,
            amount: String(total),
          });
          router.push(`/order/success?${params.toString()}`);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="card-artisan rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
            Order summary
          </p>
          <div className="mt-6 flex gap-5">
            {product.imageUrl && (
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-clay-100">
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
            )}
            <div>
              <h2 className="font-serif text-2xl font-semibold text-clay-900">{product.title}</h2>
              <p className="mt-1 text-sm text-clay-500">6 inch · Natural clay idol</p>
              <p className="mt-3 text-xl font-semibold text-gradient-gold">
                {formatPrice(product.price, product.currencyCode)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <label htmlFor="qty" className="text-sm font-medium text-clay-700">
              Quantity
            </label>
            <select
              id="qty"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="rounded-xl border border-clay-200 bg-white px-3 py-2 text-sm"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <OrnamentDivider className="my-6" />
          <div className="flex items-center justify-between text-lg">
            <span className="font-medium text-clay-700">Total</span>
            <span className="font-serif text-2xl font-semibold text-maroon">
              {formatPrice(String(total), product.currencyCode)}
            </span>
          </div>
        </div>

        <div className="card-artisan rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
            {session.type === "guest" ? "Guest checkout" : "Signed in"}
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-clay-900">
            Delivery details
          </h2>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-clay-700">
                Full name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-clay-200 bg-white/80 px-4 py-3 outline-none focus:border-maroon/40 focus:ring-2 focus:ring-maroon/10"
              />
            </div>
            <div>
              <label htmlFor="checkout-email" className="mb-1.5 block text-sm font-medium text-clay-700">
                Email
              </label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-clay-200 bg-white/80 px-4 py-3 outline-none focus:border-maroon/40 focus:ring-2 focus:ring-maroon/10"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-clay-700">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-clay-200 bg-white/80 px-4 py-3 outline-none focus:border-maroon/40 focus:ring-2 focus:ring-maroon/10"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <button
            type="button"
            onClick={handlePay}
            disabled={loading || !product.available}
            className="btn-primary mt-8 w-full rounded-2xl py-4 text-base font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Processing…" : `Pay ${formatPrice(String(total), product.currencyCode)} with Razorpay`}
          </button>

          <p className="mt-4 text-center text-xs text-clay-400">
            Secure UPI · Cards · Netbanking via Razorpay
          </p>
        </div>
      </div>
    </>
  );
}
