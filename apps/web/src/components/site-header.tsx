"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV = [
  { href: "/q-master", label: "Q-Master AI 🧠" },
  { href: "/#programs", label: "Programs" },
  { href: "/#live", label: "Live & Webinars" },
  { href: "/courses", label: "Courses" },
  { href: "/#centres", label: "Centres" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Shadow once scrolled + reading-progress bar along the bottom edge.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrolled(y > 8);
        if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Scroll-spy: highlight the menu item for the section in view (home page only).
  useEffect(() => {
    if (pathname !== "/" || !("IntersectionObserver" in window)) return;
    const ids = NAV.filter((n) => n.href.startsWith("/#")).map((n) => n.href.slice(2));
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = `/#${e.target.id}`;
          if (e.isIntersecting) setActive(id);
          else setActive((cur) => (cur === id ? null : cur));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  const isActive = (href: string) => (href.startsWith("/#") ? active === href : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "border-transparent shadow-[0_8px_24px_-12px_rgba(5,64,56,0.25)]" : "border-[#e2ece9]"
      }`}
    >
      <div className={`container-qs flex items-center justify-between transition-[height] duration-300 ${scrolled ? "h-14" : "h-16"}`}>
        <Link href="/" className="flex items-center" aria-label="Q-School home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Q-School" className={`w-auto transition-[height] duration-300 ${scrolled ? "h-8" : "h-9"}`} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const on = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "true" : undefined}
                className={`nav-tile rounded-xl px-3.5 py-2 text-sm font-medium ${on ? "nav-tile-on" : "text-[#41564f]"}`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="ml-3 flex items-center gap-2">
            <Link href="/login" className="nav-tile rounded-xl px-3.5 py-2 text-sm font-semibold text-brand-deep">
              Sign in
            </Link>
            <Link href="/#demo" className="btn-primary btn-3d btn-3d-teal !px-4 !py-2">
              Book free demo
            </Link>
          </div>
        </nav>

        <button
          className="nav-tile rounded-lg p-2 text-brand-deep lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-[#e2ece9] bg-white px-4 py-3 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`nav-tile block rounded-xl px-3 py-2.5 text-sm font-medium ${isActive(item.href) ? "nav-tile-on" : "text-[#41564f]"}`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost w-full">
              Sign in
            </Link>
            <Link href="/#demo" onClick={() => setOpen(false)} className="btn-primary btn-3d btn-3d-teal w-full">
              Free demo
            </Link>
          </div>
        </nav>
      )}

      {/* reading progress */}
      <div
        ref={bar}
        className="absolute inset-x-0 -bottom-px h-[3px] origin-left bg-gradient-to-r from-brand-teal via-[#2BD6B4] to-brand-teal500"
        style={{ transform: "scaleX(0)" }}
        aria-hidden
      />
    </header>
  );
}
