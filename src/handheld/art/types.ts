/**
 * The one sprite format every piece of Pocket Gallery art uses.
 *
 * A sprite is a character grid: `rows.length === h`, every row is exactly `w`
 * characters, `.` is transparent, and every other character must be a key of
 * `pal`. A palette value is either a literal colour (`#rrggbb`, or
 * `#rrggbbaa` for glass and light) or a SLOT (`$name`), resolved at draw time
 * from the character being drawn. Slots are how one body template becomes the
 * player and every trainer, and how an outfit from the shop recolours it.
 *
 * Outlines are baked into the art (a dark shade of the fill, as on the DS),
 * never added by the engine.
 */
export interface Sprite {
  w: number;
  h: number;
  rows: string[];
  pal: Record<string, string>;
}

/** Colour slots a `$name` palette value may reference. */
export type Slot =
  | "skin"
  | "skinShade"
  | "hair"
  | "hairShade"
  | "top"
  | "topShade"
  | "topLight"
  | "bottom"
  | "bottomShade"
  | "shoe"
  | "outline";

export type Look = Record<Slot, string>;

export type Dir = "down" | "up" | "right"; // left is `right` mirrored
/** stand, left foot forward, right foot forward */
export type WalkFrames = [Sprite, Sprite, Sprite];

export type ProjectId = "werc" | "cnc" | "ramps" | "wave" | "bot" | "campus";
export const PROJECT_IDS: ProjectId[] = ["werc", "cnc", "ramps", "wave", "bot", "campus"];

export type HairStyle = "short" | "long" | "spiky" | "bun" | "curly" | "buzz";
export type HatId = "cap" | "hardhat" | "beanie" | "mortarboard" | "tophat" | "propeller" | "welding";
export type OutfitId = "tee" | "labcoat" | "apron" | "hivis" | "flightsuit" | "hoodie";
export type ToolId = "none" | "wrench" | "calipers" | "solder" | "torque" | "plasma";

export const HAT_IDS: HatId[] = ["cap", "hardhat", "beanie", "mortarboard", "tophat", "propeller", "welding"];
export const OUTFIT_IDS: OutfitId[] = ["tee", "labcoat", "apron", "hivis", "flightsuit", "hoodie"];
export const TOOL_IDS: ToolId[] = ["none", "wrench", "calipers", "solder", "torque", "plasma"];
