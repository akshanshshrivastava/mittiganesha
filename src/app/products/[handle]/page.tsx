import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/BuyButton";
import { OrnamentDivider } from "@/components/Ornament";
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
    <div className="relative grain pattern-rings">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white/70 px-4 py-2 text-sm font-medium text-clay-600 backdrop-blur-sm transition hover:border-maroon/30 hover:text-maroon"
        >
          ← Back to collection
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-saffron/25 to-terracotta/15 blur-xl" />
            <div className="frame-ornate relative aspect-square overflow-hidden rounded-[1.75rem] border-4 border-white bg-clay-100 shadow-2xl shadow-clay-900/10">
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
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
              Mitti Ganesha · 6 inch
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-clay-900 sm:text-5xl">
              {product.title}
            </h1>
            <OrnamentDivider className="my-6 max-w-[200px]" />
            <p className="text-3xl font-semibold text-gradient-gold">
              {formatPrice(product.price, product.currencyCode)}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Natural clay", "Eco-friendly", "Visarjan-safe", "Handcrafted"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-clay-200 bg-white/80 px-3 py-1 text-xs font-medium text-clay-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div
              className="prose prose-stone mt-8 max-w-none text-clay-600"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            <div className="mt-10 rounded-2xl border border-clay-200/80 bg-white/70 p-6 backdrop-blur-sm">
              <BuyButton handle={product.handle} available={product.available} />
              <p className="mt-4 text-center text-xs text-clay-400 sm:text-left">
                Secure checkout via Razorpay · UPI · Cards · Netbanking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
