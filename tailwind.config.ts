import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d10",
        panel: "#13161b",
        panel2: "#1a1e25",
        border: "#262b33",
        text: "#e6e9ef",
        muted: "#8b94a6",
        accent: "#6ea8fe",
        good: "#34d399",
        bad: "#f87171",
      },
      fontFamily: {
        sans: ['"Pretendard"', '"Apple SD Gothic Neo"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
