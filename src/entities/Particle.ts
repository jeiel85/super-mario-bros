// Visual Particles & Floating Score Text
import { SpriteSheet } from '../graphics/SpriteSheet';
import { GRAVITY } from '../constants';

export interface IParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isDead: boolean;
  update(): void;
  render(ctx: CanvasRenderingContext2D, cameraX: number): void;
}

// 1. Brick Shatter Debris (4 flying angular chunks)
export class BrickPiece implements IParticle {
  public isDead = false;
  private life = 45;

  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number
  ) {}

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += GRAVITY * 0.9;
    this.life--;
    if (this.life <= 0 || this.y > 250) {
      this.isDead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    const img = SpriteSheet.particles['brick_chunk'];
    if (img) {
      ctx.drawImage(img, Math.round(this.x - cameraX), Math.round(this.y));
    }
  }
}

// 2. Floating Score Numbers ("100", "200", "1000", "1UP", etc.)
export class FloatingScore implements IParticle {
  public isDead = false;
  public vx = 0;
  public vy = -1.0;
  private life = 36;

  constructor(
    public x: number,
    public y: number,
    public text: string
  ) {}

  update() {
    this.y += this.vy;
    this.life--;
    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.text, Math.round(this.x - cameraX), Math.round(this.y));
    ctx.restore();
  }
}

// 3. Skid Smoke Puff
export class SkidSmoke implements IParticle {
  public isDead = false;
  public vx = 0;
  public vy = 0;
  private life = 8;

  constructor(public x: number, public y: number) {}

  update() {
    this.life--;
    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    const img = SpriteSheet.particles['smoke'];
    if (img) {
      ctx.drawImage(img, Math.round(this.x - cameraX), Math.round(this.y));
    }
  }
}

// 4. Block Bounce Animation (When a block is bumped from below)
export class BouncingBlock {
  public currentYOffset = 0;
  private timer = 0;
  public isFinished = false;

  constructor(public tileX: number, public tileY: number, public tileType: number) {}

  update() {
    this.timer++;
    // Bounces up ~5px then falls back down
    if (this.timer <= 4) {
      this.currentYOffset = -this.timer * 1.25;
    } else if (this.timer <= 8) {
      this.currentYOffset = -(8 - this.timer) * 1.25;
    } else {
      this.currentYOffset = 0;
      this.isFinished = true;
    }
  }
}

// 5. Fireball Entity
export class Fireball implements IParticle {
  public isDead = false;
  public width = 8;
  public height = 8;
  public vx: number;
  public vy = 2.0;

  constructor(public x: number, public y: number, dir: number) {
    this.vx = dir * 3.6;
  }

  update(tiles?: number[][]) {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += GRAVITY * 0.9;

    if (tiles) {
      // Check ground bounce
      const tileX = Math.floor((this.x + 4) / 16);
      const tileY = Math.floor((this.y + 8) / 16);
      if (tileY >= 0 && tileY < tiles.length && tileX >= 0 && tileX < (tiles[0]?.length || 0)) {
        const t = tiles[tileY][tileX];
        if (t !== 0 && t !== 13 && t !== 14 && t !== 16 && t !== 20) {
          this.y = tileY * 16 - 8;
          this.vy = -3.2; // Bounce up
        }
      }

      // Check wall collision
      const wallTileX = Math.floor((this.x + (this.vx > 0 ? 8 : 0)) / 16);
      const wallTileY = Math.floor((this.y + 4) / 16);
      if (wallTileY >= 0 && wallTileY < tiles.length && wallTileX >= 0 && wallTileX < (tiles[0]?.length || 0)) {
        const t = tiles[wallTileY][wallTileX];
        if (t !== 0 && t !== 13 && t !== 14 && t !== 16 && t !== 20) {
          this.isDead = true;
        }
      }
    }

    if (this.y > 250) {
      this.isDead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    const img = SpriteSheet.particles['fireball'];
    if (img) {
      ctx.drawImage(img, Math.round(this.x - cameraX), Math.round(this.y));
    }
  }
}
