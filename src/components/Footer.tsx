import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-to-b from-clay-800 to-clay-900 text-clay-300">
      <div className="pattern-mandala absolute inset-0 opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <p className="font-serif text-2xl text-clay-100">Mitti Ganesha</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-clay-400">
              Handcrafted eco-friendly clay idols rooted in devotion and respect for the earth.
              Celebrate Ganesh Chaturthi beautifully — and return your idol to nature after visarjan.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-saffron">Explore</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/#products" className="transition hover:text-saffron">
                  Shop idols
                </Link>
              </li>
              <li>
                <Link href="/#about" className="transition hover:text-saffron">
                  Our story
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-clay-700/60 pt-8 sm:flex-row">
          <p className="font-serif text-sm text-saffron/80">श्री गणेशाय नमः</p>
          <p className="text-xs text-clay-500">
            © {new Date().getFullYear()} Mitti Ganesha · mittiganesha.com
          </p>
        </div>
      </div>
    </footer>
  );
}
