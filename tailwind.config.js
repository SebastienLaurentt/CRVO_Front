/** @type {import('tailwindcss').Config} */
export const darkMode = ["class"];
export const content = [
  './pages/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './app/**/*.{ts,tsx}',
  './src/**/*.{ts,tsx}',
];
export const prefix = "";
export const theme = {
  container: {
    center: true,
    padding: "2rem",
    screens: {
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      "2xl": "1400px",
    },
  },
  extend: {
    fontSize: {
      xxs: "8px",
      xs: "12px",
      sm: "16px",
      md: "20px",
      lg: "24px",
      "xl": "28px",
      "2xl": "32px",
      "3xl": "40px",
      "4xl": "48px",
      "5xl": "56px",
      "6xl": "64px",
      "7xl": "72px",
      "8xl": "80px",
      "9xl": "88px",
      "10xl": "96px",
    },
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
    keyframes: {
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" },
      },
      "shimmer": {
        "0%, 90%, 100%": {
          "background-position": "calc(-100% - var(--shimmer-width)) 0",
        },
        "30%, 60%": {
          "background-position": "calc(100% + var(--shimmer-width)) 0",
        },
      },
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      "shimmer": "shimmer 6s infinite",
    },
  },
};
import tailwindcssAnimate from "tailwindcss-animate";

export const plugins = [tailwindcssAnimate];