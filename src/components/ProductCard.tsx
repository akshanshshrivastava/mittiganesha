import Image from "next/image";
import Link from "next/link";
import { BuyButton } from "@/components/BuyButton";
import { formatPrice, type Product } from "@/lib/shopify";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card-artisan group flex flex-col overflow-hidden rounded-2xl transition duration-500 hover:-translate-y-2">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-clay-100 to-clay-200">
          {product.imageUrl ? (
            <>
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                className="object-cover transition duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-clay-900/50 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-clay-400">No image</div>
          )}
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-maroon shadow-sm backdrop-blur-sm">
            6 inch
          </div>
        </div>
      </Link>

      <div className="relative flex flex-1 flex-col p-5">
        <div className="absolute left-5 right-5 top-0 h-px bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />
        <Link href={`/products/${product.handle}`} className="block">
          <h3 className="font-serif text-xl font-medium text-clay-900 transition group-hover:text-maroon">
            {product.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-clay-500 line-clamp-2">
            {product.description}
          </p>
        </Link>

        <div className="mt-4 flex items-center justify-between border-t border-clay-200/80 pt-4">
          <p className="text-xl font-semibold text-gradient-gold">
            {formatPrice(product.price, product.currencyCode)}
          </p>
          <Link
            href={`/products/${product.handle}`}
            className="text-xs font-medium uppercase tracking-wider text-terracotta transition hover:text-maroon"
          >
            Details →
          </Link>
        </div>

        <div className="mt-4">
          <BuyButton handle={product.handle} available={product.available} compact />
        </div>
      </div>
    </article>
  );
}
