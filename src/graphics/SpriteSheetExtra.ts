// Additional NES Sprites for Bowser, Peach, Toad, Castle/Underwater Tiles & Expanded Enemies
import { SpriteSheet, createPixelCanvas, flipCanvasH, flipCanvasV } from './SpriteSheet';

export function initExtraSprites() {
  // -------------------------------------------------------------
  // 1. CASTLE & UNDERWATER TILES
  // -------------------------------------------------------------

  // Bridge Tile (16x16)
  const bridgeMap = {
    '.': 'transparent',
    'O': '#fc9838',
    'B': '#881400',
    'D': '#000000',
  };
  const bridgeRows = [
    "OOOOOOOOOOOOOOOO",
    "OBBBBBBBBBBBBBBO",
    "OBDDDDDDDDDDDDBO",
    "OBDDDDDDDDDDDDBO",
    "OBBBBBBBBBBBBBBO",
    "OBDDDDDDDDDDDDBO",
    "OBDDDDDDDDDDDDBO",
    "OBBBBBBBBBBBBBBO",
    "OBDDDDDDDDDDDDBO",
    "OBDDDDDDDDDDDDBO",
    "OBBBBBBBBBBBBBBO",
    "OBDDDDDDDDDDDDBO",
    "OBDDDDDDDDDDDDBO",
    "OBBBBBBBBBBBBBBO",
    "OBDDDDDDDDDDDDBO",
    "DDDDDDDDDDDDDDDD"
  ];
  SpriteSheet.tiles['bridge'] = createPixelCanvas(16, 16, bridgeRows, bridgeMap);

  // Axe (16x16 golden axe)
  const axeMap = {
    '.': 'transparent',
    'Y': '#f8b800',
    'O': '#f85800',
    'W': '#ffffff',
    'D': '#000000',
  };
  const axeRows = [
    "....DDDDDDD.....",
    "...DYYYYYYYD....",
    "..DYYWWWWYYD....",
    ".DYYWWWWWWYYD...",
    ".DYYWWWWWWYYD...",
    "..DYYWWWWYYD....",
    "...DYYYYYYYD....",
    "....DDDDDDD.....",
    ".......OD.......",
    ".......OD.......",
    ".......OD.......",
    ".......OD.......",
    ".......OD.......",
    ".......OD.......",
    ".......OD.......",
    "......DDDD......"
  ];
  SpriteSheet.tiles['axe'] = createPixelCanvas(16, 16, axeRows, axeMap);

  // Chain link (16x16)
  const chainMap = {
    '.': 'transparent',
    'W': '#ffffff',
    'D': '#888888',
    'B': '#000000',
  };
  const chainRows = [
    "................",
    "................",
    ".....BBBBBB.....",
    "....BWWWWWWB....",
    "....BWDBBDWB....",
    "....BWDBBDWB....",
    "....BWWWWWWB....",
    ".....BBBBBB.....",
    ".....BBBBBB.....",
    "....BWWWWWWB....",
    "....BWDBBDWB....",
    "....BWDBBDWB....",
    "....BWWWWWWB....",
    ".....BBBBBB.....",
    "................",
    "................"
  ];
  SpriteSheet.tiles['chain'] = createPixelCanvas(16, 16, chainRows, chainMap);

  // Lava Top (16x16)
  const lavaMap = {
    '.': 'transparent',
    'R': '#d82800',
    'O': '#fc9838',
    'Y': '#f8b800',
    'W': '#ffffff',
  };
  const lavaRows = [
    "WWOOWWOOWWOOWWOO",
    "OOOOOOOOOOOOOOOO",
    "OORROORROORROORR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRR"
  ];
  SpriteSheet.tiles['lava_top'] = createPixelCanvas(16, 16, lavaRows, lavaMap);

  // Underwater Coral (16x16)
  const coralMap = {
    '.': 'transparent',
    'P': '#fc7460',
    'W': '#ffffff',
    'D': '#000000',
  };
  const coralRows = [
    "..DPPPD...DPPPD.",
    ".DPPWWPD.DPPWWPD",
    ".DPWWWPPDDPWWPPD",
    "..DPPWPPDDPPWPPD",
    "...DPPPD...DPPPD",
    "....DPD.....DPD.",
    "....DPD.....DPD.",
    "....DPPPDPPPPD..",
    "...DPPWWPPWWPD..",
    "...DPWWWWWWWPD..",
    "....DPPWWWWPD...",
    ".....DPPPPD.....",
    "......DPPD......",
    "......DPPD......",
    "......DPPD......",
    ".....DDDDDD....."
  ];
  SpriteSheet.tiles['coral'] = createPixelCanvas(16, 16, coralRows, coralMap);

  // -------------------------------------------------------------
  // 2. EXPANDED ENEMIES
  // -------------------------------------------------------------

  // Buzzy Beetle (16x16 blue shell)
  const buzzyMap = {
    '.': 'transparent',
    'B': '#002a88',
    'U': '#007c8d',
    'Y': '#f7d8a5',
    'D': '#000000',
  };
  const buzzyWalk1 = [
    "......DDDDDD....",
    "....DDBUUUUBDD..",
    "...DBBUUUUUUBBD.",
    "..DBUUUUUUUUUUBD",
    ".DBUUUUUUUUUUUUB",
    "DBUUUUBBUUBBUUUB",
    "DBUUUUBBUUBBUUUB",
    "DBUUUUUUUUUUUUUB",
    "DBUUUUUUUUUUUUUB",
    ".DBUUUUUUUUUUUBD",
    "..DBBUUUUUUBBDD.",
    "...DDBUUUUBDD...",
    "....DDDDDDDD....",
    "...DYD....DYD...",
    "..DYYD....DYYD..",
    "..DDDD....DDDD.."
  ];
  const buzzyWalk2 = [
    "......DDDDDD....",
    "....DDBUUUUBDD..",
    "...DBBUUUUUUBBD.",
    "..DBUUUUUUUUUUBD",
    ".DBUUUUUUUUUUUUB",
    "DBUUUUBBUUBBUUUB",
    "DBUUUUBBUUBBUUUB",
    "DBUUUUUUUUUUUUUB",
    "DBUUUUUUUUUUUUUB",
    ".DBUUUUUUUUUUUBD",
    "..DBBUUUUUUBBDD.",
    "...DDBUUUUBDD...",
    "....DDDDDDDD....",
    "....DYD..DYD....",
    "...DYYD..DYYD...",
    "...DDDD..DDDD..."
  ];
  const buzzyShell = [
    "......DDDDDD....",
    "....DDBUUUUBDD..",
    "...DBBUUUUUUBBD.",
    "..DBUUUUUUUUUUBD",
    ".DBUUUUUUUUUUUUB",
    "DBUUUUBBUUBBUUUB",
    "DBUUUUBBUUBBUUUB",
    "DBUUUUUUUUUUUUUB",
    "DBUUUUUUUUUUUUUB",
    ".DBUUUUUUUUUUUBD",
    "..DBBUUUUUUBBDD.",
    "...DDBUUUUBDD...",
    "....DDDDDDDD....",
    "................",
    "................",
    "................"
  ];
  SpriteSheet.enemies['buzzy_beetle_walk1'] = createPixelCanvas(16, 16, buzzyWalk1, buzzyMap);
  SpriteSheet.enemies['buzzy_beetle_walk2'] = createPixelCanvas(16, 16, buzzyWalk2, buzzyMap);
  SpriteSheet.enemies['buzzy_shell'] = createPixelCanvas(16, 16, buzzyShell, buzzyMap);
  SpriteSheet.enemies['buzzy_beetle_dead'] = flipCanvasV(SpriteSheet.enemies['buzzy_shell']);

  // Red Koopa (16x24 red palette)
  const redKoopaMap = {
    '.': 'transparent',
    'G': '#d82800', // Red shell
    'Y': '#f7d8a5',
    'W': '#ffffff',
    'B': '#000000',
  };
  const koopaWalk1Rows = [
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
    "....YYYY.YY.....",
    "...YYYY.YYYY....",
    "....YY...YY.....",
    "................",
    "................",
    "................"
  ];
  SpriteSheet.enemies['red_koopa_walk1'] = createPixelCanvas(16, 24, koopaWalk1Rows, redKoopaMap);
  SpriteSheet.enemies['red_koopa_walk2'] = createPixelCanvas(16, 24, koopaWalk1Rows, redKoopaMap);
  SpriteSheet.enemies['red_koopa_shell'] = createPixelCanvas(16, 16, buzzyShell, redKoopaMap);
  SpriteSheet.enemies['red_koopa_dead'] = flipCanvasV(SpriteSheet.enemies['red_koopa_shell']);

  // Paratroopa (Green & Red with wings)
  SpriteSheet.enemies['paratroopa_walk1'] = SpriteSheet.enemies['koopa_walk1'];
  SpriteSheet.enemies['paratroopa_walk2'] = SpriteSheet.enemies['koopa_walk2'];
  SpriteSheet.enemies['red_paratroopa_walk1'] = SpriteSheet.enemies['red_koopa_walk1'];
  SpriteSheet.enemies['red_paratroopa_walk2'] = SpriteSheet.enemies['red_koopa_walk2'];

  // Hammer Bro (16x24)
  const hammerBroMap = {
    '.': 'transparent',
    'H': '#000000', // Black helmet
    'G': '#00a800', // Green skin/body
    'Y': '#f7d8a5',
    'W': '#ffffff',
  };
  const hammerBroRows = [
    "....HHHHHH......",
    "...HHHHHHHH.....",
    "..HHHYYYHYYH....",
    "..HHHYYYHYYH....",
    "...HHHHHHHH.....",
    "....HHHHHH......",
    "....GGGGGG......",
    "...GGWWWWGG.....",
    "..GGWGGGGWGG....",
    "..GGWWWWWWGG....",
    "..GGWGGGGWGG....",
    "...GGWWWWGG.....",
    "....GGGGGG......",
    "....YY..YY......",
    "...YYYYYYYY.....",
    "..YYYY..YYYY....",
    "..YY......YY....",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ];
  SpriteSheet.enemies['hammer_bro_walk1'] = createPixelCanvas(16, 24, hammerBroRows, hammerBroMap);
  SpriteSheet.enemies['hammer_bro_walk2'] = flipCanvasH(SpriteSheet.enemies['hammer_bro_walk1']);
  SpriteSheet.enemies['hammer_bro_dead'] = flipCanvasV(SpriteSheet.enemies['hammer_bro_walk1']);

  // Blooper (16x24 white squid)
  const blooperMap = {
    '.': 'transparent',
    'W': '#ffffff',
    'B': '#000000',
    'D': '#888888',
  };
  const blooper0 = [
    ".....BBBBBB.....",
    "...BBWWWWWWBB...",
    "..BWWWWWWWWWWB..",
    ".BWWWWWWWWWWWWB.",
    "BWWWWWWWWWWWWWWB",
    "BWWBBWWWWWWBBWWB",
    "BWWBBWWWWWWBBWWB",
    "BWWWWWWWWWWWWWWB",
    ".BWWWWWWWWWWWWB.",
    "..BWWWWWWWWWWB..",
    "...BBWWWWWWBB...",
    "....BWWWWWWB....",
    "....BWWWWWWB....",
    "...BWWBBBBWWB...",
    "..BWWBB..BBWWB..",
    "..BWB......BWB..",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ];
  SpriteSheet.enemies['blooper_0'] = createPixelCanvas(16, 24, blooper0, blooperMap);
  SpriteSheet.enemies['blooper_1'] = createPixelCanvas(16, 24, blooper0, blooperMap);
  SpriteSheet.enemies['blooper_dead'] = flipCanvasV(SpriteSheet.enemies['blooper_0']);

  // Cheep Cheep (16x16)
  const cheepMap = {
    '.': 'transparent',
    'R': '#d82800',
    'W': '#ffffff',
    'Y': '#f8b800',
    'B': '#000000',
  };
  const cheep0 = [
    "......RRRR......",
    "....RRRRRRRR....",
    "...RRWWWRRRRR...",
    "..RRWBBWRRRRRR..",
    ".RRRWBBWRRRRRRR.",
    "RRRRWWWRRRRRRRRR",
    "RRRRRRRRRRRRRRRR",
    "YYRRRRRRRRRRRRYY",
    "YYYYRRRRRRRRYYYY",
    ".YYYYRRRRRRYYYY.",
    "..YYWWWWWWWWYY..",
    "...WWWWWWWWWW...",
    "....WWWWWWWW....",
    ".....WWWWWW.....",
    "......WWWW......",
    "................"
  ];
  SpriteSheet.enemies['cheep_cheep_0'] = createPixelCanvas(16, 16, cheep0, cheepMap);
  SpriteSheet.enemies['cheep_cheep_1'] = createPixelCanvas(16, 16, cheep0, cheepMap);
  SpriteSheet.enemies['flying_cheep_0'] = SpriteSheet.enemies['cheep_cheep_0'];
  SpriteSheet.enemies['flying_cheep_1'] = SpriteSheet.enemies['cheep_cheep_1'];
  SpriteSheet.enemies['cheep_cheep_dead'] = flipCanvasV(SpriteSheet.enemies['cheep_cheep_0']);

  // Lakitu (16x24)
  const lakituMap = {
    '.': 'transparent',
    'G': '#00a800',
    'W': '#ffffff',
    'Y': '#f7d8a5',
    'B': '#000000',
  };
  const lakituRows = [
    "....GGGGGG......",
    "...GGWWGGWWG....",
    "..GGWBBGGWBBG...",
    "..GGWWGGWWGG....",
    "...GGGGGGGG.....",
    "....YYYYYY......",
    ".....BBBB.......",
    "....BWWWWWB.....",
    "...BWWWWWWWB....",
    "..BWWWWWWWWWB...",
    ".BWWWWWWWWWWWB..",
    "BWWWWWWWWWWWWWB.",
    "BWWWWWWWWWWWWWB.",
    ".BWWWWWWWWWWWB..",
    "..BBBBBBBBBBB...",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ];
  SpriteSheet.enemies['lakitu_0'] = createPixelCanvas(16, 24, lakituRows, lakituMap);
  SpriteSheet.enemies['lakitu_dead'] = flipCanvasV(SpriteSheet.enemies['lakitu_0']);

  // Spiny (16x16 red spiky shell)
  const spinyMap = {
    '.': 'transparent',
    'R': '#d82800',
    'W': '#ffffff',
    'Y': '#f8b800',
    'B': '#000000',
  };
  const spinyRows = [
    "......W..W......",
    ".....WW..WW.....",
    "....WWRRRRWW....",
    "...WWRRRRRRWW...",
    "..WWRRRRRRRRWW..",
    ".WWRRRRRRRRRRWW.",
    "WWRRRRRRRRRRRRWW",
    "WWBRRRRRRRRRRBWW",
    "WWBRRRRRRRRRRBWW",
    ".WWRRRRRRRRRRWW.",
    "..WWRRRRRRRRWW..",
    "...WWYYYYYYWW...",
    "....YYYYYYYY....",
    "...YYY....YYY...",
    "..YYYY....YYYY..",
    "................"
  ];
  SpriteSheet.enemies['spiny_walk1'] = createPixelCanvas(16, 16, spinyRows, spinyMap);
  SpriteSheet.enemies['spiny_walk2'] = flipCanvasH(SpriteSheet.enemies['spiny_walk1']);
  SpriteSheet.enemies['spiny_dead'] = flipCanvasV(SpriteSheet.enemies['spiny_walk1']);

  // Bullet Bill (16x14)
  const bbillMap = {
    '.': 'transparent',
    'B': '#000000',
    'W': '#ffffff',
    'G': '#888888',
  };
  const bbillRows = [
    "....BBBBBBBB....",
    "..BBBBBBBBBBBB..",
    ".BBBBBBBBBBBBBB.",
    "BBBBWWBBBBBBBBBB",
    "BBBBWWBBBBBBBBBB",
    "BBBBBBBBBBBBBBBB",
    "BBBBBBBBWWWWWWBB",
    "BBBBBBBBWWWWWWBB",
    "BBBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBBB",
    ".BBBBBBBBBBBBBB.",
    "..BBBBBBBBBBBB..",
    "....BBBBBBBB....",
    "................"
  ];
  SpriteSheet.enemies['bullet_bill_0'] = createPixelCanvas(16, 14, bbillRows, bbillMap);
  SpriteSheet.enemies['bullet_bill_dead'] = flipCanvasV(SpriteSheet.enemies['bullet_bill_0']);

  // Podoboo (16x16 lava bubble)
  const podobooMap = {
    '.': 'transparent',
    'O': '#fc9838',
    'R': '#d82800',
    'W': '#ffffff',
    'B': '#000000',
  };
  const podobooRows = [
    ".......OO.......",
    "......OOOO......",
    ".....OOOOOO.....",
    "....OORRRROO....",
    "...OORWWWWROO...",
    "..OORWBBBBWROO..",
    "..OORWBBBBWROO..",
    ".OORRRWWWWROOOO.",
    ".OORRRRRRRROOOO.",
    "OORRRRRRRRRROOOO",
    "OORRRRRRRRRROOOO",
    ".OORRRRRRRROOOO.",
    "..OORRRRRROOOO..",
    "...OOOOOOOOOO...",
    "....OOOOOOOO....",
    "......OOOO......"
  ];
  SpriteSheet.enemies['podoboo'] = createPixelCanvas(16, 16, podobooRows, podobooMap);

  // -------------------------------------------------------------
  // 3. BOWSER (32x32 Boss)
  // -------------------------------------------------------------
  const bowserMap = {
    '.': 'transparent',
    'G': '#00a800', // Green body
    'O': '#fc9838', // Orange spikes & hair
    'Y': '#f8b800', // Yellow belly / snout
    'W': '#ffffff', // Horns, eyes, teeth
    'B': '#000000', // Black outlines
  };
  const bowserClosedRows = [
    "................OOO...WW........",
    "...............OOOO..WWWW.......",
    "..............OOOOO..WWWW.......",
    ".............OOOOOO..WWWW.......",
    "............OOOOOOOO..WW........",
    ".........YYOOOOOOOOOO...........",
    ".......YYYYYOOOOOOOOO.GGGG......",
    "......YYYYYYYOOOOOOOGGGGGGGG....",
    ".....YYYYBBYYOOOOOOGGGGGGGGG....",
    "....YYYYYWBYYOOOOOGGGGGGGGGGG...",
    "...YYYYYYYYYYOOOOGGGGGGGGGGGG...",
    "..YYYYYYYYYYYOOOGGGOWGGGGOWGG...",
    ".YYYYYYYYYYYYOOGGGOOWGGGOOWGGG..",
    "YYYYWWYYYYYYYOOGGGOOWGGGOOWGGG..",
    "YYYYBBBBBYYYOOGGGGGGGGGGGGGGGG..",
    ".YYYYYYYYYYYOOGGGGGGGGGGGGGGGG..",
    "..YYYYYYYYYYOGGGGGGGGGGGGGGGGG..",
    "...YYYYYYYYYGGGGGGGGGGGGGGGGGG..",
    "....YYYYYYYGGGGGGGGGGGGGGGGGGG..",
    ".....YYYYYYYGGGGGGOWGGGGOWGGGG..",
    "....YYYYYYYYYGGGGOOWGGGOOWGGGG..",
    "...YYYYYYYYYYGGGGOOWGGGOOWGGGG..",
    "..YYYYYYYYYYYYGGGGGGGGGGGGGGGG..",
    "..WWYYYYYYYYYYGGGGGGGGGGGGGGGG..",
    "..BBBYYYYYYYYYGGGGGGGGGGGGGGG...",
    ".....YYYYYYYYYGGGGGGGGGGGGGGG...",
    "....YYYYYYYYYYYGGGGGGGGGGGGGG...",
    "...YYYYYYYYYYYYYGGGGGGGGGGGGG...",
    "..YYYYY....YYYYY.GGGG....GGGG...",
    ".WWWWWW...WWWWWW.WWWW...WWWW....",
    ".BBBBBB...BBBBBB.BBBB...BBBB....",
    "................................"
  ];
  const bowserOpenRows = [
    "................OOO...WW........",
    "...............OOOO..WWWW.......",
    "..............OOOOO..WWWW.......",
    ".............OOOOOO..WWWW.......",
    "............OOOOOOOO..WW........",
    ".........YYOOOOOOOOOO...........",
    ".......YYYYYOOOOOOOOO.GGGG......",
    "......YYYYYYYOOOOOOOGGGGGGGG....",
    ".....YYYYBBYYOOOOOOGGGGGGGGG....",
    "....YYYYYWBYYOOOOOGGGGGGGGGGG...",
    "...YYYYYYYYYYOOOOGGGGGGGGGGGG...",
    "..YYYYWWWWYYYOOOGGGOWGGGGOWGG...",
    ".YYYYWBBBBW..OOGGGOOWGGGOOWGGG..",
    "YYYYWBBBBBB..OOGGGOOWGGGOOWGGG..",
    "YYYYWBBBBBB.YOOGGGGGGGGGGGGGGG..",
    ".YYYYWBBBBW.YOOGGGGGGGGGGGGGGG..",
    "..YYYYWWWWYYOGGGGGGGGGGGGGGGGG..",
    "...YYYYYYYYYGGGGGGGGGGGGGGGGGG..",
    "....YYYYYYYGGGGGGGGGGGGGGGGGGG..",
    ".....YYYYYYYGGGGGGOWGGGGOWGGGG..",
    "....YYYYYYYYYGGGGOOWGGGOOWGGGG..",
    "...YYYYYYYYYYGGGGOOWGGGOOWGGGG..",
    "..YYYYYYYYYYYYGGGGGGGGGGGGGGGG..",
    "..WWYYYYYYYYYYGGGGGGGGGGGGGGGG..",
    "..BBBYYYYYYYYYGGGGGGGGGGGGGGG...",
    ".....YYYYYYYYYGGGGGGGGGGGGGGG...",
    "....YYYYYYYYYYYGGGGGGGGGGGGGG...",
    "...YYYYYYYYYYYYYGGGGGGGGGGGGG...",
    "..YYYYY....YYYYY.GGGG....GGGG...",
    ".WWWWWW...WWWWWW.WWWW...WWWW....",
    ".BBBBBB...BBBBBB.BBBB...BBBB....",
    "................................"
  ];

  const bowserWalk2ClosedRows = [...bowserClosedRows];
  bowserWalk2ClosedRows[28] = "....YYYYY..YYYYY...GGGG..GGGG...";
  bowserWalk2ClosedRows[29] = "...WWWWWW.WWWWWW..WWWW..WWWW....";
  bowserWalk2ClosedRows[30] = "...BBBBBB.BBBBBB..BBBB..BBBB....";

  const bowserWalk2OpenRows = [...bowserOpenRows];
  bowserWalk2OpenRows[28] = "....YYYYY..YYYYY...GGGG..GGGG...";
  bowserWalk2OpenRows[29] = "...WWWWWW.WWWWWW..WWWW..WWWW....";
  bowserWalk2OpenRows[30] = "...BBBBBB.BBBBBB..BBBB..BBBB....";

  SpriteSheet.enemies['bowser_closed_0'] = createPixelCanvas(32, 32, bowserClosedRows, bowserMap);
  SpriteSheet.enemies['bowser_closed_1'] = createPixelCanvas(32, 32, bowserWalk2ClosedRows, bowserMap);
  SpriteSheet.enemies['bowser_open_0'] = createPixelCanvas(32, 32, bowserOpenRows, bowserMap);
  SpriteSheet.enemies['bowser_open_1'] = createPixelCanvas(32, 32, bowserWalk2OpenRows, bowserMap);

  // Bowser Flame (24x8)
  const flameMap = {
    '.': 'transparent',
    'O': '#fc9838',
    'R': '#d82800',
    'W': '#ffffff',
  };
  const flame0 = [
    "....RRRRRRRRRRRR........",
    "..RROOOOOOOOOOOORR......",
    ".RROOWWWWWWWWWWOORR.....",
    "RROOWWWWWWWWWWWWOORRRRRR",
    "RROOWWWWWWWWWWWWOORRRRRR",
    ".RROOWWWWWWWWWWOORR.....",
    "..RROOOOOOOOOOOORR......",
    "....RRRRRRRRRRRR........"
  ];
  SpriteSheet.enemies['bowser_flame_0'] = createPixelCanvas(24, 8, flame0, flameMap);
  SpriteSheet.enemies['bowser_flame_1'] = flipCanvasH(SpriteSheet.enemies['bowser_flame_0']);

  // Hammer (8x16, 4 frames rotating)
  const hammerMap = {
    '.': 'transparent',
    'H': '#888888',
    'W': '#ffffff',
    'D': '#000000',
  };
  const hammer0 = [
    ".DDDDDD.",
    "DWWWWWD.",
    "DWHHHWD.",
    "DWHHHWD.",
    "DWWWWWD.",
    ".DDDDDD.",
    "...DD...",
    "...DD...",
    "...DD...",
    "...DD...",
    "...DD...",
    "...DD...",
    "...DD...",
    "...DD...",
    "...DD...",
    "........"
  ];
  SpriteSheet.enemies['hammer_0'] = createPixelCanvas(8, 16, hammer0, hammerMap);
  SpriteSheet.enemies['hammer_1'] = flipCanvasH(SpriteSheet.enemies['hammer_0']);
  SpriteSheet.enemies['hammer_2'] = flipCanvasV(SpriteSheet.enemies['hammer_0']);
  SpriteSheet.enemies['hammer_3'] = flipCanvasH(SpriteSheet.enemies['hammer_2']);

  // -------------------------------------------------------------
  // 4. TOAD & PRINCESS PEACH
  // -------------------------------------------------------------

  // Toad (16x24)
  const toadMap = {
    '.': 'transparent',
    'R': '#d82800', // Red dots
    'W': '#ffffff', // White cap/vest
    'S': '#f7d8a5', // Skin
    'B': '#002a88', // Blue coat
    'D': '#000000',
  };
  const toadRows = [
    ".....WWWWWW.....",
    "...WWRRRRRRWW...",
    "..WWRRRRRRRRWW..",
    ".WWWRRRRRRRRWWW.",
    ".WWWRRRRRRRRWWW.",
    "WWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWW",
    ".WWWWWWWWWWWWWW.",
    "....SSSSSSSS....",
    "...SSSDSSDSSS...",
    "...SSSDSSDSSS...",
    "....SSSSSSSS....",
    "....BBWWWWBB....",
    "...BBBWWWWBBB...",
    "...BBBWWWWBBB...",
    "....BBWWWWBB....",
    ".....WWWWWW.....",
    ".....WW..WW.....",
    ".....WW..WW.....",
    "....DD....DD....",
    "....DD....DD....",
    "................",
    "................",
    "................"
  ];
  SpriteSheet.ui['toad_retainer'] = createPixelCanvas(16, 24, toadRows, toadMap);

  // Princess Peach (16x32)
  const peachMap = {
    '.': 'transparent',
    'Y': '#f8b800', // Blonde hair
    'P': '#fc7460', // Pink dress
    'W': '#ffffff', // White trim
    'S': '#f7d8a5', // Skin
    'C': '#00e8d8', // Cyan crown jewel
    'D': '#000000',
  };
  const peachRows = [
    ".......YC.......",
    "......YYYY......",
    ".....YYYYYY.....",
    "....YYYYYYYY....",
    "....YYSSSSYY....",
    "...YYYSDSSYYY...",
    "...YYYSSSSYYY...",
    "....YYSSSSYY....",
    ".....YYYYYY.....",
    "....PPPPPPPP....",
    "...PPPPPPPPPP...",
    "..PPPPWWWWPPPP..",
    "..PPPWWWWWWPPP..",
    ".PPPPWWWWWWPPPP.",
    ".PPPPPPPPPPPPPP.",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    "PPPPPPPPPPPPPPPP",
    ".WWWWWWWWWWWWWW.",
    "..DDDDDDDDDDDD.."
  ];
  SpriteSheet.ui['princess_peach'] = createPixelCanvas(16, 32, peachRows, peachMap);
}
