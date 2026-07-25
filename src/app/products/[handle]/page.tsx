import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/BuyButton";
import { formatPrice, getProduct } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-sm text-stone-500 hover:text-amber-900 transition-colors"
      >
        ← Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="font-serif text-3xl font-semibold text-stone-900 sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-amber-900">
            {formatPrice(product.price, product.currencyCode)}
          </p>
          <p className="mt-2 text-sm text-stone-500">6 inch · Natural clay · Eco-friendly</p>

          <div
            className="mt-6 prose prose-stone max-w-none text-stone-600"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          <div className="mt-8">
            <BuyButton variantId={product.variantId} available={product.available} />
          </div>

          <p className="mt-4 text-xs text-stone-400">
            Secure checkout powered by Shopify
          </p>
        </div>
      </div>
    </div>
  );
}
