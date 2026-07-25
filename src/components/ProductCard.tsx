import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/shopify";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-medium text-stone-900 group-hover:text-amber-900 transition-colors">
          {product.title}
        </h3>
        <p className="mt-1 text-sm text-stone-500 line-clamp-2">{product.description}</p>
        <p className="mt-auto pt-3 text-lg font-semibold text-amber-900">
          {formatPrice(product.price, product.currencyCode)}
        </p>
      </div>
    </Link>
  );
}
