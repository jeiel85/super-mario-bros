// Authentic NES Super Mario Bros. ROM Bytecode Decoder
// Decodes all 32 stages (World 1-1 to World 8-4) directly from disassembly byte streams.

import { TileType, TILE_SIZE } from '../constants';
import {
  WorldAddrOffsets,
  AreaAddrOffsets,
  EnemyAddrHOffsets,
  AreaDataHOffsets,
  LevelDataPointers,
  EnemyDataPointers
} from './SMB1RomData';
import { EnemySpawn, SceneryItem } from './World1_1';

export type LevelTheme = 'overworld' | 'underground' | 'underwater' | 'castle';

export interface DecodedLevel {
  world: string; // e.g. "1-1", "1-4", "8-4"
  worldNum: number;
  stageNum: number;
  theme: LevelTheme;
  backgroundColor: string;
  timer: number;
  width: number;
  height: number;
  tiles: number[][]; // [y][x]
  enemies: EnemySpawn[];
  piranhas: Array<{ pipeX: number; pipeTopY: number }>;
  firebars: Array<{ tileX: number; tileY: number; length: number; clockwise: boolean }>;
  podoboos: Array<{ x: number }>;
  flagPoleX: number;
  castleX: number;
  isCastle: boolean;
  hasAxe: boolean;
  axeX: number;
  axeY: number;
  bridgeStartX: number;
  bridgeEndX: number;
  bowserX: number;
  retainerX: number; // Toad (1-4..7-4) or Princess Peach (8-4)
  isPeach: boolean;
  scenery: SceneryItem[];
  warpZonePipes?: Array<{ pipeX: number; targetWorld: number }>;
}

export class SMB1LevelDecoder {
  public static decodeLevel(worldNum: number, stageNum: number): DecodedLevel {
    const wIdx = Math.max(0, Math.min(7, worldNum - 1));
    const start = WorldAddrOffsets[wIdx];
    const nextStart = wIdx < 7 ? WorldAddrOffsets[wIdx + 1] : AreaAddrOffsets.length;
    const count = nextStart - start;

    let slot = 0;
    if (count === 5) {
      if (stageNum === 1) slot = 0;
      else if (stageNum === 2) slot = 2; // Main underground/water area
      else if (stageNum === 3) slot = 3;
      else if (stageNum === 4) slot = 4;
    } else {
      slot = Math.max(0, Math.min(count - 1, stageNum - 1));
    }

    const areaPointer = AreaAddrOffsets[start + slot];
    return this.decodeFromPointer(worldNum, stageNum, areaPointer);
  }

  public static decodeFromPointer(worldNum: number, stageNum: number, areaPointer: number): DecodedLevel {
    const areaType = (areaPointer & 0x60) >> 5;
    const lowOffset = areaPointer & 0x1f;

    const levelIdx = AreaDataHOffsets[areaType] + lowOffset;
    const enemyIdx = EnemyAddrHOffsets[areaType] + lowOffset;

    const levelBytes = LevelDataPointers[levelIdx] || LevelDataPointers[8]; // Fallback to 1-1
    const enemyBytes = EnemyDataPointers[enemyIdx] || EnemyDataPointers[11];

    const theme: LevelTheme = ['underwater', 'overworld', 'underground', 'castle'][areaType] as LevelTheme;

    // Header Byte 0:
    // Bits 7-6: Timer (00=400s, 01=400s, 10=300s, 11=200s)
    const timerCode = (levelBytes[0] & 0xc0) >> 6;
    const timer = timerCode === 2 ? 300 : timerCode === 3 ? 200 : 400;

    // Background color based on theme
    let backgroundColor = '#5c94fc'; // Default sky blue
    if (theme === 'underground') backgroundColor = '#000000';
    else if (theme === 'castle') backgroundColor = '#000000';
    else if (theme === 'underwater') backgroundColor = '#2038ec';

    // First scan to determine level width (pages)
    let maxPage = 10;
    let page = 0;
    let pos = 2;
    while (pos < levelBytes.length) {
      const b1 = levelBytes[pos];
      if (b1 === 0xfd) break;
      const b2 = levelBytes[pos + 1];
      pos += 2;
      if (b2 & 0x80) page++;
      const row = b1 & 0x0f;
      if (row === 13 && (b2 & 0x40) === 0) {
        page = b2 & 0x1f;
      }
      if (page > maxPage) maxPage = page;
    }

    const width = (maxPage + 3) * 16;
    const height = 15;

    // Allocate tile grid [15][width]
    const tiles: number[][] = [];
    for (let y = 0; y < height; y++) {
      tiles[y] = new Array(width).fill(TileType.EMPTY);
    }

    // Initialize ground
    if (theme === 'overworld' || theme === 'underground') {
      for (let x = 0; x < width; x++) {
        tiles[13][x] = TileType.GROUND;
        tiles[14][x] = TileType.GROUND;
      }
    } else if (theme === 'underwater') {
      for (let x = 0; x < width; x++) {
        tiles[13][x] = TileType.CORAL;
        tiles[14][x] = TileType.CORAL;
      }
    } else if (theme === 'castle') {
      // Castles have floor at bottom, but often lava gaps
      for (let x = 0; x < width; x++) {
        tiles[13][x] = TileType.SOLID_BLOCK;
        tiles[14][x] = TileType.SOLID_BLOCK;
      }
    }

    // Decoded object tracking
    let flagPoleX = 0;
    let castleX = 0;
    let hasAxe = false;
    let axeX = 0;
    let axeY = 0;
    let bridgeStartX = 0;
    let bridgeEndX = 0;
    let bowserX = 0;
    let retainerX = 0;
    const isPeach = worldNum === 8 && stageNum === 4;

    const piranhas: Array<{ pipeX: number; pipeTopY: number }> = [];
    const firebars: Array<{ tileX: number; tileY: number; length: number; clockwise: boolean }> = [];
    const podoboos: Array<{ x: number }> = [];
    const warpZonePipes: Array<{ pipeX: number; targetWorld: number }> = [];

    // Decode Level Objects
    page = 0;
    pos = 2;
    while (pos < levelBytes.length) {
      const b1 = levelBytes[pos];
      if (b1 === 0xfd) break;
      const b2 = levelBytes[pos + 1];
      pos += 2;

      if (b2 & 0x80) page++;
      const row = b1 & 0x0f;
      const colInPage = (b1 >> 4) & 0x0f;
      const absX = page * 16 + colInPage;

      if (absX >= width) continue;

      // Special Row 13 (0x0D)
      if (row === 13) {
        if ((b2 & 0x40) === 0) {
          page = b2 & 0x1f;
          continue;
        }
        const objId = b2 & 0x0f;
        if (objId === 1) {
          // Flagpole
          flagPoleX = absX * TILE_SIZE;
          tiles[2][absX] = TileType.FLAG_TOP;
          for (let fy = 3; fy <= 12; fy++) {
            tiles[fy][absX] = TileType.FLAG_POLE;
          }
          tiles[12][absX] = TileType.SOLID_BLOCK;
        } else if (objId === 2) {
          // Axe
          hasAxe = true;
          axeX = absX * TILE_SIZE;
          axeY = 8 * TILE_SIZE;
          tiles[8][absX] = TileType.AXE;
        } else if (objId === 3) {
          // Bridge Chain
          tiles[8][absX] = TileType.CHAIN;
        } else if (objId === 4) {
          // Castle Bridge (length = b2 & 0x0F)
          const bridgeLen = (b2 & 0x0f) + 1;
          bridgeStartX = absX * TILE_SIZE;
          bridgeEndX = (absX + bridgeLen) * TILE_SIZE;
          for (let bx = absX; bx < absX + bridgeLen && bx < width; bx++) {
            tiles[9][bx] = TileType.BRIDGE;
            tiles[13][bx] = TileType.LAVA_TOP; // Lava under bridge
            tiles[14][bx] = TileType.LAVA_TOP;
          }
        } else if (objId === 5) {
          // Warp Zone
          if (worldNum === 1) {
            warpZonePipes.push({ pipeX: absX * TILE_SIZE, targetWorld: 4 });
            warpZonePipes.push({ pipeX: (absX + 4) * TILE_SIZE, targetWorld: 3 });
            warpZonePipes.push({ pipeX: (absX + 8) * TILE_SIZE, targetWorld: 2 });
          } else if (worldNum === 4) {
            warpZonePipes.push({ pipeX: absX * TILE_SIZE, targetWorld: 8 });
            warpZonePipes.push({ pipeX: (absX + 4) * TILE_SIZE, targetWorld: 7 });
            warpZonePipes.push({ pipeX: (absX + 8) * TILE_SIZE, targetWorld: 6 });
          }
        }
        continue;
      }

      // Special Row 12 (0x0C)
      if (row === 12) {
        const objId = (b2 >> 4) & 0x07;
        const len = (b2 & 0x0f) + 1;
        if (objId === 0 || objId === 5) {
          // Hole / Pit
          for (let hx = absX; hx < absX + len && hx < width; hx++) {
            tiles[13][hx] = TileType.EMPTY;
            tiles[14][hx] = TileType.EMPTY;
          }
        } else if (objId === 2) {
          // Bridge High (Y=7)
          for (let bx = absX; bx < absX + len && bx < width; bx++) tiles[7][bx] = TileType.BRIDGE;
        } else if (objId === 3) {
          // Bridge Middle (Y=9)
          for (let bx = absX; bx < absX + len && bx < width; bx++) tiles[9][bx] = TileType.BRIDGE;
        } else if (objId === 4) {
          // Bridge Low (Y=11)
          for (let bx = absX; bx < absX + len && bx < width; bx++) tiles[11][bx] = TileType.BRIDGE;
        } else if (objId === 6) {
          // Row of Question Blocks High (Y=5)
          for (let qx = absX; qx < absX + len && qx < width; qx++) tiles[5][qx] = TileType.QUESTION_COIN;
        } else if (objId === 7) {
          // Row of Question Blocks Low (Y=9)
          for (let qx = absX; qx < absX + len && qx < width; qx++) tiles[9][qx] = TileType.QUESTION_COIN;
        }
        continue;
      }

      // Special Row 15 (0x0F)
      if (row === 15) {
        const objId = (b2 >> 4) & 0x07;
        if (objId === 2) {
          // Castle Object
          castleX = absX * TILE_SIZE;
          const cx = absX;
          for (let cy = 8; cy <= 12; cy++) {
            for (let xOff = 0; xOff < 5; xOff++) {
              if (cx + xOff < width) tiles[cy][cx + xOff] = TileType.CASTLE_BRICK;
            }
          }
          if (cx < width) tiles[7][cx] = TileType.CASTLE_BATTLEMENT;
          if (cx + 2 < width) tiles[7][cx + 2] = TileType.CASTLE_BATTLEMENT;
          if (cx + 4 < width) tiles[7][cx + 4] = TileType.CASTLE_BATTLEMENT;
          if (cx + 2 < width) {
            tiles[11][cx + 2] = TileType.CASTLE_DOOR;
            tiles[12][cx + 2] = TileType.CASTLE_DOOR;
          }
        } else if (objId === 3) {
          // Staircase
          const heightParam = (b2 & 0x07) + 1;
          const isDown = (b2 & 0x08) !== 0;
          for (let step = 0; step < heightParam; step++) {
            const sx = absX + step;
            if (sx >= width) break;
            const colH = isDown ? heightParam - step : step + 1;
            for (let h = 0; h < colH; h++) {
              tiles[12 - h][sx] = TileType.SOLID_BLOCK;
            }
          }
        }
        continue;
      }

      // Normal Rows (0 to 11 in MetatileBuffer, screen row = row + 2)
      const isLarge = (b2 & 0x70) !== 0;
      if (isLarge) {
        const type = (b2 >> 4) & 0x07;
        const len = (b2 & 0x0f) + 1;

        if (type === 0 || type === 7) {
          // Vertical Pipe (NES: top is at row + 2, extends down to ground at row 13)
          const topY = row + 2;
          if (topY >= 0 && absX + 1 < width) {
            const isEnter = (b2 & 0x08) !== 0;
            tiles[topY][absX] = isEnter ? TileType.PIPE_ENTER_TOP_LEFT : TileType.PIPE_TOP_LEFT;
            tiles[topY][absX + 1] = isEnter ? TileType.PIPE_ENTER_TOP_RIGHT : TileType.PIPE_TOP_RIGHT;
            for (let py = topY + 1; py < 13; py++) {
              tiles[py][absX] = TileType.PIPE_BODY_LEFT;
              tiles[py][absX + 1] = TileType.PIPE_BODY_RIGHT;
            }
            // Spawn Piranha Plant if not enter pipe and tall enough (suppressed in 1-1 per authentic NES SMB1)
            if (!isEnter && topY <= 11 && !(worldNum === 1 && stageNum === 1)) {
              piranhas.push({ pipeX: absX * TILE_SIZE, pipeTopY: topY * TILE_SIZE });
            }
          }
        } else if (type === 1) {
          // Area style / Mushroom Tree
          const gridY = row + 2;
          for (let tx = absX; tx < absX + len && tx < width; tx++) {
            if (gridY < 13) tiles[gridY][tx] = TileType.SOLID_BLOCK;
          }
        } else if (type === 2) {
          // Row of Bricks
          const gridY = row + 2;
          for (let bx = absX; bx < absX + len && bx < width; bx++) {
            if (gridY < 13) tiles[gridY][bx] = TileType.BRICK;
          }
        } else if (type === 3) {
          // Row of Solid Blocks
          const gridY = row + 2;
          for (let sx = absX; sx < absX + len && sx < width; sx++) {
            if (gridY < 13) tiles[gridY][sx] = TileType.SOLID_BLOCK;
          }
        } else if (type === 4) {
          // Row of Coins
          const gridY = row + 2;
          for (let cx = absX; cx < absX + len && cx < width; cx++) {
            if (gridY < 13) tiles[gridY][cx] = TileType.COIN;
          }
        } else if (type === 5) {
          // Column of Bricks
          const startY = row + 2;
          for (let cy = startY; cy < startY + len && cy < 13; cy++) {
            tiles[cy][absX] = TileType.BRICK;
          }
        } else if (type === 6) {
          // Column of Solid Blocks
          const startY = row + 2;
          for (let cy = startY; cy < startY + len && cy < 13; cy++) {
            tiles[cy][absX] = TileType.SOLID_BLOCK;
          }
        }
      } else {
        // Small Object
        const sType = b2 & 0x0f;
        const gridY = row + 2;
        if (gridY < 13 && absX < width) {
          switch (sType) {
            case 0: tiles[gridY][absX] = TileType.QUESTION_MUSHROOM; break;
            case 1: tiles[gridY][absX] = TileType.QUESTION_COIN; break;
            case 2: tiles[gridY][absX] = TileType.QUESTION_COIN; break;
            case 3: tiles[gridY][absX] = TileType.HIDDEN_1UP; break;
            case 4: tiles[gridY][absX] = TileType.BRICK_MUSHROOM; break;
            case 5: tiles[gridY][absX] = TileType.BRICK_VINE; break;
            case 6: tiles[gridY][absX] = TileType.QUESTION_STAR; break;
            case 7: tiles[gridY][absX] = TileType.BRICK_MULTICOIN; break;
            case 8: tiles[gridY][absX] = TileType.BRICK_1UP; break;
            case 10: tiles[gridY][absX] = TileType.EMPTY_BLOCK; break;
            case 11: tiles[gridY][absX] = TileType.JUMPSPRING; break;
            default: tiles[gridY][absX] = TileType.BRICK; break;
          }
        }
      }
    }

    // Decode Enemies
    const enemies: EnemySpawn[] = [];
    page = 0;
    pos = 0;
    while (pos < enemyBytes.length) {
      const b1 = enemyBytes[pos];
      if (b1 === 0xff) break;
      const b2 = enemyBytes[pos + 1];

      if ((b1 & 0x0f) === 0x0e) {
        if (b2 & 0x80) page++;
        pos += 3;
        continue;
      }
      if ((b1 & 0x0f) === 0x0f) {
        if (!(b2 & 0x80)) {
          page = b2 & 0x3f;
        } else {
          page++;
        }
        pos += 2;
        continue;
      }

      pos += 2;
      if (b2 & 0x80) page++;
      const row = b1 & 0x0f;
      const colInPage = (b1 >> 4) & 0x0f;
      const absX = page * 16 + colInPage;
      const id = b2 & 0x3f;

      const px = absX * TILE_SIZE;
      const isKoopaTroopa = (id === 0x00 || id === 0x03 || id === 0x0e || id === 0x0f || id === 0x05);
      const enemyH = isKoopaTroopa ? 24 : 16;
      const py = (row >= 10) ? (13 * TILE_SIZE - enemyH) : ((row + 2) * TILE_SIZE - enemyH);

      // Group Enemies ($37 to $3E)
      if (id >= 0x37 && id <= 0x3e) {
        const isKoopa = id >= 0x3b;
        const count = (id & 0x01) ? 3 : 2;
        const eType = isKoopa ? 'koopa' : 'goomba';
        const yCoord = (id & 0x02) ? 7 * TILE_SIZE : 12 * TILE_SIZE;
        for (let i = 0; i < count; i++) {
          enemies.push({ x: px + i * 20, y: yCoord, type: eType as any });
        }
        continue;
      }

      // Single Enemies
      switch (id) {
        case 0x00: // Green Koopa
          enemies.push({ x: px, y: py, type: 'koopa' });
          break;
        case 0x02: // Buzzy Beetle
          enemies.push({ x: px, y: py, type: 'buzzy_beetle' as any });
          break;
        case 0x03: // Red Koopa
          enemies.push({ x: px, y: py, type: 'red_koopa' as any });
          break;
        case 0x05: // Hammer Bro
          enemies.push({ x: px, y: py, type: 'hammer_bro' as any });
          break;
        case 0x06: // Goomba
          enemies.push({ x: px, y: py, type: 'goomba' });
          break;
        case 0x07: // Blooper
          enemies.push({ x: px, y: py, type: 'blooper' as any });
          break;
        case 0x08: // Bullet Bill Frenzy
          enemies.push({ x: px, y: py, type: 'bullet_bill' as any });
          break;
        case 0x0a:
        case 0x0b: // Cheep Cheep
          enemies.push({ x: px, y: py, type: 'cheep_cheep' as any });
          break;
        case 0x0c: // Podoboo
          podoboos.push({ x: px });
          break;
        case 0x0d: // Piranha Plant
          piranhas.push({ pipeX: px, pipeTopY: py });
          break;
        case 0x0e: // Jumping Paratroopa
          enemies.push({ x: px, y: py, type: 'paratroopa' as any });
          break;
        case 0x0f: // Red Paratroopa
          enemies.push({ x: px, y: py, type: 'red_paratroopa' as any });
          break;
        case 0x11: // Lakitu
          enemies.push({ x: px, y: 3 * TILE_SIZE, type: 'lakitu' as any });
          break;
        case 0x12: // Spiny
          enemies.push({ x: px, y: py, type: 'spiny' as any });
          break;
        case 0x14: // Flying Cheep Cheep
          enemies.push({ x: px, y: py, type: 'flying_cheep' as any });
          break;
        case 0x1b:
        case 0x1c:
        case 0x1d:
        case 0x1e: // Short Firebar
          firebars.push({ tileX: absX, tileY: row, length: 4, clockwise: id % 2 === 0 });
          break;
        case 0x1f: // Long Firebar
          firebars.push({ tileX: absX, tileY: row, length: 6, clockwise: true });
          break;
        case 0x2d: // Bowser
          bowserX = px;
          break;
        case 0x35: // Retainer (Toad or Peach)
          retainerX = px;
          break;
      }
    }

    // Generate Scenery for Overworld
    const scenery: SceneryItem[] = [];
    if (theme === 'overworld') {
      const pageCount = Math.ceil(width / 48);
      for (let p = 0; p < pageCount; p++) {
        const off = p * 48;
        scenery.push({ type: 'hill_big', tileX: off + 0, tileY: 11 });
        scenery.push({ type: 'hill_small', tileX: off + 16, tileY: 12 });
        scenery.push({ type: 'bush_triple', tileX: off + 23, tileY: 12 });
        scenery.push({ type: 'bush_single', tileX: off + 41, tileY: 12 });
        scenery.push({ type: 'cloud_single', tileX: off + 8, tileY: 3 });
        scenery.push({ type: 'cloud_triple', tileX: off + 27, tileY: 2 });
        scenery.push({ type: 'cloud_double', tileX: off + 36, tileY: 3 });
      }
    }

    const isCastle = theme === 'castle';

    return {
      world: `${worldNum}-${stageNum}`,
      worldNum,
      stageNum,
      theme,
      backgroundColor,
      timer,
      width,
      height,
      tiles,
      enemies,
      piranhas,
      firebars,
      podoboos,
      flagPoleX,
      castleX,
      isCastle,
      hasAxe,
      axeX,
      axeY,
      bridgeStartX,
      bridgeEndX,
      bowserX: bowserX || (hasAxe ? axeX - 64 : 0),
      retainerX: retainerX || (hasAxe ? axeX + 96 : 0),
      isPeach,
      scenery,
      warpZonePipes
    };
  }
}
