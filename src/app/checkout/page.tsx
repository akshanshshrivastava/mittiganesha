import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutClient } from "./CheckoutClient";
import { getRazorpayKeyId } from "@/lib/razorpay";
import { getProduct } from "@/lib/shopify";
import { requireCheckoutSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ handle?: string }>;
}) {
  const { handle } = await searchParams;
  if (!handle) redirect("/");

  const checkoutPath = `/checkout?handle=${encodeURIComponent(handle)}`;
  const { session, redirect: loginRedirect } = await requireCheckoutSession(checkoutPath);
  if (loginRedirect) redirect(loginRedirect);
  if (!session) redirect("/login");

  const product = await getProduct(handle);
  if (!product) redirect("/");

  let razorpayKeyId = "";
  try {
    razorpayKeyId = getRazorpayKeyId();
  } catch {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif text-2xl text-clay-900">Payments not configured</h1>
        <p className="mt-3 text-clay-600">
          Razorpay keys are missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment.
        </p>
        <Link href="/" className="mt-6 inline-block text-maroon hover:underline">
          ← Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="relative grain pattern-rings py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Link
          href={`/products/${handle}`}
          className="inline-flex items-center text-sm text-clay-500 transition hover:text-maroon"
        >
          ← Back to product
        </Link>
        <h1 className="mt-6 font-serif text-4xl font-semibold text-clay-900">Checkout</h1>
        <p className="mt-2 text-clay-600">
          {session.type === "guest" ? "Checking out as guest" : `Signed in as ${session.email}`}
        </p>

        <div className="mt-10">
          <CheckoutClient
            product={product}
            razorpayKeyId={razorpayKeyId}
            session={{
              type: session.type,
              name: session.name,
              email: session.email,
              phone: session.phone,
            }}
          />
        </div>
      </div>
    </div>
  );
}
