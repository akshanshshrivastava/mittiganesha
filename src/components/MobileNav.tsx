"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionData } from "@/lib/session";

export function MobileNav({ session }: { session: SessionData }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  function close() {
    setOpen(false);
  }

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-clay-200 bg-white/80 text-clay-700"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 top-[65px] z-40 bg-clay-900/20"
            onClick={close}
          />
          <nav className="absolute right-4 top-[calc(100%+0.5rem)] z-50 w-[min(280px,calc(100vw-2rem))] rounded-2xl border border-clay-200 bg-white p-4 shadow-xl">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/#products"
                  onClick={close}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-clay-800 hover:bg-clay-100"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  onClick={close}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-clay-800 hover:bg-clay-100"
                >
                  Our Story
                </Link>
              </li>
              {!session.isLoggedIn ? (
                <li>
                  <Link
                    href="/login"
                    onClick={close}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-maroon hover:bg-clay-100"
                  >
                    Login / Guest checkout
                  </Link>
                </li>
              ) : (
                <li>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-clay-800 hover:bg-clay-100"
                  >
                    Logout ({session.type === "guest" ? "Guest" : "Account"})
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
