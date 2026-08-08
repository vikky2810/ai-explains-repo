import type { Config } from "tailwindcss";

/**
 * Terminal-precise design tokens.
 *
 * Two deliberate choices here:
 *
 * 1. `slate` is overridden with a true-neutral carbon ramp. The app already
 *    used slate-950/900/800/400 as page / surface / hairline / muted-text,
 *    so redefining the ramp retones every existing page at once instead of
 *    rewriting several hundred utility classes.
 *
 * 2. One accent, locked: lime. `brand-electric-blue` and friends are kept as
 *    aliases so older pages stay on-palette, but they all resolve to the same
 *    accent. Amber and red survive only because they carry real semantic
 *    state (warning / error), never decoration.
 *
 * Radius: a single 6px step (`rounded-md`) is used for every control, panel
 * and surface in the app. No pills, nothing above 8px.
 */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Neutral carbon ramp. Replaces Tailwind's blue-tinted slate.
        slate: {
          50: "#F7F7F6",
          100: "#ECECEA",
          200: "#D6D6D3",
          300: "#B4B4AF",
          400: "#8E8E88", // muted body text - 5.4:1 on slate-950, passes AA
          500: "#6E6E68",
          600: "#52524D",
          700: "#3A3A3D",
          800: "#26262A", // hairlines
          900: "#141416", // raised surface
          950: "#0B0B0C", // page base - off-black, never #000
        },

        accent: {
          DEFAULT: "#A3E635",
          dim: "#84CC16",
          muted: "#3F4A24",
        },

        // Legacy aliases. All fold into the single locked accent.
        "brand-deep-blue": "#84CC16",
        "brand-electric-blue": "#A3E635",
        "brand-success-green": "#A3E635",
        // Real semantic state only.
        "brand-warning-orange": "#E8A33D",
        "brand-error-red": "#F87171",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        // Legacy alias - `font-inter` still appears in older markup.
        inter: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        md: "6px",
      },
      maxWidth: {
        content: "1200px",
      },
      keyframes: {
        "rise-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
