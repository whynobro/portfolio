import type { HatId, OutfitId, ProjectId, ToolId } from "./art/types";
import { HAT_IDS, OUTFIT_IDS, PROJECT_IDS, TOOL_IDS } from "./art/types";
import { ITEMS } from "./data";

/**
 * Progress lives in this browser only. Storage can be missing or throw
 * (private windows, blocked site data), so every access is guarded and the
 * game runs from a fresh save when it is.
 */

export interface Save {
  v: 1;
  coins: number;
  owned: string[];
  equip: { hat: HatId; outfit: OutfitId; tool: ToolId };
  met: ProjectId[];
  beaten: ProjectId[];
  inspected: ProjectId[];
}

const KEY = "pocket-gallery.v1";

export function freshSave(): Save {
  return {
    v: 1,
    coins: 0,
    owned: ITEMS.filter((i) => i.price === 0).map((i) => i.id),
    equip: { hat: "cap", outfit: "tee", tool: "none" },
    met: [],
    beaten: [],
    inspected: [],
  };
}

const isProject = (x: unknown): x is ProjectId => typeof x === "string" && (PROJECT_IDS as string[]).includes(x);

export function loadSave(): Save {
  const s = freshSave();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return s;
    const d = JSON.parse(raw) as Partial<Save>;
    if (typeof d.coins === "number" && Number.isFinite(d.coins) && d.coins >= 0) s.coins = Math.min(999999, Math.floor(d.coins));
    if (Array.isArray(d.owned)) s.owned = [...new Set([...s.owned, ...d.owned.filter((x) => ITEMS.some((i) => i.id === x))])];
    if (d.equip) {
      // Owned AND the right kind: a hat id in the outfit slot would crash the renderer.
      const owns = (id: unknown, ids: readonly string[]) => typeof id === "string" && ids.includes(id) && s.owned.includes(id);
      if (owns(d.equip.hat, HAT_IDS)) s.equip.hat = d.equip.hat as HatId;
      if (owns(d.equip.outfit, OUTFIT_IDS)) s.equip.outfit = d.equip.outfit as OutfitId;
      if (d.equip.tool === "none" || owns(d.equip.tool, TOOL_IDS)) s.equip.tool = d.equip.tool as ToolId;
    }
    if (Array.isArray(d.met)) s.met = d.met.filter(isProject);
    if (Array.isArray(d.beaten)) s.beaten = d.beaten.filter(isProject);
    if (Array.isArray(d.inspected)) s.inspected = d.inspected.filter(isProject);
  } catch {
    /* unreadable or blocked: start fresh */
  }
  return s;
}

export function writeSave(s: Save): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked: progress lasts for this visit only */
  }
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}
