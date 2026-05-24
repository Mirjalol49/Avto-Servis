import type { Config } from "tailwindcss";

const rgbVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Arial", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        heading: ["var(--font-hanken)", "Hanken Grotesk", "Inter", "Arial", "sans-serif"],
      },
      colors: {
        background: rgbVar("--background"),
        foreground: rgbVar("--foreground"),
        border: rgbVar("--border"),
        input: rgbVar("--input"),
        ring: rgbVar("--ring"),
        card: {
          DEFAULT: rgbVar("--card"),
          foreground: rgbVar("--card-foreground"),
        },
        popover: {
          DEFAULT: rgbVar("--popover"),
          foreground: rgbVar("--popover-foreground"),
        },
        primary: {
          DEFAULT: rgbVar("--primary"),
          foreground: rgbVar("--primary-foreground"),
        },
        secondary: {
          DEFAULT: rgbVar("--secondary"),
          foreground: rgbVar("--secondary-foreground"),
        },
        muted: {
          DEFAULT: rgbVar("--muted"),
          foreground: rgbVar("--muted-foreground"),
        },
        accent: {
          DEFAULT: rgbVar("--accent"),
          foreground: rgbVar("--accent-foreground"),
        },
        destructive: {
          DEFAULT: rgbVar("--destructive"),
          foreground: rgbVar("--destructive-foreground"),
        },
        sidebar: {
          DEFAULT: rgbVar("--sidebar"),
          foreground: rgbVar("--sidebar-foreground"),
          primary: rgbVar("--sidebar-primary"),
          "primary-foreground": rgbVar("--sidebar-primary-foreground"),
          accent: rgbVar("--sidebar-accent"),
          "accent-foreground": rgbVar("--sidebar-accent-foreground"),
          border: rgbVar("--sidebar-border"),
          ring: rgbVar("--sidebar-ring"),
        },
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
