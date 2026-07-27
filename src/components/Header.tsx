import Link from "next/link";
import { HeaderAuth } from "@/components/HeaderAuth";
import { MobileNav } from "@/components/MobileNav";
import { getSession } from "@/lib/session";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-clay-200/80 bg-clay-50/85 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-maroon to-terracotta shadow-md shadow-maroon/20 sm:h-11 sm:w-11">
            <span className="font-serif text-lg text-amber-100 sm:text-xl" aria-hidden>
              ॐ
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-serif text-lg font-semibold tracking-wide text-clay-900 sm:text-xl">
              Mitti Ganesha
            </p>
            <p className="hidden text-[11px] uppercase tracking-[0.2em] text-clay-500 sm:block">
              Shree Ganeshay Namah
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/#products"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-clay-700 transition hover:bg-clay-200/60 hover:text-maroon md:inline"
          >
            Shop
          </Link>
          <Link
            href="/#about"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-clay-700 transition hover:bg-clay-200/60 hover:text-maroon md:inline"
          >
            Our Story
          </Link>
          <div className="hidden md:block">
            <HeaderAuth session={session} />
          </div>
          <MobileNav session={session} />
        </nav>
      </div>
    </header>
  );
}
