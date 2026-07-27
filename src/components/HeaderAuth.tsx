"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SessionData } from "@/lib/session";

export function HeaderAuth({ session }: { session: SessionData }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!session.isLoggedIn) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-clay-300 bg-white/70 px-4 py-2 text-sm font-medium text-clay-700 transition hover:border-maroon/30 hover:text-maroon"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[140px] truncate text-xs text-clay-500 sm:inline">
        {session.type === "guest" ? "Guest" : session.email}
      </span>
      <button
        type="button"
        onClick={logout}
        className="rounded-full px-3 py-2 text-sm text-clay-600 transition hover:bg-clay-200/60 hover:text-maroon"
      >
        Logout
      </button>
    </div>
  );
}
