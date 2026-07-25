import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/shopify";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f5efe6] to-[#faf7f2]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-amber-800">
              Eco-friendly · Handcrafted · Visarjan-safe
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl">
              Clay Ganesha idols that return to the earth
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">
              Mitti Ganesha offers beautiful 6-inch mitti idols made from natural clay.
              Celebrate with devotion — and dissolve your idol safely in water after visarjan.
            </p>
            <a
              href="#products"
              className="mt-8 inline-block rounded-xl bg-amber-900 px-6 py-3.5 text-base font-medium text-white transition hover:bg-amber-950"
            >
              Shop idols
            </a>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10">
          <h2 className="font-serif text-3xl font-semibold text-stone-900">Our idols</h2>
          <p className="mt-2 text-stone-600">All idols are 6 inches · Natural clay · ₹449–₹549</p>
        </div>
        {products.length === 0 ? (
          <p className="text-stone-500">No products available yet. Check back soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section id="about" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-serif text-3xl font-semibold text-stone-900">Why Mitti Ganesha?</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-2xl" aria-hidden>🌿</p>
              <h3 className="mt-2 font-medium text-stone-900">Eco-friendly</h3>
              <p className="mt-1 text-sm text-stone-600">
                Made from natural clay that dissolves in water — no pollution, no harm.
              </p>
            </div>
            <div>
              <p className="text-2xl" aria-hidden>🙏</p>
              <h3 className="mt-2 font-medium text-stone-900">Handcrafted</h3>
              <p className="mt-1 text-sm text-stone-600">
                Each idol is sculpted by artisans with traditional detail and care.
              </p>
            </div>
            <div>
              <p className="text-2xl" aria-hidden>💧</p>
              <h3 className="mt-2 font-medium text-stone-900">Visarjan-safe</h3>
              <p className="mt-1 text-sm text-stone-600">
                Designed for immersion — kind to rivers, soil, and the planet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
