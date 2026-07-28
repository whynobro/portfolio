import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Builds to ONE self-contained dist/index.html — all CSS, JS, fonts and images
 * inlined. It must open correctly from file:// with no server, so `base` stays
 * relative and no asset may be emitted as a separate file.
 *
 * Budget: the built file stays under 900 KB (see scripts/size.mjs). Development
 * keeps real ES modules and TypeScript; only the output is flattened.
 */
export default defineConfig({
  // Relative base so the file works from file:// and from any subpath on Pages.
  base: "./",
  build: {
    target: "es2022",
    // Inline every asset regardless of size — a separate file would break the
    // single-file promise. Fonts and images are already subset/compressed.
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    // The singlefile plugin inlines the bundle; a sourcemap would be dead weight
    // in a file we ship to recruiters.
    sourcemap: false,
    reportCompressedSize: true,
  },
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
});
