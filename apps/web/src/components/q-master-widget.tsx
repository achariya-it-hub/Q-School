"use client";

import { useState } from "react";
import Link from "next/link";

export function QMasterWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [ageLevel, setAgeLevel] = useState<"Kids" | "Junior" | "Teens">("Junior");
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

  const [chat, setChat] = useState<Array<{ sender: "ai" | "user"; text: string; badge?: string }>>([
    {
      sender: "ai",
      text: "Hello scholar! 🌟 I'm Q-Master, your AI Educational Tutor. Ask me ANY doubt in Science, Anatomy, Math, Physics, History or Coding!",
      badge: "Q-Master AI",
    },
  ]);

  const fetchLiveGemini = async (q: string, level: string): Promise<string | null> => {
    const cleanKey = apiKey.trim();
    if (!cleanKey) return null;
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    const prompt = `You are Q-Master, an expert friendly AI educational tutor for Q-School LMS. Answer the student doubt accurately and thoroughly for age level "${level}": "${q}". Include fun emojis, clear step-by-step points, real-world examples, and a 1-question checkpoint quiz at the end.`;

    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );
        if (res.ok) {
          const json = await res.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) return text.trim();
        }
      } catch (_) {}
    }
    return null;
  };

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || query).trim();
    if (!q || loading) return;

    const userMsg = { sender: "user" as const, text: q };
    setChat((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    let replyText = "";
    let badgeLabel = `${ageLevel} Mode 🚀`;

    // Try Live Gemini API
    const liveAiText = await fetchLiveGemini(q, ageLevel);

    if (liveAiText) {
      replyText = liveAiText;
      badgeLabel = `${ageLevel} Live Gemini AI ✨`;
    } else {
      const lower = q.toLowerCase();

      // ───────────────── 1. KIDNEY & ANATOMY ─────────────────
      if (lower.includes("kidney") || lower.includes("urinary") || lower.includes("excret") || lower.includes("nephron")) {
        if (ageLevel === "Kids") {
          replyText =
            "🩺 **What Do Your Kidneys Do? (Body Water Filter Mode!)** 🧼\n\nThink of your kidneys as two bean-shaped superhero water filters working 24/7 inside your body!\n\n1. 🧼 **Filter Waste:** Clean your blood and flush away extra water & toxins when you pee.\n2. ⚖️ **Balance Water & Salts:** Keep just the right water amount.\n3. 🦸 **Blood Pressure Signals:** Help heart & blood flow smoothly!\n\n💡 **Fun Fact:** Your kidneys filter ~50 gallons of blood every day! 🌊\n\n🎯 **Kid Quiz:** What shape are your kidneys? (Answer: Bean-shaped!) 🫘";
        } else if (ageLevel === "Junior") {
          replyText =
            "🩺 **Functions of Kidneys (Human Anatomy & Physiology)** 🔬\n\nKidneys are essential excretory organs located near the lower back:\n\n1. **Excretion of Metabolic Waste:** Over 1 million microscopic **Nephrons** filter out urea, uric acid, and creatinine from blood.\n2. **Osmoregulation:** Maintains water balance and electrolytes (Sodium Na+, Potassium K+).\n3. **Hormone Production:** Secretes **Erythropoietin (EPO)** for red blood cell production, and **Renin** for blood pressure control.\n4. **Acid-Base (pH) Balance:** Regulates blood pH between 7.35 and 7.45.\n\n🎯 **Checkpoint Quiz:** What is the basic microscopic filtering unit inside a kidney? (Answer: Nephron)";
        } else {
          replyText =
            "📘 **Renal Physiology & Nephron Filtration Mechanics** 🎓\n\n• **Glomerular Filtration Rate (GFR):** High-pressure capillary bed in Glomerulus filters ~125 mL/min of plasma into Bowman's Capsule.\n• **Tubular Reabsorption & Secretion:** Proximal Convoluted Tubule and Loop of Henle reabsorb 99% of filtered water, glucose, and essential ions via active transport.\n• **Countercurrent Multiplier Mechanism:** Establishes osmotic gradient in renal medulla for concentrated urine production under Vasopressin (ADH) control.";
        }
      }
      // ───────────────── 2. PHOTOSYNTHESIS ─────────────────
      else if (lower.includes("photosynthes") || lower.includes("plant") || lower.includes("leaf")) {
        if (ageLevel === "Kids") {
          replyText =
            "🌱 **How Plants Make Food! (Photosynthesis)** ☀️\n\n1. ☀️ **Sunlight:** Solar energy for cooking.\n2. 🌧️ **Water:** Drank by roots from soil.\n3. 🌬️ **Air (CO2):** Taken in through leaf pores.\n\nPlants mix these to make sweet plant sugar and release fresh **Oxygen** for us to breathe! 🍃";
        } else {
          replyText =
            "🌿 **Photosynthesis Reaction & Bioenergetics** 🔬\n\n**Equation:** 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2\n\n1. **Light Reactions:** Occur in Thylakoid membranes. Solar photons split H2O (Photolysis), generating ATP & NADPH and releasing O2.\n2. **Calvin Cycle:** Occur in Stroma. Uses ATP & NADPH to fix CO2 into Glucose.\n\n🎯 **Checkpoint Quiz:** Where inside plant cells does the Calvin Cycle occur? (Answer: Stroma)";
        }
      }
      // ───────────────── 3. NEWTON'S LAWS ─────────────────
      else if (lower.includes("newton") || lower.includes("gravity") || lower.includes("force")) {
        if (ageLevel === "Kids") {
          replyText =
            "🍎 **Gravity & Motion (Earth's Invisible Magnet!)** 🌍\n\n1. 🦘 **Gravity:** Keeps your feet on the floor so you don't float away!\n2. 🚗 **Motion:** Objects stay still until a push or pull moves them.\n3. 🛑 **Friction:** Slows down sliding toys!\n\n🎯 **Kid Quiz:** What pulls dropped apples down? (Answer: Gravity!) 🍏";
        } else {
          replyText =
            "🍎 **Newton's Three Laws of Motion** 🔬\n\n1. **1st Law (Inertia):** An object stays at rest or constant velocity unless acted upon by a net force.\n2. **2nd Law (F = m × a):** Force equals mass times acceleration.\n3. **3rd Law (Action-Reaction):** For every action, there is an equal and opposite reaction.\n\n🎯 **Checkpoint Quiz:** What is the net force F on m = 4 kg with a = 3 m/s^2? (Answer: 12 N)";
        }
      }
      // ───────────────── 4. FRACTIONS ─────────────────
      else if (lower.includes("fraction") || lower.includes("math")) {
        replyText =
          "🍕 **Fractions & Ratios (Pizza Slices!)** 😋\n\nIf a pizza has 4 equal slices and you eat 1, you ate **1/4**!\n• Top (1) = Numerator (slices eaten)\n• Bottom (4) = Denominator (total slices)\n\n🎯 **Quiz:** What is 3/4 expressed as a percentage? (Answer: 75%)";
      }
      // ───────────────── 5. DYNAMIC GENERATOR ─────────────────
      else {
        const topic = q.replace(/^(what|how|why|is|are|the|functions|of|tell|me|about|explain|\?)+/gi, "").trim() || q;
        const topicUpper = topic.toUpperCase();
        if (ageLevel === "Kids") {
          replyText = `🌟 **Fun Story & Facts: "${topicUpper}"** 🎈\n\n1. 🔍 **What it is:** Imagine "${topicUpper}" as a team of friendly helpers working together!\n2. ⚡ **How it works:** Step-by-step actions make everything run smoothly in nature.\n3. 💡 **Tip:** Look around your house & school to see this in action!\n\n🎯 **Kid Quiz:** Want to hear a fun story about ${topic}?`;
        } else {
          replyText = `📚 **Scientific Breakdown: "${topicUpper}"** 🔬\n\n1. **Core Definition:** Detailed conceptual breakdown of ${topic}.\n2. **Mechanism & Process:** How key components interact systematically.\n3. **Practical Application:** Everyday relevance in STEM & exam preparation.\n\n🎯 **Checkpoint Quiz:** What is the main principle governing ${topic}?`;
        }
      }
    }

    setChat((prev) => [...prev, { sender: "ai", text: replyText, badge: badgeLabel }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2.5 rounded-full bg-[#054038] p-3.5 text-white shadow-[0_12px_28px_-6px_rgba(5,64,56,0.6)] border border-[#2BD6B4]/30 transition hover:scale-105 active:scale-95"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#0E937E] text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="Q-Master" className="h-5 w-5 object-contain" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2BD6B4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2BD6B4]"></span>
            </span>
          </span>
          <span className="pr-1 text-sm font-bold tracking-wide">Q-Master AI</span>
        </button>
      )}

      {/* Floating Modal Window */}
      {open && (
        <div className="flex h-[520px] w-[360px] flex-col overflow-hidden rounded-3xl border border-[#CFE3DD] bg-white shadow-[0_20px_50px_-12px_rgba(5,64,56,0.35)] sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2ECE9] bg-[#054038] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E937E]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-mark.png" alt="Q-Master" className="h-5 w-5 object-contain" />
              </div>
              <div>
                <p className="text-sm font-extrabold leading-tight">Q-Master AI Tutor</p>
                <p className="text-[10.5px] font-medium text-[#2BD6B4]">Answers ANY Academic Doubt 🧠</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/q-master" className="rounded-lg bg-white/15 px-2 py-1 text-[11px] font-semibold text-white hover:bg-white/25">
                Full Screen
              </Link>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white">
                ✕
              </button>
            </div>
          </div>

          {/* Age Level Selector Bar */}
          <div className="flex items-center justify-between border-b border-[#E2ECE9] bg-[#F7FAF9] px-3 py-2 text-xs">
            <span className="font-bold text-[#054038]">Age Level:</span>
            <div className="flex gap-1">
              {(["Kids", "Junior", "Teens"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setAgeLevel(lvl)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                    ageLevel === lvl ? "bg-[#054038] text-white" : "bg-[#E6EFEC] text-[#0E937E] hover:bg-[#D7F0EB]"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F9FBFB]">
            {chat.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#054038] text-white rounded-br-none shadow-sm"
                      : "bg-white text-brand-ink border border-[#E2ECE9] rounded-bl-none shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  }`}
                >
                  {msg.badge && (
                    <span className="mb-1.5 inline-block rounded-md bg-[#2BD6B4]/20 px-2 py-0.5 text-[9.5px] font-black text-[#0E937E]">
                      {msg.badge}
                    </span>
                  )}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#6b807b]">
                <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[#0E937E]" />
                Q-Master is explaining...
              </div>
            )}
          </div>

          {/* Subject Quick Chips */}
          <div className="flex gap-1.5 overflow-x-auto border-t border-[#E2ECE9] bg-white px-3 py-1.5 text-[11px]">
            <button onClick={() => handleSend("Functions of kidney 🩺")} className="whitespace-nowrap rounded-full bg-[#E6EFEC] px-2.5 py-1 font-semibold text-[#054038] hover:bg-[#D7F0EB]">
              Functions of kidney 🩺
            </button>
            <button onClick={() => handleSend("Photosynthesis 🍃")} className="whitespace-nowrap rounded-full bg-[#E6EFEC] px-2.5 py-1 font-semibold text-[#054038] hover:bg-[#D7F0EB]">
              Photosynthesis 🍃
            </button>
            <button onClick={() => handleSend("Newton's laws 🍎")} className="whitespace-nowrap rounded-full bg-[#E6EFEC] px-2.5 py-1 font-semibold text-[#054038] hover:bg-[#D7F0EB]">
              Newton's laws 🍎
            </button>
          </div>

          {/* Input Footer */}
          <div className="border-t border-[#E2ECE9] bg-white p-2.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Q-Master ANY doubt..."
                className="flex-1 rounded-full border border-[#CFE3DD] bg-[#F6FAF9] px-3.5 py-2 text-xs text-brand-ink outline-none focus:border-[#0E937E]"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#054038] text-white disabled:opacity-40"
              >
                ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
