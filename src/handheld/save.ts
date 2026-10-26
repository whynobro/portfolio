import type { HatId, OutfitId, ProjectId, ToolId } from "./art/types";
import { PROJECT_IDS } from "./art/types";
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
    if (typeof d.coins === "number" && d.coins >= 0) s.coins = Math.floor(d.coins);
    if (Array.isArray(d.owned)) s.owned = [...new Set([...s.owned, ...d.owned.filter((x) => ITEMS.some((i) => i.id === x))])];
    if (d.equip) {
      const owns = (id: string) => s.owned.includes(id);
      if (d.equip.hat && owns(d.equip.hat)) s.equip.hat = d.equip.hat;
      if (d.equip.outfit && owns(d.equip.outfit)) s.equip.outfit = d.equip.outfit;
      if (d.equip.tool && (d.equip.tool === "none" || owns(d.equip.tool))) s.equip.tool = d.equip.tool;
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
