import type { Page } from "playwright";

/**
 * The shot manifest. Kept separate from the driver so adding a shot is a
 * one-line data edit, that's what makes the loop actually get used.
 */

export type Lang = "en" | "de";
export type ViewportKey = "desktop" | "mobile" | "wide";

export type Shot = {
  /** Filename stem: screenshots/<target>/<name>.<lang>.<viewport>.png */
  name: string;
  /** Hash route, e.g. "#/work/cnc". Empty string for the landing page. */
  route: string;
  /** Defaults to both languages. */
  langs?: Lang[];
  /** Defaults to desktop + mobile (wide is opt-in; it's mostly for the landing). */
  viewports?: ViewportKey[];
  /** Scroll this selector into view before capturing. */
  scrollTo?: string;
  /** Reach a state that no URL can express (open menu, drag a slider, Tab focus). */
  act?: (page: Page) => Promise<void>;
  /**
   * Full-page by default. Set false for pages over ~6000px, a 12000px PNG is
   * hard for a human or an agent to read usefully.
   */
  fullPage?: boolean;
};

export const VIEWPORTS: Record<ViewportKey, { width: number; height: number }> = {
  // Recruiter on a laptop.
  desktop: { width: 1280, height: 900 },
  // Worst case for German text overflow, scrutinize these.
  mobile: { width: 390, height: 844 },
  // HWA engineers sit at docked monitors; a hero that reads at 1280 can look
  // sparse at 1920.
  wide: { width: 1920, height: 1080 },
};

export const SHOTS: Shot[] = [
  {
    name: "landing",
    route: "",
    viewports: ["desktop", "mobile", "wide"],
  },
  { name: "awards", route: "#/awards" },
  { name: "about", route: "#/about" },
  { name: "contact", route: "#/contact" },

  // A room per work. These run long, the putter's is five plates below the
  // text, so they are captured at the fold rather than full-page; a 7000px
  // PNG is not something a human or an agent reads usefully.
  { name: "work-cnc", route: "#/work/cnc", fullPage: false },
  { name: "work-ramps", route: "#/work/ramps", fullPage: false },
  { name: "work-wave", route: "#/work/wave", fullPage: false },
  { name: "work-bot", route: "#/work/bot", fullPage: false },
  { name: "work-campus", route: "#/work/campus", fullPage: false },
  { name: "work-water", route: "#/work/water", fullPage: false },
];
