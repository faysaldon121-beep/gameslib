import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gaming theme colors
        'g-bg': '#0a0a0a',
        'g-secondary': '#1a1a1a',
        'g-border': '#2a2a2a',
        'g-text': '#ffffff',
        'g-muted': '#9ca3af',
        'g-purple': '#7c3aed',
        'g-purpleLight': '#8b5cf6',
        'g-purpleDark': '#6d28d9',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
