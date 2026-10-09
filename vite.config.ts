import { defineConfig } from "vite";

// The standalone page (web/): a static site, everything runs in the browser.
export default defineConfig({
  root: "web",
  base: "./",
  // The three certificate fonts are bundled into the page (~1.4 MB) so nothing loads from elsewhere: big chunk on purpose.
  build: { outDir: "../site", emptyOutDir: true, target: "es2022", chunkSizeWarningLimit: 3000 },
  optimizeDeps: { esbuildOptions: { target: "es2022" } },
});
