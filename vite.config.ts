import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'react', 'react-dom', 'react-router-dom']
  },
  build: {
    commonjsOptions: {
      include: [/pdfjs-dist/, /node_modules/],
      transformMixedEsModules: true
    }
  }
}));