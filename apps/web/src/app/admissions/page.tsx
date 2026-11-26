import type { Metadata } from "next";
import Link from "next/link";
import { ADMISSION_CENTRES, QSCHOOL_PROGRAMS } from "@qschool/shared";
import { AdmissionEnquiryForm } from "@/components/admission-enquiry-form";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Admissions Open | Q-School — Thinking, Memory & Confidence Classes for Ages 6–14",
  description:
    "Apply to Q-School: mentor-led classes that build focus, memory, reasoning and confidence in children aged 6–14, at 9 centres across 7 cities and online. Start with a BMIT assessment. Request a call-back today.",
  alternates: { canonical: "/admissions" },
  openGraph: {
    title: "Admissions Open | Q-School",
    description: "Mentor-led thinking, memory and confidence classes for ages 6–14. Request an admission call-back.",
    type: "website",
  },
};

const PHONE = "+91 99444 54840";
const WHATSAPP = "https://wa.me/919944454840?text=Hi%20Q-School%2C%20I%20want%20to%20know%20about%20admissions.";

const WHY = [
  { t: "Mentor-led classes", d: "48 live, mentor-led classes a year in small groups, so every child is seen and heard." },
  { t: "Starts with the BMIT", d: "A one-to-one Brain Mapping Intelligence Test and parent counselling shows your child's natural strengths first." },
  { t: "Ages 6 to 14, level by level", d: "Programmes are matched to age, so each child learns at the right depth." },
  { t: "9 centres and online", d: "Learn at a centre near you across 7 cities, or join the live online cohort." },
];

const STEPS = [
  { t: "Enquire", d: "Send the short form on this page." },
  { t: "Counsellor call", d: "We call within 24 hours to understand your child." },
  { t: "BMIT assessment", d: "A one-to-one session at your preferred centre." },
  { t: "Choose programme", d: "We recommend the programme and centre that fit." },
  { t: "Apply & pay first fee", d: "Complete the admission form. Fees can be paid in full or in instalments." },
  { t: "Admitted", d: "Your admission is confirmed when the first fee is received." },
];

const FAQ = [
  { q: "Which ages can join?", a: "Children aged 6 to 14. The programme is matched to your child's age." },
  { q: "What is the BMIT assessment?", a: "BMIT is a one-to-one Brain Mapping Intelligence Test with parent counselling. It helps us understand how your child learns and which programme suits them." },
  { q: "Is there an online option?", a: "Yes. Choose the Live online cohort in the form and the counsellor will explain the timings." },
  { q: "How are fees paid?", a: "Fees can be paid in full or in instalments. Your counsellor explains the fee structure for your child's programme during counselling." },
  { q: "When is the admission confirmed?", a: "Once the admission form is complete and the first fee is received. You get a receipt and a GST invoice for every payment." },
];

export default function AdmissionsLanding() {
  return (
    <>
      {/* Slim header: logo, call, apply */}
      <header className="sticky top-0 z-50 border-b border-[#e2ece9] bg-white/95 backdrop-blur">
        <div className="container-qs flex h-16 items-center justify-between gap-3">
          <Link href="/" aria-label="Q-School home" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Q-School" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="hidden text-sm font-bold text-brand-deep hover:underline sm:inline">
              {PHONE}
            </a>
            <a href="#enquire" className="btn-3d btn-3d-teal rounded-xl px-4 py-2.5 text-[13px] font-extrabold">
              Apply now
            </a>
          </div>
        </div>
      </header>

      <main className="bg-[#f4faf8] pb-24 md:pb-0">
        {/* Hero + form */}
        <section className="bg-brand-deep py-12 text-white lg:py-16">
          <div className="container-qs grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#2BD6B4]">
                Admissions open · Ages 6–14
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Give your child the <span className="text-[#2BD6B4]">Q-School</span> advantage
              </h1>
              <p className="mt-4 max-w-xl text-lg text-white/85">
                Mentor-led classes that build focus, memory, reasoning and confidence, at 9 centres across 7 cities and online.
              </p>
              <ul className="mt-6 space-y-3">
                {["Start with a one-to-one BMIT assessment", "A counsellor calls you within 24 hours", "Pay in full or in instalments, with a receipt and GST invoice for every payment"].map((x) => (
                  <li key={x} className="flex items-start gap-3 text-[15px] text-white/90">
                    <span className="icon-3d mt-0.5 h-6 w-6 shrink-0 rounded-full" style={{ ["--c" as string]: "#0E937E" }}>
                      <Icon name="check" size={14} strokeWidth={3} className="text-white" />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="btn-3d btn-3d-mint inline-flex items-center rounded-xl px-5 py-3 text-sm font-extrabold text-brand-deep">
                  Call {PHONE}
                </a>
                <a href={WHATSAPP} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                  Chat on WhatsApp
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <AdmissionEnquiryForm />
            </div>
          </div>
        </section>

        {/* Why Q-School */}
        <section className="container-qs py-14">
          <h2 className="text-2xl font-extrabold text-brand-deep sm:text-3xl">Why parents choose Q-School</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <div key={w.t} className="rounded-2xl border border-[#CFE3DD] bg-white p-5 shadow-sm">
                <h3 className="text-base font-extrabold text-brand-deep">{w.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#41564f]">{w.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Programmes by age */}
        <section className="bg-white py-14">
          <div className="container-qs">
            <h2 className="text-2xl font-extrabold text-brand-deep sm:text-3xl">The right programme for every age</h2>
            <p className="mt-2 max-w-2xl text-[15px] text-[#41564f]">Each programme includes Q School, Q Learning and the annual kit and study material. Your counsellor shares the fee structure and instalment options.</p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {QSCHOOL_PROGRAMS.map((p) => (
                <div key={p.id} className="rounded-2xl border border-[#E2ECE9] bg-[#F8FCFB] p-5">
                  <span className="inline-block rounded-full bg-brand-teal100 px-3 py-1 text-xs font-extrabold text-brand-deep">{p.ageRange}</span>
                  <h3 className="mt-3 text-lg font-extrabold text-brand-deep">{p.name}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[#41564f]">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How admission works */}
        <section className="container-qs py-14">
          <h2 className="text-2xl font-extrabold text-brand-deep sm:text-3xl">How admission works</h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-4 rounded-2xl border border-[#CFE3DD] bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-deep text-sm font-black text-[#2BD6B4]">{i + 1}</span>
                <div>
                  <h3 className="font-extrabold text-brand-deep">{s.t}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#41564f]">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Centres */}
        <section className="bg-white py-14">
          <div className="container-qs">
            <h2 className="text-2xl font-extrabold text-brand-deep sm:text-3xl">Find a centre near you</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {ADMISSION_CENTRES.map((c) => (
                <div key={c.id} className="rounded-xl border border-[#E2ECE9] bg-[#F8FCFB] px-4 py-3">
                  <p className="text-sm font-extrabold text-brand-deep">{c.name.split(",")[0]}</p>
                  <p className="text-[12.5px] text-[#5d716b]">{c.city}</p>
                </div>
              ))}
              <div className="rounded-xl border border-brand-teal bg-brand-teal100/60 px-4 py-3">
                <p className="text-sm font-extrabold text-brand-deep">Live online</p>
                <p className="text-[12.5px] text-[#5d716b]">From anywhere</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container-qs py-14">
          <h2 className="text-2xl font-extrabold text-brand-deep sm:text-3xl">Questions parents ask</h2>
          <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-[#CFE3DD] bg-white p-5">
                <summary className="cursor-pointer list-none font-extrabold text-brand-deep">{f.q}</summary>
                <p className="mt-2 text-[14px] leading-relaxed text-[#41564f]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-brand-deep py-12 text-center text-white">
          <div className="container-qs">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Ready to begin?</h2>
            <p className="mt-2 text-white/80">Send the enquiry and we will call you within 24 hours.</p>
            <a href="#enquire" className="btn-3d btn-3d-mint mt-6 inline-flex items-center rounded-xl px-7 py-3.5 text-sm font-extrabold text-brand-deep">
              Request admission call-back
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e2ece9] bg-white py-8 text-center text-[13px] text-[#5d716b]">
        <div className="container-qs space-y-2">
          <p className="font-semibold text-brand-deep">Q-School · A unit of Divine Grace Foundation</p>
          <p>
            Call or WhatsApp {PHONE} · <a className="underline" href="mailto:info@theqschool.com">info@theqschool.com</a>
          </p>
          <p>
            <Link className="underline" href="/privacy">Privacy</Link> · <Link className="underline" href="/refund-policy">Refund policy</Link> · <Link className="underline" href="/">Main website</Link>
          </p>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e2ece9] bg-white/95 p-3 backdrop-blur md:hidden">
        <a href="#enquire" className="btn-3d btn-3d-teal flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-extrabold">
          Request admission call-back
        </a>
      </div>
    </>
  );
}
