import Link from "next/link";
import { OrnamentDivider } from "@/components/Ornament";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    payment_id?: string;
    product?: string;
    amount?: string;
    delivery?: string;
    estimated_by?: string;
    address?: string;
    shopify_order?: string;
  }>;
}) {
  const { payment_id, product, amount, delivery, estimated_by, address, shopify_order } =
    await searchParams;

  return (
    <div className="relative grain pattern-rings py-20 sm:py-28">
      <div className="card-artisan mx-auto max-w-lg rounded-3xl p-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-50 text-4xl">
          ✓
        </div>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-clay-900">Order confirmed!</h1>
        <OrnamentDivider className="mx-auto my-6 max-w-xs" />
        <p className="text-clay-600">
          Thank you for your order. We&apos;ll pack your mitti Ganesha with care and ship it soon.
        </p>

        {(delivery || estimated_by) && (
          <div className="mt-6 rounded-2xl border border-green-200/80 bg-green-50/80 p-5 text-left text-sm">
            <p className="font-medium text-green-900">🚚 Delivery estimate</p>
            {delivery && <p className="mt-1 text-green-800">{delivery}</p>}
            {estimated_by && (
              <p className="mt-1 text-green-700">
                Expected by <strong>{estimated_by}</strong>
              </p>
            )}
          </div>
        )}

        {(product || address) && (
          <div className="mt-4 rounded-2xl bg-clay-100/80 p-5 text-left text-sm">
            {product && (
              <p>
                <span className="font-medium text-clay-700">Product:</span> {product}
              </p>
            )}
            {amount && (
              <p className="mt-2">
                <span className="font-medium text-clay-700">Amount paid:</span> ₹{amount}
              </p>
            )}
            {address && (
              <p className="mt-2">
                <span className="font-medium text-clay-700">Delivering to:</span> {address}
              </p>
            )}
            {shopify_order && (
              <p className="mt-2">
                <span className="font-medium text-clay-700">Shopify order:</span> {shopify_order}
              </p>
            )}
            {payment_id && (
              <p className="mt-2 break-all text-xs text-clay-500">
                Payment ID: {payment_id}
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
