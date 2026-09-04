// Pixel-Perfect NES Super Mario Bros. Sprite & Tile Generator
import { COLORS } from './Palette';
import { initExtraSprites } from './SpriteSheetExtra';

export type SpriteCanvas = HTMLCanvasElement;

// Helper to create an offscreen canvas from a 2D pixel string array and color map
export function createPixelCanvas(
  width: number,
  height: number,
  rows: string[],
  colorMap: Record<string, string>
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < height; y++) {
    const row = rows[y] || '';
    for (let x = 0; x < width; x++) {
      const char = row[x] || '.';
      const color = colorMap[char];
      if (color && color !== 'transparent') {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return canvas;
}

// Flip canvas horizontally
export function flipCanvasH(src: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = src.width;
  canvas.height = src.height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(src.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return canvas;
}

// Flip canvas vertically (for dead enemies)
export function flipCanvasV(src: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = src.width;
  canvas.height = src.height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(0, src.height);
  ctx.scale(1, -1);
  ctx.drawImage(src, 0, 0);
  return canvas;
}

export class SpriteSheet {
  public static marioSmall: Record<string, HTMLCanvasElement> = {};
  public static marioSmallFire: Record<string, HTMLCanvasElement> = {};
  public static marioSmallAlt: Record<string, HTMLCanvasElement> = {};
  public static marioSuper: Record<string, HTMLCanvasElement> = {};
  public static marioSuperAlt: Record<string, HTMLCanvasElement> = {};
  public static marioFire: Record<string, HTMLCanvasElement> = {};

  public static luigiSmall: Record<string, HTMLCanvasElement> = {};
  public static luigiSmallFire: Record<string, HTMLCanvasElement> = {};
  public static luigiSmallAlt: Record<string, HTMLCanvasElement> = {};
  public static luigiSuper: Record<string, HTMLCanvasElement> = {};
  public static luigiSuperAlt: Record<string, HTMLCanvasElement> = {};
  public static luigiFire: Record<string, HTMLCanvasElement> = {};

  public static enemies: Record<string, HTMLCanvasElement> = {};
  public static tiles: Record<string, HTMLCanvasElement> = {};
  public static items: Record<string, HTMLCanvasElement> = {};
  public static particles: Record<string, HTMLCanvasElement> = {};
  public static scenery: Record<string, HTMLCanvasElement> = {};
  public static ui: Record<string, HTMLCanvasElement> = {};

  public static isLoaded = false;

  public static init() {
    if (this.isLoaded) return;
    this.generateTiles();
    this.generateMarioSprites();
    this.generateEnemies();
    this.generateItems();
    this.generateScenery();
    this.generateParticles();
    initExtraSprites();
    this.isLoaded = true;
  }

  // -------------------------------------------------------------
  // TILES (Ground, Bricks, Questions, Pipes, Castle)
  // -------------------------------------------------------------
  private static generateTiles() {
    // 1. Ground Tile (16x16)
    const groundMap: Record<string, string> = {
      '.': 'transparent',
      'X': COLORS.GROUND_BROWN,
      'O': COLORS.GROUND_ORANGE,
      'B': COLORS.GROUND_BLACK,
    };
    const groundRows = [
      "OOOOOOOOOOOOOOOO",
      "OXXXXXXXXXXXXXXB",
      "OXXXXXXXXXXXXXXB",
      "OXXXXXXXXXXXXXXB",
      "OXXBXXXXXXXXXXBB",
      "OXXBBXXXXXXXXXBB",
      "OXXXXXXXXXXXXXXB",
      "OXXXXXXXXXXXXXXB",
      "OXXXXXBBXXXXXXXB",
      "OXXXXXBBBXXXXXXB",
      "OXXXXXXXXXXXXXXB",
      "OXXXXXXXXXXXXXXB",
      "OXXXXXXXXBBXXXXB",
      "OXXXXXXXXBBBXXXB",
      "OXXXXXXXXXXXXXXB",
      "BBBBBBBBBBBBBBBB"
    ];
    this.tiles['ground'] = createPixelCanvas(16, 16, groundRows, groundMap);

    // Underground Ground Tile (Blue theme)
    const ugGroundMap: Record<string, string> = {
      '.': 'transparent',
      'X': COLORS.UNDERGROUND_BLUE,
      'O': COLORS.UNDERGROUND_LIGHT_BLUE,
      'B': COLORS.BLACK,
    };
    this.tiles['ground_ug'] = createPixelCanvas(16, 16, groundRows, ugGroundMap);

    // 2. Breakable Brick Tile (16x16)
    const brickMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.GROUND_BLACK,
      'M': COLORS.BRICK_MID,
      'L': COLORS.BRICK_LIGHT,
      'D': COLORS.BRICK_DARK
    };
    const brickRows = [
      "LLLLLLLLBBLLLLLL",
      "MMMMMMMMBBMMMMMM",
      "MMMMMMMMBBMMMMMM",
      "DDDDDDDDBBDDDDDD",
      "BBBBBBBBBBBBBBBB",
      "LLLLBBLLLLLLLLBB",
      "MMMMBBMMMMMMMMBB",
      "MMMMBBMMMMMMMMBB",
      "DDDDBBDDDDDDDDBB",
      "BBBBBBBBBBBBBBBB",
      "LLLLLLLLBBLLLLLL",
      "MMMMMMMMBBMMMMMM",
      "MMMMMMMMBBMMMMMM",
      "DDDDDDDDBBDDDDDD",
      "BBBBBBBBBBBBBBBB",
      "MMMMMMMMMMMMMMMM"
    ];
    this.tiles['brick'] = createPixelCanvas(16, 16, brickRows, brickMap);

    // Underground Brick Tile
    const ugBrickMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'M': COLORS.UNDERGROUND_BLUE,
      'L': COLORS.UNDERGROUND_LIGHT_BLUE,
      'D': COLORS.UNDERGROUND_ROCK_DARK
    };
    this.tiles['brick_ug'] = createPixelCanvas(16, 16, brickRows, ugBrickMap);

    // 3. Question Block (4 Animated Frames)
    const qMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.QUESTION_BLACK,
      'Y': COLORS.QUESTION_YELLOW,
      'W': COLORS.QUESTION_WHITE,
      'D': COLORS.QUESTION_BROWN
    };
    const qRows0 = [
      "BBBBBBBBBBBBBBBB",
      "BYYYYYYYYYYYYYYB",
      "BYWWWWWWWWWWWWYB",
      "BYWDDDDDDDDDDWYB",
      "BYWD..DDDD..DWYB",
      "BYW.DD.DD.DD.WYB",
      "BYW.DD.DD.DD.WYB",
      "BYW...DDDD...WYB",
      "BYWDD.DDDD.DDWYB",
      "BYWDD.DDDD.DDWYB",
      "BYWDD......DDWYB",
      "BYWDD.DDDD.DDWYB",
      "BYWDDDDDDDDDDWYB",
      "BYWWWWWWWWWWWWYB",
      "BYYYYYYYYYYYYYYB",
      "BBBBBBBBBBBBBBBB"
    ];
    // Alternate shimmer frames
    const qRows1 = qRows0.map(r => r.replace(/Y/g, 'W'));
    const qRows2 = qRows0.map(r => r.replace(/Y/g, 'D'));
    this.tiles['question_0'] = createPixelCanvas(16, 16, qRows0, qMap);
    this.tiles['question_1'] = createPixelCanvas(16, 16, qRows1, qMap);
    this.tiles['question_2'] = createPixelCanvas(16, 16, qRows2, qMap);
    this.tiles['question_3'] = this.tiles['question_0'];

    // 4. Empty Hit Block (Solid brown with 4 corner rivets)
    const emptyRows = [
      "BBBBBBBBBBBBBBBB",
      "BDDDDDDDDDDDDDDB",
      "BDYDDDDDDDDDDYDB",
      "BDDDDDDDDDDDDDDB",
      "BDDDDDDDDDDDDDDB",
      "BDDDDDDDDDDDDDDB",
      "BDDDDDDDDDDDDDDB",
      "BDDDDDDDDDDDDDDB",
      "BDDDDDDDDDDDDDDB",
      "BDDDDDDDDDDDDDDB",
      "BDDDDDDDDDDDDDDB",
      "BDDDDDDDDDDDDDDB",
      "BDDDDDDDDDDDDDDB",
      "BDYDDDDDDDDDDYDB",
      "BDDDDDDDDDDDDDDB",
      "BBBBBBBBBBBBBBBB"
    ];
    this.tiles['empty_block'] = createPixelCanvas(16, 16, emptyRows, qMap);

    // 5. Solid Step Block (Staircase blocks in 1-1)
    const solidBlockMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'O': COLORS.GROUND_ORANGE,
      'D': COLORS.GROUND_BROWN
    };
    const solidBlockRows = [
      "BBBBBBBBBBBBBBBB",
      "BOOOOOOOOOOOOOOB",
      "BOOOOOOOOOOOOOOB",
      "BODDDDDDDDDDDDOB",
      "BODDDDDDDDDDDDOB",
      "BODDDDDDDDDDDDOB",
      "BODDDDDDDDDDDDOB",
      "BODDDDDDDDDDDDOB",
      "BODDDDDDDDDDDDOB",
      "BODDDDDDDDDDDDOB",
      "BODDDDDDDDDDDDOB",
      "BODDDDDDDDDDDDOB",
      "BODDDDDDDDDDDDOB",
      "BOOOOOOOOOOOOOOB",
      "BOOOOOOOOOOOOOOB",
      "BBBBBBBBBBBBBBBB"
    ];
    this.tiles['solid_block'] = createPixelCanvas(16, 16, solidBlockRows, solidBlockMap);

    // 6. Pipes (16x16 parts: Top-Left, Top-Right, Shaft-Left, Shaft-Right)
    const pipeMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'L': COLORS.PIPE_LIGHT_GREEN,
      'M': COLORS.PIPE_MID_GREEN,
      'D': COLORS.PIPE_DARK_GREEN
    };
    const pipeTopLeft = [
      "BBBBBBBBBBBBBBBB",
      "BLLLLLLLLLLLLLLB",
      "BLLLLLLLLLLLLLLB",
      "BLMMMMMMMMMMMMMD",
      "BLMMMMMMMMMMMMMD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BBBBBBBBBBBBBBBB"
    ];
    const pipeTopRight = [
      "BBBBBBBBBBBBBBBB",
      "BLLMMMMMMMMMMMMB",
      "BLLMMMMMMMMMMMMB",
      "DMMMMMMMMMMMMMMB",
      "DMMMMMMMMMMMMMMB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "BBBBBBBBBBBBBBBB"
    ];
    const pipeBodyLeft = [
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD",
      "BLMDDDDDDDDDDDDD"
    ];
    const pipeBodyRight = [
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB",
      "DDDDDDDDDDDDDDDB"
    ];
    this.tiles['pipe_top_left'] = createPixelCanvas(16, 16, pipeTopLeft, pipeMap);
    this.tiles['pipe_top_right'] = createPixelCanvas(16, 16, pipeTopRight, pipeMap);
    this.tiles['pipe_body_left'] = createPixelCanvas(16, 16, pipeBodyLeft, pipeMap);
    this.tiles['pipe_body_right'] = createPixelCanvas(16, 16, pipeBodyRight, pipeMap);

    // 7. Flagpole & Castle Tiles
    const poleMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'G': COLORS.PIPE_LIGHT_GREEN,
      'D': COLORS.PIPE_DARK_GREEN
    };
    const poleRows = [
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......"
    ];
    this.tiles['flag_pole'] = createPixelCanvas(16, 16, poleRows, poleMap);

    const flagBallRows = [
      "......BGGDB.....",
      ".....BGGGGDB....",
      ".....BGGGGDB....",
      "......BDDDB.....",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......",
      ".......BGD......"
    ];
    this.tiles['flag_top'] = createPixelCanvas(16, 16, flagBallRows, poleMap);

    // Flag (Green triangle flag with black border)
    const flagRows = [
      "BBBBBBBBBBBBBBBB",
      "BGGGGGGGGGGGGGG.",
      "BGGGGGGGGGGGGG..",
      "BGGGGGGGGGGGG...",
      "BGGGGGGGGGGG....",
      "BGGGGGGGGGG.....",
      "BGGGGGGGGG......",
      "BGGGGGGGG.......",
      "BGGGGGGG........",
      "BGGGGGG.........",
      "BGGGGG..........",
      "BGGGG...........",
      "BGGG............",
      "BGG.............",
      "BG..............",
      "B..............."
    ];
    this.tiles['flag'] = createPixelCanvas(16, 16, flagRows, poleMap);

    // Castle Bricks
    const castleMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'R': COLORS.CASTLE_BRICK,
      'L': COLORS.CASTLE_LIGHT
    };
    const castleBrickRows = [
      "LLLLLLLLBBLLLLLL",
      "RRRRRRRRBBRRRRRR",
      "RRRRRRRRBBRRRRRR",
      "BBBBBBBBBBBBBBBB",
      "LLLLBBLLLLLLLLBB",
      "RRRRBBRRRRRRRRBB",
      "RRRRBBRRRRRRRRBB",
      "BBBBBBBBBBBBBBBB",
      "LLLLLLLLBBLLLLLL",
      "RRRRRRRRBBRRRRRR",
      "RRRRRRRRBBRRRRRR",
      "BBBBBBBBBBBBBBBB",
      "LLLLBBLLLLLLLLBB",
      "RRRRBBRRRRRRRRBB",
      "RRRRBBRRRRRRRRBB",
      "BBBBBBBBBBBBBBBB"
    ];
    this.tiles['castle_brick'] = createPixelCanvas(16, 16, castleBrickRows, castleMap);

    // Castle Door
    const castleDoorRows = [
      "....BBBBBBBB....",
      "...BBBBBBBBBB...",
      "..BBBBBBBBBBBB..",
      ".BBBBBBBBBBBBBB.",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB"
    ];
    this.tiles['castle_door'] = createPixelCanvas(16, 16, castleDoorRows, castleMap);

    // Castle Battlement (top crenels)
    const battlementRows = [
      "LLLLBB....LLLLBB",
      "RRRRBB....RRRRBB",
      "RRRRBB....RRRRBB",
      "LLLLLLLLLLLLLLLL",
      "RRRRRRRRRRRRRRRR",
      "RRRRRRRRRRRRRRRR",
      "BBBBBBBBBBBBBBBB",
      "LLLLBBLLLLLLLLBB",
      "RRRRBBRRRRRRRRBB",
      "RRRRBBRRRRRRRRBB",
      "BBBBBBBBBBBBBBBB",
      "LLLLLLLLBBLLLLLL",
      "RRRRRRRRBBRRRRRR",
      "RRRRRRRRBBRRRRRR",
      "BBBBBBBBBBBBBBBB",
      "LLLLBBLLLLLLLLBB"
    ];
    this.tiles['castle_battlement'] = createPixelCanvas(16, 16, battlementRows, castleMap);

    // Castle Top Small Flag (Rising on castle tower upon level clear)
    const castleFlagMap: Record<string, string> = {
      '.': 'transparent',
      'G': COLORS.PIPE_LIGHT_GREEN,
      'B': COLORS.BLACK
    };
    const castleFlagRows = [
      "B.......",
      "BGGGG...",
      "BGGGGGG.",
      "BGGGGG..",
      "BGG.....",
      "B.......",
      "B.......",
      "B......."
    ];
    this.tiles['castle_flag'] = createPixelCanvas(8, 8, castleFlagRows, castleFlagMap);
  }

  // -------------------------------------------------------------
  // MARIO SPRITES (Small: 16x16, Super: 16x32, Fire: 16x32)
  // -------------------------------------------------------------
  private static generateMarioSprites() {
    // 1. Small Mario (16x16)
    const smallMap: Record<string, string> = {
      '.': 'transparent',
      'R': COLORS.MARIO_RED,
      'B': COLORS.MARIO_BROWN,
      'S': COLORS.MARIO_SKIN
    };

    const smallIdle = [
      ".....RRRRR......",
      "....RRRRRRRRR...",
      "....BBBSSBS.....",
      "...BSBSSSBSSS...",
      "...BSBBSSSBSSS..",
      "...BBSSSSBBBB...",
      ".....SSSSSSS....",
      "....BBRBBB......",
      "...BBBRBBRBBB...",
      "..BBBBRRRRBBBB..",
      "..SSBRSRRSRBSS..",
      "..SSSRRRRRRSSS..",
      "..SSRRRRRRRRSS..",
      "....RRR..RRR....",
      "...BBB....BBB...",
      "..BBBB....BBBB.."
    ];

    const smallWalk1 = [
      "................",
      "......RRRRR.....",
      ".....RRRRRRRRR..",
      ".....BBBSSBS....",
      "....BSBSSSBSSS..",
      "....BSBBSSSBSSS.",
      "....BBSSSSBBBB..",
      "......SSSSSSS...",
      ".....BBBBRB.S...",
      "....SBBBBBBSSS..",
      "...SSRBBBBBSS...",
      "...BBRRRRRRR....",
      "...BRRRRRRRR....",
      "..BBRRR.RRR.....",
      "..B....BBB......",
      ".......BBBB....."
    ];

    const smallWalk2 = [
      ".....RRRRR......",
      "....RRRRRRRRR...",
      "....BBBSSBS.....",
      "...BSBSSSBSSS...",
      "...BSBBSSSBSSS..",
      "...BBSSSSBBBB...",
      ".....SSSSSSS....",
      "..BBBBRRBB......",
      "SSBBBBRRRBBBSSS.",
      "SSS.BBRSRRRBBSS.",
      "SS..RRRRRRR..B..",
      "...RRRRRRRRRBB..",
      "..RRRRRRRRRRBB..",
      ".BBRRR...RRRBB..",
      ".BBB............",
      "..BBB..........."
    ];

    const smallWalk3 = [
      ".....RRRRR......",
      "....RRRRRRRRR...",
      "....BBBSSBS.....",
      "...BSBSSSBSSS...",
      "...BSBBSSSBSSS..",
      "...BBSSSSBBBB...",
      ".....SSSSSSS....",
      "....BBRBBB......",
      "...BBBBRRBB.....",
      "...BBBRRSRRS....",
      "...BBBBRRRRR....",
      "...RBBSSSRRR....",
      "....RBSSRRR.....",
      ".....RRRBBB.....",
      ".....BBBBBBB....",
      ".....BBBB......."
    ];

    const smallJump = [
      ".............SSS",
      "......RRRRR..SSS",
      ".....RRRRRRRRRSS",
      ".....BBBSSBS.BBB",
      "....BSBSSSBSSBBB",
      "....BSBBSSSBSSSB",
      "....BBSSSSBBBBB.",
      "......SSSSSSSB..",
      "..BBBBBRBBBRB...",
      ".BBBBBBBRBBBR..B",
      "SSBBBBBBRRRRR..B",
      "SSS.RRBRRSRRSRBB",
      ".S.BRRRRRRRRRRBB",
      "..BBBRRRRRRRRRBB",
      ".BBBRRRRRRR.....",
      ".B..RRRR........"
    ];

    const smallSkid = [
      ".....RRRRR......",
      "...BRRRRRRRR....",
      "..BBBBBBSBS.....",
      ".SSBSSBSSSSSS...",
      ".SSBSSBBSSBBSS..",
      "..SSBSSSSSSBB...",
      "...RRRBBBRSS....",
      "..RRSSSBRRBBB...",
      "..RBSSSBBBBBB...",
      "..RRRSSBBBBBB...",
      "...RRRRRBBBB....",
      "...RBBBRRRR.....",
      "....BBBBRRR.....",
      ".B.BRRBBBR......",
      ".BBBBBR.........",
      "..BBBB.........."
    ];

    const smallDie = [
      "......RRRR......",
      "...S.RRRRRR.S...",
      ".SSSBSBSSBSBSSS.",
      ".SSBBSBSSBSBBSS.",
      ".SSBBBSSSSBBBSS.",
      "...BBBBSSBBBB...",
      "....BSBBBBSB....",
      "....BSSSSSSB....",
      "...RRRSSSSRRR...",
      "..BBRRBBBBRRBB..",
      "..BBBRRBBRRBBB..",
      "..BBBRSRRSRBBB..",
      "..BBBRRRRRRBBB..",
      "...BBRRRRRRBB...",
      "................",
      "................"
    ];

    const smallFlag = [
      ".....RRRRR......",
      "....RRRRRRRRR...",
      "....BBBSSBS.....",
      "...BSBSSSBSSS...",
      "...BSBBSSSBSSS..",
      "...BBSBSSBSSSS..",
      ".....SSSSSSSS...",
      "....RRBRRR......",
      "...RRRBRRBRRR...",
      "..RRRRBBBBRRRR..",
      "..SSRBBYBBRSSS..",
      "..SSSBBBBBBSSS..",
      "..SSBBBBBBBBSS..",
      "....BBBBBBBB....",
      "....BBBBBBBB....",
      "....BB....BB...."
    ];

    // 2. Super (Big) Mario (16x32)
    const superMap: Record<string, string> = {
      '.': 'transparent',
      'R': COLORS.MARIO_RED,
      'B': COLORS.MARIO_BROWN,
      'S': COLORS.MARIO_SKIN
    };

    const superIdle = [
      "......RRRRR.....",
      "....RRRRRRS.....",
      "...RRRRRRSS.....",
      "...RRRRRRRRRRR..",
      "...BBBSSBSSS....",
      "..BSSBSSBBSSSS..",
      "..BSSBBSSSSSSSS.",
      ".BBSSBBSSSBSSSS.",
      ".BBSSSSSBBBBBB..",
      ".BBBSSSSSBBBBB..",
      "...BBSSSSSSSS...",
      "....RSSSSSB.....",
      "....BRBBBBRB....",
      "...BBRBBBBRBB...",
      "..BBBRBBBBRBBB..",
      ".BBBBRBBBBRBBBB.",
      ".BBBRRBBBBRRBBB.",
      "BBBBRRBBBBRRBBBB",
      "BBBBRRRRRRRRBBBB",
      "BBBBRSRRRRSRBBBB",
      "SSSSRRRRRRRRSSSS",
      "SSSSRRRRRRRRSSSS",
      ".SSSRRRRRRRRSSS.",
      ".SSRRRRRRRRRRSS.",
      "..RRRRRRRRRRRR..",
      ".RRRRRR..RRRRRR.",
      ".RRRRR....RRRRR.",
      ".RRRRR....RRRRR.",
      "..BBBB....BBBB..",
      "..BBBB....BBBB..",
      "BBBBBB....BBBBBB",
      "BBBBBB....BBBBBB"
    ];

    const superWalk1 = [
      "......RRRRR.....",
      "....RRRRRRS.....",
      "...RRRRRRSS.....",
      "...RRRRRRRRRRR..",
      "...BBBSSBSSS....",
      "..BSSBSSBBSSSS..",
      "..BSSBBSSSSSSSS.",
      ".BBSSBBSSSBSSSS.",
      ".BBSSSSSBBBBBB..",
      ".BBBSSSSSBBBBB..",
      "...BBSSSSSSSS...",
      ".....BBBSS......",
      "....RRRRBBR...S.",
      "...BBBBRRBBR.SSS",
      "..BBBBBBRRBRBSSS",
      ".BBBBBBBRRBBRSSS",
      ".BBBBBBBRRBBRBSB",
      ".BBBBBBRRRBBRBB.",
      "BBBBBBRRRSRBSB..",
      "BBBBRRRRRRRRR...",
      "SSSSSRRRRRRRR...",
      "SSSSSRRRRRRRR..B",
      "SSSSRRRRRRRRR.BB",
      ".SSSRRRRRRRBBBBB",
      "...RBRRRRRRBBBBB",
      "..BRRBRRRRRBBBBB",
      "BBBRRRBBRRRBBBBB",
      "BBBBRRRR...BBBBB",
      "BBBBBR..........",
      ".BBB............",
      ".BBB............",
      "..BBB..........."
    ];

    const superWalk2 = [
      "................",
      "................",
      ".......RRRRR....",
      ".....RRRRRRS....",
      "....RRRRRRSS....",
      "....RRRRRRRRRRR.",
      "....BBBSSBSSS...",
      "...BSSBSSBBSSSS.",
      "...BSSBBSSSSSSSS",
      "..BBSSBBSSSBSSSS",
      "..BBSSSSSBBBBBB.",
      "...BBSSSSSBBBBB.",
      ".....BSSSSSSSS..",
      "....BRRRSSS.....",
      "...BRBBBRB......",
      "...BRBBBBRB.....",
      "..BBRBBBBBRRSS..",
      "..BRRBBBBBBBSSSS",
      "..BRRRBBBBBBSSSS",
      "...RRRBBBBBBBSSS",
      "...RRRRBBBBBBSSS",
      "...RRRRRRBBBR...",
      "...RRRRRRRRRR...",
      "...RRRRRRRRRB...",
      "BBBBRRRRRRRBRR..",
      "BBBBRRRRRBBRRR..",
      "BBBBRRRRBRRRR...",
      "BBBBRRR..RRRR...",
      "BBBB.....BBBB...",
      "BB.......BBBB...",
      "B........BBBBBB.",
      ".........BBBBBB."
    ];

    const superWalk3 = [
      "................",
      "......RRRRR.....",
      "....RRRRRRS.....",
      "...RRRRRRSS.....",
      "...RRRRRRRRRRR..",
      "...BBBSSBSSS....",
      "..BSSBSSBBSSSS..",
      "..BSSBBSSSSSSSS.",
      ".BBSSBBSSSBSSSS.",
      ".BBSSSSSBBBBBB..",
      "..BBSSSSSBBBBB..",
      "...BBSSSSSSSS...",
      "....RRRRSS......",
      "...BRBBRRBB.....",
      "..BRBBBBRRB.....",
      "..BRBBBBRRBB....",
      "..BRBBBBRRRB....",
      "..BRBBBBBSSB....",
      "..BRBBBBSSSS....",
      "..RRBBBBSSSSR...",
      "..RRRBBBSSSSRR..",
      "..RRRRBBSSSRRR..",
      "..RRRRRRBBRRRR..",
      "...RRRRRBBBRR...",
      "....RRRBBBBBB...",
      "....RRBBBBBB....",
      ".....RRBBBB.....",
      ".....BRRRBBB....",
      ".....BBBB.BB....",
      "....BBBBB.......",
      "....BBBBBBB.....",
      "......BBBBB....."
    ];

    const superJump = [
      "............SSS.",
      "...........SSBSS",
      "......RRRRRSSBBS",
      "....RRRRRRRSSSSS",
      "...RRRRRRRRBBBBB",
      "...RRRRRRRRRRRBB",
      "...BBBSSBSSSBBBB",
      "..BSSBSSBSSSSSBB",
      "..BSSBBSSSSSSSSB",
      "..BSSBBSSSBSSSSB",
      ".BBSSSSSBBBBBBB.",
      ".BBBBSSSSBBBBSB.",
      "...BBSSSSSSSSBB.",
      "....RRRRBBRBBBB.",
      ".BBBBBBRRBRBBB..",
      "BBBBBBBBRBBRBB..",
      "BBBBBBBBRRBRB...",
      "BBSSBBBBRRBBR...",
      "BSSSSBBRRRRBS...",
      "SSSSSBRRRSRRR...",
      "SSSSSRRRRRRRR...",
      "S.SSRRRRRRRRR..B",
      ".SSRRRRRRRRRR.BB",
      "...RRRRRRRRRBBBB",
      "...BRRRRRRRRBBBB",
      "BBBRBBRRRRRRBBBB",
      "BBBRRRBBRRRRBBBB",
      "BBBRRRRR..RRBBBB",
      "BBBRRRRR........",
      "BBBRRRR.........",
      "BB..............",
      "B..............."
    ];

    const superCrouch = [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      ".......RRRRR....",
      ".....RRRRRRS....",
      "....RRRRRRSS....",
      "....RRRRRRRRRRR.",
      "....BBBSSBSSS...",
      "...BSSBSSBBSSSS.",
      "..BBSSSBSSSBSSSS",
      "..BBSSSSSBBBBBB.",
      "..RRBSSSSSBBBBB.",
      ".BBBRBSSSSSSSSS.",
      ".BBBRBBBSSSBBRB.",
      "BBBBRBBBBBBBBRB.",
      "BBBBRBBBBBBBRRBB",
      "BBBBRSBBBBBRRBBB",
      "BBBBRRRRRRRRBBBB",
      "BBBBBRRRRRRBBBBB",
      "BBBSSSRRRRSSSBBB",
      "RBSSSSRRRRSSSSBR",
      "RSSSSRRRRRRSSSSR",
      ".RSSB......BSSR.",
      "..BBBB....BBBB..",
      "BBBBBB....BBBBBB"
    ];

    const superSkid = [
      "......RRRRRRR...",
      "..BBRRRRRRRSS...",
      ".BBBRRRRRRRS....",
      ".SSBBSSBRRRRRR..",
      "SSSSBSSBSSBSSRR.",
      "SSSSBSSBSSBBS...",
      "SSBSRSSSBSSSSSS.",
      "SBSBRRSSSSSBSSSS",
      "SSBRRBBSSBBBBSSS",
      "...RBBBSSSSBBBB.",
      "..RRBBBBBSSSSS..",
      "..RBBSSSBBRRRBB.",
      "..RBSSSSSRRRBBB.",
      "..RBSSSSSBBRBBB.",
      "....SSSSSBBBBBBB",
      "..RRRSBSSBBBBBBB",
      "..RRRRSSBBBBBBBB",
      "..RRRRRRRBBBBBBB",
      "...RRRRRRRBBBBBB",
      "....BBBRRRRRBBB.",
      ".....BBBBBRRRRR.",
      "..BBBBBBBBRRRRR.",
      "..BSSSSBBBBRRR..",
      "..BSSSSSSBBR....",
      "....RRRRSSB.....",
      "B..RRRRRRR......",
      "BB..BRRRR.......",
      "BBBBBBBRR.......",
      ".BBBBBBB........",
      "..BBBBBB........",
      "...BBBB.........",
      "....BBB........."
    ];

    const superFlag = [
      "................",
      "................",
      ".......RRRRR....",
      ".....RRRRRRS....",
      "....RRRRRRSS....",
      "....RRRRRRRRRRR.",
      "....BBBSSBSSS...",
      "...BSSBSSBBSSSS.",
      "...BSSBBSSSSSSSS",
      "..BBSSBBSSSBSSSS",
      "..BBSSSSSBBBBBB.",
      "...BBSSSSSBBBBB.",
      ".....BSSSSSSSS..",
      "....BRRRSSS.....",
      "...BRBBBRB......",
      "...BRBBBBRB.....",
      "..BBRBBBBBRRSS..",
      "..BRRBBBBBBBSSSS",
      "..BRRRBBBBBBSSSS",
      "...RRRBBBBBBBSSS",
      "...RRRRBBBBBBSSS",
      "...RRRRRRBBBR...",
      "...RRRRRRRRRR...",
      "...RRRRRRRRRB...",
      "...RRRRRRRRRR.BB",
      "...RRRRRRRRRBBBB",
      "....RRRRRRRRBBBB",
      "....RRRRRRRRBBBB",
      ".....RRRRRRRBBBB",
      "................",
      "................",
      "................"
    ];

    const superThrow = [
      "......RRRRR.....",
      "....RRRRRRBS....",
      "...RRRRRRBBS....",
      "...RRRRRRRRRRR..",
      "...BBBSSBSSS....",
      "..BSSBSSBBSSSS..",
      "..BSSBBSSSSSSSSS",
      ".BBSSBBSSSSSSSS.",
      ".BBSSSSSBBSBBBB.",
      ".BBBSSSSSBSSSSS.",
      "...BBSSSSSSSSSS.",
      "....RSSSSSSB....",
      "....BRBBBBRB....",
      "...BBRBBBBRBB...",
      "..BBBRBBBBRBBB..",
      ".BBBBRBBBBRBBBB.",
      ".BBBRRBBBBRRBBB.",
      "BBBBRRBBBBRRBBBB",
      "BBBBRRRRRRRRBBBB",
      "BBBBRBRRRRBRBBBB",
      "SSSSRRRRRRRRSS..",
      "SSSSRRRRRRRRSSSS",
      ".SSSRRRRRRRRSSSS",
      ".SSRRRRRRRRRRSSS",
      "..RRRRRRRRRRRR..",
      ".RRRRRR..RRRRRR.",
      ".RRRRR....RRRRR.",
      ".RRRRR....RRRRR.",
      "..BBBB....BBBB..",
      "..BBBB....BBBB..",
      "BBBBBB....BBBBBB",
      "BBBBBB....BBBBBB"
    ];

    const buildSmall = (map: Record<string, string>) => ({
      idle: createPixelCanvas(16, 16, smallIdle, map),
      walk1: createPixelCanvas(16, 16, smallWalk1, map),
      walk2: createPixelCanvas(16, 16, smallWalk2, map),
      walk3: createPixelCanvas(16, 16, smallWalk3, map),
      jump: createPixelCanvas(16, 16, smallJump, map),
      skid: createPixelCanvas(16, 16, smallSkid, map),
      die: createPixelCanvas(16, 16, smallDie, map),
      flag: createPixelCanvas(16, 16, smallFlag, map),
    });

    const buildSuper = (map: Record<string, string>) => ({
      idle: createPixelCanvas(16, 32, superIdle, map),
      walk1: createPixelCanvas(16, 32, superWalk1, map),
      walk2: createPixelCanvas(16, 32, superWalk2, map),
      walk3: createPixelCanvas(16, 32, superWalk3, map),
      jump: createPixelCanvas(16, 32, superJump, map),
      crouch: createPixelCanvas(16, 32, superCrouch, map),
      skid: createPixelCanvas(16, 32, superSkid, map),
      flag: createPixelCanvas(16, 32, superFlag, map),
      throw: createPixelCanvas(16, 32, superThrow, map),
    });

    // 1. Mario Small (Original, Fire, Alt Starman)
    const fireSmallMap: Record<string, string> = {
      '.': 'transparent',
      'R': COLORS.FIRE_WHITE,
      'B': COLORS.FIRE_RED,
      'S': COLORS.FIRE_SKIN,
      'Y': COLORS.WHITE
    };
    const altSmallMap: Record<string, string> = {
      '.': 'transparent',
      'R': COLORS.GROUND_ORANGE,
      'B': COLORS.BLACK,
      'S': COLORS.MARIO_SKIN,
      'Y': COLORS.GROUND_ORANGE
    };

    this.marioSmall = buildSmall(smallMap);
    this.marioSmallFire = buildSmall(fireSmallMap);
    this.marioSmallAlt = buildSmall(altSmallMap);

    // 2. Mario Super & Fire & Alt Starman (16x32)
    const fireMap: Record<string, string> = {
      '.': 'transparent',
      'R': COLORS.FIRE_WHITE,
      'B': COLORS.FIRE_RED,
      'S': COLORS.FIRE_SKIN
    };
    const altSuperMap: Record<string, string> = {
      '.': 'transparent',
      'R': COLORS.GROUND_ORANGE,
      'B': COLORS.BLACK,
      'S': COLORS.MARIO_SKIN
    };

    this.marioSuper = buildSuper(superMap);
    this.marioFire = buildSuper(fireMap);
    this.marioSuperAlt = buildSuper(altSuperMap);

    // 3. Luigi Small & Super
    const luigiSmallMap: Record<string, string> = {
      '.': 'transparent',
      'R': COLORS.PIPE_MID_GREEN,
      'B': COLORS.WHITE,
      'S': COLORS.MARIO_SKIN,
      'Y': COLORS.WHITE
    };
    this.luigiSmall = buildSmall(luigiSmallMap);
    this.luigiSmallFire = this.marioSmallFire;
    this.luigiSmallAlt = this.marioSmallAlt;

    const luigiSuperMap: Record<string, string> = {
      '.': 'transparent',
      'R': COLORS.PIPE_MID_GREEN,
      'B': COLORS.WHITE,
      'S': COLORS.MARIO_SKIN
    };
    this.luigiSuper = buildSuper(luigiSuperMap);
    this.luigiSuperAlt = this.marioSuperAlt;
    this.luigiFire = this.marioFire;

    // Title Screen Mushroom Cursor (8x8)
    const cursorMap: Record<string, string> = {
      '.': 'transparent',
      'R': COLORS.MUSHROOM_RED,
      'W': COLORS.WHITE,
      'B': COLORS.BLACK,
      'S': COLORS.MARIO_SKIN
    };
    const cursorRows = [
      "...RR...",
      ".RRWWRR.",
      "RWWWWWRR",
      "RWWWWWRR",
      "RRRRRRRR",
      ".SSSSSS.",
      "..SSSS..",
      "........"
    ];
    this.ui['mushroom_cursor'] = createPixelCanvas(8, 8, cursorRows, cursorMap);
  }

  // -------------------------------------------------------------
  // ENEMIES (Goomba, Koopa Troopa)
  // -------------------------------------------------------------
  private static generateEnemies() {
    // 1. Goomba (16x16)
    const goombaMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.GOOMBA_BLACK,
      'R': COLORS.GOOMBA_BROWN,
      'S': COLORS.GOOMBA_SKIN
    };

    const goombaWalk1 = [
      "......RRRR......",
      "....RRRRRRRR....",
      "...RRRRRRRRRR...",
      "..RRRRRRRRRRRR..",
      "..RRBBRRRRBBRR..",
      ".RRBSSBRRBSSBRR.",
      ".RRBSSBRRBSSBRR.",
      ".RRBSSBRRBSSBRR.",
      ".RRBBBSSSSBBBRR.",
      "RRRRSSSSSSSSRRRR",
      "RRRRSSSSSSSSRRRR",
      ".RRRSSSSSSSSRRR.",
      "...SSSSSSSSSS...",
      "..BBBB....BBBB..",
      ".BBBB......BBBB.",
      ".BBBB......BBBB."
    ];

    const goombaWalk2 = [
      "......RRRR......",
      "....RRRRRRRR....",
      "...RRRRRRRRRR...",
      "..RRRRRRRRRRRR..",
      "..RRBBRRRRBBRR..",
      ".RRBSSBRRBSSBRR.",
      ".RRBSSBRRBSSBRR.",
      ".RRBSSBRRBSSBRR.",
      ".RRBBBSSSSBBBRR.",
      "RRRRSSSSSSSSRRRR",
      "RRRRSSSSSSSSRRRR",
      ".RRRSSSSSSSSRRR.",
      "...SSSSSSSSSS...",
      "..BBBBBB..BBBB..",
      ".BBBBBBB..BBBB..",
      "..........BBBB.."
    ];

    const goombaFlat = [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "......RRRR......",
      "....RRRRRRRR....",
      "...RRBBRRRRBBRR.",
      "..RRBSSBRRBSSBRR",
      ".RRBBBSSSSBBBRRR",
      "RRRRSSSSSSSSRRRR",
      "..BBBBBBBBBBBB..",
      ".BBBBBBBBBBBBBB."
    ];

    this.enemies['goomba_walk1'] = createPixelCanvas(16, 16, goombaWalk1, goombaMap);
    this.enemies['goomba_walk2'] = createPixelCanvas(16, 16, goombaWalk2, goombaMap);
    this.enemies['goomba_flat'] = createPixelCanvas(16, 16, goombaFlat, goombaMap);
    this.enemies['goomba_dead'] = flipCanvasV(this.enemies['goomba_walk1']);

    // 2. Koopa Troopa (16x24 standard NES size)
    const koopaMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'G': COLORS.KOOPA_GREEN,
      'Y': COLORS.KOOPA_YELLOW,
      'W': COLORS.KOOPA_WHITE
    };

    const koopaWalk1 = [
      ".....GGGG.......",
      "....GGGGGG......",
      "...GYYGGYYG.....",
      "...GYYGGYYG.....",
      "...GYBGGYBG.....",
      "...GGGGGGGG.....",
      "....GGGGGG......",
      ".....GGGG.......",
      "....GGGGGG......",
      "...GGWWWWGG.....",
      "..GGWGGGGWGG....",
      "..GGWGGGGWGG....",
      "..GGWWWWWWGG....",
      "..GGWGGGGWGG....",
      "..GGWGGGGWGG....",
      "...GGWWWWGG.....",
      "....GGGGGG......",
      "....YY..YY......",
      "...YYYY.YYYY....",
      "...YYYY.YYYY....",
      "....YY...YY.....",
      "................",
      "................",
      "................"
    ];

    const koopaWalk2 = [
      ".....GGGG.......",
      "....GGGGGG......",
      "...GYYGGYYG.....",
      "...GYYGGYYG.....",
      "...GYBGGYBG.....",
      "...GGGGGGGG.....",
      "....GGGGGG......",
      ".....GGGG.......",
      "....GGGGGG......",
      "...GGWWWWGG.....",
      "..GGWGGGGWGG....",
      "..GGWGGGGWGG....",
      "..GGWWWWWWGG....",
      "..GGWGGGGWGG....",
      "..GGWGGGGWGG....",
      "...GGWWWWGG.....",
      "....GGGGGG......",
      ".....YY.YY......",
      "....YYYYYYYY....",
      "....YYYY.YY.....",
      ".....YY.........",
      "................",
      "................",
      "................"
    ];

    // Koopa Shell (16x16)
    const koopaShellRows = [
      ".....BBBBBB.....",
      "...BBGGGGGGBB...",
      "..BGGGGGGGGGGB..",
      ".BGGWWWWWWWWGGB.",
      ".BGWGGGGGGGGWGB.",
      "BGGWGGGGGGGGWGGB",
      "BGGWWWWWWWWWWGGB",
      "BGGWGGGGGGGGWGGB",
      "BGGWGGGGGGGGWGGB",
      "BGGWWWWWWWWWWGGB",
      "BGGWGGGGGGGGWGGB",
      ".BGWGGGGGGGGWGB.",
      ".BGGWWWWWWWWGGB.",
      "..BGGGGGGGGGGB..",
      "...BBGGGGGGBB...",
      ".....BBBBBB....."
    ];

    this.enemies['koopa_walk1'] = createPixelCanvas(16, 24, koopaWalk1, koopaMap);
    this.enemies['koopa_walk2'] = createPixelCanvas(16, 24, koopaWalk2, koopaMap);
    this.enemies['koopa_shell'] = createPixelCanvas(16, 16, koopaShellRows, koopaMap);
    this.enemies['koopa_dead'] = flipCanvasV(this.enemies['koopa_shell']);

    // 3. Piranha Plant (16x24, 2 Frames: Open mouth & Closed mouth)
    const piranhaMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'G': COLORS.PIPE_MID_GREEN,
      'L': COLORS.PIPE_LIGHT_GREEN,
      'D': COLORS.PIPE_DARK_GREEN,
      'W': COLORS.WHITE
    };

    const piranha0 = [
      "......GGGG......",
      ".....GGGGGG.....",
      "....GGWWWWGG....",
      "...GGWGGGGWGG...",
      "...GGWGGGGWGG...",
      "..GGWWWWWWWWGG..",
      "..GGWWWWWWWWGG..",
      "..GGW.WWWW.WGG..",
      "..GGW......WGG..",
      "...GGWWWWWWGG...",
      "....GGGGGGGG....",
      ".....GGGGGG.....",
      "......GGGG......",
      ".......GG.......",
      "......GGGG......",
      ".....GGGGGG.....",
      ".....GGGGGG.....",
      "......GGGG......",
      ".......GG.......",
      ".......GG.......",
      ".......GG.......",
      ".......GG.......",
      ".......GG.......",
      ".......GG......."
    ];

    const piranha1 = [
      "......GGGG......",
      ".....GGGGGG.....",
      "....GGWWWWGG....",
      "...GGWGGGGWGG...",
      "...GGWGGGGWGG...",
      "..GGWWWWWWWWGG..",
      "..GGWWWWWWWWGG..",
      "..GGWWWWWWWWGG..",
      "..GGWWWWWWWWGG..",
      "...GGWWWWWWGG...",
      "....GGGGGGGG....",
      ".....GGGGGG.....",
      "......GGGG......",
      ".......GG.......",
      "......GGGG......",
      ".....GGGGGG.....",
      ".....GGGGGG.....",
      "......GGGG......",
      ".......GG.......",
      ".......GG.......",
      ".......GG.......",
      ".......GG.......",
      ".......GG.......",
      ".......GG......."
    ];

    this.enemies['piranha_0'] = createPixelCanvas(16, 24, piranha0, piranhaMap);
    this.enemies['piranha_1'] = createPixelCanvas(16, 24, piranha1, piranhaMap);
  }

  // -------------------------------------------------------------
  // ITEMS (Mushroom, Fire Flower, Starman, Coins)
  // -------------------------------------------------------------
  private static generateItems() {
    // 1. Super Mushroom (16x16)
    const mushMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'R': COLORS.MUSHROOM_RED,
      'W': COLORS.MUSHROOM_WHITE,
      'S': COLORS.MUSHROOM_SKIN
    };
    const mushRows = [
      ".....BBBBBB.....",
      "...BBRRRRRRBB...",
      "..BRRWWWWWWWRRB.",
      ".BRWWWRRRRWWWRB.",
      ".BRWWWRRRRWWWRB.",
      "BRRRRRRRRRRRRRRB",
      "BRRRRRRRRRRRRRRB",
      "BRRWWWRRRRWWWRRB",
      "BWWWWWWWWWWWWWWB",
      "BWWBBWWWWWWBBWWB",
      "BWWBBWWWWWWBBWWB",
      ".BSSSSSSSSSSSSB.",
      "..BSSSSSSSSSSB..",
      "...BBSSSSSSBB...",
      ".....BBBBBB.....",
      "................"
    ];
    this.items['mushroom'] = createPixelCanvas(16, 16, mushRows, mushMap);

    // 1-UP Mushroom (Green)
    const oneUpMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'R': COLORS.PIPE_MID_GREEN,
      'W': COLORS.MUSHROOM_WHITE,
      'S': COLORS.MUSHROOM_SKIN
    };
    this.items['1up'] = createPixelCanvas(16, 16, mushRows, oneUpMap);

    // 2. Fire Flower (16x16, 4 color frames)
    const flowerMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'O': COLORS.MARIO_RED,
      'Y': COLORS.QUESTION_YELLOW,
      'W': COLORS.WHITE,
      'G': COLORS.PIPE_MID_GREEN
    };
    const flowerRows = [
      ".....BBBBBB.....",
      "...BBOOOOOOBB...",
      "..BOOWWWWWWOOB..",
      ".BOOWWYYYYWWOOB.",
      ".BOOWYYYYYYWOOB.",
      ".BOOWYYYYYYWOOB.",
      ".BOOWWYYYYWWOOB.",
      "..BOOWWWWWWOOB..",
      "...BBOOOOOOBB...",
      ".....BBGGBB.....",
      "....BGGGGGGB....",
      "...BGGGBBGGGB...",
      "..BGGGGBBGGGGB..",
      "....BBB..BBB....",
      "................",
      "................"
    ];
    this.items['flower'] = createPixelCanvas(16, 16, flowerRows, flowerMap);

    // 3. Starman (16x16)
    const starMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'Y': COLORS.STAR_YELLOW,
      'O': COLORS.STAR_ORANGE
    };
    const starRows = [
      ".......BB.......",
      "......BYYB......",
      "......BYYB......",
      ".....BYYYYB.....",
      "BBBBBYYYYYBBBBB.",
      ".BYYYYYYYYYYYB..",
      "..BYBBBYBBBYB...",
      "...BYBBYBBYB....",
      "..BYYYYYYYYYB...",
      ".BYYYYYYYYYYYB..",
      ".BYYYBBYYBBBYB..",
      "BBYYB.BYYB.BYYBB",
      "BYYB..BYYB..BYYB",
      "BYB....BB....BYB",
      "BB............BB",
      "................"
    ];
    this.items['star'] = createPixelCanvas(16, 16, starRows, starMap);

    // 4. Coin (4 Animation Frames: Full, 3/4, Half, Line)
    const coinMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.COIN_DARK,
      'Y': COLORS.COIN_GOLD,
      'W': COLORS.WHITE
    };
    const coinRows0 = [
      ".....BBBBBB.....",
      "...BBYYYYYYBB...",
      "..BYYWWWWWWYYB..",
      ".BYWWYYYYYYWWYB.",
      ".BYWYYYYYYYYWYB.",
      "BYWYYYYYYYYYYWYB",
      "BYWYYYYBBYYYYWYB",
      "BYWYYYYBBYYYYWYB",
      "BYWYYYYBBYYYYWYB",
      "BYWYYYYBBYYYYWYB",
      "BYWYYYYYYYYYYWYB",
      ".BYWYYYYYYYYWYB.",
      ".BYWWYYYYYYWWYB.",
      "..BYYWWWWWWYYB..",
      "...BBYYYYYYBB...",
      ".....BBBBBB....."
    ];
    const coinRows1 = [
      "......BBBB......",
      "....BBYYYYBB....",
      "...BYYWWWWYYB...",
      "..BYWWYYYYWWYB..",
      "..BYWYYYYYYWYB..",
      ".BYWYYYYYYYYWYB.",
      ".BYWYYYBYYYYWYB.",
      ".BYWYYYBYYYYWYB.",
      ".BYWYYYBYYYYWYB.",
      ".BYWYYYBYYYYWYB.",
      ".BYWYYYYYYYYWYB.",
      "..BYWYYYYYYWYB..",
      "..BYWWYYYYWWYB..",
      "...BYYWWWWYYB...",
      "....BBYYYYBB....",
      "......BBBB......"
    ];
    const coinRows2 = [
      ".......BB.......",
      ".....BBYYBB.....",
      "....BYYWWYYB....",
      "...BYWWYYWWYB...",
      "...BYWYYYYWYB...",
      "..BYWYYYYYYWYB..",
      "..BYWYYBYYYWYB..",
      "..BYWYYBYYYWYB..",
      "..BYWYYBYYYWYB..",
      "..BYWYYBYYYWYB..",
      "..BYWYYYYYYWYB..",
      "...BYWYYYYWYB...",
      "...BYWWYYWWYB...",
      "....BYYWWYYB....",
      ".....BBYYBB.....",
      ".......BB......."
    ];
    const coinRows3 = [
      "........B.......",
      ".......BYB......",
      "......BYWYB.....",
      ".....BYWWWYB....",
      ".....BYWWWYB....",
      ".....BYWWWYB....",
      ".....BYWWWYB....",
      ".....BYWWWYB....",
      ".....BYWWWYB....",
      ".....BYWWWYB....",
      ".....BYWWWYB....",
      ".....BYWWWYB....",
      ".....BYWWWYB....",
      "......BYWYB.....",
      ".......BYB......",
      "........B......."
    ];
    this.items['coin_0'] = createPixelCanvas(16, 16, coinRows0, coinMap);
    this.items['coin_1'] = createPixelCanvas(16, 16, coinRows1, coinMap);
    this.items['coin_2'] = createPixelCanvas(16, 16, coinRows2, coinMap);
    this.items['coin_3'] = createPixelCanvas(16, 16, coinRows3, coinMap);
  }

  // -------------------------------------------------------------
  // SCENERY (Clouds, Bushes, Hills)
  // -------------------------------------------------------------
  private static generateScenery() {
    // Clouds & Bushes in Super Mario Bros share the exact same shape!
    // Clouds use White/Sky Border, Bushes use Green/Black Border.
    const cloudMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.CLOUD_BLUE_BORDER,
      'W': COLORS.CLOUD_WHITE
    };
    const bushMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'W': COLORS.PIPE_LIGHT_GREEN
    };

    const cloudLeft = [
      ".......BBBBB....",
      ".....BBWWWWWB...",
      "....BWWWWWWWWB..",
      "...BWWWWWWWWWWB.",
      "..BWWWWWWWWWWWWB",
      ".BWWWWWWWWWWWWWB",
      ".BWWWWWWWWWWWWWB",
      "BWWWWWWWWWWWWWWX",
      "BWWWWWWWWWWWWWWX",
      "BWWWWWWWWWWWWWWX",
      "BWWWWWWWWWWWWWWX",
      "BWWWWWWWWWWWWWWX",
      ".BWWWWWWWWWWWWWB",
      ".BWWWWWWWWWWWWWB",
      "..BBWWWWWWWWWBB.",
      "....BBBBBBBBB..."
    ].map(r => r.replace(/X/g, 'W'));

    const cloudMid = [
      "BBBBBBBBBBBBBBBB",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWW",
      "BBBBBBBBBBBBBBBB"
    ];

    const cloudRight = [
      "....BBBBB.......",
      "...BWWWWWBB.....",
      "..BWWWWWWWWWB...",
      ".BWWWWWWWWWWWB..",
      "BWWWWWWWWWWWWWB.",
      "BWWWWWWWWWWWWWB.",
      "BWWWWWWWWWWWWWB.",
      "XWWWWWWWWWWWWWWX",
      "XWWWWWWWWWWWWWWX",
      "XWWWWWWWWWWWWWWX",
      "XWWWWWWWWWWWWWWX",
      "XWWWWWWWWWWWWWWX",
      "BWWWWWWWWWWWWWB.",
      "BWWWWWWWWWWWWWB.",
      ".BBWWWWWWWWWBB..",
      "...BBBBBBBBB...."
    ].map(r => r.replace(/X/g, 'W'));

    this.scenery['cloud_left'] = createPixelCanvas(16, 16, cloudLeft, cloudMap);
    this.scenery['cloud_mid'] = createPixelCanvas(16, 16, cloudMid, cloudMap);
    this.scenery['cloud_right'] = createPixelCanvas(16, 16, cloudRight, cloudMap);

    this.scenery['bush_left'] = createPixelCanvas(16, 16, cloudLeft, bushMap);
    this.scenery['bush_mid'] = createPixelCanvas(16, 16, cloudMid, bushMap);
    this.scenery['bush_right'] = createPixelCanvas(16, 16, cloudRight, bushMap);

    // Hill segments (16x16)
    const hillMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'G': COLORS.PIPE_LIGHT_GREEN,
      'D': COLORS.PIPE_DARK_GREEN
    };
    const hillTop = [
      ".......BB.......",
      "......BGGDB.....",
      ".....BGGGGDB....",
      "....BGGGGGGDB...",
      "...BGGGGGGGGDB..",
      "..BGGGGGGGGGGDB.",
      ".BGGGGGGGGGGGGDB",
      "BGGGGGGGGGGGGGGX",
      "BGGGGGGGGGGGGGGX",
      "BGGGGGGGGGGGGGGX",
      "BGGGGGGGGGGGGGGX",
      "BGGGGGGGGGGGGGGX",
      "BGGGGGGGGGGGGGGX",
      "BGGGGGGGGGGGGGGX",
      "BGGGGGGGGGGGGGGX",
      "BGGGGGGGGGGGGGGX"
    ].map(r => r.replace(/X/g, 'D'));
    this.scenery['hill_top'] = createPixelCanvas(16, 16, hillTop, hillMap);

    const hillFill = [
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGG"
    ];
    this.scenery['hill_fill'] = createPixelCanvas(16, 16, hillFill, hillMap);
  }

  // -------------------------------------------------------------
  // PARTICLES (Brick chunks, Skid smoke, Fireball)
  // -------------------------------------------------------------
  private static generateParticles() {
    const brickChunkMap: Record<string, string> = {
      '.': 'transparent',
      'B': COLORS.BLACK,
      'M': COLORS.BRICK_MID,
      'L': COLORS.BRICK_LIGHT
    };
    const chunkRows = [
      "BBBBBBBB",
      "BLLLLLMB",
      "BLLLLLMB",
      "BMMMMMMB",
      "BMMMMMMB",
      "BMMMMMMB",
      "BBBBBBBB",
      "........"
    ];
    this.particles['brick_chunk'] = createPixelCanvas(8, 8, chunkRows, brickChunkMap);

    const smokeMap: Record<string, string> = {
      '.': 'transparent',
      'W': COLORS.WHITE,
      'B': COLORS.BLACK
    };
    const smokeRows = [
      "..BBBB..",
      ".BWWWWWB",
      "BWWWWWWWB",
      "BWWWWWWWB",
      "BWWWWWWWB",
      ".BWWWWWB",
      "..BBBB..",
      "........"
    ];
    this.particles['smoke'] = createPixelCanvas(8, 8, smokeRows, smokeMap);

    // Fireball
    const fireMap: Record<string, string> = {
      '.': 'transparent',
      'R': COLORS.MARIO_RED,
      'Y': COLORS.QUESTION_YELLOW,
      'W': COLORS.WHITE
    };
    const fireRows = [
      "..RRRR..",
      ".RYYYYRR",
      "RYYYYYYR",
      "RYWWWWYR",
      "RYWWWWYR",
      "RYYYYYYR",
      ".RYYYYRR",
      "..RRRR.."
    ];
    this.particles['fireball'] = createPixelCanvas(8, 8, fireRows, fireMap);
  }
}
