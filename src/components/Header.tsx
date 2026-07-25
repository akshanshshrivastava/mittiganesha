import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-[#faf7f2]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            ॐ
          </span>
          <div>
            <p className="font-serif text-xl font-semibold tracking-tight text-stone-900 group-hover:text-amber-900 transition-colors">
              Mitti Ganesha
            </p>
            <p className="text-xs text-stone-500">Eco-friendly clay idols</p>
          </div>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-stone-600">
          <Link href="/#products" className="hover:text-amber-900 transition-colors">
            Shop
          </Link>
          <Link href="/#about" className="hover:text-amber-900 transition-colors">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
