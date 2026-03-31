import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        g: {
          bg: "#07070f",
          card: "#0f0f1a",
          border: "#1c1c2e",
          purple: "#7c3aed",
          purpleLight: "#a855f7",
          blue: "#2563eb",
          blueLight: "#3b82f6",
          green: "#10b981",
          red: "#ef4444",
          gold: "#f59e0b",
          silver: "#94a3b8",
          bronze: "#b45309",
          text: "#e2e8f0",
          muted: "#64748b",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s infinite",
        shimmer: "shimmer 1.5s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 16px rgba(124,58,237,0.3)" },
          "50%": { boxShadow: "0 0 36px rgba(124,58,237,0.65)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // adds prose classes for markdown
  ],
};

export default config;
