"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Auth stub: Better Auth integration lands with the API phase.
    setTimeout(() => router.push("/dashboard"), 500);
  }

  return (
    <>
      <SiteHeader />
      <main className="container-qs flex justify-center py-16">
        <div className="card w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-brand-deep">Welcome back</h1>
          <p className="mt-1 text-sm text-[#5c7772]">Sign in to continue learning.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm outline-none focus:border-brand-teal"
            />
            <input
              type="password"
              required
              placeholder="Password"
              className="w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm outline-none focus:border-brand-teal"
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <div className="my-5 flex items-center gap-3 text-xs text-[#8aa39c]">
            <div className="h-px flex-1 bg-[#e2ece9]" /> or <div className="h-px flex-1 bg-[#e2ece9]" />
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-ghost w-full"
          >
            Continue with Google
          </button>
          <p className="mt-6 text-center text-xs text-[#5c7772]">
            New to Q-School?{" "}
            <Link href="/live" className="font-semibold text-brand-teal hover:underline">
              Register free
            </Link>
          </p>
          <div className="mt-6 pt-4 border-t border-[#e2ece9] text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-deep hover:text-brand-teal bg-[#f4f7f6] hover:bg-[#e2ece9] px-3.5 py-2 rounded-xl border border-[#dce8e4] transition"
            >
              🔐 Switch to Admin Console Login →
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
