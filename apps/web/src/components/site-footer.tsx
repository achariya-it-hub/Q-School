import Link from "next/link";

export function SiteFooter({ stickyCtaSpace = false }: { stickyCtaSpace?: boolean } = {}) {
  return (
    <footer className={`mt-20 border-t ${stickyCtaSpace ? "pb-20 md:pb-0" : ""} border-[#e2ece9] bg-brand-deep text-white`}>
      <div className="container-qs grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              Q-<span className="text-brand-teal500">School</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-white/70">
            Quantum Schooling — live classes, webinars, workshops and recorded courses on one owned
            platform.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-teal500">Platform</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link href="/courses" className="hover:text-white">Courses</Link></li>
            <li><Link href="/live" className="hover:text-white">Live &amp; Webinars</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">My Learning</Link></li>
            <li><Link href="/#pricing" className="hover:text-white">Pricing</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/admin/login" className="hover:text-white">Admin Console</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-teal500">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>hello@qschool.example</li>
            <li>+91 90000 00000</li>
            <li>Mon–Sat · 9am–7pm IST</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Q-School · Quantum Schooling
      </div>
    </footer>
  );
}
