import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "Arial", "Helvetica", "sans-serif"],
        mono: ["Geist Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
      colors: {
        mist: "#B1C1C0",
        garden: "#DCEDB9",
        leaf: "#D2E59E",
        olive: "#CBD081",
        stone: "#918868",
      },
    },
  },
  plugins: [],
};

export default config;
