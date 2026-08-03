/**
 * The site ships in two variants from ONE codebase.
 *
 * `hwa` is the version submitted to HWA AG. Its URL (the bare
 * michaelfischbach.dev) is the one written on the application, so a recruiter
 * may open it weeks or months after submitting. What they see must not drift
 * from what was submitted, which is why the general version is a SEPARATE
 * build at a subpath rather than an edit to this one.
 *
 * `general` is the same portfolio addressed to no particular employer: the
 * same works, the same photographs, the same rooms. It differs in exactly two
 * places, and both are here:
 *
 *   1. the second paragraph of the entrance bio, which in the HWA build names
 *      the posting and Affalterbach;
 *   2. which resume PDF the button serves.
 *
 * DEFAULT IS `hwa`, deliberately. An unflagged build (a forgotten env var, a
 * fresh clone, a CI change) produces the HWA site. The failure mode of
 * forgetting the flag is then "the general subpath shows the HWA copy", which
 * is cosmetic, rather than "the submitted link lost its framing", which is not.
 */
export type Variant = "hwa" | "general";

const raw = import.meta.env["VITE_VARIANT"];

export const VARIANT: Variant = raw === "general" ? "general" : "hwa";

export const isHwa = VARIANT === "hwa";
