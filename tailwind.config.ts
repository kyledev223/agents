import type { Config } from "tailwindcss";

// Design tokens extracted from the reference site. See DESIGN_SPEC.md.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#fbf8f2", 2: "#f4eee7" },
        card: "#ffffff",
        ink: { DEFAULT: "#0b0c0c", 2: "#2b2c2c", 3: "#5d5f5f", 4: "#9a9b9a" },
        rule: { DEFAULT: "#e4ded5", soft: "#efeae3" },
        outline: "#2b2b2a",
        board: { DEFAULT: "#1f1e1d", 2: "#2a2928", rule: "#3a3937" },
        win: { DEFAULT: "#22c55e", deep: "#16a34a", soft: "#e3f6ea" },
        loss: { DEFAULT: "#e5484d", soft: "#fbe5e5" },
        warm: "#e7a33e",
        marker: "#1b1c1f",
        scene: "#3b2c22",
        room: "#6b4128",
        glow: { teal: "#5eead4", green: "#4ade80" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        condensed: ["var(--font-barlow)", "Arial Narrow", "sans-serif"],
        digital: ["var(--font-digital-face)", "ui-monospace", "SF Mono", "Menlo", "monospace"],
        marker: ["var(--font-marker-face)", "Marker Felt", "Comic Sans MS", "cursive"],
        hand: ["var(--font-hand-face)", "Marker Felt", "Comic Sans MS", "cursive"],
      },
      keyframes: {
        "screen-ticker": { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "team-bob": { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-3px)" } },
        "character-in": {
          from: { opacity: "0", transform: "translate(-28px) scale(.97)" },
          to: { opacity: "1", transform: "none" },
        },
        "character-info": { from: { opacity: "0", transform: "translate(20px)" }, to: { opacity: "1", transform: "none" } },
        "wb-draw": { from: { strokeDashoffset: "1px" }, to: { strokeDashoffset: "0" } },
        "wb-fade": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "none" } },
        "pm-fill": { "0%": { transform: "scaleX(.04)" }, "70%, 100%": { transform: "scaleX(1)" } },
        blink: { "0%, 92%, 100%": { transform: "scaleY(1)" }, "95%": { transform: "scaleY(.1)" } },
        typing: { "0%, 100%": { transform: "rotate(0deg)" }, "50%": { transform: "rotate(-7deg)" } },
        flicker: { "0%, 100%": { opacity: "1" }, "47%": { opacity: ".86" }, "50%": { opacity: ".7" }, "53%": { opacity: ".92" } },
        "chart-tick": { "0%": { strokeDashoffset: "1px" }, "60%, 100%": { strokeDashoffset: "0" } },
        ember: {
          "0%": { opacity: "0", transform: "translateY(0) scale(.6)" },
          "20%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(-90px) scale(1.2)" },
        },
      },
      animation: {
        "screen-ticker": "screen-ticker 22s linear infinite",
        "team-bob": "team-bob 2.4s ease-in-out infinite",
        "character-in": "character-in .35s ease-out both",
        "character-info": "character-info .35s ease-out 60ms both",
        "wb-fade": "wb-fade .5s ease-out both",
        "pm-fill": "pm-fill 6s cubic-bezier(.45,0,.3,1) infinite",
        blink: "blink 4.6s ease-in-out infinite",
        typing: "typing .42s ease-in-out infinite",
        flicker: "flicker 5s linear infinite",
        "chart-tick": "chart-tick 6s ease-out infinite",
        ember: "ember 1.6s ease-out infinite",
      },
    },
  },
};

export default config;
