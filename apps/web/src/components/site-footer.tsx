import Link from "next/link";
import { CENTERS } from "@qschool/shared";

export function SiteFooter({ stickyCtaSpace = false }: { stickyCtaSpace?: boolean } = {}) {
  return (
    <footer className={`mt-20 border-t ${stickyCtaSpace ? "pb-20 md:pb-0" : ""} border-[#e2ece9] bg-brand-deep text-white`}>
      <div className="container-qs grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">
              Q-<span className="text-brand-teal500">School</span>
            </span>
          </div>
          <p className="mt-2 text-xs font-bold text-[#2BD6B4] uppercase tracking-wider">Quantum Schooling</p>
          <p className="mt-3 max-w-xs text-xs sm:text-sm text-white/70 leading-relaxed">
            Engineering the Neo Sapiens. Awakening Genius. Activating Quantum Intelligence. Shaping Future-Ready Human Beings aged 6–14 years.
          </p>
          <p className="mt-4 text-[11px] font-bold text-white/50 tracking-wider uppercase">
            Focus · Learn · Think · Create · Lead
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-brand-teal500 uppercase tracking-wider">Explore</p>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-white/70">
            <li><Link href="/#story" className="hover:text-white transition">The Q-School Story</Link></li>
            <li><Link href="/#pedagogy" className="hover:text-white transition">Traditional vs Q-School</Link></li>
            <li><Link href="/#framework" className="hover:text-white transition">Q 5D™ XYZTP Framework</Link></li>
            <li><Link href="/#programs" className="hover:text-white transition">8 Core Programs</Link></li>
            <li><Link href="/#neo-sapiens" className="hover:text-white transition">Who is a Neo Sapiens?</Link></li>
            <li><Link href="/#journey" className="hover:text-white transition">48-Class Journey &amp; Habits</Link></li>
            <li><Link href="/#q-verse" className="hover:text-white transition">Q-Verse Ecosystem</Link></li>
            <li><Link href="/#centres" className="hover:text-white transition">9 Learning Centres</Link></li>
            <li><Link href="/courses" className="hover:text-white transition">Courses &amp; Curriculum</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-brand-teal500 uppercase tracking-wider">9 Learning Centres</p>
          <ul className="mt-3 space-y-1.5 text-xs text-white/70">
            {CENTERS.map((c) => (
              <li key={c.id} className="truncate">
                <Link href="/#centres" className="hover:text-white transition">
                  <span className="font-semibold text-white/90">{c.city}:</span> {c.area}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-brand-teal500 uppercase tracking-wider">Contact</p>
          <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-white/70">
            <li>
              <span className="block text-[11px] font-semibold text-white/40 uppercase">Email</span>
              <a href="mailto:info@theqschool.com" className="hover:text-white transition font-medium text-white/90">
                info@theqschool.com
              </a>
            </li>
            <li>
              <span className="block text-[11px] font-semibold text-white/40 uppercase">Central Desk / WhatsApp</span>
              <a href="tel:+919944454840" className="hover:text-white transition font-bold text-[#2BD6B4]">
                +91 99444 54840
              </a>
            </li>
            <li>
              <span className="block text-[11px] font-semibold text-white/40 uppercase">Support Hours</span>
              <span>Mon–Sat · 9am–7pm IST</span>
            </li>
            <li className="pt-2">
              <Link href="/#demo" className="btn-3d btn-3d-mint inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg">
                Book a Free Demo Class →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Q-School · Quantum Schooling™ · Engineering the Neo Sapiens · All rights reserved.
      </div>
    </footer>
  );
}
