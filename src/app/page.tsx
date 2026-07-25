import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { FloatingOm, OrnamentDivider } from "@/components/Ornament";
import { getProducts } from "@/lib/shopify";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: "🌿",
    title: "Eco-friendly",
    text: "Natural mitti clay that dissolves in water — no pollution, no plastic, no guilt.",
  },
  {
    icon: "🪔",
    title: "Handcrafted",
    text: "Each idol is shaped by skilled artisans with traditional detail and devotion.",
  },
  {
    icon: "💧",
    title: "Visarjan-safe",
    text: "Designed for immersion — gentle on rivers, soil, and the planet we share.",
  },
];

export default async function HomePage() {
  const products = await getProducts();
  const heroProduct = products[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden grain pattern-rings">
        <FloatingOm className="absolute left-[8%] top-[20%] text-[120px]" />
        <FloatingOm className="absolute right-[12%] bottom-[15%] text-[80px] [animation-delay:-3s]" />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="relative z-10">
            <p className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-amber-700/20 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-maroon backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-saffron" />
              Eco · Handcrafted · Visarjan-safe
            </p>
            <h1 className="animate-fade-up-delay font-serif text-[2.75rem] font-semibold leading-[1.1] text-clay-900 sm:text-5xl lg:text-[3.5rem]">
              Clay idols that{" "}
              <span className="text-gradient-gold italic">return</span>{" "}
              to the earth
            </h1>
            <p className="animate-fade-up-delay-2 mt-6 text-lg leading-relaxed text-clay-600">
              Mitti Ganesha brings you beautiful 6-inch mitti Ganesha idols — sculpted from
              natural clay, made for devotion, and meant to dissolve safely after visarjan.
            </p>
            <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-4">
              <a href="#products" className="btn-primary inline-flex rounded-full px-8 py-3.5 text-base font-semibold text-white">
                Shop our idols
              </a>
              <a
                href="#about"
                className="inline-flex rounded-full border border-clay-300 bg-white/70 px-8 py-3.5 text-base font-medium text-clay-700 backdrop-blur-sm transition hover:border-maroon/30 hover:text-maroon"
              >
                Our story
              </a>
            </div>
          </div>

          {heroProduct?.imageUrl && (
            <div className="relative z-10 animate-fade-up-delay-2 mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-saffron/30 via-terracotta/20 to-maroon/20 blur-2xl" />
              <div className="frame-ornate relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border-4 border-white/80 bg-clay-100 shadow-2xl shadow-clay-900/15">
                <Image
                  src={heroProduct.imageUrl}
                  alt={heroProduct.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 480px"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-clay-900/70 to-transparent p-6 pt-16">
                  <p className="font-serif text-lg text-white">{heroProduct.title}</p>
                  <p className="text-sm text-clay-200">Featured · 6 inch mitti idol</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-clay-50 to-transparent" />
      </section>

      {/* Products */}
      <section id="products" className="relative bg-clay-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
              Collection
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold text-clay-900 sm:text-5xl">
              Our idols
            </h2>
            <OrnamentDivider className="mx-auto mt-6 max-w-xs" />
            <p className="mx-auto mt-4 max-w-lg text-clay-600">
              Each piece is 6 inches of pure mitti — natural clay, traditional form, earth-friendly finish.
            </p>
          </div>

          {products.length === 0 ? (
            <p className="mt-12 text-center text-clay-500">No products available yet. Check back soon.</p>
          ) : (
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative overflow-hidden bg-gradient-to-b from-clay-100 to-clay-50 py-20 sm:py-28">
        <div className="pattern-mandala absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="font-serif text-2xl text-maroon/80">श्री गणेशाय नमः</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold text-clay-900">
              Why Mitti Ganesha?
            </h2>
            <OrnamentDivider className="mx-auto mt-6 max-w-xs" />
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="card-artisan rounded-2xl p-8 text-center transition hover:-translate-y-1"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-clay-100 to-clay-200 text-3xl shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="mt-5 font-serif text-xl font-medium text-clay-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-clay-600">{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-clay-200/80 bg-white/60 p-8 text-center backdrop-blur-sm sm:p-12">
            <p className="font-serif text-xl leading-relaxed text-clay-700 sm:text-2xl">
              &ldquo;Celebrate with devotion. Immerse with conscience.&rdquo;
            </p>
            <p className="mt-4 text-sm text-clay-500">
              Perfect for home puja, Ganesh Chaturthi, and gifting with meaning.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
