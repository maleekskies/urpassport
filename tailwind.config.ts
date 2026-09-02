import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F2F4EC",
        panel: "#FFFDF8",
        ink: "#142219",
        "ink-soft": "#56685B",
        "ink-faint": "#8A9A8D",
        "green-deep": "#0F3D2E",
        "green-mid": "#1F6E4A",
        "green-pale": "#E4EBE0",
        gold: "#C9962C",
        "gold-soft": "#F1E3C2",
        navy: "#131F35",
        "navy-soft": "#1E3050",
        line: "#DEDBC9",
        red: "#B5493C",
        "red-soft": "#F3E1DE",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "6.5": "1.625rem",
      },
    },
  },
  plugins: [],
};
export default config;
