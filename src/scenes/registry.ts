import type { SceneFactory } from "./types";

/**
 * Scene id (the `data-scene` attribute) → dynamic import.
 *
 * The import specifiers are static string literals so the bundler can analyse
 * them. In development each scene is a separate chunk; the single-file build
 * inlines them all, but keeping the split here means the lazy-mount logic still
 * saves CPU even when it no longer saves bytes.
 */
export const REGISTRY: Record<string, () => Promise<{ default: SceneFactory }>> = {
  "tolerance-stack": () => import("./tolerance-stack/index"),
};

export function hasScene(id: string): boolean {
  return id in REGISTRY;
}
