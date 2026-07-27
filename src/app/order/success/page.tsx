import Link from "next/link";
import { OrnamentDivider } from "@/components/Ornament";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string; product?: string; amount?: string }>;
}) {
  const { payment_id, product, amount } = await searchParams;

  return (
    <div className="relative grain pattern-rings py-20 sm:py-28">
      <div className="card-artisan mx-auto max-w-lg rounded-3xl p-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-50 text-4xl">
          ✓
        </div>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-clay-900">Payment successful</h1>
        <OrnamentDivider className="mx-auto my-6 max-w-xs" />
        <p className="text-clay-600">
          Thank you for your order. Your devotion supports eco-friendly craftsmanship.
        </p>

        {product && (
          <div className="mt-6 rounded-2xl bg-clay-100/80 p-5 text-left text-sm">
            <p>
              <span className="font-medium text-clay-700">Product:</span> {product}
            </p>
            {amount && (
              <p className="mt-2">
                <span className="font-medium text-clay-700">Amount:</span> ₹{amount}
              </p>
            )}
            {payment_id && (
              <p className="mt-2 break-all">
                <span className="font-medium text-clay-700">Payment ID:</span> {payment_id}
              </p>
            )}
          </div>
        )}

        <p className="mt-6 font-serif text-maroon/80">श्री गणेशाय नमः</p>

        <Link
          href="/"
          className="btn-primary mt-8 inline-flex rounded-full px-8 py-3 font-semibold text-white"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
