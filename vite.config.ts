import { defineConfig } from "vite";

/**
 * Builds to dist/index.html plus a hashed dist/assets/ folder.
 *
 * This used to inline everything into ONE file so it opened from file://. That
 * cost 5.8 MB brotli of BLOCKING payload before first paint: base64 defeats
 * `loading="lazy"` (the bytes are already in the document), defeats per-asset
 * caching, and adds 33% over the binary. Splitting the assets out drops first
 * paint to the HTML shell plus the hero and lets every photograph below the
 * fold arrive lazily and stay cached.
 *
 * The portfolio is delivered as a LINK, so the file:// promise bought nothing;
 * see CLAUDE.md. Total bytes are slightly lower now (no base64 tax) and, more
 * to the point, they no longer all arrive up front.
 *
 * There is still no size ceiling on the photographs: the gallery's argument is
 * the quality of the photography, so images are encoded for how they look
 * rather than to hit a number.
 */
export default defineConfig({
  // Relative base so the site works from any subpath (project page, user page,
  // or a plain static host) unchanged.
  base: "./",
  build: {
    target: "es2022",
    // Small assets (the marks, the tiny logos) still inline: a separate request
    // costs more than the 33% base64 tax at this size. Everything above 4 KB
    // becomes its own cacheable, lazily-fetched file.
    assetsInlineLimit: 4096,
    cssCodeSplit: false,
    // A sourcemap would be dead weight in a site we ship to recruiters.
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Content-hashed so a cache lives forever and a changed photograph
        // still busts it.
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
      },
    },
  },
});
