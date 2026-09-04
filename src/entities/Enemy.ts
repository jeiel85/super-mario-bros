// Enemies: Goomba, Koopa Troopa, Paratroopa, Buzzy Beetle, Hammer Bro,
// Blooper, Cheep Cheep, Lakitu, Spiny, Bullet Bill, and Piranha Plant
import { SpriteSheet, flipCanvasH } from '../graphics/SpriteSheet';
import { TILE_SIZE, GRAVITY, TERMINAL_VELOCITY, SHELL_SPEED } from '../constants';
import { NESAudio } from '../audio/NESAudio';
import { FloatingScore } from './Particle';
import { BowserHammer } from './Bowser';

export type EnemyType =
  | 'goomba'
  | 'koopa'
  | 'red_koopa'
  | 'paratroopa'
  | 'red_paratroopa'
  | 'buzzy_beetle'
  | 'hammer_bro'
  | 'blooper'
  | 'cheep_cheep'
  | 'flying_cheep'
  | 'lakitu'
  | 'spiny'
  | 'bullet_bill';

export class Enemy {
  public width = 16;
  public height = 16;
  public vx = -0.5; // Walk left initially
  public vy = 0;

  public isDead = false;
  public isStomped = false;
  private stompedTimer = 0;

  // Shell physics (Koopa, Buzzy Beetle)
  public isShell = false;
  public isShellMoving = false;
  public shellComboCount = 0;

  // Flipped death animation (hit by shell, star, or block below)
  public isFlipped = false;

  private animTimer = 0;
  private animFrame = 0;

  // Special enemy states
  private hammerTimer = 0;
  private lakituTimer = 0;
  private jumpTimer = 0;
  private baseY = 0;
  public hammers: BowserHammer[] = [];

  constructor(public type: EnemyType, public x: number, public y: number) {
    this.baseY = y;
    if (type === 'koopa' || type === 'red_koopa' || type === 'paratroopa' || type === 'red_paratroopa' || type === 'hammer_bro') {
      this.height = 24;
    }
    if (type === 'flying_cheep') {
      this.vy = -7.5;
      this.vx = Math.random() < 0.5 ? -1.2 : 1.2;
    }
    if (type === 'bullet_bill') {
      this.vx = -2.5;
    }
  }

  update(
    tiles: number[][],
    cameraX: number,
    playerX?: number,
    onSpawnEnemy?: (e: Enemy) => void,
    _onSpawnScore?: (score: FloatingScore) => void
  ) {
    if (this.isDead) return;

    // Flipped death physics (arcs up and offscreen)
    if (this.isFlipped) {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += GRAVITY;
      if (this.y > 260) {
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
    if (this.x < cameraX - 48 || this.x > cameraX + 300) {
      return;
    }

    this.animTimer++;
    if (this.animTimer % 8 === 0) {
      this.animFrame = (this.animFrame + 1) % 2;
    }

    // Specific enemy behavior
    if (this.type === 'bullet_bill') {
      this.x += this.vx;
      if (this.x < cameraX - 40) this.isDead = true;
      return;
    }

    if (this.type === 'flying_cheep') {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += GRAVITY * 0.4;
      if (this.y > 250) this.isDead = true;
      return;
    }

    if (this.type === 'blooper') {
      // Blooper propels toward player in water
      if (this.animTimer % 60 === 0) {
        this.vy = -2.2;
        if (playerX !== undefined) {
          this.vx = playerX < this.x ? -0.8 : 0.8;
        }
      } else {
        this.vy = Math.min(1.0, this.vy + 0.05);
      }
      this.x += this.vx;
      this.y += this.vy;
      return;
    }

    if (this.type === 'cheep_cheep') {
      // Swimming fish
      this.x += this.vx;
      return;
    }

    if (this.type === 'lakitu') {
      // Lakitu hovers near player at top of screen
      if (playerX !== undefined) {
        const targetX = playerX - 30;
        this.x += (targetX - this.x) * 0.03;
      }
      this.lakituTimer++;
      if (this.lakituTimer > 180 && onSpawnEnemy) {
        this.lakituTimer = 0;
        onSpawnEnemy(new Enemy('spiny', this.x, this.y + 12));
      }
      return;
    }

    if (this.type === 'hammer_bro') {
      // Hammer Bro paces and throws hammers
      this.hammerTimer++;
      if (this.hammerTimer > 70) {
        this.hammerTimer = 0;
        const dirLeft = playerX !== undefined ? playerX < this.x : true;
        this.hammers.push(new BowserHammer(this.x, this.y, dirLeft));
      }
      this.jumpTimer++;
      if (this.jumpTimer > 160) {
        this.jumpTimer = 0;
        this.vy = -4.5; // Jump between rows
      }
    }

    if (this.type === 'paratroopa') {
      // Jumping paratroopa
      if (this.vy === 0) {
        this.vy = -3.8;
      }
    }

    if (this.type === 'red_paratroopa') {
      // Hovers vertically up and down
      this.y = this.baseY + Math.sin(this.animTimer * 0.05) * 32;
      return;
    }

    // Standard Gravity
    this.vy = Math.min(TERMINAL_VELOCITY, this.vy + GRAVITY);

    // Horizontal Movement & Collision
    this.x += this.vx;
    this.resolveHorizontalCollision(tiles);

    // Red Koopa: turn around at ledge instead of falling into pit!
    if (this.type === 'red_koopa' && !this.isShell) {
      const checkX = this.vx < 0 ? Math.floor(this.x / TILE_SIZE) : Math.floor((this.x + this.width) / TILE_SIZE);
      const groundY = Math.floor((this.y + this.height + 2) / TILE_SIZE);
      if (tiles[groundY] && tiles[groundY][checkX] === 0) {
        this.vx = -this.vx;
      }
    }

    // Vertical Movement & Collision
    this.y += this.vy;
    this.resolveVerticalCollision(tiles);

    // Update hammers
    this.hammers.forEach(h => h.update());
    this.hammers = this.hammers.filter(h => !h.isDead);

    // Pit death
    if (this.y > 250) {
      this.isDead = true;
    }
  }

  // Stomp interaction from above
  public stomp(onSpawnScore: (score: FloatingScore) => void): boolean {
    if (this.type === 'spiny') {
      return false; // Spiny cannot be stomped! Mario takes damage!
    }

    if (this.type === 'goomba') {
      this.isStomped = true;
      this.vx = 0;
      this.vy = 0;
      NESAudio.playStomp();
      onSpawnScore(new FloatingScore(this.x, this.y, '100'));
      return true;
    }

    if (this.type === 'paratroopa' || this.type === 'red_paratroopa') {
      // Loses wings
      this.type = this.type === 'paratroopa' ? 'koopa' : 'red_koopa';
      NESAudio.playStomp();
      onSpawnScore(new FloatingScore(this.x, this.y, '400'));
      return true;
    }

    if (this.type === 'koopa' || this.type === 'red_koopa' || this.type === 'buzzy_beetle') {
      NESAudio.playStomp();
      if (!this.isShell) {
        this.isShell = true;
        this.height = 16;
        this.y += 8;
        this.vx = 0;
        this.isShellMoving = false;
        onSpawnScore(new FloatingScore(this.x, this.y, '100'));
        return true;
      } else if (this.isShell && this.isShellMoving) {
        this.vx = 0;
        this.isShellMoving = false;
        onSpawnScore(new FloatingScore(this.x, this.y, '100'));
        return true;
      }
    }

    if (this.type === 'hammer_bro') {
      this.flipDie();
      onSpawnScore(new FloatingScore(this.x, this.y, '1000'));
      return true;
    }

    if (this.type === 'lakitu') {
      this.flipDie();
      onSpawnScore(new FloatingScore(this.x, this.y, '800'));
      return true;
    }

    if (this.type === 'bullet_bill' || this.type === 'flying_cheep') {
      this.flipDie();
      onSpawnScore(new FloatingScore(this.x, this.y, '200'));
      return true;
    }

    return false;
  }

  // Kick stationary shell
  public kickShell(direction: number, onSpawnScore: (score: FloatingScore) => void) {
    if (!this.isShell) return;
    this.isShellMoving = true;
    this.vx = direction * SHELL_SPEED;
    NESAudio.playKick();
    onSpawnScore(new FloatingScore(this.x, this.y, '400'));
  }

  // Flip death (hit by shell, star, or block bump)
  public flipDie() {
    this.isFlipped = true;
    this.vx = (Math.random() < 0.5 ? -1 : 1) * 1.5;
    this.vy = -4.0;
    NESAudio.playKick();
  }

  // Horizontal tile collision
  private resolveHorizontalCollision(tiles: number[][]) {
    const leftTile = Math.floor(this.x / TILE_SIZE);
    const rightTile = Math.floor((this.x + this.width - 1) / TILE_SIZE);
    const topTile = Math.floor(this.y / TILE_SIZE);
    const bottomTile = Math.floor((this.y + this.height - 1) / TILE_SIZE);

    for (let ty = topTile; ty <= bottomTile; ty++) {
      if (!tiles[ty]) continue;
      if (this.vx < 0 && this.isSolid(tiles[ty][leftTile])) {
        this.x = (leftTile + 1) * TILE_SIZE;
        this.vx = -this.vx;
        if (this.isShell && this.isShellMoving) NESAudio.playBlockBump();
        break;
      } else if (this.vx > 0 && this.isSolid(tiles[ty][rightTile])) {
        this.x = rightTile * TILE_SIZE - this.width;
        this.vx = -this.vx;
        if (this.isShell && this.isShellMoving) NESAudio.playBlockBump();
        break;
      }
    }
  }

  // Vertical tile collision
  private resolveVerticalCollision(tiles: number[][]) {
    const leftTile = Math.floor(this.x / TILE_SIZE);
    const rightTile = Math.floor((this.x + this.width - 1) / TILE_SIZE);
    const bottomTile = Math.floor((this.y + this.height) / TILE_SIZE);

    if (this.vy >= 0 && tiles[bottomTile]) {
      for (let tx = leftTile; tx <= rightTile; tx++) {
        if (this.isSolid(tiles[bottomTile][tx])) {
          this.y = bottomTile * TILE_SIZE - this.height;
          this.vy = 0;
          break;
        }
      }
    }
  }

  private isSolid(tile: number): boolean {
    return (
      tile === 1 || // Ground
      tile === 2 || // Brick
      tile === 3 || // Question Coin
      tile === 4 || // Question Mushroom
      tile === 5 || // Question Star
      tile === 6 || // Solid Block
      (tile >= 7 && tile <= 12) || // Pipes
      tile === 15 || // Castle Brick
      tile === 18 || // Empty Block
      tile === 21 || // Brick Multicoin
      tile === 22 || // Bridge
      tile === 27 ||
      tile === 28 ||
      tile === 29 ||
      tile === 30 ||
      tile === 31 ||
      tile === 32 ||
      tile === 33
    );
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    if (this.isDead) return;

    // Render hammers if any
    this.hammers.forEach(h => h.render(ctx, cameraX));

    let img: HTMLCanvasElement | null = null;
    const px = Math.round(this.x - cameraX);
    const py = Math.round(this.y);

    if (this.isFlipped) {
      const base = SpriteSheet.enemies[`${this.type}_dead`] || SpriteSheet.enemies['goomba_dead'];
      if (base) img = base;
    } else if (this.isStomped && this.type === 'goomba') {
      img = SpriteSheet.enemies['goomba_flat'];
    } else if (this.isShell) {
      const shellKey = this.type === 'buzzy_beetle' ? 'buzzy_shell' : 'koopa_shell';
      img = SpriteSheet.enemies[shellKey] || SpriteSheet.enemies['koopa_shell'];
    } else {
      const walkKey = `${this.type}_walk${this.animFrame + 1}`;
      const baseImg = SpriteSheet.enemies[walkKey] || SpriteSheet.enemies[`${this.type}_0`] || SpriteSheet.enemies['goomba_walk1'];
      img = this.vx > 0 ? flipCanvasH(baseImg) : baseImg;
    }

    if (img) {
      ctx.drawImage(img, px, py);
    } else {
      // Fallback
      ctx.fillStyle = this.type === 'buzzy_beetle' ? '#000088' : '#b84418';
      ctx.fillRect(px, py, this.width, this.height);
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
