import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        page: "#f5f6f7",
        card: "#e5e7eb",
        brand: "#2563eb",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        xl: "12px",
        btn: "10px",
      },
      minHeight: {
        screenDvh: "100dvh",
      }
    }
  },
  plugins: []
} satisfies Config