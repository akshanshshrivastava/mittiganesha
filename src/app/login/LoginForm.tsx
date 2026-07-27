"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { OrnamentDivider } from "@/components/Ornament";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"login" | "guest" | null>(null);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading("login");
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(null);
    }
  }

  async function handleGuest() {
    setLoading("guest");
    setError("");

    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not continue as guest");
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div className="card-artisan rounded-3xl p-8 sm:p-10">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
        Welcome
      </p>
      <h1 className="mt-3 text-center font-serif text-3xl font-semibold text-clay-900">
        Sign in to Mitti Ganesha
      </h1>
      <OrnamentDivider className="mx-auto my-6 max-w-xs" />

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-clay-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-clay-200 bg-white/80 px-4 py-3 text-clay-900 outline-none transition focus:border-maroon/40 focus:ring-2 focus:ring-maroon/10"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-clay-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-clay-200 bg-white/80 px-4 py-3 text-clay-900 outline-none transition focus:border-maroon/40 focus:ring-2 focus:ring-maroon/10"
            placeholder="Your Shopify account password"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading !== null}
          className="btn-primary w-full rounded-2xl py-3.5 text-base font-semibold text-white disabled:opacity-60"
        >
          {loading === "login" ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-clay-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#faf6f0] px-4 text-xs uppercase tracking-widest text-clay-400">
            or
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGuest}
        disabled={loading !== null}
        className="w-full rounded-2xl border-2 border-clay-300 bg-white/70 py-3.5 text-base font-semibold text-clay-800 transition hover:border-maroon/30 hover:text-maroon disabled:opacity-60"
      >
        {loading === "guest" ? "Continuing…" : "Continue as Guest"}
      </button>

      <p className="mt-6 text-center text-xs leading-relaxed text-clay-500">
        Guest checkout skips account creation. Sign in if you already have a Mitti Ganesha
        customer account in Shopify.
      </p>
    </div>
  );
}
