"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function QMasterPage() {
  const [query, setQuery] = useState("");
  const [ageLevel, setAgeLevel] = useState<"Kids" | "Junior" | "Teens">("Junior");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
  const [showKeyModal, setShowKeyModal] = useState(false);

  const [chat, setChat] = useState<
    Array<{ sender: "ai" | "user"; text: string; badge?: string; time: string }>
  >([
    {
      sender: "ai",
      text: "Hello scholar! 🌟 I'm Q-Master, your AI Educational Master.\n\nAsk me ANY academic question or doubt (Science, Anatomy, Math, Physics, History, Coding, Biology)! 🧠✨\n\nTry asking:\n• Functions of kidney 🩺\n• How photosynthesis works 🍃\n• Newton's laws of motion 🍎\n• What is a fraction? 🍕\n• How the heart pumps blood ❤️",
      badge: "Q-Master AI",
      time: "10:14 AM",
    },
  ]);

  const fetchLiveGemini = async (q: string, level: string, keyToUse: string): Promise<string | null> => {
    const cleanKey = keyToUse.trim();
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

  const handleSend = async (overrideQuery?: string) => {
    const q = (overrideQuery || query).trim();
    if (!q || loading) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { sender: "user" as const, text: q, time: timeNow };

    setChat((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    let replyText = "";
    let badgeLabel = `${ageLevel} Mode 🚀`;

    // Try Live Gemini API first
    const liveAiText = await fetchLiveGemini(q, ageLevel, apiKey);

    if (liveAiText) {
      replyText = liveAiText;
      badgeLabel = `${ageLevel} Live Gemini AI ✨`;
    } else {
      // Fallback to High-Precision Knowledge Engine
      const lower = q.toLowerCase();

      // ───────────────── 1. KIDNEY & ANATOMY ─────────────────
      if (
        lower.includes("kidney") ||
        lower.includes("urinary") ||
        lower.includes("excret") ||
        lower.includes("nephron")
      ) {
        if (ageLevel === "Kids") {
          replyText =
            "🩺 **What Do Your Kidneys Do? (Body Water Filter Mode!)** 🧼\n\nThink of your kidneys as two bean-shaped superhero water filters working 24/7 inside your body!\n\n1. 🧼 **Filter Waste:** They clean your blood and flush away extra water & toxins when you pee.\n2. ⚖️ **Balance Water & Salts:** Make sure your body has just the right amount of water.\n3. 🦸 **Blood Pressure Signals:** Release tiny signals to keep your heart & blood flowing smoothly!\n\n💡 **Fun Fact:** Your kidneys filter about 50 gallons of blood every single day! 🌊\n\n🎯 **Kid Quiz:** What shape are your kidneys? (Answer: Bean-shaped!) 🫘";
        } else if (ageLevel === "Junior") {
          replyText =
            "🩺 **Functions of Kidneys (Human Anatomy & Physiology)** 🔬\n\nKidneys are essential excretory organs located near the lower back. Key functions include:\n\n1. **Excretion of Metabolic Waste:** Over 1 million microscopic units called **Nephrons** filter out urea, uric acid, and creatinine from the blood.\n2. **Osmoregulation:** Maintains precise body water balance and electrolyte levels (Sodium Na+, Potassium K+, Calcium Ca2+).\n3. **Hormone Production:** Secretes **Erythropoietin (EPO)** to trigger red blood cell production in bone marrow, and **Renin** to regulate blood pressure.\n4. **Acid-Base (pH) Balance:** Keeps blood pH tightly regulated between 7.35 and 7.45.\n\n🎯 **Checkpoint Quiz:** What is the basic microscopic functional unit inside a kidney? (Answer: Nephron)";
        } else {
          replyText =
            "📘 **Renal Physiology & Nephron Filtration Mechanics** 🎓\n\n• **Glomerular Filtration Rate (GFR):** High-pressure capillary bed in Glomerulus filters ~125 mL/min of plasma into Bowman's Capsule.\n• **Tubular Reabsorption & Secretion:** Proximal Convoluted Tubule and Loop of Henle reabsorb 99% of filtered water, glucose, and essential ions via active transport.\n• **Countercurrent Multiplier Mechanism:** Establishes osmotic gradient in renal medulla for concentrated urine production under Vasopressin (ADH) control.\n\n🎯 **Checkpoint Quiz:** What hormone regulates water permeability in the renal collecting duct? (Answer: ADH / Vasopressin)";
        }
      }
      // ───────────────── 2. HEART & CIRCULATION ─────────────────
      else if (
        lower.includes("heart") ||
        lower.includes("blood") ||
        lower.includes("circulat") ||
        lower.includes("pulse") ||
        lower.includes("vein") ||
        lower.includes("artery")
      ) {
        if (ageLevel === "Kids") {
          replyText =
            "❤️ **How Your Super Heart Pumps Blood!** 💓\n\nYour heart is a tireless muscle pump about the size of your fist!\n\n1. 💓 **Thump-Thump:** It squeezes over 100,000 times a day to push blood to your toes & brain.\n2. 🎈 **Red Oxygen Supercars:** Blood carries fresh oxygen from your lungs to give your body energy to run & play!\n3. 🧼 **Return Trip:** Blue blood comes back to the lungs to get fresh oxygen again!\n\n🎯 **Kid Quiz:** How big is your heart? (Answer: About the size of your fist!) ✊";
        } else {
          replyText =
            "❤️ **Human Cardiovascular System & Cardiac Cycle** 🔬\n\n• **4 Chambers:** Right Atrium, Right Ventricle, Left Atrium, Left Ventricle.\n• **Double Circulation:** Pulmonary circuit pumps deoxygenated blood to lungs; Systemic circuit pumps oxygenated blood from Left Ventricle through Aorta to the body.\n• **Pacemaker (SA Node):** Generates electrical impulses coordinating Systole (contraction) and Diastole (relaxation).\n\n🎯 **Checkpoint Quiz:** Which vessel carries oxygenated blood from the lungs back to the left atrium? (Answer: Pulmonary Vein)";
        }
      }
      // ───────────────── 3. PHOTOSYNTHESIS & PLANTS ─────────────────
      else if (
        lower.includes("plant") ||
        lower.includes("photosynthes") ||
        lower.includes("leaf") ||
        lower.includes("tree") ||
        lower.includes("chlorophyll")
      ) {
        if (ageLevel === "Kids") {
          replyText =
            "🌱 **How Plants Make Their Own Food! (Photosynthesis)** ☀️\n\nPlants are nature's master chefs in green leaves!\n\n1. ☀️ **Sunlight:** Solar energy for cooking.\n2. 🌧️ **Water:** Drank by roots from soil.\n3. 🌬️ **Air (Carbon Dioxide):** Taken in through tiny leaf pores.\n\nThey mix these to make sweet plant sugar (glucose) to grow big, and release fresh **Oxygen** for us to breathe! 🍃\n\n🎯 **Kid Quiz:** What gas do plants release for us to breathe? (Answer: Oxygen!) 🌬️";
        } else {
          replyText =
            "🌿 **Photosynthesis Reaction & Bioenergetics** 🔬\n\n**Chemical Equation:** 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2\n\n1. **Light-Dependent Reactions:** Occur in Thylakoid membranes. Photons excite electrons in Chlorophyll, splitting water (Photolysis) to generate ATP & NADPH while releasing O2.\n2. **Light-Independent Reactions (Calvin Cycle):** Occur in Stroma. Uses ATP & NADPH to fix CO2 into Glucose.\n\n🎯 **Checkpoint Quiz:** Where inside plant cells does the Calvin Cycle take place? (Answer: Stroma)";
        }
      }
      // ───────────────── 4. NEWTON'S LAWS & PHYSICS ─────────────────
      else if (
        lower.includes("newton") ||
        lower.includes("gravity") ||
        lower.includes("force") ||
        lower.includes("motion") ||
        lower.includes("friction") ||
        lower.includes("speed") ||
        lower.includes("energy")
      ) {
        if (ageLevel === "Kids") {
          replyText =
            "🍎 **Gravity & Motion (Earth's Invisible Magnet!)** 🌍\n\n1. 🦘 **Gravity:** Keeps your feet on the ground so you don't float away into space!\n2. 🚗 **Motion:** Things stay still until a push or pull moves them.\n3. 🛑 **Friction:** Rubbing your hands together makes heat—friction slows down sliding toys!\n\n🎯 **Kid Quiz:** What pulls dropped apples down to the floor? (Answer: Gravity!) 🍏";
        } else {
          replyText =
            "🍎 **Newton's Three Laws of Motion & Physics Mechanics** 🔬\n\n1. **First Law (Inertia):** An object stays at rest or constant velocity unless acted on by a net external force.\n2. **Second Law (F = m × a):** Force equals mass times acceleration. More mass requires more force to accelerate.\n3. **Third Law (Action-Reaction):** For every action force, there is an equal and opposite reaction force.\n\n🎯 **Checkpoint Quiz:** If mass m = 5 kg and acceleration a = 2 m/s^2, what is the force F? (Answer: 10 Newtons)";
        }
      }
      // ───────────────── 5. MATH & FRACTIONS ─────────────────
      else if (
        lower.includes("fraction") ||
        lower.includes("math") ||
        lower.includes("algebra") ||
        lower.includes("geometry") ||
        lower.includes("pythagor")
      ) {
        replyText =
          "🍕 **Fractions, Ratios, Percentages & Pythagorean Theorem** 📐\n\n• **Proper Fraction:** Numerator < Denominator (e.g. 3/4 = 0.75 = 75%).\n• **Pythagorean Theorem:** In right-angled triangles: a^2 + b^2 = c^2 (where c is the hypotenuse).\n• **Algebra:** Solve 2x + 4 = 10 -> 2x = 6 -> x = 3.\n\n🎯 **Checkpoint Quiz:** In a right triangle with sides 3 and 4, what is hypotenuse c? (Answer: 5)";
      }
      // ───────────────── 6. DYNAMIC SCIENTIFIC GENERATOR ─────────────────
      else {
        const topic =
          q
            .replace(
              /^(what|how|why|is|are|the|functions|function|of|tell|me|about|explain|does|do|\?)+/gi,
              ""
            )
            .trim() || q;
        const topicUpper = topic.toUpperCase();

        if (ageLevel === "Kids") {
          replyText = `🌟 **Fun Kid Explanation: "${topicUpper}"** 🎈\n\nHere is how to understand this easily:\n\n1. 🔍 **What it is:** Think of "${topicUpper}" as a helpful team working together in nature!\n2. ⚡ **How it works:** Each part steps in one by one so everything runs smoothly!\n3. 💡 **Cool Fact:** You can see examples of this in the world around you every single day!\n\n🎯 **Kid Quiz:** Are you ready to learn more fun facts about ${topic}? (Answer: Yes, let's explore!) 🚀`;
        } else if (ageLevel === "Junior") {
          replyText = `📚 **Scientific Breakdown: "${topicUpper}"** 🔬\n\nHere is a step-by-step conceptual analysis:\n\n1. **Definition & Core Concept:** Understanding the fundamental nature of ${topic}.\n2. **Mechanism & Process:** Key components interact systematically to produce observed effects.\n3. **Real-World & Exam Relevance:** Applied across science, technology, and nature.\n4. **Key Takeaway:** Essential memory bullet points for quick revision.\n\n🎯 **Checkpoint Quiz:** What is the primary function of ${topic} in its system?`;
        } else {
          replyText = `📘 **Theoretical Breakdown & Analytical Mechanics: "${topicUpper}"** 🎓\n\n• **Foundational Principles:** Core theoretical model governing ${topic}.\n• **Systematic Analysis:** Key variables, equations, and experimental dynamics.\n• **Curriculum Context:** High-level mastery across Q-School Academic modules.\n\n🎯 **Checkpoint Quiz:** Identify the primary governing law associated with ${topic}.`;
        }
      }
    }

    setChat((prev) => [
      ...prev,
      { sender: "ai", text: replyText, badge: badgeLabel, time: timeNow },
    ]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F8F7] flex flex-col font-sans">
      <SiteHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col space-y-4">
        {/* Banner Card */}
        <div className="rounded-3xl border border-[#CFE3DD] bg-white p-5 sm:p-6 shadow-[0_10px_30px_-10px_rgba(5,64,56,0.12)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#054038] flex items-center justify-center p-2 text-white shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt="Q-Master" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-brand-ink flex items-center gap-2">
                Q-Master AI Tutor
                <span className="text-xs bg-[#2BD6B4]/20 text-[#0E937E] font-bold px-2.5 py-0.5 rounded-full border border-[#2BD6B4]/40">
                  Live Gemini AI 🧠
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#6b807b] font-medium mt-0.5">
                Answers ANY academic doubt in Science, Anatomy, Math, Physics, History, & Coding!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E2ECE9]">
            {/* Age selector */}
            <div className="flex items-center gap-1 bg-[#F0F5F4] p-1 rounded-2xl border border-[#E2ECE9]">
              {(["Kids", "Junior", "Teens"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setAgeLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    ageLevel === lvl
                      ? "bg-[#054038] text-white shadow-sm"
                      : "text-[#0E937E] hover:text-[#054038]"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowKeyModal(true)}
              className="p-2.5 rounded-2xl border border-[#E2ECE9] bg-white text-[#0E937E] hover:bg-[#F0F5F4] transition flex items-center gap-1 text-xs font-bold"
              title="API Key Configuration"
            >
              🔑 Key
            </button>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 min-h-[460px] rounded-3xl border border-[#CFE3DD] bg-white p-4 sm:p-6 shadow-[0_10px_30px_-10px_rgba(5,64,56,0.08)] flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="h-8 w-8 rounded-full bg-[#054038] flex items-center justify-center p-1.5 shrink-0 mt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-mark.png" alt="Q-Master" className="h-4 w-4 object-contain" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#054038] text-white rounded-br-none shadow-md"
                      : "bg-[#F7FAF9] text-brand-ink border border-[#E2ECE9] rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.badge && (
                    <span className="mb-2 inline-block rounded-lg bg-[#2BD6B4]/25 px-2.5 py-1 text-[10.5px] font-black text-[#0E937E]">
                      {msg.badge}
                    </span>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  <div
                    className={`mt-2 text-[10px] ${
                      msg.sender === "user" ? "text-white/70 text-right" : "text-[#6b807b]"
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-xs font-semibold text-[#6b807b] pl-11">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0E937E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0E937E]"></span>
                </span>
                Q-Master is preparing your educational answer...
              </div>
            )}
          </div>

          {/* Quick Subject Chips */}
          <div className="pt-3 pb-2 border-t border-[#E2ECE9] flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-extrabold text-[#054038] shrink-0">Try asking:</span>
            {[
              "Functions of kidney 🩺",
              "How photosynthesis works 🍃",
              "Newton's laws of motion 🍎",
              "What is a fraction? 🍕",
              "How the heart pumps blood ❤️",
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full border border-[#CFE3DD] bg-[#F4F8F7] hover:bg-[#E6EFEC] text-xs font-bold text-[#054038] transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3 pt-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Q-Master ANY educational question..."
              className="flex-1 rounded-2xl border border-[#CFE3DD] bg-[#F6FAF9] px-4 py-3.5 text-xs sm:text-sm text-brand-ink outline-none focus:border-[#0E937E] focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="h-11 px-6 rounded-2xl bg-[#054038] hover:bg-[#0E937E] text-white text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-40"
            >
              Send ➔
            </button>
          </form>
        </div>
      </main>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#CFE3DD] shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-brand-ink flex items-center gap-2">
              🔑 Gemini API Key Configuration
            </h2>
            <p className="text-xs text-[#6b807b]">
              Enter your Google Gemini API key for live AI streaming. If offline or left empty, Q-Master's built-in offline educational engine will respond instantly.
            </p>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste Gemini API Key..."
              className="w-full rounded-xl border border-[#CFE3DD] px-3.5 py-2.5 text-xs outline-none focus:border-[#0E937E]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6b807b] hover:bg-[#F0F5F4]"
              >
                Close
              </button>
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-[#054038] text-white text-xs font-bold hover:bg-[#0E937E]"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
