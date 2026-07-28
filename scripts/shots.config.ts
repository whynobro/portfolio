import type { Page } from "playwright";

/**
 * The shot manifest. Kept separate from the driver so adding a shot is a
 * one-line data edit — that's what makes the loop actually get used.
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
   * Full-page by default. Set false for pages over ~6000px — a 12000px PNG is
   * hard for a human or an agent to read usefully.
   */
  fullPage?: boolean;
};

export const VIEWPORTS: Record<ViewportKey, { width: number; height: number }> = {
  // Recruiter on a laptop.
  desktop: { width: 1280, height: 900 },
  // Worst case for German text overflow — scrutinize these.
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
];
