"use client";

import { useEffect } from "react";

/** Site-wide error boundary (public pages, forms). Shows a friendly message with a retry instead of a blank page. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[site] page crashed:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#D9E6E2] bg-white p-6 text-center shadow-sm">
        <h2 className="text-xl font-extrabold text-brand-deep">Something went wrong</h2>
        <p className="mt-2 text-[14px] text-[#41564f]">
          Please try again. If you were submitting a form, your details may not have been sent — you can also call or WhatsApp us.
        </p>
        <p className="mt-3 text-[11.5px] text-[#7B8E89]">{error?.message}{error?.digest ? ` (ref ${error.digest})` : ""}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={reset} className="rounded-xl bg-brand-deep px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-90">
            Try again
          </button>
          <a href="/" className="rounded-xl border border-[#D9E6E2] px-4 py-2.5 text-[13px] font-semibold text-brand-deep">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
