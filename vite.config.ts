import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      // injectManifest (au lieu du generateSW par défaut) : nécessaire pour
      // pouvoir ajouter la gestion des événements Web Push (self.sw.ts) —
      // generateSW ne permet pas d'injecter du code personnalisé dans le
      // service worker généré.
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}"],
      },
      // Sans ça, le service worker n'est enregistré qu'en build de production
      // — impossible de tester les notifications push en `npm run dev`.
      devOptions: {
        enabled: true,
        type: "module",
      },
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "Amani Resorts — Éco-luxe aux Comores",
        short_name: "Amani Resorts",
        description: "Séjours éco-luxe, coworking et mobilité douce aux Comores. Amani Resorts.",
        theme_color: "#1E293B",
        background_color: "#F5F1E8",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
