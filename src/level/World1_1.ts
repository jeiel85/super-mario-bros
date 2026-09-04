// World 1-1 Complete Level Layout & Underground Room
import { TileType, TILE_SIZE } from '../constants';

import { EnemyType } from '../entities/Enemy';

export interface EnemySpawn {
  x: number;
  y: number;
  type: EnemyType;
  spawned?: boolean;
}

export interface SceneryItem {
  type: 'cloud_single' | 'cloud_double' | 'cloud_triple' |
        'bush_single' | 'bush_double' | 'bush_triple' |
        'hill_small' | 'hill_big';
  tileX: number;
  tileY: number;
}

export class World1_1 {
  public static readonly WIDTH = 220; // 220 tiles wide = 3520px
  public static readonly HEIGHT = 15; // 15 tiles high = 240px

  public static createLevelData(): {
    tiles: number[][];
    enemies: EnemySpawn[];
    scenery: SceneryItem[];
    piranhas: Array<{ pipeX: number; pipeTopY: number }>;
    flagPoleX: number;
    castleX: number;
  } {
    const tiles: number[][] = [];
    for (let y = 0; y < this.HEIGHT; y++) {
      tiles[y] = new Array(this.WIDTH).fill(TileType.EMPTY);
    }

    // Helper: set ground
    const setGround = (startX: number, endX: number) => {
      for (let x = startX; x <= endX; x++) {
        tiles[13][x] = TileType.GROUND;
        tiles[14][x] = TileType.GROUND;
      }
    };

    // Helper: build pipe
    const buildPipe = (x: number, height: number, isEnter = false) => {
      const topY = 13 - height;
      tiles[topY][x] = isEnter ? TileType.PIPE_ENTER_TOP_LEFT : TileType.PIPE_TOP_LEFT;
      tiles[topY][x + 1] = isEnter ? TileType.PIPE_ENTER_TOP_RIGHT : TileType.PIPE_TOP_RIGHT;
      for (let y = topY + 1; y < 13; y++) {
        tiles[y][x] = TileType.PIPE_BODY_LEFT;
        tiles[y][x + 1] = TileType.PIPE_BODY_RIGHT;
      }
    };

    // Helper: build solid stair step
    const buildStairs = (startX: number, height: number, dir: 'up' | 'down') => {
      for (let step = 0; step < height; step++) {
        const x = dir === 'up' ? startX + step : startX + step;
        const colHeight = dir === 'up' ? step + 1 : height - step;
        for (let h = 0; h < colHeight; h++) {
          tiles[12 - h][x] = TileType.SOLID_BLOCK;
        }
      }
    };

    // 1. Ground segments with pits
    // Pit 1: 69-70, Pit 2: 86-88, Pit 3: 153-154
    setGround(0, 68);
    setGround(71, 85);
    setGround(89, 152);
    setGround(155, 219);

    // 2. Question Blocks & Bricks (Classic Miyamoto Tutorial Layout)
    tiles[9][16] = TileType.QUESTION_COIN;

    tiles[9][20] = TileType.BRICK;
    tiles[9][21] = TileType.QUESTION_MUSHROOM;
    tiles[9][22] = TileType.BRICK;
    tiles[9][23] = TileType.QUESTION_COIN;
    tiles[9][24] = TileType.BRICK;
    tiles[5][22] = TileType.QUESTION_COIN;

    // 3. Pipes 1 to 4
    buildPipe(28, 2);
    buildPipe(38, 3);
    buildPipe(46, 4);
    buildPipe(57, 4, true); // Pipe 4 is the secret warp to underground!

    // Hidden 1-UP block
    tiles[9][64] = TileType.HIDDEN_1UP;

    // 4. Over Pit 1
    tiles[9][77] = TileType.BRICK;
    tiles[9][78] = TileType.QUESTION_MUSHROOM;
    tiles[9][79] = TileType.BRICK;

    for (let x = 80; x <= 87; x++) {
      tiles[5][x] = TileType.BRICK;
    }

    // 5. Section after Pit 2
    for (let x = 91; x <= 93; x++) {
      tiles[5][x] = TileType.BRICK;
    }
    tiles[5][94] = TileType.BRICK_MULTICOIN;

    tiles[9][100] = TileType.BRICK;
    tiles[9][101] = TileType.QUESTION_STAR;
    tiles[9][106] = TileType.QUESTION_COIN;
    tiles[9][109] = TileType.QUESTION_COIN;
    tiles[9][112] = TileType.QUESTION_COIN;
    tiles[5][109] = TileType.QUESTION_MUSHROOM;

    tiles[9][118] = TileType.BRICK;
    tiles[5][121] = TileType.BRICK;
    tiles[5][122] = TileType.BRICK;
    tiles[5][123] = TileType.BRICK;

    tiles[5][128] = TileType.BRICK;
    tiles[5][129] = TileType.QUESTION_COIN;
    tiles[5][130] = TileType.QUESTION_COIN;
    tiles[5][131] = TileType.BRICK;

    // 6. Pyramids (Staircases)
    buildStairs(134, 4, 'up');
    buildStairs(140, 4, 'down');

    buildStairs(148, 4, 'up');
    // Pit 3 is 153-154
    buildStairs(155, 4, 'down');

    // 7. Surface Exit Pipe from Underground
    buildPipe(163, 2);

    tiles[9][168] = TileType.BRICK;
    tiles[9][169] = TileType.BRICK;
    tiles[9][170] = TileType.QUESTION_COIN;
    tiles[9][171] = TileType.BRICK;

    buildPipe(179, 2);

    // 8. Final Giant Flagpole Staircase (8 steps)
    buildStairs(181, 8, 'up');
    tiles[12][189] = TileType.SOLID_BLOCK; // Final drop step

    // 9. Flagpole at x = 198
    tiles[2][198] = TileType.FLAG_TOP;
    for (let y = 3; y <= 12; y++) {
      tiles[y][198] = TileType.FLAG_POLE;
    }
    tiles[12][198] = TileType.SOLID_BLOCK; // Base block

    // 10. Castle at x = 202 to 207
    const castleX = 202;
    for (let cy = 8; cy <= 12; cy++) {
      for (let cx = castleX; cx <= castleX + 4; cx++) {
        tiles[cy][cx] = TileType.CASTLE_BRICK;
      }
    }
    // Battlements
    tiles[7][castleX] = TileType.CASTLE_BATTLEMENT;
    tiles[7][castleX + 2] = TileType.CASTLE_BATTLEMENT;
    tiles[7][castleX + 4] = TileType.CASTLE_BATTLEMENT;
    // Door
    tiles[11][castleX + 2] = TileType.CASTLE_DOOR;
    tiles[12][castleX + 2] = TileType.CASTLE_DOOR;

    // 11. Enemy Spawns (Original NES 1-1 placement)
    const enemies: EnemySpawn[] = [
      { x: 22 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' },
      { x: 40 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' },
      { x: 51 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' },
      { x: 53 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' },
      { x: 80 * TILE_SIZE, y: 4 * TILE_SIZE, type: 'goomba' },
      { x: 82 * TILE_SIZE, y: 4 * TILE_SIZE, type: 'goomba' },
      { x: 97 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' },
      { x: 99 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' },
      { x: 107 * TILE_SIZE, y: 11 * TILE_SIZE, type: 'koopa' },
      { x: 114 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' },
      { x: 116 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' },
      { x: 125 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' },
      { x: 127 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' },
      { x: 174 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' },
      { x: 176 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'goomba' }
    ];

    // 12. Scenery (Authentic repeating clouds, bushes, and hills)
    const scenery: SceneryItem[] = [];
    const sceneryOffsets = [0, 48, 96, 144, 192];
    sceneryOffsets.forEach(off => {
      // Hills
      scenery.push({ type: 'hill_big', tileX: off + 0, tileY: 11 });
      scenery.push({ type: 'hill_small', tileX: off + 16, tileY: 12 });

      // Bushes
      scenery.push({ type: 'bush_triple', tileX: off + 23, tileY: 12 });
      scenery.push({ type: 'bush_single', tileX: off + 41, tileY: 12 });

      // Clouds
      scenery.push({ type: 'cloud_single', tileX: off + 8, tileY: 3 });
      scenery.push({ type: 'cloud_triple', tileX: off + 27, tileY: 2 });
      scenery.push({ type: 'cloud_double', tileX: off + 36, tileY: 3 });
    });

    const piranhas = [
      { pipeX: 38 * TILE_SIZE, pipeTopY: 10 * TILE_SIZE },
      { pipeX: 46 * TILE_SIZE, pipeTopY: 9 * TILE_SIZE },
      { pipeX: 179 * TILE_SIZE, pipeTopY: 11 * TILE_SIZE }
    ];

    return {
      tiles,
      enemies,
      scenery,
      piranhas,
      flagPoleX: 198 * TILE_SIZE,
      castleX: 202 * TILE_SIZE
    };
  }

  // Underground Bonus Coin Room Layout
  public static createUndergroundData(): {
    tiles: number[][];
    coins: Array<{ x: number; y: number }>;
    exitPipeX: number;
  } {
    const width = 20;
    const height = 15;
    const tiles: number[][] = [];
    for (let y = 0; y < height; y++) {
      tiles[y] = new Array(width).fill(TileType.EMPTY);
    }

    // Walls & Ceiling
    for (let x = 0; x < width; x++) {
      tiles[0][x] = TileType.BRICK;
      tiles[13][x] = TileType.GROUND;
      tiles[14][x] = TileType.GROUND;
    }
    for (let y = 0; y < height; y++) {
      tiles[y][0] = TileType.BRICK;
      tiles[y][width - 1] = TileType.BRICK;
    }

    // Coin arrangement (3 rows of coins)
    const coins: Array<{ x: number; y: number }> = [];
    for (let cx = 4; cx <= 13; cx++) {
      coins.push({ x: cx * TILE_SIZE, y: 7 * TILE_SIZE });
      coins.push({ x: cx * TILE_SIZE, y: 9 * TILE_SIZE });
    }

    // Exit Pipe at right (x = 16, 17)
    tiles[11][16] = TileType.PIPE_TOP_LEFT;
    tiles[11][17] = TileType.PIPE_TOP_RIGHT;
    tiles[12][16] = TileType.PIPE_BODY_LEFT;
    tiles[12][17] = TileType.PIPE_BODY_RIGHT;

    return {
      tiles,
      coins,
      exitPipeX: 16 * TILE_SIZE
    };
  }
}
