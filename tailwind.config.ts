import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#03050a",
          900: "#060a14",
          850: "#080d1a",
          800: "#0b1220",
          700: "#101a2e",
          600: "#16243d",
        },
        cyan: {
          glow: "#4df2ff",
          core: "#00e5ff",
          dim: "#0891a8",
        },
        amber: {
          warn: "#ffb454",
        },
        red: {
          alert: "#ff5470",
        },
      },
      fontFamily: {
        mono: [
          "'JetBrains Mono'",
          "'Space Mono'",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
        display: ["'Orbitron'", "'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        "glow-sm": "0 0 8px 0 rgba(77, 242, 255, 0.35)",
        glow: "0 0 20px 0 rgba(77, 242, 255, 0.25)",
        "glow-lg": "0 0 40px 0 rgba(77, 242, 255, 0.2)",
        "inner-glow": "inset 0 0 30px 0 rgba(77, 242, 255, 0.08)",
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(rgba(77,242,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(77,242,255,0.05) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(circle at center, rgba(77,242,255,0.12) 0%, rgba(6,10,20,0) 70%)",
      },
      backgroundSize: {
        grid: "36px 36px",
      },
      animation: {
        scan: "scan 6s linear infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        flicker: "flicker 4s linear infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        flicker: {
          "0%, 96%, 100%": { opacity: "1" },
          "97%": { opacity: "0.7" },
          "98%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
