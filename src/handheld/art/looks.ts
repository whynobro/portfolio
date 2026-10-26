import type { HairStyle, HatId, Look, OutfitId, ProjectId } from "./types";

/**
 * Who everyone is, in colour. Overworld and battle art both read these, so a
 * trainer is the same person on the map and in the battle intro.
 */

const OUTLINE = "#1d1a24";

/** What a shop outfit does to the slots; any art overlay is keyed by the same id. */
export const OUTFIT_LOOKS: Record<OutfitId, Pick<Look, "top" | "topShade" | "topLight" | "bottom" | "bottomShade">> = {
  tee: { top: "#e8e2d4", topShade: "#b9b1a0", topLight: "#ffffff", bottom: "#3a4252", bottomShade: "#262c38" },
  labcoat: { top: "#f4f6f8", topShade: "#c3cad3", topLight: "#ffffff", bottom: "#4a5668", bottomShade: "#323b4a" },
  apron: { top: "#5b6b7c", topShade: "#3f4b58", topLight: "#7a8a9b", bottom: "#2f2a26", bottomShade: "#1f1b18" },
  hivis: { top: "#dbe43a", topShade: "#a9b022", topLight: "#f4f88a", bottom: "#3a4252", bottomShade: "#262c38" },
  flightsuit: { top: "#e0782e", topShade: "#b05a1e", topLight: "#f2a060", bottom: "#c9671f", bottomShade: "#9a4c14" },
  hoodie: { top: "#2b5f8a", topShade: "#1d4466", topLight: "#3f7fb0", bottom: "#2f3440", bottomShade: "#1f232b" },
};

export interface Character {
  look: Look;
  hair: HairStyle;
  hat: HatId | null;
  /** Which outfit overlay (if any) the art draws over the body. */
  outfit: OutfitId | null;
  /** One line for the artists: who this is. */
  brief: string;
}

const skin = {
  light: { skin: "#f0c29a", skinShade: "#d09a72" },
  fair: { skin: "#f1c9a5", skinShade: "#d4a27c" },
  tan: { skin: "#e2a983", skinShade: "#bf855f" },
  olive: { skin: "#c98b62", skinShade: "#a56c47" },
  brown: { skin: "#a86d4a", skinShade: "#875134" },
  deep: { skin: "#8d5a3b", skinShade: "#6c4129" },
};

export const PLAYER: Character = {
  look: { ...skin.light, hair: "#4a3022", hairShade: "#2e1d14", ...OUTFIT_LOOKS.tee, shoe: "#2a2420", outline: OUTLINE },
  hair: "short",
  hat: "cap",
  outfit: "tee",
  brief: "The visitor: you. A young engineer in a cyan ball cap. Default outfit is a plain tee.",
};

export const TRAINERS: Record<ProjectId | "clerk", Character> = {
  werc: {
    look: { ...skin.tan, hair: "#2b2018", hairShade: "#17100b", ...OUTFIT_LOOKS.flightsuit, shoe: "#3a3530", outline: OUTLINE },
    hair: "buzz",
    hat: null,
    outfit: "flightsuit",
    brief: "ROVER CREW: lunar rover team member in an orange flight suit, mission patch on the chest.",
  },
  cnc: {
    look: { ...skin.olive, hair: "#6b4a2a", hairShade: "#4a3018", top: "#3d4f63", topShade: "#2a3746", topLight: "#56708c", bottom: "#2f2a26", bottomShade: "#1f1b18", shoe: "#1f1b18", outline: OUTLINE },
    hair: "short",
    hat: null,
    outfit: "apron",
    brief: "MACHINIST: machine-shop worker, navy work shirt, leather shop apron, safety glasses.",
  },
  ramps: {
    look: { ...skin.fair, hair: "#1e1a17", hairShade: "#0f0d0b", top: "#3f9a5c", topShade: "#2c7042", topLight: "#62bb7c", bottom: "#4a5a78", bottomShade: "#333f56", shoe: "#2a2420", outline: OUTLINE },
    hair: "bun",
    hat: null,
    outfit: null,
    brief: "SHOPKEEPER: small-business owner in a green shirt, a measuring tape at the belt.",
  },
  wave: {
    look: { ...skin.tan, hair: "#c9a36a", hairShade: "#9c7a45", top: "#f2f0ea", topShade: "#c8c3b6", topLight: "#ffffff", bottom: "#2c4f7a", bottomShade: "#1d3655", shoe: "#2a2420", outline: OUTLINE },
    hair: "curly",
    hat: null,
    outfit: null,
    brief: "SAILOR: ocean engineer, white top with a navy collar stripe, rolled sleeves.",
  },
  bot: {
    look: { ...skin.brown, hair: "#14110e", hairShade: "#000000", ...OUTFIT_LOOKS.hoodie, top: "#2a2f3a", topShade: "#1b1f27", topLight: "#3d4452", shoe: "#e8e2d4", outline: OUTLINE },
    hair: "spiky",
    hat: null,
    outfit: "hoodie",
    brief: "TRADER: quant coder in a charcoal hoodie and headphones around the neck, white sneakers.",
  },
  campus: {
    look: { ...skin.fair, hair: "#7a3e22", hairShade: "#552813", top: "#2596be", topShade: "#17698a", topLight: "#6fc4de", bottom: "#d8d0bf", bottomShade: "#b3a991", shoe: "#5a4632", outline: OUTLINE },
    hair: "long",
    hat: null,
    outfit: null,
    brief: "GUIDE: campus tour guide in a cyan polo and khakis, holding a folded map.",
  },
  clerk: {
    look: { ...skin.deep, hair: "#8a8a8a", hairShade: "#5f5f5f", top: "#7a2f3a", topShade: "#561f28", topLight: "#a04654", bottom: "#24212a", bottomShade: "#15131a", shoe: "#15131a", outline: OUTLINE },
    hair: "short",
    hat: null,
    outfit: null,
    brief: "CLERK: gallery gift-shop clerk, burgundy vest over a white shirt, friendly.",
  },
};
