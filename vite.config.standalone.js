import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  base: "./",  // ✅ important for GitHub Pages
  plugins: [react()],
  build: {
    lib: {
      entry: "./src/standalone.js",
      name: "BrandNovaEditor",
      fileName: (format) => `brand-nova-editor.${format}.js`,
      formats: ["umd"],
    },
    outDir: "dist-standalone",
    emptyOutDir: true,
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
})
