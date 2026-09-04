// 256x240 NES Canvas Viewport Renderer
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, TileType } from '../constants';
import { COLORS } from './Palette';
import { SpriteSheet } from './SpriteSheet';
import { Mario } from '../entities/Mario';
import { Enemy, PiranhaPlant } from '../entities/Enemy';
import { Item, BlockCoin } from '../entities/Item';
import { IParticle, BouncingBlock } from '../entities/Particle';
import { SceneryItem } from '../level/World1_1';
import { LevelTheme } from '../level/SMB1LevelDecoder';
import { Bowser } from '../entities/Bowser';
import { Firebar, Podoboo, Retainer } from '../entities/CastleHazards';

export class Renderer {
  private questionAnimTimer = 0;

  constructor(private ctx: CanvasRenderingContext2D) {
    this.ctx.imageSmoothingEnabled = false;
  }

  public renderScene(
    cameraX: number,
    theme: LevelTheme,
    tiles: number[][],
    scenery: SceneryItem[],
    mario: Mario,
    enemies: Enemy[],
    piranhas: PiranhaPlant[],
    items: Item[],
    blockCoins: BlockCoin[],
    bouncingBlocks: BouncingBlock[],
    particles: IParticle[],
    fireballs: IParticle[],
    flagY: number,
    castleFlagY = 112,
    bowser: Bowser | null = null,
    firebars: Firebar[] = [],
    podoboos: Podoboo[] = [],
    retainer: Retainer | null = null,
    flagPoleX = 0,
    castleX = 0
  ) {
    this.questionAnimTimer = (this.questionAnimTimer + 0.15) % 4;
    const qFrame = Math.floor(this.questionAnimTimer);

    // 1. Clear Screen / Sky Background
    if (theme === 'underground' || theme === 'castle') {
      this.ctx.fillStyle = COLORS.BLACK;
    } else if (theme === 'underwater') {
      this.ctx.fillStyle = '#2038ec';
    } else {
      this.ctx.fillStyle = COLORS.SKY_BLUE;
    }
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Render Scenery (Only for overworld)
    if (theme === 'overworld') {
      this.renderScenery(scenery, cameraX);
    }

    // 3. Render Tiles
    this.renderTiles(
      tiles,
      cameraX,
      theme,
      qFrame,
      bouncingBlocks,
      flagY,
      castleFlagY,
      flagPoleX,
      castleX
    );

    // 4. Render Hazards (Firebars & Podoboos)
    firebars.forEach(fb => fb.render(this.ctx, cameraX));
    podoboos.forEach(p => p.render(this.ctx, cameraX));

    // 5. Render Retainer (Toad or Peach in castle)
    if (retainer) {
      retainer.render(this.ctx, cameraX);
    }

    // 6. Render Bowser Boss
    if (bowser) {
      bowser.render(this.ctx, cameraX);
    }

    // 7. Render Items & Bouncing Coins
    items.forEach(item => item.render(this.ctx, cameraX));
    blockCoins.forEach(coin => coin.render(this.ctx, cameraX));

    // 8. Render Enemies & Piranhas
    piranhas.forEach(p => p.render(this.ctx, cameraX));
    enemies.forEach(enemy => enemy.render(this.ctx, cameraX));

    // 9. Render Mario
    mario.render(this.ctx, cameraX);

    // 10. Render Particles (Brick pieces, Smoke, Floating Scores)
    particles.forEach(p => p.render(this.ctx, cameraX));
    fireballs.forEach(fb => fb.render(this.ctx, cameraX));
  }

  private renderScenery(scenery: SceneryItem[], cameraX: number) {
    scenery.forEach(item => {
      const px = item.tileX * TILE_SIZE - cameraX;
      const py = item.tileY * TILE_SIZE;

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
    theme: LevelTheme,
    qFrame: number,
    bouncingBlocks: BouncingBlock[],
    flagY: number,
    castleFlagY = 112,
    flagPoleX = 0,
    castleX = 0
  ) {
    const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE));
    const endCol = Math.min(tiles[0]?.length || 0, Math.ceil((cameraX + CANVAS_WIDTH) / TILE_SIZE));
    const isUg = theme === 'underground';

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
            this.drawSprite(isUg ? 'ground_ug' : 'ground', px, py);
            break;
          case TileType.BRICK:
          case TileType.BRICK_MULTICOIN:
          case TileType.BRICK_MUSHROOM:
          case TileType.BRICK_1UP:
          case TileType.BRICK_STAR:
          case TileType.BRICK_VINE:
            this.drawSprite(isUg ? 'brick_ug' : 'brick', px, py);
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
          case TileType.BRIDGE:
            this.drawSprite('bridge', px, py);
            break;
          case TileType.AXE:
            this.drawSprite('axe', px, py);
            break;
          case TileType.CHAIN:
            this.drawSprite('chain', px, py);
            break;
          case TileType.LAVA_TOP:
            this.drawSprite('lava_top', px, py);
            break;
          case TileType.CORAL:
            this.drawSprite('coral', px, py);
            break;
          case TileType.COIN:
            const coinImg = SpriteSheet.items[`coin_${qFrame}`];
            if (coinImg) this.ctx.drawImage(coinImg, Math.round(px + 4), Math.round(py));
            break;
        }
      }
    }

    // Render Flag on flagpole
    if (flagPoleX > 0 && theme !== 'underground' && theme !== 'castle') {
      const flagPx = flagPoleX - cameraX - 8;
      if (flagPx > -20 && flagPx < CANVAS_WIDTH + 20) {
        this.drawSprite('flag', flagPx, flagY);
      }

      // Render Castle top flag (rises when level is cleared)
      if (castleFlagY < 112 && castleX > 0) {
        const castleFlagPx = castleX + 36 - cameraX;
        this.drawSprite('castle_flag', castleFlagPx, castleFlagY);
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
