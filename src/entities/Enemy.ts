// Enemies: Goomba, Koopa Troopa, and Shell Physics
import { SpriteSheet, flipCanvasH } from '../graphics/SpriteSheet';
import { TILE_SIZE, GRAVITY, TERMINAL_VELOCITY, SHELL_SPEED } from '../constants';
import { NESAudio } from '../audio/NESAudio';
import { FloatingScore } from './Particle';

export type EnemyType = 'goomba' | 'koopa';

export class Enemy {
  public width = 16;
  public height = 16;
  public vx = -0.5; // Walk left initially
  public vy = 0;

  public isDead = false;
  public isStomped = false;
  private stompedTimer = 0;

  // Koopa specific
  public isShell = false;
  public isShellMoving = false;
  public shellComboCount = 0;

  // Flipped death animation (hit by shell, star, or block below)
  public isFlipped = false;

  private animTimer = 0;
  private animFrame = 0;

  constructor(public type: EnemyType, public x: number, public y: number) {
    if (type === 'koopa') {
      this.height = 24; // Koopa is taller
    }
  }

  update(tiles: number[][], cameraX: number, _onSpawnScore?: (score: FloatingScore) => void) {
    if (this.isDead) return;

    // Flipped death physics (arcs up and offscreen)
    if (this.isFlipped) {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += GRAVITY;
      if (this.y > 250) {
        this.isDead = true;
      }
      return;
    }

    // Stomped flat Goomba
    if (this.isStomped && this.type === 'goomba') {
      this.stompedTimer++;
      if (this.stompedTimer > 30) {
        this.isDead = true;
      }
      return;
    }

    // Only update if near camera viewport (NES active window)
    if (this.x < cameraX - 32 || this.x > cameraX + 288) {
      return;
    }

    this.animTimer++;
    if (this.animTimer % 8 === 0) {
      this.animFrame = (this.animFrame + 1) % 2;
    }

    // Gravity
    this.vy = Math.min(TERMINAL_VELOCITY, this.vy + GRAVITY);

    // Horizontal Movement & Collision
    this.x += this.vx;
    this.resolveHorizontalCollision(tiles);

    // Vertical Movement & Collision
    this.y += this.vy;
    this.resolveVerticalCollision(tiles);

    // Pit death
    if (this.y > 250) {
      this.isDead = true;
    }
  }

  // Stomp interaction from above
  public stomp(onSpawnScore: (score: FloatingScore) => void): boolean {
    if (this.type === 'goomba') {
      this.isStomped = true;
      this.vx = 0;
      this.vy = 0;
      NESAudio.playStomp();
      onSpawnScore(new FloatingScore(this.x, this.y, '100'));
      return true;
    } else if (this.type === 'koopa') {
      NESAudio.playStomp();
      if (!this.isShell) {
        // Retreat into shell
        this.isShell = true;
        this.height = 16;
        this.y += 8; // Adjust height down to 16
        this.vx = 0;
        this.isShellMoving = false;
        onSpawnScore(new FloatingScore(this.x, this.y, '100'));
        return true;
      } else if (this.isShell && this.isShellMoving) {
        // Stop moving shell
        this.vx = 0;
        this.isShellMoving = false;
        onSpawnScore(new FloatingScore(this.x, this.y, '100'));
        return true;
      }
    }
    return false;
  }

  // Kick stationary shell
  public kickShell(direction: number, onSpawnScore: (score: FloatingScore) => void) {
    if (!this.isShell) return;
    this.isShellMoving = true;
    this.vx = direction * SHELL_SPEED;
    this.shellComboCount = 0;
    NESAudio.playKick();
    onSpawnScore(new FloatingScore(this.x, this.y, '400'));
  }

  // Flipped death (from block below, starman, or sliding shell)
  public flipDie(dir = 1) {
    this.isFlipped = true;
    this.vx = dir * 1.5;
    this.vy = -4.0;
    NESAudio.playKick();
  }

  private resolveHorizontalCollision(tiles: number[][]) {
    const h = this.isShell ? 16 : this.height;
    const tileY1 = Math.floor(this.y / TILE_SIZE);
    const tileY2 = Math.floor((this.y + h - 1) / TILE_SIZE);

    if (this.vx > 0) {
      const tileX = Math.floor((this.x + this.width) / TILE_SIZE);
      if (this.isSolid(tiles, tileX, tileY1) || this.isSolid(tiles, tileX, tileY2)) {
        this.x = tileX * TILE_SIZE - this.width;
        this.vx = -this.vx;
        if (this.isShell && this.isShellMoving) {
          NESAudio.playBlockBump();
        }
      }
    } else if (this.vx < 0) {
      const tileX = Math.floor(this.x / TILE_SIZE);
      if (this.isSolid(tiles, tileX, tileY1) || this.isSolid(tiles, tileX, tileY2)) {
        this.x = (tileX + 1) * TILE_SIZE;
        this.vx = -this.vx;
        if (this.isShell && this.isShellMoving) {
          NESAudio.playBlockBump();
        }
      }
    }
  }

  private resolveVerticalCollision(tiles: number[][]) {
    const h = this.isShell ? 16 : this.height;
    const tileX1 = Math.floor(this.x / TILE_SIZE);
    const tileX2 = Math.floor((this.x + this.width - 1) / TILE_SIZE);

    if (this.vy > 0) {
      const tileY = Math.floor((this.y + h) / TILE_SIZE);
      if (this.isSolid(tiles, tileX1, tileY) || this.isSolid(tiles, tileX2, tileY)) {
        this.y = tileY * TILE_SIZE - h;
        this.vy = 0;
      }
    }
  }

  private isSolid(tiles: number[][], tx: number, ty: number): boolean {
    if (ty < 0 || ty >= tiles.length || tx < 0 || tx >= (tiles[0]?.length || 0)) return false;
    const t = tiles[ty][tx];
    return t !== 0 && t !== 13 && t !== 14 && t !== 16 && t !== 20;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    if (this.isDead) return;

    let img: HTMLCanvasElement | null = null;

    if (this.type === 'goomba') {
      if (this.isFlipped) {
        img = SpriteSheet.enemies['goomba_dead'];
      } else if (this.isStomped) {
        img = SpriteSheet.enemies['goomba_flat'];
      } else {
        img = this.animFrame === 0 ? SpriteSheet.enemies['goomba_walk1'] : SpriteSheet.enemies['goomba_walk2'];
      }
    } else if (this.type === 'koopa') {
      if (this.isFlipped) {
        img = SpriteSheet.enemies['koopa_dead'];
      } else if (this.isShell) {
        img = SpriteSheet.enemies['koopa_shell'];
      } else {
        const baseImg = this.animFrame === 0 ? SpriteSheet.enemies['koopa_walk1'] : SpriteSheet.enemies['koopa_walk2'];
        img = this.vx > 0 ? flipCanvasH(baseImg) : baseImg;
      }
    }

    if (img) {
      ctx.drawImage(img, Math.round(this.x - cameraX), Math.round(this.y));
    }
  }
}

// 2. Piranha Plant in Pipes
export class PiranhaPlant {
  public x: number;
  public y: number;
  public pipeTopY: number;
  public width = 16;
  public height = 24;
  public isDead = false;

  public state: 'HIDDEN' | 'RISING' | 'EXPOSED' | 'RETREATING' = 'HIDDEN';
  private timer = 0;
  private animTimer = 0;
  private animFrame = 0;

  constructor(pipeX: number, pipeTopY: number) {
    this.x = pipeX + 8; // Center in 32px pipe
    this.pipeTopY = pipeTopY;
    this.y = pipeTopY; // Hidden inside pipe initially
  }

  update(marioX: number, cameraX: number) {
    if (this.isDead) return;

    // Only update if near camera
    if (this.x < cameraX - 48 || this.x > cameraX + 300) return;

    this.animTimer++;
    if (this.animTimer % 8 === 0) {
      this.animFrame = (this.animFrame + 1) % 2;
    }

    const distToMario = Math.abs(marioX + 8 - (this.x + 8));

    switch (this.state) {
      case 'HIDDEN':
        this.timer++;
        // Check proximity: only rise if Mario is > 24px away from pipe center
        if (this.timer >= 70 && distToMario > 24) {
          this.state = 'RISING';
          this.timer = 0;
        }
        break;

      case 'RISING':
        this.y -= 0.6;
        if (this.y <= this.pipeTopY - 24) {
          this.y = this.pipeTopY - 24;
          this.state = 'EXPOSED';
          this.timer = 0;
        }
        break;

      case 'EXPOSED':
        this.timer++;
        if (this.timer >= 70) {
          this.state = 'RETREATING';
          this.timer = 0;
        }
        break;

      case 'RETREATING':
        this.y += 0.6;
        if (this.y >= this.pipeTopY) {
          this.y = this.pipeTopY;
          this.state = 'HIDDEN';
          this.timer = 0;
        }
        break;
    }
  }

  public checkMarioCollision(marioX: number, marioY: number, marioW: number, marioH: number): boolean {
    if (this.isDead || this.state === 'HIDDEN') return false;
    const overlapX = Math.min(marioX + marioW, this.x + this.width) - Math.max(marioX, this.x);
    const overlapY = Math.min(marioY + marioH, this.pipeTopY) - Math.max(marioY, this.y);
    return overlapX > 3 && overlapY > 3;
  }

  public defeat() {
    this.isDead = true;
    NESAudio.playKick();
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    if (this.isDead || this.state === 'HIDDEN') return;

    const img = this.animFrame === 0 ? SpriteSheet.enemies['piranha_0'] : SpriteSheet.enemies['piranha_1'];
    if (img) {
      const visibleHeight = Math.min(24, Math.round(this.pipeTopY - this.y));
      if (visibleHeight > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(Math.round(this.x - cameraX), Math.round(this.y), 16, visibleHeight);
        ctx.clip();
        ctx.drawImage(img, Math.round(this.x - cameraX), Math.round(this.y));
        ctx.restore();
      }
    }
  }
}
