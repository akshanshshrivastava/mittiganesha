import Link from "next/link";
import { HeaderAuth } from "@/components/HeaderAuth";
import { getSession } from "@/lib/session";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-clay-200/80 bg-clay-50/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-maroon to-terracotta shadow-md shadow-maroon/20 transition group-hover:shadow-lg group-hover:shadow-maroon/30">
            <span className="font-serif text-xl text-amber-100" aria-hidden>
              ॐ
            </span>
          </div>
          <div>
            <p className="font-serif text-xl font-semibold tracking-wide text-clay-900 group-hover:text-maroon transition-colors">
              Mitti Ganesha
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-clay-500">
              Shree Ganeshay Namah
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/#products"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-clay-700 transition hover:bg-clay-200/60 hover:text-maroon sm:inline"
          >
            Shop
          </Link>
          <Link
            href="/#about"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-clay-700 transition hover:bg-clay-200/60 hover:text-maroon sm:inline"
          >
            Our Story
          </Link>
          <HeaderAuth session={session} />
        </nav>
      </div>
    </header>
  );
}
