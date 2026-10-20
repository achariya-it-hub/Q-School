import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: "#054038",
          teal: "#0E937E",
          teal500: "#2BB39C",
          teal100: "#D7F0EB",
          ink: "#010D0B",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        hand: ["Caveat", "cursive"],
      },
      keyframes: {
        fadeUp: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "none" } },
        slideIn: { "0%": { transform: "translateX(24px)", opacity: "0" }, "100%": { transform: "none", opacity: "1" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fadeUp .7s ease-out both",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
