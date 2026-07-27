import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { FloatingOm } from "@/components/Ornament";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="relative min-h-[80vh] grain pattern-rings py-16 sm:py-24">
      <FloatingOm className="absolute left-[10%] top-[15%] text-[100px] opacity-20" />
      <div className="relative mx-auto max-w-md px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="card-artisan rounded-3xl p-10 text-center text-clay-500">
              Loading…
            </div>
          }
        >
          <LoginForm />
        </Suspense>
        <p className="mt-8 text-center">
          <Link href="/" className="text-sm text-clay-500 transition hover:text-maroon">
            ← Back to shop
          </Link>
        </p>
      </div>
    </div>
  );
}
