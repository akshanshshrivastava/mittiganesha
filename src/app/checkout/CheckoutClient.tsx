"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useMemo, useState, type ReactNode } from "react";
import { OrnamentDivider } from "@/components/Ornament";
import {
  formatDeliveryAddress,
  getEstimatedDelivery,
  INDIAN_STATES,
  validateDeliveryAddress,
  type DeliveryAddress,
  type DeliveryEstimate,
} from "@/lib/delivery";
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

const inputClass =
  "w-full rounded-xl border border-clay-200 bg-white/80 px-4 py-3 outline-none transition focus:border-maroon/40 focus:ring-2 focus:ring-maroon/10";

export function CheckoutClient({ product, razorpayKeyId, session }: CheckoutClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<"delivery" | "payment">("delivery");
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState<DeliveryAddress>({
    name: session.name || "",
    email: session.email || "",
    phone: session.phone || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scriptReady, setScriptReady] = useState(false);

  const total = parseFloat(product.price) * quantity;

  const deliveryEstimate: DeliveryEstimate | null = useMemo(
    () => getEstimatedDelivery(address.pincode),
    [address.pincode],
  );

  function updateField<K extends keyof DeliveryAddress>(key: K, value: DeliveryAddress[K]) {
    setAddress((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function handleContinueToPayment() {
    const validationError = validateDeliveryAddress(address);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!deliveryEstimate) {
      setError("Please enter a valid pincode to see delivery estimate.");
      return;
    }
    setError("");
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handlePay() {
    if (!scriptReady || !window.Razorpay) {
      setError("Payment system is still loading. Please try again.");
      return;
    }

    const validationError = validateDeliveryAddress(address);
    if (validationError || !deliveryEstimate) {
      setError(validationError || "Invalid delivery details.");
      setStep("delivery");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: product.handle,
          quantity,
          delivery: {
            ...address,
            formatted: formatDeliveryAddress(address),
            estimate: deliveryEstimate.label,
            estimatedBy: deliveryEstimate.estimatedBy,
          },
        }),
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
          name: address.name.trim(),
          email: address.email.trim(),
          contact: address.phone.trim(),
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
              handle: product.handle,
              quantity,
              delivery: {
                ...address,
                estimate: deliveryEstimate.label,
                estimatedBy: deliveryEstimate.estimatedBy,
              },
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
            delivery: deliveryEstimate.label,
            estimated_by: deliveryEstimate.estimatedBy,
            address: formatDeliveryAddress(address),
          });
          if (verifyData.shopifyOrderName) {
            params.set("shopify_order", verifyData.shopifyOrderName);
          }
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

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-3 text-sm">
        <StepBadge number={1} label="Delivery" active={step === "delivery"} done={step === "payment"} />
        <div className="h-px w-10 bg-clay-300" />
        <StepBadge number={2} label="Payment" active={step === "payment"} done={false} />
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Order summary — always visible */}
        <div className="card-artisan rounded-3xl p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
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

          {step === "delivery" && (
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
          )}

          <OrnamentDivider className="my-6" />
          <div className="flex items-center justify-between text-lg">
            <span className="font-medium text-clay-700">Total</span>
            <span className="font-serif text-2xl font-semibold text-maroon">
              {formatPrice(String(total), product.currencyCode)}
            </span>
          </div>

          {deliveryEstimate && (
            <div className="mt-6 rounded-2xl border border-green-200/80 bg-green-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-green-800">
                Estimated delivery
              </p>
              <p className="mt-1 font-medium text-green-900">{deliveryEstimate.label}</p>
              <p className="mt-1 text-sm text-green-700">
                Expected by <strong>{deliveryEstimate.estimatedBy}</strong>
              </p>
              <p className="mt-2 text-xs text-green-600">
                {deliveryEstimate.zone === "metro"
                  ? "Metro city — faster shipping"
                  : "Standard shipping across India"}
              </p>
            </div>
          )}

          {step === "payment" && address.pincode && (
            <div className="mt-6 rounded-2xl bg-clay-100/80 p-4 text-sm">
              <p className="font-medium text-clay-800">Delivering to</p>
              <p className="mt-1 text-clay-600">{address.name}</p>
              <p className="mt-1 text-clay-600">{formatDeliveryAddress(address)}</p>
              <button
                type="button"
                onClick={() => setStep("delivery")}
                className="mt-3 text-xs font-medium text-maroon hover:underline"
              >
                Edit address
              </button>
            </div>
          )}
        </div>

        {/* Right panel — delivery or payment */}
        <div className="card-artisan rounded-3xl p-6 sm:p-8">
          {step === "delivery" ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
                Step 1 of 2
              </p>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-clay-900">
                Contact & delivery address
              </h2>
              <p className="mt-2 text-sm text-clay-500">
                We need your full address before payment. Delivery estimate is based on your pincode.
              </p>

              <div className="mt-6 space-y-4">
                <Field label="Full name *" id="name">
                  <input
                    id="name"
                    value={address.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={inputClass}
                    placeholder="Akshansh Shrivastava"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email *" id="email">
                    <input
                      id="email"
                      type="email"
                      value={address.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Mobile *" id="phone">
                    <input
                      id="phone"
                      type="tel"
                      value={address.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={inputClass}
                      placeholder="9876543210"
                    />
                  </Field>
                </div>

                <Field label="Address line 1 *" id="address1">
                  <input
                    id="address1"
                    value={address.addressLine1}
                    onChange={(e) => updateField("addressLine1", e.target.value)}
                    className={inputClass}
                    placeholder="House no., building, street"
                  />
                </Field>

                <Field label="Address line 2" id="address2">
                  <input
                    id="address2"
                    value={address.addressLine2}
                    onChange={(e) => updateField("addressLine2", e.target.value)}
                    className={inputClass}
                    placeholder="Landmark, area (optional)"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City *" id="city">
                    <input
                      id="city"
                      value={address.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className={inputClass}
                      placeholder="Mumbai"
                    />
                  </Field>
                  <Field label="Pincode *" id="pincode">
                    <input
                      id="pincode"
                      value={address.pincode}
                      onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className={inputClass}
                      placeholder="400001"
                      maxLength={6}
                      inputMode="numeric"
                    />
                  </Field>
                </div>

                <Field label="State *" id="state">
                  <select
                    id="state"
                    value={address.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {error && <ErrorBox message={error} />}

              <button
                type="button"
                onClick={handleContinueToPayment}
                disabled={!product.available}
                className="btn-primary mt-8 w-full rounded-2xl py-4 text-base font-semibold text-white disabled:opacity-60"
              >
                Continue to payment →
              </button>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
                Step 2 of 2
              </p>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-clay-900">
                Review & pay
              </h2>
              <p className="mt-2 text-sm text-clay-500">
                Confirm your order details below, then pay securely via Razorpay.
              </p>

              {deliveryEstimate && (
                <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-5">
                  <p className="flex items-center gap-2 font-medium text-amber-900">
                    <span>🚚</span> Delivery: {deliveryEstimate.label}
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    Your idol should arrive by <strong>{deliveryEstimate.estimatedBy}</strong>
                  </p>
                </div>
              )}

              {error && <ErrorBox message={error} />}

              <button
                type="button"
                onClick={handlePay}
                disabled={loading || !product.available}
                className="btn-primary mt-8 w-full rounded-2xl py-4 text-base font-semibold text-white disabled:opacity-60"
              >
                {loading
                  ? "Opening Razorpay…"
                  : `Pay ${formatPrice(String(total), product.currencyCode)} securely`}
              </button>

              <button
                type="button"
                onClick={() => setStep("delivery")}
                className="mt-4 w-full text-center text-sm text-clay-500 hover:text-maroon"
              >
                ← Back to delivery details
              </button>

              <p className="mt-4 text-center text-xs text-clay-400">
                Secure UPI · Cards · Netbanking · Wallets via Razorpay
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function StepBadge({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${active ? "text-maroon" : done ? "text-green-700" : "text-clay-400"}`}>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          active
            ? "bg-maroon text-white"
            : done
              ? "bg-green-600 text-white"
              : "bg-clay-200 text-clay-500"
        }`}
      >
        {done ? "✓" : number}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-clay-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
  );
}
