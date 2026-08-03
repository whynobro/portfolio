/// <reference types="vite/client" />

/**
 * Typed build-time env. `VITE_VARIANT` selects which of the two builds this is;
 * see `src/variant.ts` for why the default is the HWA one.
 */
interface ImportMetaEnv {
  readonly VITE_VARIANT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * The English resume, aliased by build mode in vite.config.ts: the HWA
 * application resume at the root, the US one in the general build.
 */
declare module "@resume-en?url" {
  const url: string;
  export default url;
}
