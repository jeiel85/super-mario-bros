// Castle Hazards: Firebar, Podoboo, Retainer (Toad/Princess Peach)
import { TILE_SIZE } from '../constants';
import { SpriteSheet } from '../graphics/SpriteSheet';
import { NESAudio } from '../audio/NESAudio';

// Rotating Firebar attached to a block in castle
export class Firebar {
  public angle: number;
  private speed: number;
  public centerX: number;
  public centerY: number;

  constructor(
    public tileX: number,
    public tileY: number,
    public length = 4,
    public clockwise = true
  ) {
    this.centerX = tileX * TILE_SIZE + 8;
    this.centerY = tileY * TILE_SIZE + 8;
    this.angle = 0;
    this.speed = (clockwise ? 1 : -1) * 0.045;
  }

  update() {
    this.angle += this.speed;
  }

  // Check collision with Mario (circle hits)
  checkCollision(mx: number, my: number, mw: number, mh: number): boolean {
    const marioCenterX = mx + mw / 2;
    const marioCenterY = my + mh / 2;

    for (let i = 1; i <= this.length; i++) {
      const dist = i * 8;
      const bx = this.centerX + Math.cos(this.angle) * dist;
      const by = this.centerY + Math.sin(this.angle) * dist;

      // Distance to Mario center
      const dx = marioCenterX - bx;
      const dy = marioCenterY - by;
      if (dx * dx + dy * dy < 7 * 7) {
        return true;
      }
    }
    return false;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    const px = this.centerX - cameraX;
    if (px < -60 || px > 300) return;

    for (let i = 1; i <= this.length; i++) {
      const dist = i * 8;
      const bx = px + Math.cos(this.angle) * dist;
      const by = this.centerY + Math.sin(this.angle) * dist;

      ctx.save();
      ctx.fillStyle = '#fc9838'; // Outer fireball orange
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff'; // Inner white core
      ctx.beginPath();
      ctx.arc(bx, by, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// Podoboo (Lava Bubble leaping from pit)
export class Podoboo {
  public width = 16;
  public height = 16;
  public x: number;
  public y: number;
  public vy = 0;
  private timer = 0;
  private isLeaping = false;
  private startY = 240;

  constructor(startX: number) {
    this.x = startX;
    this.y = this.startY;
  }

  update() {
    this.timer++;
    if (!this.isLeaping) {
      // Periodically leap every ~150 frames
      if (this.timer >= 150) {
        this.timer = 0;
        this.isLeaping = true;
        this.y = this.startY;
        this.vy = -7.2;
        NESAudio.playBowserFlame();
      }
    } else {
      this.y += this.vy;
      this.vy += 0.18; // Gravity for Podoboo
      if (this.y > this.startY + 10) {
        this.y = this.startY;
        this.vy = 0;
        this.isLeaping = false;
      }
    }
  }

  checkCollision(mx: number, my: number, mw: number, mh: number): boolean {
    if (!this.isLeaping) return false;
    return (
      mx < this.x + this.width &&
      mx + mw > this.x &&
      my < this.y + this.height &&
      my + mh > this.y
    );
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    if (!this.isLeaping) return;
    const px = this.x - cameraX;
    if (px < -20 || px > 280) return;

    const img = SpriteSheet.enemies['podoboo'];
    if (img) {
      ctx.save();
      // Flip when falling down
      if (this.vy > 0) {
        ctx.translate(px + 8, this.y + 8);
        ctx.scale(1, -1);
        ctx.drawImage(img, -8, -8);
      } else {
        ctx.drawImage(img, px, this.y);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = '#fc9838';
      ctx.fillRect(px, this.y, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 4, this.y + 4, 8, 8);
    }
  }
}

// Retainer: Toad (World 1..7) and Princess Peach (World 8-4)
export class Retainer {
  public width = 16;
  public height = 24;
  public isPeach: boolean;

  constructor(public x: number, public y = 11 * TILE_SIZE, isPeach = false) {
    this.isPeach = isPeach;
    if (isPeach) {
      this.height = 32;
      this.y = 10 * TILE_SIZE;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    const px = this.x - cameraX;
    if (px < -30 || px > 280) return;

    const img = this.isPeach ? SpriteSheet.ui['princess_peach'] : SpriteSheet.ui['toad_retainer'];
    if (img) {
      ctx.drawImage(img, px, this.y);
    } else {
      // Procedural fallback
      ctx.fillStyle = this.isPeach ? '#fc9838' : '#ffffff';
      ctx.fillRect(px, this.y, 16, this.height);
      ctx.fillStyle = '#f83800';
      ctx.fillRect(px + 2, this.y + 2, 12, 6);
    }
  }
}
