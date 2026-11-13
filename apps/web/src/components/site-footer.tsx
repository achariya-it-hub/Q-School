import Link from "next/link";
import { QuantumAtomOrbital, QuantumWaveStream } from "@/components/ui/quantum-effects";

export function SiteFooter({ stickyCtaSpace = false }: { stickyCtaSpace?: boolean } = {}) {
  return (
    <footer
      className={`relative overflow-hidden mt-20 border-t ${
        stickyCtaSpace ? "pb-20 md:pb-0" : ""
      } border-[#2BD6B4]/25 bg-brand-deep text-white`}
    >
      {/* Ambient Quantum Wave & Orbital Accents */}
      <QuantumWaveStream theme="dark" className="opacity-75" />
      <QuantumAtomOrbital
        theme="dark"
        size={360}
        className="absolute -right-24 -bottom-24 opacity-45"
      />
      <div
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#2BD6B4]/10 blur-3xl"
        aria-hidden
      />

      <div className="container-qs relative z-10 grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-extrabold tracking-tight text-white">
              Q-<span className="text-[#2BD6B4]">School</span>
            </span>
            <span className="inline-block text-xs sm:text-sm font-bold text-[#FFD875]">
              Q-School - A Unit of Divine Grace Foundation
            </span>
          </div>
          <p className="mt-3 max-w-xs text-xs sm:text-sm text-white/80 leading-relaxed">
            Helping children aged 6–14 focus, learn, think, create and lead.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/rbiq"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#FFC845]/40 bg-[#FFC845]/15 px-3.5 py-2 text-xs font-extrabold text-[#FFD875] hover:bg-[#FFC845] hover:text-[#03221E] transition"
            >
              ✦ RBIQ Program
            </Link>
            <Link
              href="/q-master"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#2BD6B4]/40 bg-[#2BD6B4]/15 px-3.5 py-2 text-xs font-extrabold text-[#2BD6B4] hover:bg-[#2BD6B4] hover:text-[#03221E] transition"
            >
              ✦ Q-Master AI
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-brand-teal500 uppercase tracking-wider">Explore</p>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-white/75">
            <li>
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/#programs" className="hover:text-white transition">
                Programs
              </Link>
            </li>
            <li>
              <Link href="/rbiq" className="hover:text-white transition">
                RBIQ – Whole Brain Development
              </Link>
            </li>
            <li>
              <Link href="/#how" className="hover:text-white transition">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/#pathway" className="hover:text-white transition">
                Pathway
              </Link>
            </li>
            <li>
              <Link href="/#centres" className="hover:text-white transition">
                Our Centres
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-white transition">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-brand-teal500 uppercase tracking-wider">
            Learn More &amp; Policies
          </p>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-white/75">
            <li>
              <Link href="/our-story" className="hover:text-white transition">
                Our Story and Founder&apos;s Vision
              </Link>
            </li>
            <li>
              <Link href="/q-5d-framework" className="hover:text-white transition">
                Q 5D™ XYZTP Framework
              </Link>
            </li>
            <li>
              <Link href="/neo-sapiens" className="hover:text-white transition">
                What Is a Neo Sapiens?
              </Link>
            </li>
            <li>
              <Link href="/q-school-ecosystem" className="hover:text-white transition">
                Q-School Ecosystem
              </Link>
            </li>
            <li className="pt-1 border-t border-white/10">
              <Link href="/privacy" className="hover:text-[#2BD6B4] font-semibold transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-[#2BD6B4] font-semibold transition">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-brand-teal500 uppercase tracking-wider">Contact</p>
          <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-white/75">
            <li>
              <span className="block text-[11px] font-semibold text-white/40 uppercase">
                Call or WhatsApp
              </span>
              <a
                href="tel:+919944454840"
                className="hover:text-white transition font-bold text-[#2BD6B4]"
              >
                +91 99444 54840
              </a>
            </li>
            <li>
              <span className="block text-[11px] font-semibold text-white/40 uppercase">Email</span>
              <a
                href="mailto:info@theqschool.com"
                className="hover:text-white transition font-medium text-white/90"
              >
                info@theqschool.com
              </a>
            </li>
            <li>
              <span className="block text-[11px] font-semibold text-white/40 uppercase">
                Support Hours
              </span>
              <span>Mon–Sat, 9am–7pm IST</span>
            </li>
            <li className="pt-2">
              <Link
                href="/#demo"
                className="btn-3d btn-3d-mint inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold rounded-lg text-brand-deep"
              >
                Book Now →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-qs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p className="font-semibold text-white/80">
            © 2026  Q-School - A Unit of Divine Grace Foundation
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-white transition">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
