import type { Dir, HatId, Look, OutfitId, ProjectId, Sprite, ToolId } from "./art/types";
import { MONSTERS } from "./art/monsters";
import { OW_BODY, OW_EXTRAS, OW_HAIR, OW_HATS, OW_OUTFITS, EMOTE_BANG, SHADOW } from "./art/people";
import { BACK_BODY, BACK_HATS, BACK_OUTFITS, BACK_TOOLS, ICONS, TRAINER_FRONT } from "./art/battle";
import { PLATFORM_FOE, PLATFORM_ME, PROPS, TILES, drawBattleBackdrop } from "./art/tiles";
import { GALLERY } from "./art/map";
import { FONT, FONT_SMALL, drawText, measure, wrap } from "./art/font";
import { OUTFIT_LOOKS, PLAYER, TRAINERS, type Character } from "./art/looks";
import { ITEMS, PROJECTS, PROJECT_BY_ID, REWARD, TYPE_COLORS, type GameProject, type Item, type ItemKind, type MoveType } from "./data";
import { loadSave, writeSave, type Save } from "./save";
import { bake, blit, panel, shade, tint } from "./gfx";

/**
 * Pocket Gallery: one gallery hall, six curators (the six works on the wall),
 * a gift shop. Battles are conversations: each move quotes one real figure and
 * knocks a quarter off the work's HP, and asking everything wins its coins.
 *
 * The game is immediate-mode on two 256x192 canvases. Scripted sequences are
 * async functions awaiting dialogue and tweens, which all advance on the
 * game's own clock, so a paused game is simply one whose tick is not called.
 */

export type Button = "A" | "B";
export type FullDir = "up" | "down" | "left" | "right";

export interface Region {
  key: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  act: () => void;
}

export interface GameOptions {
  reducedMotion: boolean;
  onExit: () => void;
  onViewRoom: (slug: string) => void;
  announce: (text: string) => void;
  onRegions: (regions: Region[]) => void;
}

interface Actor {
  x: number;
  y: number;
  px: number;
  py: number;
  dir: FullDir;
  from: [number, number];
  t: number;
  moving: boolean;
  steps: number;
  frame: 0 | 1 | 2;
  onArrive: (() => void) | null;
  emote: Sprite | null;
  who: Character;
  extras: string[];
  project: ProjectId | null;
}

interface Particle {
  x: number; y: number; vx: number; vy: number; ay: number;
  life: number; max: number; col: string; size: number;
  kind: "rect" | "coin" | "glyph" | "star";
  ch?: string;
}

interface Ring { x: number; y: number; r0: number; r1: number; t: number; max: number; col: string; square?: boolean }

interface Battle {
  p: GameProject;
  rematch: boolean;
  asked: boolean[];
  hp: number;
  foeOn: boolean;
  foeScale: number;
  foeWhite: number;
  foeDy: number;
  foeAlpha: number;
  blink: boolean;
  shake: number;
  trainerOff: number | null;
  meOff: number;
  pose: 0 | 1;
  plateFoe: number;
  plateMe: number;
  frameThrow: { x: number; y: number; a: number } | null;
  bolt: { x: number; t: number } | null;
  menu: boolean;
  done: (() => void) | null;
}

interface Dialog {
  pages: string[][];
  page: number;
  n: number;
  typing: boolean;
  auto: number | null;
  wait: number;
  res: () => void;
}

const D: Record<FullDir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP: Record<FullDir, FullDir> = { up: "down", down: "up", left: "right", right: "left" };
const W = 256, H = 192, T = 16;
const STEP_SPEED = 6.5; // tiles per second
const SIGHT = 3;
const TEXT_W = 232;
const FOE_X = 188, FOE_Y = 104, ME_X = 64, ME_Y = 140;
const EXTRAS: Partial<Record<ProjectId | "clerk", string[]>> = {
  cnc: ["glasses"], ramps: ["tape"], wave: ["collar"], bot: ["headphones"], campus: ["map"], clerk: ["vest"],
};
const INK = "#1b1a22", INK_SHADOW = "#c9d1d6", PAPER = "#fbfbf7", FRAME = "#2a2f3a";
const UI_BG = "#22313a", UI_PANEL = "#2d4250", UI_LINE = "#456273", UI_TEXT = "#eef3f5", UI_DIM = "#9fb3bd", ACCENT = "#2596be", ACCENT_HI = "#6fc4de";

const ease = (p: number) => 1 - (1 - p) * (1 - p);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export class Game {
  private readonly top: CanvasRenderingContext2D;
  private readonly bot: CanvasRenderingContext2D;
  private readonly o: GameOptions;
  private time = 0;
  private save: Save;
  private readonly player: Actor;
  private readonly npcs: Actor[];
  private readonly clerk: Actor;
  private mode: "walk" | "script" = "script";
  private scene: "world" | "battle" = "world";
  private held: FullDir[] = [];
  private turnT = 0;
  private dialog: Dialog | null = null;
  private prompt: string | null = null;
  private choice: { options: string[]; sel: number; res: (i: number) => void } | null = null;
  private tweens: { t0: number; ms: number; fn: (p: number) => void; res: () => void }[] = [];
  private particles: Particle[] = [];
  private rings: Ring[] = [];
  private fade = 0; // 0 clear, 1 black: the battle wipe
  private wipe: "bars" | "flash" | null = null;
  private flashOn = false;
  private bottom: "menu" | "battle" | "shop" = "menu";
  private tab: "works" | "wardrobe" = "works";
  private shopTab: ItemKind = "hat";
  private shopSel = 0;
  private regions: Region[] = [];
  private regionSig = "";
  private focus = 0;
  private battle: Battle | null = null;
  private coinShown: number;
  private lookCache = new Map<string, Look>();
  private backdropCanvas: HTMLCanvasElement | null = null;

  constructor(top: HTMLCanvasElement, bottom: HTMLCanvasElement, opts: GameOptions) {
    const tg = top.getContext("2d"), bg = bottom.getContext("2d");
    if (!tg || !bg) throw new Error("no 2d context");
    this.top = tg;
    this.bot = bg;
    tg.imageSmoothingEnabled = false;
    bg.imageSmoothingEnabled = false;
    this.o = opts;
    this.save = loadSave();
    this.coinShown = this.save.coins;
    const m = GALLERY;
    this.player = this.actor(m.start[0], m.start[1], m.start[2], PLAYER, [], null);
    this.npcs = PROJECTS.map((p) => {
      const at = m.trainers[p.id];
      return this.actor(at[0], at[1], at[2], TRAINERS[p.id], EXTRAS[p.id] ?? [], p.id);
    });
    this.clerk = this.actor(m.clerk[0], m.clerk[1], m.clerk[2], TRAINERS.clerk, EXTRAS.clerk ?? [], null);
  }

  // ---- Lifecycle ------------------------------------------------------------

  start(): void {
    const s = this.save;
    const fresh = s.met.length === 0 && s.coins === 0;
    const lines = fresh
      ? [
          "Welcome to the POCKET GALLERY!",
          "Six curators are inside. Each one guards one of MICHAEL's projects.",
          "Ask about every figure to win their coins, then spend them at the gift shop.",
        ]
      : [`Welcome back! You have ${s.coins} coins and have seen ${s.beaten.length} of 6 works.`];
    void this.script(this.say(lines));
    // Paint the battle backdrop while the player reads the welcome, not at the first battle.
    window.setTimeout(() => this.backdrop(), 600);
  }

  // ---- Input ------------------------------------------------------------------

  press(b: Button): void {
    if (this.dialog) {
      this.advance();
      return;
    }
    if (this.choice) {
      const c = this.choice;
      this.choice = null;
      c.res(b === "A" ? c.sel : c.options.length - 1);
      return;
    }
    if (this.bottom === "battle" && this.battle?.menu) {
      if (b === "A") this.regions[this.focus]?.act();
      else void this.run();
      return;
    }
    if (this.bottom === "shop") {
      if (b === "A") this.regions[this.focus]?.act();
      else void this.closeShop();
      return;
    }
    if (b === "A" && this.mode === "walk" && this.scene === "world" && !this.player.moving) this.interact();
  }

  hold(d: FullDir, down: boolean): void {
    if (down) {
      if (!this.held.includes(d)) this.held.push(d);
      // A tap shorter than a frame must still turn you, or facing the
      // counter to talk takes a held key.
      const pl = this.player;
      if (this.mode === "walk" && this.scene === "world" && !pl.moving && !this.dialog && pl.dir !== d && this.bottom !== "shop") {
        pl.dir = d;
        this.turnT = 0.08;
      }
      if (this.choice) {
        const c = this.choice;
        if (d === "up") c.sel = (c.sel + c.options.length - 1) % c.options.length;
        if (d === "down") c.sel = (c.sel + 1) % c.options.length;
      } else if ((this.bottom === "battle" && this.battle?.menu) || this.bottom === "shop") {
        this.navigate(d);
      }
    } else {
      this.held = this.held.filter((x) => x !== d);
    }
  }

  releaseAll(): void {
    this.held = [];
  }

  /** A tap on the bottom screen, in its 256x192 pixel space. */
  tap(x: number, y: number): void {
    const i = this.regions.findIndex((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
    if (i < 0) return;
    this.focus = i;
    this.regions[i]?.act();
  }

  /** Activate a bottom-screen region by key (the screen-reader mirror). */
  activate(key: string): void {
    const i = this.regions.findIndex((r) => r.key === key);
    if (i >= 0) {
      this.focus = i;
      this.regions[i]?.act();
    }
  }

  saveNow(): void {
    writeSave(this.save);
  }

  /** A read-only snapshot for verification scripts (window.__pocket.state()). */
  state(): Record<string, unknown> {
    return {
      mode: this.mode,
      scene: this.scene,
      bottom: this.bottom,
      dialog: this.dialog ? (this.dialog.pages[this.dialog.page] ?? []).join(" ") : null,
      typing: this.dialog?.typing ?? false,
      choice: this.choice?.options ?? null,
      menu: this.battle?.menu ?? false,
      hp: this.battle?.hp ?? null,
      busy: this.tweens.length > 0,
      coins: this.save.coins,
      equip: { ...this.save.equip },
      owned: [...this.save.owned],
      beaten: [...this.save.beaten],
      player: { x: this.player.x, y: this.player.y, dir: this.player.dir },
      regions: this.regions.map((r) => r.key),
    };
  }

  // ---- Clock ------------------------------------------------------------------

  tick(dt: number): void {
    this.time += dt;
    for (const tw of [...this.tweens]) {
      const p = Math.min(1, ((this.time - tw.t0) * 1000) / tw.ms);
      tw.fn(p);
      if (p >= 1) {
        this.tweens.splice(this.tweens.indexOf(tw), 1);
        tw.res();
      }
    }
    this.turnT = Math.max(0, this.turnT - dt);
    const pl = this.player;
    if (this.mode === "walk" && this.scene === "world" && !pl.moving && !this.dialog && !this.choice && this.bottom !== "shop") {
      const d = this.held[this.held.length - 1];
      if (d) {
        if (pl.dir !== d) {
          pl.dir = d;
          this.turnT = 0.08;
        } else if (this.turnT <= 0 && this.tryMove(pl, d)) {
          pl.onArrive = () => {
            if (this.mode !== "walk") return;
            const [ex, ey] = GALLERY.exit;
            if (pl.y === ey && Math.abs(pl.x - ex) <= 1 && this.solid(pl.x, pl.y + 1)) void this.script(this.leave(true));
            else this.checkSight();
          };
        }
      }
    }
    for (const a of this.all()) this.stepActor(a, dt);
    const dl = this.dialog;
    if (dl) {
      const total = (dl.pages[dl.page] ?? []).join("\n").length;
      if (dl.typing) {
        dl.n = Math.min(total, dl.n + dt * 60);
        if (dl.n >= total) dl.typing = false;
      } else if (dl.auto !== null) {
        dl.wait += dt * 1000;
        if (dl.wait >= dl.auto) this.advance();
      }
    }
    for (const q of this.particles) {
      q.vy += q.ay * dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.life -= dt;
    }
    this.particles = this.particles.filter((q) => q.life > 0);
    for (const r of this.rings) r.t += dt;
    this.rings = this.rings.filter((r) => r.t < r.max);
    if (this.coinShown !== this.save.coins) {
      const step = Math.max(1, Math.ceil(Math.abs(this.save.coins - this.coinShown) * dt * 6));
      this.coinShown += Math.sign(this.save.coins - this.coinShown) * Math.min(step, Math.abs(this.save.coins - this.coinShown));
    }
  }

  draw(): void {
    if (this.scene === "world") this.drawWorld();
    else this.drawBattle();
    this.drawParticles(this.top);
    this.drawTextBox();
    this.drawChoice();
    this.drawWipe();
    this.drawBottom();
  }

  // ---- Actors and the map -----------------------------------------------------

  private actor(x: number, y: number, dir: FullDir, who: Character, extras: string[], project: ProjectId | null): Actor {
    return { x, y, px: x * T, py: y * T, dir, from: [x, y], t: 1, moving: false, steps: 0, frame: 0, onArrive: null, emote: null, who, extras, project };
  }

  private all(): Actor[] {
    return [...this.npcs, this.clerk, this.player];
  }

  private solid(x: number, y: number): boolean {
    const row = GALLERY.solid[y];
    if (!row || x < 0 || x >= row.length) return true;
    return row[x] !== ".";
  }

  private walkable(x: number, y: number): boolean {
    return !this.solid(x, y) && !this.all().some((a) => a.x === x && a.y === y);
  }

  private tryMove(a: Actor, d: FullDir): boolean {
    a.dir = d;
    const nx = a.x + D[d][0], ny = a.y + D[d][1];
    if (!this.walkable(nx, ny)) return false;
    a.from = [a.x, a.y];
    a.x = nx;
    a.y = ny;
    a.t = 0;
    a.moving = true;
    return true;
  }

  private stepActor(a: Actor, dt: number): void {
    if (!a.moving) return;
    a.t = Math.min(1, a.t + dt * STEP_SPEED);
    const [fx, fy] = a.from;
    a.px = Math.round(lerp(fx, a.x, a.t) * T);
    a.py = Math.round(lerp(fy, a.y, a.t) * T);
    a.frame = a.t < 0.5 ? (a.steps % 2 ? 1 : 2) : 0;
    if (a.t >= 1) {
      a.moving = false;
      a.steps++;
      a.frame = 0;
      const cb = a.onArrive;
      a.onArrive = null;
      cb?.();
    }
  }

  private step(a: Actor, d: FullDir): Promise<void> {
    return new Promise((res) => {
      if (!this.tryMove(a, d)) return res();
      a.onArrive = res;
    });
  }

  private checkSight(): void {
    for (const n of this.npcs) {
      if (!n.project || this.save.met.includes(n.project)) continue;
      const [dx, dy] = D[n.dir];
      for (let i = 1; i <= SIGHT; i++) {
        const x = n.x + dx * i, y = n.y + dy * i;
        if (x === this.player.x && y === this.player.y) {
          void this.spotted(n, i);
          return;
        }
        if (this.solid(x, y)) break;
      }
    }
  }

  private async spotted(n: Actor, dist: number): Promise<void> {
    this.mode = "script";
    n.emote = EMOTE_BANG;
    await this.wait(this.o.reducedMotion ? 300 : 700);
    n.emote = null;
    for (let i = 1; i < dist; i++) await this.step(n, n.dir);
    this.player.dir = OPP[n.dir];
    await this.meet(n);
    this.mode = "walk";
  }

  private async meet(n: Actor): Promise<void> {
    const p = n.project ? PROJECT_BY_ID[n.project] : null;
    if (!p) return;
    const beaten = this.save.beaten.includes(p.id);
    await this.say(`${p.trainer}: ${beaten ? p.rematch : p.intro}`);
    await this.fight(p, beaten);
  }

  private interact(): void {
    const pl = this.player;
    const x = pl.x + D[pl.dir][0], y = pl.y + D[pl.dir][1];
    const n = this.npcs.find((a) => a.x === x && a.y === y);
    if (n) {
      n.dir = OPP[pl.dir];
      void this.script(this.meet(n));
      return;
    }
    const m = GALLERY;
    const at = (p: [number, number]) => p[0] === x && p[1] === y;
    if (at(m.counter) || (this.clerk.x === x && this.clerk.y === y)) {
      void this.openShop();
      return;
    }
    for (const p of PROJECTS) {
      if (at(m.works[p.id])) {
        void this.script(this.inspect(p));
        return;
      }
    }
    if (at(m.sign)) {
      void this.script(
        this.say([
          "POCKET GALLERY. Six works by MICHAEL FISCHBACH, mechanical engineering, Cal Poly SLO.",
          "Each curator stands by their work. Ask them everything.",
        ]),
      );
      return;
    }
    if (at(m.exit)) void this.script(this.leave(false));
  }

  /** The doors. Standing on them asks; staying steps you back inside. */
  private async leave(onDoor: boolean): Promise<void> {
    await this.say("Leave the gallery? Your coins and outfits are saved.", true);
    if ((await this.ask(["STAY", "LEAVE"])) === 1) {
      this.o.onExit();
      if (onDoor) await this.step(this.player, "up");
      return;
    }
    if (onDoor) await this.step(this.player, "up");
  }

  private async inspect(p: GameProject): Promise<void> {
    await this.say(`A work on the wall: ${p.name}. Its ${p.trainer} is close by.`);
    if (!this.save.inspected.includes(p.id)) {
      this.save.inspected.push(p.id);
      this.addCoins(REWARD.inspect, FOE_X, 40);
      await this.say(`You read the whole label. +${REWARD.inspect} coins!`);
    }
  }

  // ---- Script helpers -----------------------------------------------------------

  private script(p: Promise<void>): Promise<void> {
    this.mode = "script";
    return p.then(() => {
      this.mode = "walk";
    });
  }

  private wait(ms: number): Promise<void> {
    return this.tween(ms, () => {});
  }

  private tween(ms: number, fn: (p: number) => void): Promise<void> {
    if (this.o.reducedMotion && ms > 0) {
      fn(1);
      return Promise.resolve();
    }
    return new Promise((res) => this.tweens.push({ t0: this.time, ms, fn, res }));
  }

  /** Dialogue. `hold` leaves the last page up (for a choice under it); `auto` advances by itself. */
  private say(text: string | string[], hold = false, auto: number | null = null): Promise<void> {
    const pages: string[][] = [];
    for (const t of Array.isArray(text) ? text : [text]) {
      const lines = wrap(FONT, t, TEXT_W);
      for (let i = 0; i < lines.length; i += 2) pages.push(lines.slice(i, i + 2));
    }
    this.prompt = null;
    return new Promise((res) => {
      this.dialog = {
        pages,
        page: 0,
        n: this.o.reducedMotion ? Infinity : 0,
        typing: !this.o.reducedMotion,
        auto,
        wait: 0,
        res: () => {
          if (hold) this.prompt = (pages[pages.length - 1] ?? []).join(" ");
          res();
        },
      };
      this.o.announce((pages[0] ?? []).join(" "));
    });
  }

  private advance(): void {
    const d = this.dialog;
    if (!d) return;
    if (d.typing) {
      d.n = Infinity;
      d.typing = false;
      return;
    }
    d.page++;
    d.wait = 0;
    if (d.page >= d.pages.length) {
      this.dialog = null;
      d.res();
      return;
    }
    d.n = this.o.reducedMotion ? Infinity : 0;
    d.typing = !this.o.reducedMotion;
    this.o.announce((d.pages[d.page] ?? []).join(" "));
  }

  private ask(options: string[]): Promise<number> {
    return new Promise((res) => {
      this.choice = {
        options,
        sel: 0,
        res: (i) => {
          this.prompt = null;
          res(i);
        },
      };
      this.o.announce(`Choose: ${options.join(" or ")}.`);
    });
  }

  private addCoins(n: number, x: number, y: number): void {
    this.save.coins += n;
    writeSave(this.save);
    if (this.o.reducedMotion) return;
    for (let i = 0; i < Math.min(24, 6 + n / 5); i++) {
      this.particles.push({ x, y, vx: rand(-70, 70), vy: rand(-150, -60), ay: 260, life: rand(0.8, 1.3), max: 1.3, col: "#e8b44a", size: 1, kind: "coin" });
    }
  }

  // ---- Battles --------------------------------------------------------------------

  private async wipeIn(): Promise<void> {
    this.wipe = "flash";
    for (let i = 0; i < 3; i++) {
      this.flashOn = true;
      await this.wait(70);
      this.flashOn = false;
      await this.wait(70);
    }
    this.wipe = "bars";
    await this.tween(380, (p) => (this.fade = p));
  }

  private async wipeOut(): Promise<void> {
    this.wipe = "bars";
    await this.tween(320, (p) => (this.fade = 1 - p));
    this.wipe = null;
    this.fade = 0;
  }

  /** The whole battle: intro, send-out, moves until every figure is asked or you run, then the exit. */
  private async fight(p: GameProject, rematch: boolean): Promise<void> {
    const s = this.save;
    if (!s.met.includes(p.id)) s.met.push(p.id);
    writeSave(s);
    await this.wipeIn();
    this.scene = "battle";
    const b: Battle = {
      p, rematch, asked: p.moves.map(() => false), hp: 1,
      foeOn: false, foeScale: 0, foeWhite: 0, foeDy: 0, foeAlpha: 1, blink: false, shake: 0,
      trainerOff: 180, meOff: -180, pose: 0, plateFoe: 0, plateMe: 0, frameThrow: null, bolt: null,
      menu: false, done: null,
    };
    this.battle = b;
    this.bottom = "battle";
    this.focus = 0;
    await this.wipeOut();
    await this.tween(520, (q) => {
      const e = ease(q);
      b.trainerOff = lerp(180, 0, e);
      b.meOff = lerp(-180, 0, e);
    });
    await this.say(`${p.trainer} wants to show you a work!`);
    const sent = this.say(`${p.trainer} sent out ${p.name}!`, false, 900);
    await this.tween(300, (q) => (b.trainerOff = lerp(0, 180, ease(q))));
    b.trainerOff = null;
    await this.tween(420, (q) => {
      b.frameThrow = { x: lerp(W + 10, FOE_X, q), y: FOE_Y - 30 - Math.sin(q * Math.PI) * 40, a: q * 4 };
    });
    b.frameThrow = null;
    this.burst(FOE_X, FOE_Y - 28, "#ffffff", 16, 120);
    this.rings.push({ x: FOE_X, y: FOE_Y - 28, r0: 4, r1: 46, t: 0, max: 0.4, col: "#ffffff" });
    b.foeOn = true;
    b.foeWhite = 1;
    await this.tween(380, (q) => {
      b.foeScale = ease(q);
      b.foeWhite = 1 - q;
    });
    b.foeScale = 1;
    b.foeWhite = 0;
    await this.tween(260, (q) => {
      b.plateFoe = ease(q);
      b.plateMe = ease(q);
    });
    await sent;
    return new Promise((res) => {
      b.done = res;
      this.menuOn();
    });
  }

  private menuOn(): void {
    const b = this.battle;
    if (!b) return;
    b.menu = true;
    this.prompt = `What will you ask ${b.p.name}?`;
    const next = b.asked.findIndex((a) => !a);
    this.focus = next >= 0 ? next : 0;
    this.o.announce(this.prompt);
  }

  private async useMove(i: number): Promise<void> {
    const b = this.battle;
    const m = b?.p.moves[i];
    if (!b || !m || !b.menu || b.asked[i]) return;
    b.menu = false;
    this.prompt = null;
    b.asked[i] = true;
    const left = b.asked.filter((a) => !a).length;
    const intro = this.say(`You asked about ${m.name}!`, false, 700);
    b.pose = 1;
    await this.wait(140);
    await this.attack(m.type);
    b.pose = 0;
    // The hit: three blinks and a shake, then the HP drains.
    await this.tween(420, (q) => {
      b.blink = Math.floor(q * 6) % 2 === 0;
      b.shake = Math.sin(q * Math.PI * 6) * (1 - q) * 4;
    });
    b.blink = false;
    b.shake = 0;
    const from = b.hp, to = left / b.asked.length;
    await this.tween(650, (q) => (b.hp = lerp(from, to, q)));
    await intro;
    await this.say(m.superEffective ? [...m.lines, "It's super effective!"] : m.lines);
    if (left === 0) await this.victory();
    else this.menuOn();
  }

  /** The move's animation, chosen by its type. */
  private async attack(type: MoveType): Promise<void> {
    const b = this.battle;
    if (!b) return;
    const col = TYPE_COLORS[type];
    const hi = shade(col, 0.45);
    const sx = ME_X + 34, sy = ME_Y - 70, tx = FOE_X, ty = FOE_Y - 30;
    if (this.o.reducedMotion) return;
    if (type === "POWER") {
      b.bolt = { x: tx, t: 0 };
      await this.tween(260, (q) => b.bolt && (b.bolt.t = q));
      b.bolt = null;
      this.burst(tx, ty, "#ffe27a", 18, 140);
      return;
    }
    // Everything else throws an orb along an arc, trailing its colour.
    await this.tween(360, (q) => {
      const x = lerp(sx, tx, q), y = lerp(sy, ty, q) - Math.sin(q * Math.PI) * 28;
      this.particles.push({ x, y, vx: rand(-12, 12), vy: rand(-12, 12), ay: 0, life: 0.28, max: 0.28, col: q % 0.2 < 0.1 ? hi : col, size: 3, kind: "rect" });
    });
    switch (type) {
      case "MACHINING":
        for (let i = 0; i < 26; i++) this.particles.push({ x: tx, y: ty, vx: rand(-160, 160), vy: rand(-180, 20), ay: 420, life: rand(0.3, 0.7), max: 0.7, col: i % 3 ? "#ffd27a" : "#ffffff", size: 1, kind: "rect" });
        break;
      case "BUSINESS":
        for (let i = 0; i < 14; i++) this.particles.push({ x: tx, y: ty, vx: rand(-90, 90), vy: rand(-170, -60), ay: 330, life: rand(0.6, 1), max: 1, col: "#e8b44a", size: 1, kind: "coin" });
        break;
      case "SOFTWARE":
        for (let i = 0; i < 16; i++) this.particles.push({ x: tx + rand(-30, 30), y: ty - rand(20, 50), vx: 0, vy: rand(50, 110), ay: 0, life: rand(0.5, 0.8), max: 0.8, col: i % 2 ? ACCENT_HI : "#7be0a0", size: 1, kind: "glyph", ch: i % 2 ? "1" : "0" });
        break;
      case "CAD":
        for (let i = 0; i < 3; i++) this.rings.push({ x: tx, y: ty, r0: 4 + i * 6, r1: 40 + i * 8, t: -i * 0.08, max: 0.5, col: hi, square: true });
        break;
      case "DESIGN": {
        const cols = ["#b4527a", "#e8b44a", "#2596be", "#3a8a55", "#ffffff"];
        for (let i = 0; i < 24; i++) this.particles.push({ x: tx, y: ty, vx: rand(-120, 120), vy: rand(-150, 30), ay: 200, life: rand(0.5, 0.9), max: 0.9, col: cols[i % cols.length] ?? "#fff", size: 2, kind: "rect" });
        break;
      }
      case "TEAM":
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          this.particles.push({ x: tx, y: ty, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, ay: 0, life: 0.55, max: 0.55, col: "#ffe27a", size: 1, kind: "star" });
        }
        break;
      case "MARKETS":
        for (let i = 0; i < 7; i++) this.particles.push({ x: tx - 30 + i * 10, y: ty + 24, vx: 0, vy: -rand(40, 110), ay: 0, life: 0.6, max: 0.6, col: i % 3 === 2 ? "#8a8175" : ACCENT, size: 4, kind: "rect" });
        break;
      default:
        // CONTROLS and ENERGY: pulses.
        for (let i = 0; i < 3; i++) this.rings.push({ x: tx, y: ty, r0: 2, r1: 36 + i * 10, t: -i * 0.1, max: 0.5, col: i % 2 ? col : hi });
        this.burst(tx, ty, hi, 10, 90);
    }
  }

  private burst(x: number, y: number, col: string, n: number, speed: number): void {
    if (this.o.reducedMotion) return;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand(0, 0.4);
      this.particles.push({ x, y, vx: Math.cos(a) * speed * rand(0.5, 1), vy: Math.sin(a) * speed * rand(0.5, 1), ay: 0, life: rand(0.25, 0.45), max: 0.45, col, size: 2, kind: "rect" });
    }
  }

  private async victory(): Promise<void> {
    const b = this.battle;
    if (!b) return;
    const s = this.save;
    const first = !s.beaten.includes(b.p.id);
    const fainted = this.say(`${b.p.name} fainted! It has nothing left to hide.`, false, 1300);
    await this.tween(520, (q) => {
      b.foeDy = ease(q) * 56;
      b.foeAlpha = 1 - q;
    });
    b.foeOn = false;
    await fainted;
    b.plateFoe = 0;
    b.trainerOff = 180;
    await this.tween(420, (q) => (b.trainerOff = lerp(180, 0, ease(q))));
    await this.say(`${b.p.trainer}: ${b.p.win}`);
    const reward = first ? REWARD.win : REWARD.rematch;
    if (first) s.beaten.push(b.p.id);
    this.addCoins(reward, FOE_X, FOE_Y - 40);
    await this.say(`You got ${reward} coins for asking everything!`);
    if (first) {
      await this.say(`VISITOR grew to Lv. ${1 + s.beaten.length}!`);
      if (s.beaten.length === PROJECTS.length) {
        await this.say([
          "You've seen every work in the gallery!",
          "MICHAEL would love to hear from you. The contact page is one click away.",
        ]);
      }
    }
    await this.leaveBattle();
  }

  private async run(): Promise<void> {
    const b = this.battle;
    if (!b?.menu) return;
    b.menu = false;
    this.prompt = null;
    await this.say("You got away safely!");
    await this.leaveBattle();
  }

  private async leaveBattle(): Promise<void> {
    const b = this.battle;
    await this.wipeIn();
    this.scene = "world";
    this.battle = null;
    this.bottom = "menu";
    this.prompt = null;
    await this.wipeOut();
    b?.done?.();
  }

  // ---- Shop -------------------------------------------------------------------------

  private async openShop(): Promise<void> {
    this.mode = "script";
    this.clerk.dir = OPP[this.player.dir];
    await this.say("CLERK: Welcome to the gift shop! Curators pay in coins. Spend them here.", true);
    this.bottom = "shop";
    this.shopSel = 0;
    this.focus = 0;
    this.prompt = "Pick something on the bottom screen.";
  }

  private async closeShop(): Promise<void> {
    if (this.dialog) return;
    this.bottom = "menu";
    this.prompt = null;
    await this.say("CLERK: Come again!");
    this.mode = "walk";
  }

  private owns(id: string): boolean {
    return this.save.owned.includes(id);
  }

  private equipped(it: Item): boolean {
    const e = this.save.equip;
    return (it.kind === "hat" && e.hat === it.id) || (it.kind === "outfit" && e.outfit === it.id) || (it.kind === "tool" && e.tool === it.id);
  }

  private equip(it: Item): void {
    const e = this.save.equip;
    if (it.kind === "hat") e.hat = it.id as HatId;
    if (it.kind === "outfit") e.outfit = it.id as OutfitId;
    if (it.kind === "tool") e.tool = e.tool === it.id ? "none" : (it.id as ToolId);
    writeSave(this.save);
  }

  private async buy(it: Item): Promise<void> {
    if (this.dialog) return;
    if (this.owns(it.id)) {
      this.equip(it);
      await this.say(this.equipped(it) ? `You put on the ${it.name}.` : `You put the ${it.name} away.`, true);
      this.prompt = "Pick something on the bottom screen.";
      return;
    }
    const short = it.price - this.save.coins;
    if (short > 0) {
      await this.say(`CLERK: That's ${it.price} coins. You need ${short} more. Ask a curator everything to earn some!`, true);
      this.prompt = "Pick something on the bottom screen.";
      return;
    }
    this.save.coins -= it.price;
    this.save.owned.push(it.id);
    this.equip(it);
    this.burst(128, 70, "#ffe27a", 14, 80);
    await this.say(`You bought the ${it.name}! You're wearing it now.`, true);
    this.prompt = "Pick something on the bottom screen.";
  }

  // ---- Looks ------------------------------------------------------------------------

  private playerLook(): Look {
    const o = this.save.equip.outfit;
    let l = this.lookCache.get(o);
    if (!l) {
      l = { ...PLAYER.look, ...OUTFIT_LOOKS[o] };
      this.lookCache.set(o, l);
    }
    return l;
  }

  private actorCanvas(a: Actor): { c: HTMLCanvasElement; flip: boolean } {
    const d: Dir = a.dir === "left" ? "right" : a.dir;
    const isPlayer = a === this.player;
    const hat = isPlayer ? this.save.equip.hat : a.who.hat;
    const outfit = isPlayer ? this.save.equip.outfit : a.who.outfit;
    const layers: (Sprite | undefined)[] = [
      OW_BODY[d][a.frame],
      outfit ? OW_OUTFITS[outfit]?.[d][a.frame] : undefined,
      ...a.extras.map((e) => OW_EXTRAS[e]?.[d]),
      OW_HAIR[a.who.hair][d],
      hat ? OW_HATS[hat][d] : undefined,
    ];
    return { c: bake(layers, isPlayer ? this.playerLook() : a.who.look), flip: a.dir === "left" };
  }

  private backCanvas(pose: 0 | 1): HTMLCanvasElement {
    const e = this.save.equip;
    const tool = e.tool === "none" ? undefined : BACK_TOOLS[e.tool][pose];
    return bake([BACK_BODY[pose], BACK_OUTFITS[e.outfit]?.[pose], tool, BACK_HATS[e.hat]], this.playerLook());
  }

  // ---- Drawing: world ---------------------------------------------------------------

  private camera(): [number, number] {
    const m = GALLERY;
    const mw = m.w * T, mh = m.h * T;
    const cx = mw <= W ? (mw - W) / 2 : Math.max(0, Math.min(mw - W, this.player.px + 8 - W / 2));
    const cy = mh <= H ? (mh - H) / 2 : Math.max(0, Math.min(mh - H, this.player.py + 8 - H / 2));
    return [Math.round(cx), Math.round(cy)];
  }

  private drawWorld(): void {
    const g = this.top;
    const m = GALLERY;
    const [cx, cy] = this.camera();
    g.fillStyle = "#14110e";
    g.fillRect(0, 0, W, H);
    const x0 = Math.floor(cx / T), y0 = Math.floor(cy / T);
    for (let ty = y0; ty <= y0 + 12; ty++) {
      const row = m.floor[ty];
      if (!row) continue;
      for (let tx = x0; tx <= x0 + 16; tx++) {
        const key = m.legend[row[tx] ?? ""];
        const tile = key ? TILES[key] : undefined;
        if (tile) blit(g, bake([tile]), tx * T - cx, ty * T - cy);
      }
    }
    const props = m.props.map((p) => ({ p, def: PROPS[p.id] })).filter((x) => x.def);
    for (const { p, def } of props) if (def?.layer === "floor") blit(g, bake([def.sprite]), p.x * T - cx, p.y * T - cy);
    type Item = { bottom: number; draw: () => void };
    const sorted: Item[] = [];
    for (const { p, def } of props) {
      if (def?.layer !== "sort") continue;
      sorted.push({ bottom: p.y * T + def.sprite.h, draw: () => blit(g, bake([def.sprite]), p.x * T - cx, p.y * T - cy) });
    }
    for (const a of this.all()) {
      sorted.push({
        bottom: a.py + T,
        draw: () => {
          const sh = bake([SHADOW]);
          blit(g, sh, a.px + (T - sh.width) / 2 - cx, a.py + T - sh.height - cy);
          const { c, flip } = this.actorCanvas(a);
          const bob = a.frame === 0 ? 0 : -1;
          blit(g, c, a.px + (T - c.width) / 2 - cx, a.py + T - c.height + bob - cy, flip);
        },
      });
    }
    sorted.sort((a, b) => a.bottom - b.bottom);
    for (const it of sorted) it.draw();
    for (const { p, def } of props) if (def?.layer === "over") blit(g, bake([def.sprite]), p.x * T - cx, p.y * T - cy);
    for (const a of this.all()) {
      if (!a.emote) continue;
      const e = bake([a.emote]);
      blit(g, e, a.px + (T - e.width) / 2 - cx, a.py - 8 - e.height - cy);
    }
  }

  // ---- Drawing: battle --------------------------------------------------------------

  private drawBattle(): void {
    const g = this.top;
    const b = this.battle;
    if (!b) return;
    g.drawImage(this.backdrop(), 0, 0);
    const pf = bake([PLATFORM_FOE]), pm = bake([PLATFORM_ME]);
    blit(g, pf, FOE_X - pf.width / 2, FOE_Y - pf.height / 2);
    blit(g, pm, ME_X + b.meOff - pm.width / 2, ME_Y - pm.height / 2);
    if (b.trainerOff !== null) {
      const tr = bake([TRAINER_FRONT[b.p.id]]);
      blit(g, tr, FOE_X - tr.width / 2 + b.trainerOff, FOE_Y + 4 - tr.height);
    }
    if (b.foeOn && !b.blink) {
      const frames = MONSTERS[b.p.id];
      const idle = this.o.reducedMotion ? 0 : Math.floor(this.time * 2) % 2;
      let c = bake([frames[idle as 0 | 1]]);
      if (b.foeWhite > 0.5) c = tint(c, "#ffffff", `m${b.p.id}${idle}`);
      const k = b.foeScale;
      const w = c.width * k, h = c.height * k;
      g.save();
      g.globalAlpha = b.foeAlpha;
      g.beginPath();
      g.rect(0, 0, W, FOE_Y + 6);
      g.clip();
      g.drawImage(c, Math.round(FOE_X - w / 2 + b.shake), Math.round(FOE_Y + 2 - h + b.foeDy), Math.round(w), Math.round(h));
      g.restore();
    }
    if (b.frameThrow) {
      const f = bake([ICONS.frame]);
      g.save();
      g.translate(Math.round(b.frameThrow.x), Math.round(b.frameThrow.y));
      g.rotate(Math.round(b.frameThrow.a * 4) * (Math.PI / 2));
      g.drawImage(f, -8, -8);
      g.restore();
    }
    if (b.bolt) this.drawBolt(b.bolt.x, b.bolt.t);
    const me = this.backCanvas(b.pose);
    // Cut at the waist like a B/W back sprite: the waist sits on the text box's top edge.
    blit(g, me, ME_X - me.width + b.meOff, 146 - me.height * 2, false, 2);
    this.drawFoePlate(b);
    this.drawMePlate(b);
  }

  /** The battle backdrop is costly to paint (most of a second the first time), so it is painted once. */
  private backdrop(): HTMLCanvasElement {
    if (this.backdropCanvas) return this.backdropCanvas;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    if (g) drawBattleBackdrop(g, 0);
    this.backdropCanvas = c;
    return c;
  }

  private drawBolt(x: number, t: number): void {
    const g = this.top;
    g.fillStyle = "#ffe27a";
    let px = x + 10;
    const end = Math.round((FOE_Y - 30) * Math.min(1, t * 1.6));
    for (let y = 0; y < end; y += 6) {
      const nx = x + ((y / 6) % 2 ? -8 : 8);
      for (let k = 0; k < 6; k++) g.fillRect(Math.round(lerp(px, nx, k / 6)) - 1, y + k, 3, 1);
      px = nx;
    }
    if (t > 0.5) {
      g.fillStyle = `rgba(255,240,170,${0.35 * (1 - t)})`;
      g.fillRect(0, 0, W, H);
    }
  }

  private hpBar(g: CanvasRenderingContext2D, x: number, y: number, w: number, frac: number): void {
    const col = frac > 0.5 ? "#4cc35a" : frac > 0.2 ? "#e8b432" : "#e0503c";
    g.fillStyle = FRAME;
    g.fillRect(x, y, w + 4, 6);
    g.fillStyle = "#e9ecef";
    g.fillRect(x + 2, y + 1, w, 4);
    const fw = Math.round(w * Math.max(0, frac));
    g.fillStyle = col;
    g.fillRect(x + 2, y + 1, fw, 4);
    g.fillStyle = shade(col, 0.35);
    g.fillRect(x + 2, y + 1, fw, 1);
  }

  private drawFoePlate(b: Battle): void {
    if (b.plateFoe <= 0) return;
    const g = this.top;
    const x = Math.round(lerp(-130, 6, b.plateFoe)), y = 8;
    panel(g, x, y, 124, 34, PAPER, FRAME, "#dfe6ea");
    drawText(g, FONT, b.p.name, x + 7, y + 4, INK, INK_SHADOW);
    let cx = x + 7;
    for (const t of b.p.types) {
      const w = measure(FONT_SMALL, t) + 6;
      g.fillStyle = TYPE_COLORS[t];
      g.fillRect(cx, y + 16, w, 7);
      drawText(g, FONT_SMALL, t, cx + 3, y + 17, "#ffffff");
      cx += w + 3;
    }
    drawText(g, FONT_SMALL, "HP", x + 7, y + 26, "#e8b432");
    this.hpBar(g, x + 20, y + 25, 96, b.hp);
  }

  private drawMePlate(b: Battle): void {
    if (b.plateMe <= 0) return;
    const g = this.top;
    const x = Math.round(lerp(W + 10, 126, b.plateMe)), y = 104;
    panel(g, x, y, 124, 34, PAPER, FRAME, "#dfe6ea");
    const lv = 1 + this.save.beaten.length;
    drawText(g, FONT, "VISITOR", x + 7, y + 4, INK, INK_SHADOW);
    const lvText = `Lv${lv}`;
    drawText(g, FONT, lvText, x + 117 - measure(FONT, lvText), y + 4, INK, INK_SHADOW);
    drawText(g, FONT_SMALL, "HP", x + 7, y + 17, "#e8b432");
    this.hpBar(g, x + 20, y + 16, 96, 1);
    drawText(g, FONT_SMALL, "EXP", x + 7, y + 26, ACCENT);
    g.fillStyle = FRAME;
    g.fillRect(x + 24, y + 26, 94, 4);
    g.fillStyle = ACCENT_HI;
    g.fillRect(x + 25, y + 27, Math.round(92 * (this.save.beaten.length / PROJECTS.length)), 2);
  }

  // ---- Drawing: shared top-screen layers --------------------------------------------

  private drawParticles(g: CanvasRenderingContext2D): void {
    for (const r of this.rings) {
      if (r.t < 0) continue;
      const q = r.t / r.max;
      const rad = Math.round(lerp(r.r0, r.r1, ease(q)));
      g.globalAlpha = 1 - q;
      g.fillStyle = r.col;
      if (r.square) {
        g.fillRect(r.x - rad, r.y - rad, rad * 2, 1);
        g.fillRect(r.x - rad, r.y + rad, rad * 2, 1);
        g.fillRect(r.x - rad, r.y - rad, 1, rad * 2);
        g.fillRect(r.x + rad, r.y - rad, 1, rad * 2 + 1);
      } else {
        for (let a = 0; a < 40; a++) {
          const t = (a / 40) * Math.PI * 2;
          g.fillRect(Math.round(r.x + Math.cos(t) * rad), Math.round(r.y + Math.sin(t) * rad * 0.7), 2, 2);
        }
      }
      g.globalAlpha = 1;
    }
    const coin = bake([ICONS.coin]);
    for (const q of this.particles) {
      g.globalAlpha = Math.min(1, q.life / (q.max * 0.5));
      const x = Math.round(q.x), y = Math.round(q.y);
      if (q.kind === "coin") blit(g, coin, x - 4, y - 4);
      else if (q.kind === "glyph") drawText(g, FONT, q.ch ?? "0", x, y, q.col);
      else if (q.kind === "star") {
        g.fillStyle = q.col;
        g.fillRect(x - 2, y, 5, 1);
        g.fillRect(x, y - 2, 1, 5);
      } else {
        g.fillStyle = q.col;
        g.fillRect(x, y, q.size, q.size);
      }
    }
    g.globalAlpha = 1;
  }

  private drawTextBox(): void {
    const g = this.top;
    const d = this.dialog;
    const lines = d ? (d.pages[d.page] ?? []) : this.prompt ? wrap(FONT, this.prompt, TEXT_W).slice(0, 2) : null;
    if (!lines) return;
    panel(g, 2, 144, 252, 46, PAPER, FRAME, "#cfdbe1");
    let left = d ? d.n : Infinity;
    lines.forEach((ln, i) => {
      const shown = ln.slice(0, Math.max(0, Math.floor(left)));
      left -= ln.length + 1;
      drawText(g, FONT, shown, 12, 151 + i * 16, INK, INK_SHADOW);
    });
    if (d && !d.typing && d.auto === null && Math.floor(this.time * 2.5) % 2 === 0) {
      g.fillStyle = "#e0503c";
      for (let k = 0; k < 4; k++) g.fillRect(240 + k, 180 + k, 7 - k * 2, 1);
    }
  }

  private drawChoice(): void {
    const c = this.choice;
    if (!c) return;
    const g = this.top;
    const w = 8 + Math.max(...c.options.map((o) => measure(FONT, o))) + 22;
    const h = 10 + c.options.length * 16;
    const x = W - w - 4, y = 144 - h - 2;
    panel(g, x, y, w, h, PAPER, FRAME, "#cfdbe1");
    c.options.forEach((o, i) => {
      drawText(g, FONT, o, x + 18, y + 6 + i * 16, INK, INK_SHADOW);
      if (i === c.sel) drawText(g, FONT, "▶", x + 7, y + 6 + i * 16, INK);
    });
  }

  private drawWipe(): void {
    const g = this.top;
    if (this.wipe === "flash" && this.flashOn) {
      g.fillStyle = "rgba(255,255,255,0.85)";
      g.fillRect(0, 0, W, H);
    }
    if (this.fade > 0) {
      g.fillStyle = "#14110e";
      const w = Math.ceil(this.fade * W);
      for (let i = 0; i < 12; i++) g.fillRect(i % 2 ? 0 : W - w, i * 16, w, 16);
    }
  }

  // ---- Drawing: bottom screen -------------------------------------------------------

  private drawBottom(): void {
    const g = this.bot;
    const regions: Region[] = [];
    g.fillStyle = UI_BG;
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#263843";
    for (let i = -H; i < W; i += 12) for (let y = 0; y < H; y++) if ((y + i) % 12 < 6) g.fillRect(i + y, y, 1, 1);
    if (this.bottom === "battle") this.bottomBattle(g, regions);
    else if (this.bottom === "shop") this.bottomShop(g, regions);
    else this.bottomMenu(g, regions);
    const keyboard = (this.bottom === "battle" && this.battle?.menu) || this.bottom === "shop";
    const f = regions[this.focus];
    if (keyboard && f) {
      g.fillStyle = "#ffffff";
      g.fillRect(f.x - 2, f.y - 2, f.w + 4, 2);
      g.fillRect(f.x - 2, f.y + f.h, f.w + 4, 2);
      g.fillRect(f.x - 2, f.y, 2, f.h);
      g.fillRect(f.x + f.w, f.y, 2, f.h);
    }
    this.regions = regions;
    const sig = regions.map((r) => r.key + r.label).join("|");
    if (sig !== this.regionSig) {
      this.regionSig = sig;
      if (this.focus >= regions.length) this.focus = 0;
      this.o.onRegions(regions);
    }
  }

  private coinsHud(g: CanvasRenderingContext2D): void {
    const text = String(this.coinShown);
    const w = measure(FONT, text);
    blit(g, bake([ICONS.coinBig]), W - w - 30, 3);
    drawText(g, FONT, text, W - w - 10, 6, UI_TEXT);
  }

  private button(g: CanvasRenderingContext2D, regions: Region[], r: Omit<Region, "label"> & { label?: string }, text: string, fill: string, on = true, sub?: string): void {
    panel(g, r.x, r.y, r.w, r.h, on ? fill : shade(fill, -0.45), "#0f1519", on ? shade(fill, 0.25) : shade(fill, -0.3));
    g.fillStyle = shade(fill, -0.25);
    if (on) g.fillRect(r.x + 3, r.y + r.h - 4, r.w - 6, 1);
    const tw = measure(FONT, text);
    const ty = sub ? r.y + Math.round(r.h / 2) - 10 : r.y + Math.round((r.h - 9) / 2);
    drawText(g, FONT, text, r.x + Math.round((r.w - tw) / 2), ty, on ? "#ffffff" : "#c3ccd1", on ? shade(fill, -0.45) : undefined);
    if (sub) {
      const sw = measure(FONT_SMALL, sub);
      drawText(g, FONT_SMALL, sub, r.x + Math.round((r.w - sw) / 2), ty + 14, on ? shade(fill, 0.7) : "#aab4ba");
    }
    regions.push({ ...r, label: r.label ?? text });
  }

  private bottomMenu(g: CanvasRenderingContext2D, regions: Region[]): void {
    const inBattleFlow = this.mode === "script" || this.scene !== "world";
    const tabs: ["works" | "wardrobe", string][] = [["works", "WORKS"], ["wardrobe", "WARDROBE"]];
    tabs.forEach(([id, label], i) => {
      this.button(g, regions, { key: `tab-${id}`, x: 4 + i * 82, y: 2, w: 78, h: 18, act: () => (this.tab = id) }, label, this.tab === id ? ACCENT : UI_PANEL);
    });
    this.coinsHud(g);
    if (this.tab === "works") {
      PROJECTS.forEach((p, i) => {
        const x = 4 + (i % 3) * 84, y = 24 + Math.floor(i / 3) * 84;
        const met = this.save.met.includes(p.id), beaten = this.save.beaten.includes(p.id);
        panel(g, x, y, 80, 80, met ? "#30495a" : UI_PANEL, "#0f1519", met ? UI_LINE : "#34495a");
        const src = bake([MONSTERS[p.id][0]]);
        const c = met ? src : tint(src, "#14202a", `sil${p.id}`);
        blit(g, c, x + 8, y + 2);
        const lw = measure(FONT_SMALL, p.short);
        drawText(g, FONT_SMALL, met ? p.short : "???", x + Math.round((80 - (met ? lw : measure(FONT_SMALL, "???"))) / 2), y + 70, met ? UI_TEXT : UI_DIM);
        if (beaten) {
          g.fillStyle = "#4cc35a";
          g.fillRect(x + 66, y + 4, 10, 10);
          g.fillStyle = "#ffffff";
          g.fillRect(x + 68, y + 9, 2, 2);
          g.fillRect(x + 70, y + 10, 2, 2);
          g.fillRect(x + 72, y + 6, 2, 4);
        }
        regions.push({
          key: `work-${p.id}`,
          label: `${p.name}${beaten ? ", seen" : met ? ", met" : ""}: battle now`,
          x, y, w: 80, h: 80,
          act: () => {
            if (inBattleFlow) return;
            void this.script(this.fight(p, beaten));
          },
        });
      });
      return;
    }
    // Wardrobe: the player as they look now, and every owned item to swap.
    panel(g, 4, 24, 74, 164, UI_PANEL, "#0f1519", UI_LINE);
    const look = this.actorCanvas({ ...this.player, dir: "down", frame: 0 }).c;
    blit(g, look, 41 - look.width * 1.5, 40, false, 3);
    drawText(g, FONT_SMALL, `LV ${1 + this.save.beaten.length}`, 12, 170, UI_TEXT);
    const kinds: [ItemKind, string][] = [["hat", "HATS"], ["outfit", "OUTFITS"], ["tool", "TOOLS"]];
    kinds.forEach(([kind, label], r) => {
      const y = 24 + r * 55;
      drawText(g, FONT_SMALL, label, 84, y + 2, UI_DIM);
      const owned = ITEMS.filter((it) => it.kind === kind && this.owns(it.id));
      owned.forEach((it, i) => {
        const x = 84 + i * 28;
        const on = this.equipped(it);
        panel(g, x, y + 10, 26, 26, on ? ACCENT : UI_PANEL, "#0f1519", on ? ACCENT_HI : UI_LINE);
        blit(g, bake([ICONS[it.id]]), x + 5, y + 15);
        regions.push({ key: `wear-${it.id}`, label: `${on ? "Take off" : "Wear"} ${it.name}`, x, y: y + 10, w: 26, h: 26, act: () => this.equip(it) });
      });
      if (owned.length === 0) drawText(g, FONT_SMALL, "NONE YET", 84, y + 20, "#6d8592");
    });
    drawText(g, FONT_SMALL, "MORE AT THE GIFT SHOP", 84, 180, UI_DIM);
  }

  private bottomBattle(g: CanvasRenderingContext2D, regions: Region[]): void {
    const b = this.battle;
    if (!b) return;
    const on = b.menu;
    drawText(g, FONT, `ASK ${b.p.name}`, 6, 6, UI_TEXT);
    const left = b.asked.filter((a) => !a).length;
    const tag = `${left} LEFT`;
    drawText(g, FONT_SMALL, tag, W - 6 - measure(FONT_SMALL, tag), 8, ACCENT_HI);
    b.p.moves.forEach((m, i) => {
      const x = 4 + (i % 2) * 126, y = 22 + Math.floor(i / 2) * 54;
      const asked = b.asked[i] ?? false;
      this.button(
        g, regions,
        { key: `move-${i}`, label: `${m.name}, ${m.type}${asked ? ", already asked" : ""}`, x, y, w: 122, h: 50, act: () => void this.useMove(i) },
        m.name, TYPE_COLORS[m.type], on && !asked, asked ? "ASKED" : m.type,
      );
    });
    this.button(g, regions, { key: "view", label: "View this project's room", x: 4, y: 134, w: 122, h: 26, act: () => this.o.onViewRoom(b.p.slug) }, "VIEW ROOM", "#8a7a5a", true);
    this.button(g, regions, { key: "run", label: "Run", x: 130, y: 134, w: 122, h: 26, act: () => void this.run() }, "RUN", "#4a5462", on);
    drawText(g, FONT_SMALL, "EVERY FIGURE HERE IS FROM THE SITE", 6, 172, UI_DIM);
  }

  private bottomShop(g: CanvasRenderingContext2D, regions: Region[]): void {
    drawText(g, FONT, "GIFT SHOP", 6, 6, UI_TEXT);
    this.coinsHud(g);
    const tabs: [ItemKind, string][] = [["hat", "HATS"], ["outfit", "OUTFITS"], ["tool", "TOOLS"]];
    tabs.forEach(([kind, label], i) => {
      this.button(g, regions, { key: `shop-tab-${kind}`, x: 4 + i * 64, y: 22, w: 60, h: 18, act: () => { this.shopTab = kind; this.shopSel = 0; } }, label, this.shopTab === kind ? ACCENT : UI_PANEL);
    });
    this.button(g, regions, { key: "shop-exit", label: "Leave the shop", x: 196, y: 22, w: 56, h: 18, act: () => void this.closeShop() }, "EXIT", "#4a5462");
    const items = ITEMS.filter((it) => it.kind === this.shopTab);
    items.forEach((it, i) => {
      const x = 4 + (i % 4) * 63, y = 44 + Math.floor(i / 4) * 50;
      const sel = i === this.shopSel;
      const own = this.owns(it.id), on = this.equipped(it);
      panel(g, x, y, 60, 46, sel ? "#30495a" : UI_PANEL, "#0f1519", sel ? ACCENT_HI : UI_LINE);
      blit(g, bake([ICONS[it.id]]), x + 14, y + 4, false, 2);
      const tag = on ? "ON" : own ? "OWNED" : String(it.price);
      const tw = measure(FONT_SMALL, tag) + (own ? 0 : 9);
      if (!own) blit(g, bake([ICONS.coin]), x + Math.round((60 - tw) / 2), y + 37);
      drawText(g, FONT_SMALL, tag, x + Math.round((60 - tw) / 2) + (own ? 0 : 9), y + 38, on ? ACCENT_HI : own ? "#9fe0a8" : "#ffe27a");
      regions.push({ key: `item-${it.id}`, label: `${it.name}, ${own ? (on ? "wearing" : "owned") : `${it.price} coins`}`, x, y, w: 60, h: 46, act: () => (this.shopSel = i) });
    });
    const it = items[this.shopSel];
    if (!it) return;
    panel(g, 4, 146, 248, 44, UI_PANEL, "#0f1519", UI_LINE);
    drawText(g, FONT, it.name, 10, 151, UI_TEXT);
    const blurb = wrap(FONT_SMALL, it.blurb.toUpperCase(), 150);
    blurb.slice(0, 2).forEach((ln, i) => drawText(g, FONT_SMALL, ln, 10, 166 + i * 9, UI_DIM));
    const own = this.owns(it.id), on = this.equipped(it);
    const label = own ? (on ? (it.kind === "tool" ? "PUT AWAY" : "WEARING") : "WEAR") : `BUY`;
    const can = own ? !(on && it.kind !== "tool") : this.save.coins >= it.price;
    this.button(g, regions, { key: "shop-buy", label: own ? `${label} ${it.name}` : `Buy ${it.name} for ${it.price} coins`, x: 172, y: 150, w: 76, h: 36, act: () => void this.buy(it) }, label, own ? ACCENT : "#3a8a55", can, own ? undefined : `${it.price}`);
  }

  // ---- Keyboard focus on the bottom screen -------------------------------------------

  private navigate(d: FullDir): void {
    const cur = this.regions[this.focus];
    if (!cur) {
      this.focus = 0;
      return;
    }
    const cx = cur.x + cur.w / 2, cy = cur.y + cur.h / 2;
    const [dx, dy] = D[d];
    let best = -1, bestScore = Infinity;
    this.regions.forEach((r, i) => {
      if (i === this.focus) return;
      const rx = r.x + r.w / 2 - cx, ry = r.y + r.h / 2 - cy;
      const along = rx * dx + ry * dy;
      if (along <= 2) return;
      const across = Math.abs(rx * dy) + Math.abs(ry * dx);
      const score = along + across * 2;
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    });
    if (best >= 0) {
      this.focus = best;
      const r = this.regions[best];
      if (r?.key.startsWith("item-")) r.act();
    }
  }
}
