import type { SceneContext, SceneModule } from "../types";
import { vertices } from "./mesh";
import { subscribe, unsubscribe } from "../../lib/raf";
import { clearFrame, createFrame, createMeshRaster, type Frame } from "../../lib/mesh-raster";

/**
 * The putter head, turning slowly, drawn from the capstone's own STL.
 *
 * Rendered by the shared z-buffered rasteriser in src/lib/mesh-raster.ts (also
 * used by the opening intro), so there is nothing to load and no WebGL path.
 * The lamp is fixed at the upper left, the direction the gilt frames are lit
 * from, so the piece agrees with the room it hangs in.
 */
export default function createPutterScene(): SceneModule {
  let root: HTMLElement;
  let canvas: HTMLCanvasElement;
  let ctx2d: CanvasRenderingContext2D | null = null;
  let tick: ((dt: number) => void) | null = null;
  let dpr = 1;
  let width = 0;
  let height = 0;

  const raster = createMeshRaster(vertices());
  /** Pixel and depth buffers, reallocated only on resize. */
  let frame: Frame | null = null;

  /**
   * The starting angle presents the scooping face to the viewer. At 0.6 the
   * part showed its plain back edge, which is the one view that says nothing
   * about the design.
   */
  let angle = 3.9;
  /** The resting turn rate, in radians per frame. Velocity always eases here. */
  const IDLE_SPIN = 0.006;
  /** Dragging takes over; on release this eases back to IDLE_SPIN. */
  let velocity = IDLE_SPIN;
  let dragging = false;
  let lastX = 0;

  /*
   * A gentle tilt DOWN onto the part, so the top face and the scooping cavity
   * both read. Negative: with the projection's Y flip, a positive tilt looks
   * up at the floor of the scoop pocket, which a putter never presents.
   */
  const TILT = -0.55;

  function render(): void {
    if (!ctx2d || !frame) return;
    raster.setView(
      { angle, tilt: TILT, scale: Math.min(width, height) * 0.92, cx: width / 2, cy: height / 2 },
      dpr,
    );
    clearFrame(frame);
    raster.draw(frame);
    ctx2d.putImageData(frame.image, 0, 0);
  }

  function size(w: number, h: number): void {
    if (!w || !h) return;
    width = w;
    height = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx2d = canvas.getContext("2d");
    // No CTM: the rasteriser works in device pixels and writes the backing
    // store directly, and putImageData ignores the transform in any case.
    frame = ctx2d ? createFrame(ctx2d, canvas.width, canvas.height) : null;
    render();
  }

  return {
    mount(c: SceneContext) {
      root = c.root;
      dpr = c.dpr;

      canvas = document.createElement("canvas");
      canvas.className = "putter__canvas";
      root.append(canvas);

      const box = root.getBoundingClientRect();
      size(box.width, box.height || box.width * 0.75);

      /*
       * On the wall the part hangs inside a link: the whole tile opens the
       * room. There it only turns, with no drag, no focus stop and no name of
       * its own (the tile's label names it), so it cannot steal the click or
       * add a second tab stop inside the link.
       */
      const decorative = root.closest("a") !== null;
      if (!decorative) {
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", c.t("putter.aria"));
      }

      // Dragging spins the part. Pointer events cover mouse, pen and touch in
      // one path; `touch-action: none` in the stylesheet stops the browser
      // claiming the gesture for a scroll.
      const down = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        canvas.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        // NEGATIVE: dragging right should carry the face nearest the viewer to
        // the right, the way turning a real object in the hand does. Adding the
        // delta spun it against the drag.
        velocity = -dx * 0.01;
        angle += velocity;
        render();
      };
      const up = (e: PointerEvent) => {
        dragging = false;
        canvas.releasePointerCapture?.(e.pointerId);
      };
      if (!decorative) {
        canvas.addEventListener("pointerdown", down);
        canvas.addEventListener("pointermove", move);
        canvas.addEventListener("pointerup", up);
        canvas.addEventListener("pointercancel", up);

        // Keyboard: the piece has to be inspectable without a pointer.
        canvas.tabIndex = 0;
        canvas.addEventListener("keydown", (e) => {
          if (e.key === "ArrowLeft") { angle += 0.12; render(); }
          if (e.key === "ArrowRight") { angle -= 0.12; render(); }
        });
      }

      if (c.reducedMotion) {
        render();
        return;
      }

      /*
       * The part always turns. Letting go hands the throw back to the idle
       * spin rather than stopping at it.
       *
       * The previous version treated "spinning" and "thrown" as separate
       * states, so a release decayed to a dead stop and only then resumed, and
       * a slow drag ended below the threshold and parked the part entirely.
       * Easing the velocity toward the idle rate instead means there is never a
       * frame where nothing moves, and a hard throw still coasts.
       */
      tick = () => {
        if (dragging) return;
        velocity += (IDLE_SPIN - velocity) * 0.04;
        angle += velocity;
        render();
      };
      if (!subscribe(tick)) tick = null;
    },

    resize(w: number, h: number) {
      size(w, h);
    },

    renderStatic() {
      render();
    },

    dispose() {
      if (tick) unsubscribe(tick);
      tick = null;
      canvas.remove();
    },
  };
}
