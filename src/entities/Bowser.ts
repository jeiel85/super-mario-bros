// NES Super Mario Bros. Bowser Boss Entity
import { GRAVITY } from '../constants';
import { SpriteSheet } from '../graphics/SpriteSheet';
import { NESAudio } from '../audio/NESAudio';
import { FloatingScore, IParticle } from './Particle';

export class BowserFlame implements IParticle {
  public width = 24;
  public height = 8;
  public vx = -2.0;
  public vy = 0;
  public isDead = false;
  private animTimer = 0;

  constructor(public x: number, public y: number) {}

  update() {
    this.x += this.vx;
    this.animTimer++;
    if (this.x < -40) {
      this.isDead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    const px = this.x - cameraX;
    if (px < -30 || px > 280) return;

    // 2-frame flame
    const frame = Math.floor(this.animTimer / 6) % 2;
    const img = SpriteSheet.enemies[`bowser_flame_${frame}`] || SpriteSheet.enemies['bowser_flame_0'];
    if (img) {
      ctx.drawImage(img, px, this.y);
    } else {
      ctx.fillStyle = '#fc9838';
      ctx.fillRect(px, this.y, 24, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 4, this.y + 2, 16, 4);
    }
  }
}

export class BowserHammer implements IParticle {
  public width = 8;
  public height = 16;
  public vx: number;
  public vy = -5.0;
  public isDead = false;
  private animTimer = 0;

  constructor(public x: number, public y: number, dirLeft = true) {
    this.vx = dirLeft ? -1.5 : 1.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += GRAVITY * 0.7;
    this.animTimer++;
    if (this.y > 250) {
      this.isDead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    const px = this.x - cameraX;
    if (px < -20 || px > 280) return;
    const frame = Math.floor(this.animTimer / 4) % 4;
    const img = SpriteSheet.enemies[`hammer_${frame}`];
    if (img) {
      ctx.drawImage(img, px, this.y);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px, this.y, 8, 12);
    }
  }
}

export class Bowser {
  public width = 32;
  public height = 32;
  public x: number;
  public y: number;
  public vx = -0.3;
  public vy = 0;

  public hp = 5;
  public isDead = false;
  public isFalling = false;
  public isDefeated = false;

  private minX: number;
  private maxX: number;
  private baseY: number;

  private jumpTimer = 0;
  private breathTimer = 0;
  private hammerTimer = 0;
  private animTimer = 0;
  private isOpenMouth = false;

  public flames: BowserFlame[] = [];
  public hammers: BowserHammer[] = [];

  constructor(startX: number, startY: number, private worldNum = 1) {
    this.x = startX;
    this.y = startY;
    this.baseY = startY;
    this.minX = startX - 48;
    this.maxX = startX + 16;
  }

  update(_tiles: number[][], cameraX: number, _playerX: number, _onSpawnScore: (score: FloatingScore) => void) {
    if (this.isDead) return;

    // Bridge collapse / fall into lava
    if (this.isFalling) {
      this.y += 2.0;
      this.animTimer++;
      if (this.y > 240) {
        this.isDead = true;
      }
      return;
    }

    // Only active when on screen
    if (this.x < cameraX - 48 || this.x > cameraX + 270) return;

    this.animTimer++;

    // Walk back and forth on bridge
    this.x += this.vx;
    if (this.x < this.minX) {
      this.x = this.minX;
      this.vx = 0.3;
    } else if (this.x > this.maxX) {
      this.x = this.maxX;
      this.vx = -0.3;
    }

    // Jumping physics
    this.jumpTimer++;
    if (this.jumpTimer > 150) {
      this.jumpTimer = 0;
      this.vy = -3.8;
    }

    if (this.y < this.baseY || this.vy < 0) {
      this.y += this.vy;
      this.vy += GRAVITY * 0.7;
      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.vy = 0;
      }
    }

    // Fire breath
    this.breathTimer++;
    if (this.breathTimer === 100) {
      this.isOpenMouth = true;
    } else if (this.breathTimer >= 130) {
      this.breathTimer = 0;
      this.isOpenMouth = false;
      // Fire flame
      this.flames.push(new BowserFlame(this.x - 16, this.y + 10));
      NESAudio.playFireball();
    }

    // Hammers in World 6, 7, 8
    if (this.worldNum >= 6) {
      this.hammerTimer++;
      if (this.hammerTimer > 80) {
        this.hammerTimer = 0;
        this.hammers.push(new BowserHammer(this.x + 8, this.y, true));
      }
    }

    // Update projectiles
    this.flames.forEach(f => f.update());
    this.flames = this.flames.filter(f => !f.isDead);

    this.hammers.forEach(h => h.update());
    this.hammers = this.hammers.filter(h => !h.isDead);
  }

  // Hit by Mario's fireball
  hitByFireball(onSpawnScore: (score: FloatingScore) => void): boolean {
    if (this.isDead || this.isFalling) return false;
    this.hp--;
    NESAudio.playKick();
    if (this.hp <= 0) {
      this.defeat(onSpawnScore);
      return true;
    }
    return false;
  }

  // Defeated (either by 5 fireballs or bridge collapse)
  defeat(onSpawnScore: (score: FloatingScore) => void) {
    if (this.isDefeated) return;
    this.isDefeated = true;
    this.isFalling = true;
    NESAudio.playBowserFall();
    onSpawnScore(new FloatingScore(this.x + 8, this.y, '5000'));
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    if (this.isDead) return;

    // Render projectiles
    this.flames.forEach(f => f.render(ctx, cameraX));
    this.hammers.forEach(h => h.render(ctx, cameraX));

    const px = this.x - cameraX;
    if (px < -40 || px > 280) return;

    const frame = Math.floor(this.animTimer / 12) % 2;
    const mouthKey = this.isOpenMouth ? 'open' : 'closed';
    const spriteKey = `bowser_${mouthKey}_${frame}`;
    const img = SpriteSheet.enemies[spriteKey] || SpriteSheet.enemies['bowser_closed_0'];

    if (img) {
      ctx.drawImage(img, px, this.y);
    } else {
      ctx.fillStyle = '#00a800';
      ctx.fillRect(px, this.y, 32, 32);
      ctx.fillStyle = '#fc9838';
      ctx.fillRect(px + 16, this.y + 4, 16, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 4, this.y + 8, 4, 4);
    }
  }
}
