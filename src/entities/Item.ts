// Items: Mushroom, Fire Flower, Starman, Bouncing Coin
import { SpriteSheet } from '../graphics/SpriteSheet';
import { TILE_SIZE, GRAVITY, TERMINAL_VELOCITY } from '../constants';
import { NESAudio } from '../audio/NESAudio';

export type ItemType = 'mushroom' | '1up' | 'flower' | 'star' | 'coin_block';

export class Item {
  public x: number;
  public y: number;
  public width = 16;
  public height = 16;
  public vx = 0;
  public vy = 0;
  public isDead = false;
  public isSprouting = true;
  private sproutProgress = 0; // 0 to 16 pixels rising
  private targetY: number;

  constructor(public type: ItemType, startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
    this.targetY = startY - 16;
    if (type !== 'coin_block') {
      NESAudio.playPowerupAppear();
    }
  }

  update(tiles: number[][]) {
    // 1. Sprouting phase out of block
    if (this.isSprouting) {
      this.sproutProgress += 0.8;
      this.y -= 0.8;
      if (this.sproutProgress >= 16) {
        this.y = this.targetY;
        this.isSprouting = false;
        if (this.type === 'mushroom' || this.type === '1up') {
          this.vx = 1.0; // Moves right once emerged
        } else if (this.type === 'star') {
          this.vx = 1.2;
          this.vy = -3.0;
        }
      }
      return;
    }

    // 2. Physics for moving items (Mushroom, Star)
    if (this.type === 'mushroom' || this.type === '1up' || this.type === 'star') {
      this.vy = Math.min(TERMINAL_VELOCITY, this.vy + GRAVITY);

      // Horizontal move & collision
      this.x += this.vx;
      this.resolveHorizontalCollision(tiles);

      // Vertical move & collision
      this.y += this.vy;
      this.resolveVerticalCollision(tiles);
    }

    // Fall in pit
    if (this.y > 260) {
      this.isDead = true;
    }
  }

  private resolveHorizontalCollision(tiles: number[][]) {
    const tileY1 = Math.floor(this.y / TILE_SIZE);
    const tileY2 = Math.floor((this.y + this.height - 1) / TILE_SIZE);

    if (this.vx > 0) {
      const tileX = Math.floor((this.x + this.width) / TILE_SIZE);
      if (this.isSolid(tiles, tileX, tileY1) || this.isSolid(tiles, tileX, tileY2)) {
        this.x = tileX * TILE_SIZE - this.width;
        this.vx = -this.vx; // Reverse direction
      }
    } else if (this.vx < 0) {
      const tileX = Math.floor(this.x / TILE_SIZE);
      if (this.isSolid(tiles, tileX, tileY1) || this.isSolid(tiles, tileX, tileY2)) {
        this.x = (tileX + 1) * TILE_SIZE;
        this.vx = -this.vx; // Reverse direction
      }
    }
  }

  private resolveVerticalCollision(tiles: number[][]) {
    const tileX1 = Math.floor(this.x / TILE_SIZE);
    const tileX2 = Math.floor((this.x + this.width - 1) / TILE_SIZE);

    if (this.vy > 0) {
      const tileY = Math.floor((this.y + this.height) / TILE_SIZE);
      if (this.isSolid(tiles, tileX1, tileY) || this.isSolid(tiles, tileX2, tileY)) {
        this.y = tileY * TILE_SIZE - this.height;
        if (this.type === 'star') {
          this.vy = -3.5; // Star bounces!
        } else {
          this.vy = 0;
        }
      }
    }
  }

  private isSolid(tiles: number[][], tx: number, ty: number): boolean {
    if (ty < 0 || ty >= tiles.length || tx < 0 || tx >= (tiles[0]?.length || 0)) return false;
    const t = tiles[ty][tx];
    return t !== 0 && t !== 13 && t !== 14 && t !== 16 && t !== 20;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    let img: HTMLCanvasElement | null = null;
    if (this.type === 'mushroom') img = SpriteSheet.items['mushroom'];
    else if (this.type === '1up') img = SpriteSheet.items['1up'];
    else if (this.type === 'flower') img = SpriteSheet.items['flower'];
    else if (this.type === 'star') img = SpriteSheet.items['star'];

    if (img) {
      ctx.drawImage(img, Math.round(this.x - cameraX), Math.round(this.y));
    }
  }
}

// Block Coin that pops out, spins, and awards points
export class BlockCoin {
  public x: number;
  public y: number;
  private startY: number;
  public vy = -5.0;
  public isDead = false;
  private animFrame = 0;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
    this.startY = startY;
    NESAudio.playCoin();
  }

  update() {
    this.y += this.vy;
    this.vy += 0.45;
    this.animFrame++;

    if (this.vy > 0 && this.y >= this.startY - 8) {
      this.isDead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    const f = Math.floor((this.animFrame / 3) % 4);
    const img = SpriteSheet.items[`coin_${f}`];
    if (img) {
      ctx.drawImage(img, Math.round(this.x - cameraX), Math.round(this.y));
    }
  }
}
