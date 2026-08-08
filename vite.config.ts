// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Build para servidor Node self-hosted (Docker), em vez do target cloudflare.
  nitro: { preset: "node-server" },
  plugins: [
    VitePWA({
      // O registro é feito manualmente por src/lib/pwa.ts (único registrador).
      injectRegister: null,
      registerType: "autoUpdate",
      filename: "sw.js",
      // Nada de service worker em desenvolvimento.
      devOptions: { enabled: false },
      manifest: {
        name: "Meu Bolso",
        short_name: "Meu Bolso",
        description: "Suas finanças pessoais, no seu servidor",
        lang: "pt-BR",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        background_color: "#0B1220",
        theme_color: "#087F5B",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Só assets estáticos do build entram no precache.
        globPatterns: ["**/*.{js,css,woff,woff2,ttf,png,svg,ico}"],
        // SSR: não existe index.html para servir de fallback.
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // HTML sempre pela rede primeiro.
            urlPattern: ({ request, sameOrigin, url }) =>
              sameOrigin &&
              request.mode === "navigate" &&
              !url.pathname.startsWith("/api/") &&
              !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: { cacheName: "html-navigations", networkTimeoutSeconds: 5 },
          },
        ],
      },
    }),
  ],
});
