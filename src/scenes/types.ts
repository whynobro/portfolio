import type { TranslationKey } from "../i18n/en";

export type SceneContext = {
  /** The container. Sized by CSS aspect-ratio before mount, so no layout shift. */
  root: HTMLElement;
  t: (key: TranslationKey) => string;
  /** True when the user asked for reduced motion, or in screenshot mode. */
  reducedMotion: boolean;
  /** Capped at 2, a 3x phone costs 2.25x fill rate for no visible gain. */
  dpr: number;
};

export interface SceneModule {
  mount(ctx: SceneContext): void;
  resize?(width: number, height: number): void;
  /** Must cancel every RAF subscription and listener. Called on scroll-out. */
  dispose(): void;
  /**
   * Paint one frame with no animation. Used for reduced-motion, for the
   * screenshot loop, and as the tile poster before hover.
   */
  renderStatic?(): void;
}

export type SceneFactory = () => SceneModule;
