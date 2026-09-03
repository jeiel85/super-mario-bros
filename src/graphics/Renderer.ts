// 256x240 NES Canvas Viewport Renderer
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, TileType } from '../constants';
import { COLORS } from './Palette';
import { SpriteSheet } from './SpriteSheet';
import { Mario } from '../entities/Mario';
import { Enemy } from '../entities/Enemy';
import { Item, BlockCoin } from '../entities/Item';
import { IParticle, BouncingBlock } from '../entities/Particle';
import { SceneryItem } from '../level/World1_1';

export class Renderer {
  private questionAnimTimer = 0;

  constructor(private ctx: CanvasRenderingContext2D) {
    this.ctx.imageSmoothingEnabled = false;
  }

  public renderScene(
    cameraX: number,
    isUnderground: boolean,
    tiles: number[][],
    scenery: SceneryItem[],
    mario: Mario,
    enemies: Enemy[],
    items: Item[],
    blockCoins: BlockCoin[],
    bouncingBlocks: BouncingBlock[],
    particles: IParticle[],
    fireballs: IParticle[],
    flagY: number
  ) {
    this.questionAnimTimer = (this.questionAnimTimer + 0.15) % 4;
    const qFrame = Math.floor(this.questionAnimTimer);

    // 1. Clear Screen / Sky Background
    this.ctx.fillStyle = isUnderground ? COLORS.UNDERGROUND_BG : COLORS.SKY_BLUE;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Render Scenery (Only for overworld)
    if (!isUnderground) {
      this.renderScenery(scenery, cameraX);
    }

    // 3. Render Tiles
    this.renderTiles(tiles, cameraX, isUnderground, qFrame, bouncingBlocks, flagY);

    // 4. Render Items & Bouncing Coins
    items.forEach(item => item.render(this.ctx, cameraX));
    blockCoins.forEach(coin => coin.render(this.ctx, cameraX));

    // 5. Render Enemies
    enemies.forEach(enemy => enemy.render(this.ctx, cameraX));

    // 6. Render Mario
    mario.render(this.ctx, cameraX);

    // 7. Render Particles (Brick pieces, Smoke, Floating Scores)
    particles.forEach(p => p.render(this.ctx, cameraX));
    fireballs.forEach(fb => fb.render(this.ctx, cameraX));
  }

  private renderScenery(scenery: SceneryItem[], cameraX: number) {
    scenery.forEach(item => {
      const px = item.tileX * TILE_SIZE - cameraX;
      const py = item.tileY * TILE_SIZE;

      // Cull scenery off screen
      if (px < -80 || px > CANVAS_WIDTH + 80) return;

      if (item.type === 'cloud_single') {
        this.drawSprite('cloud_left', px, py);
        this.drawSprite('cloud_right', px + 16, py);
      } else if (item.type === 'cloud_double') {
        this.drawSprite('cloud_left', px, py);
        this.drawSprite('cloud_mid', px + 16, py);
        this.drawSprite('cloud_right', px + 32, py);
      } else if (item.type === 'cloud_triple') {
        this.drawSprite('cloud_left', px, py);
        this.drawSprite('cloud_mid', px + 16, py);
        this.drawSprite('cloud_mid', px + 32, py);
        this.drawSprite('cloud_right', px + 48, py);
      } else if (item.type === 'bush_single') {
        this.drawSprite('bush_left', px, py);
        this.drawSprite('bush_right', px + 16, py);
      } else if (item.type === 'bush_double') {
        this.drawSprite('bush_left', px, py);
        this.drawSprite('bush_mid', px + 16, py);
        this.drawSprite('bush_right', px + 32, py);
      } else if (item.type === 'bush_triple') {
        this.drawSprite('bush_left', px, py);
        this.drawSprite('bush_mid', px + 16, py);
        this.drawSprite('bush_mid', px + 32, py);
        this.drawSprite('bush_right', px + 48, py);
      } else if (item.type === 'hill_small') {
        this.drawSprite('hill_top', px + 8, py);
        this.drawSprite('hill_fill', px, py + 16);
        this.drawSprite('hill_fill', px + 16, py + 16);
      } else if (item.type === 'hill_big') {
        this.drawSprite('hill_top', px + 24, py - 16);
        this.drawSprite('hill_fill', px + 8, py);
        this.drawSprite('hill_fill', px + 24, py);
        this.drawSprite('hill_fill', px + 40, py);
      }
    });
  }

  private renderTiles(
    tiles: number[][],
    cameraX: number,
    isUnderground: boolean,
    qFrame: number,
    bouncingBlocks: BouncingBlock[],
    flagY: number
  ) {
    const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE));
    const endCol = Math.min(tiles[0]?.length || 0, Math.ceil((cameraX + CANVAS_WIDTH) / TILE_SIZE));

    for (let ty = 0; ty < tiles.length; ty++) {
      for (let tx = startCol; tx < endCol; tx++) {
        const tile = tiles[ty][tx];
        if (tile === TileType.EMPTY) continue;

        let px = tx * TILE_SIZE - cameraX;
        let py = ty * TILE_SIZE;

        // Check if this tile is currently bouncing
        const bouncing = bouncingBlocks.find(b => b.tileX === tx && b.tileY === ty);
        if (bouncing) {
          py += bouncing.currentYOffset;
        }

        switch (tile) {
          case TileType.GROUND:
            this.drawSprite(isUnderground ? 'ground_ug' : 'ground', px, py);
            break;
          case TileType.BRICK:
            this.drawSprite(isUnderground ? 'brick_ug' : 'brick', px, py);
            break;
          case TileType.QUESTION_COIN:
          case TileType.QUESTION_MUSHROOM:
          case TileType.QUESTION_STAR:
            this.drawSprite(`question_${qFrame}`, px, py);
            break;
          case TileType.EMPTY_BLOCK:
            this.drawSprite('empty_block', px, py);
            break;
          case TileType.SOLID_BLOCK:
            this.drawSprite('solid_block', px, py);
            break;
          case TileType.PIPE_TOP_LEFT:
          case TileType.PIPE_ENTER_TOP_LEFT:
            this.drawSprite('pipe_top_left', px, py);
            break;
          case TileType.PIPE_TOP_RIGHT:
          case TileType.PIPE_ENTER_TOP_RIGHT:
            this.drawSprite('pipe_top_right', px, py);
            break;
          case TileType.PIPE_BODY_LEFT:
            this.drawSprite('pipe_body_left', px, py);
            break;
          case TileType.PIPE_BODY_RIGHT:
            this.drawSprite('pipe_body_right', px, py);
            break;
          case TileType.FLAG_TOP:
            this.drawSprite('flag_top', px, py);
            break;
          case TileType.FLAG_POLE:
            this.drawSprite('flag_pole', px, py);
            break;
          case TileType.CASTLE_BRICK:
            this.drawSprite('castle_brick', px, py);
            break;
          case TileType.CASTLE_BATTLEMENT:
            this.drawSprite('castle_battlement', px, py);
            break;
          case TileType.CASTLE_DOOR:
            this.drawSprite('castle_door', px, py);
            break;
        }
      }
    }

    // Render Flag on flagpole
    if (!isUnderground) {
      const flagPoleTileX = 198;
      const flagPx = flagPoleTileX * TILE_SIZE - cameraX - 8;
      if (flagPx > -20 && flagPx < CANVAS_WIDTH + 20) {
        this.drawSprite('flag', flagPx, flagY);
      }
    }
  }

  private drawSprite(name: string, x: number, y: number) {
    const img = SpriteSheet.tiles[name] || SpriteSheet.scenery[name] || SpriteSheet.particles[name];
    if (img) {
      this.ctx.drawImage(img, Math.round(x), Math.round(y));
    }
  }
}
