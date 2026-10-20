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
      },
    },
  },
  plugins: [],
};

export default config;
