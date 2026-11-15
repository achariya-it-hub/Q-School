"use client";

import { useEffect } from "react";

/**
 * Console error boundary. Instead of Next's blank "Application error: a client-side exception has occurred",
 * staff see what failed, can retry, and can copy the details for support.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[console] page crashed:", error);
  }, [error]);

  const details = `${error?.name || "Error"}: ${error?.message || "Unknown error"}${error?.digest ? ` (ref ${error.digest})` : ""}\nPage: ${
    typeof window !== "undefined" ? window.location.pathname : ""
  }\nTime: ${new Date().toISOString()}`;

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <p className="text-[12px] font-bold uppercase tracking-wider text-rose-600">Something went wrong</p>
        <h2 className="mt-1 text-xl font-extrabold text-brand-deep">This screen hit an error</h2>
        <p className="mt-2 text-[13.5px] text-[#41564f]">
          Your data is safe. Try again — if it keeps happening, copy the details below and send them to support.
        </p>
        <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-[#F7FAF9] p-3 text-[11.5px] text-[#41564f]">{details}</pre>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => {
              try {
                localStorage.removeItem("qs_crm_leads_cache_v3");
              } catch {}
              reset();
            }}
            className="rounded-xl bg-brand-deep px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-90"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border border-[#D9E6E2] px-4 py-2.5 text-[13px] font-semibold text-brand-deep hover:border-brand-teal"
          >
            Reload page
          </button>
          <button
            onClick={() => navigator.clipboard?.writeText(details)}
            className="rounded-xl border border-[#D9E6E2] px-4 py-2.5 text-[13px] font-semibold text-brand-deep hover:border-brand-teal"
          >
            Copy details
          </button>
        </div>
      </div>
    </div>
  );
}
