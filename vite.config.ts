import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { generalOverrides, type Overrides } from "./src/i18n/general";

/**
 * Where the general build is published, relative to the domain root.
 *
 * The root belongs to the HWA build: the bare michaelfischbach.dev is the URL
 * written on that application, and a recruiter may open it long after
 * submitting, so what it serves must not drift. The general version therefore
 * lives one level down rather than replacing it.
 *
 * Used for both the output directory and the canonical/og:url the general
 * build declares, so the two cannot disagree.
 */
const GENERAL_SUBPATH = "general";

/**
 * Rewrites the HTML shell and the dictionaries for the `general` build.
 *
 * A runtime patch is not enough. Every translated string ALSO appears inline in
 * index.html as the no-JS default, so a purely runtime override leaves the
 * employer-addressed paragraph sitting in the shipped HTML, where a reader
 * without JavaScript, a crawler, and anyone using View Source all still meet
 * it. And the superseded string stays in the JS bundle even when it can never
 * render, which puts a named application on a site that is not that
 * application.
 *
 * So the substitution happens at build time, in both places, from the one table
 * in `src/i18n/general.ts`:
 *
 *   - `transformIndexHtml` replaces the text of each `[data-i18n="<key>"]`
 *     element that the table overrides;
 *   - `transform` rewrites the superseded value in en.ts/de.ts to the general
 *     one, so the HWA copy is not merely unused but absent.
 *
 * Both are no-ops in the HWA build, which is left byte-for-byte as it was.
 */
function generalVariant(active: boolean, subpath: string): Plugin {
  const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /** The keys this build overrides, with their EN and DE replacements. */
  const keys = Object.keys(generalOverrides.en) as (keyof Overrides)[];

  /** Filled from the resolved config so cleanup knows where the build landed. */
  let outDir = "";

  return {
    name: "general-variant",
    // Deliberately NOT `apply: "build"`. The dev server has to run the same
    // substitutions or `npm run dev:general` previews the HWA paragraph and the
    // screenshot loop photographs the wrong site.
    enforce: "post",

    configResolved(config) {
      outDir = config.command === "build" ? config.build.outDir : "";
    },

    transformIndexHtml(html) {
      if (!active) return html;
      let out = html;

      // The shell hard-codes the canonical address as the bare domain, which is
      // the HWA page. Left alone, this build would declare itself a duplicate of
      // that page: a search engine consolidates the two and a shared link
      // previews as the root, so the general site would advertise the version
      // addressed to one employer.
      out = out
        .replace(
          /(<link rel="canonical" href=")https:\/\/michaelfischbach\.dev\/(")/,
          `$1https://michaelfischbach.dev/${subpath}/$2`,
        )
        .replace(
          /(<meta property="og:url" content=")https:\/\/michaelfischbach\.dev\/(")/,
          `$1https://michaelfischbach.dev/${subpath}/$2`,
        );

      for (const key of keys) {
        const replacement = generalOverrides.en[key];
        if (!replacement) continue;
        // Match the element carrying this key and swap its text content. The
        // shell's copy is pretty-printed across lines, so the body is matched
        // lazily rather than assumed to be one line.
        const re = new RegExp(
          `(<([a-z]+)([^>]*\\bdata-i18n="${escapeRe(key)}"[^>]*)>)([\\s\\S]*?)(</\\2>)`,
          "i",
        );
        const before = out;
        out = out.replace(re, `$1${replacement}$5`);
        if (out === before) {
          throw new Error(
            `general variant: no [data-i18n="${key}"] element found in index.html. ` +
              `The override would apply to the dictionary but NOT to the no-JS ` +
              `document, leaving the two disagreeing.`,
          );
        }
      }
      return out;
    },

    // `public/` is copied verbatim into every build, but CNAME exists only so
    // GitHub Pages can read the custom domain from the ROOT of the artifact.
    // A copy inside the subdirectory is never read; drop it rather than ship a
    // second domain declaration that looks like it means something.
    //
    // Done here rather than in generateBundle because the public/ copy is a
    // file-system step that runs outside the Rollup bundle.
    async closeBundle() {
      if (!active || !outDir) return;
      await rm(`${outDir}/CNAME`, { force: true });
    },

    transform(code, id) {
      if (!active) return null;
      const m = /src[\\/]i18n[\\/](en|de)\.ts$/.exec(id);
      if (!m) return null;
      const lang = m[1] as "en" | "de";

      let out = code;
      for (const key of keys) {
        const replacement = generalOverrides[lang][key];
        if (!replacement) continue;
        // Replace the value of `"<key>":` up to the end of its string literal.
        // The dictionaries are plain object literals of double-quoted strings.
        const re = new RegExp(`("${escapeRe(key)}":\\s*)"(?:[^"\\\\]|\\\\.)*"`);
        const before = out;
        out = out.replace(re, `$1${JSON.stringify(replacement)}`);
        if (out === before) {
          throw new Error(
            `general variant: could not rewrite "${key}" in ${lang}.ts, so the ` +
              `HWA copy would ship in a bundle that is not addressed to HWA.`,
          );
        }
      }
      return { code: out, map: null };
    },
  };
}

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
export default defineConfig(({ mode }) => ({
  // The site builds in two variants from one codebase; see `src/variant.ts`.
  // The mode IS the variant, so `vite build --mode general` is all it takes and
  // there is no .env file that can go missing. Anything other than "general"
  // builds the HWA site, which is the safe default: the bare michaelfischbach.dev
  // is the URL on the HWA application and must not drift.
  define: {
    "import.meta.env.VITE_VARIANT": JSON.stringify(mode === "general" ? "general" : "hwa"),
  },
  plugins: [generalVariant(mode === "general", GENERAL_SUBPATH)],
  resolve: {
    alias: [
      {
        // Which English resume the button serves; see src/resume.ts. Aliased
        // rather than branched so the unused PDF is never imported and so never
        // emitted: the HWA resume must not be a fetchable URL on the general
        // site, and vice versa.
        //
        // Matched as a regex that keeps the `?url` suffix, since a plain string
        // alias is compared against the whole specifier and so never matches
        // `@resume-en?url`.
        find: /^@resume-en(\?.*)?$/,
        replacement:
          fileURLToPath(
            new URL(
              mode === "general"
                ? "./src/assets/docs/resume-general.pdf"
                : "./src/assets/docs/resume.pdf",
              import.meta.url,
            ),
          ) + "$1",
      },
    ],
  },
  // Relative base so the site works from any subpath (project page, user page,
  // or a plain static host) unchanged.
  base: "./",
  build: {
    // The general build nests inside the HWA one so a single Pages artifact
    // serves both: the root stays the submitted site, `/general/` is the
    // employer-neutral version. Set here rather than on the command line so the
    // output path and the canonical URL come from the same constant.
    outDir: mode === "general" ? `dist/${GENERAL_SUBPATH}` : "dist",
    // Never empty dist/ for the general build: it runs second and would delete
    // the HWA site it nests inside.
    emptyOutDir: mode !== "general",
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
}));
