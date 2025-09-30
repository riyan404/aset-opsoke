/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Custom color palette for rebranding
        primary: {
          DEFAULT: "#006FFD", // Primary Blue
          50: "#EBF4FF",
          100: "#D6E8FF",
          200: "#B3D4FF",
          300: "#80BAFF",
          400: "#4D9AFF",
          500: "#006FFD", // Main primary color
          600: "#0056CA",
          700: "#004397",
          800: "#003064",
          900: "#001D31",
        },
        accent: {
          DEFAULT: "#00D084", // Accent Green
          50: "#E6FFF5",
          100: "#CCFFEB",
          200: "#99FFD7",
          300: "#66FFC3",
          400: "#33FFAF",
          500: "#00D084", // Main accent color
          600: "#00A66A",
          700: "#007D50",
          800: "#005336",
          900: "#002A1B",
        },
        active: {
          DEFAULT: "#3FB7AC", // Active Menu Background
          50: "#F0FDFB",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#3FB7AC", // Main active color
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
        },
        // Text colors
        text: {
          dark: "#1F2937",    // Dark Gray
          medium: "#6B7280",  // Medium Gray
        },
        // Background colors
        background: {
          DEFAULT: "#FFFFFF", // White
          light: "#F7F9FC",   // Light Gray
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}