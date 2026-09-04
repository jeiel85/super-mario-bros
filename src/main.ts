// Super Mario Bros. (NES 1985) - Full 32-Stage Game Engine
import {
  CANVAS_WIDTH,
  TILE_SIZE,
  TileType,
  GameState,
  MarioForm,
  Character
} from './constants';
import { SpriteSheet } from './graphics/SpriteSheet';
import { NESAudio } from './audio/NESAudio';
import { InputManager } from './input/InputManager';
import { Renderer } from './graphics/Renderer';
import { HUD } from './ui/HUD';
import { TouchControls } from './ui/TouchControls';
import { Mario } from './entities/Mario';
import { Enemy, PiranhaPlant } from './entities/Enemy';
import { Item, BlockCoin } from './entities/Item';
import { IParticle, BrickPiece, FloatingScore, BouncingBlock, Fireball, Firework } from './entities/Particle';
import { World1_1, EnemySpawn, SceneryItem } from './level/World1_1';
import { SMB1LevelDecoder, LevelTheme } from './level/SMB1LevelDecoder';
import { Bowser } from './entities/Bowser';
import { Firebar, Podoboo, Retainer } from './entities/CastleHazards';
import { Autopilot } from './ai/Autopilot';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;
  private hud: HUD;
  private renderer: Renderer;
  public autopilot: Autopilot = new Autopilot();

  private state: GameState = GameState.TITLE;
  private stateTimer = 0;
  private frameCount = 0;

  // Active Stage Coordinates (1-1 through 8-4)
  public currentWorld = 1;
  public currentStage = 1;

  // Level Environment & Data
  private theme: LevelTheme = 'overworld';
  private isUnderground = false;
  private tiles: number[][] = [];
  private enemySpawns: EnemySpawn[] = [];
  private scenery: SceneryItem[] = [];
  private flagPoleX = 198 * TILE_SIZE;
  private castleX = 202 * TILE_SIZE;

  // Castle Specifics
  private isCastle = false;
  private hasAxe = false;
  private axeX = 0;
  private bridgeStartX = 0;
  private bridgeEndX = 0;
  private isPeach = false;

  // Active Entities
  private mario: Mario;
  private bowser: Bowser | null = null;
  private firebars: Firebar[] = [];
  private podoboos: Podoboo[] = [];
  private retainer: Retainer | null = null;
  private enemies: Enemy[] = [];
  private piranhas: PiranhaPlant[] = [];
  private items: Item[] = [];
  private blockCoins: BlockCoin[] = [];
  private bouncingBlocks: BouncingBlock[] = [];
  private particles: IParticle[] = [];
  private fireballs: Fireball[] = [];
  private multiCoinBricks: Map<string, { hits: number; expireFrame: number }> = new Map();

  // Underground Bonus Cache
  private ugTiles: number[][] = [];

  // Camera & Viewport
  private cameraX = 0;

  // Flagpole & Castle celebration
  private flagY = 3 * TILE_SIZE;
  private isFlagLowering = false;
  private castleFlagY = 112;
  private fireworksLeft = 0;
  private fireworkTimer = 0;

  constructor() {
    this.canvas = document.getElementById('nes-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.input = new InputManager();
    new TouchControls(this.input);
    this.hud = new HUD();
    this.renderer = new Renderer(this.ctx);
    this.mario = new Mario();

    SpriteSheet.init();

    // Auto unlock audio on user gesture
    this.input.setFirstInteractionCallback(() => {
      NESAudio.unlock();
    });

    this.setupUIControls();
    this.initLevel(this.currentWorld, this.currentStage);

    // Start 60 FPS Fixed Time Loop
    let lastTime = performance.now();
    const frameDuration = 1000 / 60;
    let lag = 0;

    const loop = (currentTime: number) => {
      const elapsed = currentTime - lastTime;
      lastTime = currentTime;
      lag += elapsed;

      // Cap lag to prevent spiral of death
      if (lag > 250) lag = frameDuration;

      while (lag >= frameDuration) {
        this.update();
        lag -= frameDuration;
      }

      this.render();
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  // Setup Stage (World 1-1 to World 8-4)
  private initLevel(worldNum = this.currentWorld, stageNum = this.currentStage) {
    this.currentWorld = worldNum;
    this.currentStage = stageNum;

    // Decode authentic level directly from NES ROM byte stream
    const decoded = SMB1LevelDecoder.decodeLevel(worldNum, stageNum);
    this.tiles = decoded.tiles;
    this.enemySpawns = decoded.enemies;
    this.scenery = decoded.scenery;
    this.theme = decoded.theme;
    this.flagPoleX = decoded.flagPoleX;
    this.castleX = decoded.castleX;
    this.hasAxe = decoded.hasAxe;
    this.axeX = decoded.axeX;
    this.isCastle = decoded.isCastle;
    this.isPeach = decoded.isPeach;
    this.bridgeStartX = decoded.bridgeStartX;
    this.bridgeEndX = decoded.bridgeEndX;

    this.piranhas = decoded.piranhas.map(p => new PiranhaPlant(p.pipeX, p.pipeTopY));
    this.firebars = decoded.firebars.map(f => new Firebar(f.tileX, f.tileY, f.length, f.clockwise));
    this.podoboos = decoded.podoboos.map(p => new Podoboo(p.x));
    this.bowser = decoded.bowserX ? new Bowser(decoded.bowserX, 9 * TILE_SIZE, worldNum) : null;
    this.retainer = decoded.retainerX ? new Retainer(decoded.retainerX, 11 * TILE_SIZE, decoded.isPeach) : null;

    // Default underground bonus room
    const ugData = World1_1.createUndergroundData();
    this.ugTiles = ugData.tiles;

    this.enemies = [];
    this.items = [];
    this.blockCoins = [];
    this.bouncingBlocks = [];
    this.particles = [];
    this.fireballs = [];
    this.multiCoinBricks.clear();
    this.cameraX = 0;
    this.flagY = 3 * TILE_SIZE;
    this.isFlagLowering = false;
    this.castleFlagY = 112;
    this.fireworksLeft = 0;
    this.fireworkTimer = 0;
    this.isUnderground = false;

    this.hud.world = `${worldNum}-${stageNum}`;
    this.hud.resetLevelTime(decoded.timer);
    this.mario.isUnderwater = (decoded.theme === 'underwater');
  }

  // Start Level Playing
  private startLevel() {
    this.initLevel(this.currentWorld, this.currentStage);
    this.mario.character = this.hud.selectedPlayer === 2 ? Character.LUIGI : Character.MARIO;
    const startY = this.theme === 'underwater' ? 80 : 192;
    this.mario.reset(40, startY);
    this.state = GameState.PLAYING;

    if (this.theme === 'castle') {
      NESAudio.playCastle();
    } else if (this.theme === 'underwater') {
      NESAudio.playUnderwater();
    } else if (this.theme === 'underground') {
      NESAudio.playUnderground();
    } else {
      NESAudio.playOverworld();
    }
  }

  // UI Buttons setup
  private setupUIControls() {
    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        NESAudio.unlock();
        const unmuted = NESAudio.toggleMute();
        btnSound.textContent = unmuted ? '🔊 SOUND ON' : '🔇 MUTED';
        btnSound.classList.toggle('active', unmuted);
      });
    }

    const btnCrt = document.getElementById('btn-crt');
    const screenContainer = document.getElementById('screen-container');
    if (btnCrt && screenContainer) {
      btnCrt.addEventListener('click', () => {
        screenContainer.classList.toggle('crt-effect');
        const hasCrt = screenContainer.classList.contains('crt-effect');
        btnCrt.textContent = hasCrt ? '📺 CRT SCANLINES' : '🖥️ CRT OFF';
        btnCrt.classList.toggle('active', hasCrt);
      });
    }

    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    const btnAutopilot = document.getElementById('btn-autopilot');
    const updateAutopilotUI = (on: boolean) => {
      if (btnAutopilot) {
        btnAutopilot.textContent = on ? '🤖 AUTO PLAY: ON' : '🤖 AUTO PLAY: OFF';
        btnAutopilot.classList.toggle('active', on);
      }
    };

    if (btnAutopilot) {
      btnAutopilot.addEventListener('click', () => {
        const on = this.autopilot.toggle();
        updateAutopilotUI(on);
        if (on && this.state === GameState.TITLE) {
          NESAudio.unlock();
          this.startLevel();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyP' || e.code === 'KeyO') {
        const on = this.autopilot.toggle();
        updateAutopilotUI(on);
        if (on && this.state === GameState.TITLE) {
          NESAudio.unlock();
          this.startLevel();
        }
      }
    });

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        NESAudio.unlock();
        this.hud.lives = 3;
        this.hud.score = 0;
        this.hud.coins = 0;
        this.startLevel();
      });
    }
  }

  // -------------------------------------------------------------
  // UPDATE LOOP (60 FPS)
  // -------------------------------------------------------------
  private update() {
    this.input.update();

    // Autopilot AI Controller
    this.autopilot.update(
      this.input,
      this.state,
      this.mario,
      this.isUnderground ? this.ugTiles : this.tiles,
      this.enemies,
      this.piranhas,
      this.bowser,
      this.firebars,
      this.podoboos,
      this.cameraX,
      this.hasAxe,
      this.axeX,
      this.flagPoleX,
      this.theme
    );

    this.frameCount++;
    (window as any).__gameState = this.state;
    (window as any).__currentWorld = `${this.currentWorld}-${this.currentStage}`;

    switch (this.state) {
      case GameState.TITLE:
        if (this.input.selectPressed) {
          NESAudio.unlock();
          this.hud.selectedPlayer = this.hud.selectedPlayer === 1 ? 2 : 1;
          NESAudio.playCoin();
        }
        // Stage Select via Left / Right arrow keys
        if (this.input.leftPressed) {
          NESAudio.unlock();
          if (this.hud.startingStage > 1) {
            this.hud.startingStage--;
          } else if (this.hud.startingWorld > 1) {
            this.hud.startingWorld--;
            this.hud.startingStage = 4;
          } else {
            this.hud.startingWorld = 8;
            this.hud.startingStage = 4;
          }
          NESAudio.playCoin();
        }
        if (this.input.rightPressed) {
          NESAudio.unlock();
          if (this.hud.startingStage < 4) {
            this.hud.startingStage++;
          } else if (this.hud.startingWorld < 8) {
            this.hud.startingWorld++;
            this.hud.startingStage = 1;
          } else {
            this.hud.startingWorld = 1;
            this.hud.startingStage = 1;
          }
          NESAudio.playCoin();
        }
        if (this.input.startPressed || this.input.jumpPressed) {
          NESAudio.unlock();
          this.currentWorld = this.hud.startingWorld;
          this.currentStage = this.hud.startingStage;
          this.mario.character = this.hud.selectedPlayer === 2 ? Character.LUIGI : Character.MARIO;
          this.state = GameState.START_SCREEN;
          this.stateTimer = 120; // 2 seconds
        }
        break;

      case GameState.START_SCREEN:
        this.stateTimer--;
        if (this.stateTimer <= 0) {
          this.startLevel();
        }
        break;

      case GameState.PAUSED:
        if (this.input.startPressed) {
          this.state = GameState.PLAYING;
          NESAudio.playPause();
          NESAudio.resumeMusic();
        }
        break;

      case GameState.PLAYING:
        if (this.input.startPressed) {
          this.state = GameState.PAUSED;
          NESAudio.playPause();
          NESAudio.pauseMusic();
          return;
        }
        this.updatePlaying();
        break;

      case GameState.FLAGPOLE_SLIDE:
        this.updateFlagpoleSequence();
        break;

      case GameState.CASTLE_WALK:
        this.updateCastleWalkSequence();
        break;

      case GameState.LEVEL_CLEAR:
        this.updateLevelClearTally();
        break;

      case GameState.CASTLE_CLEAR:
        this.updateCastleClearSequence();
        break;

      case GameState.GAME_VICTORY:
        this.updateVictorySequence();
        break;

      case GameState.MARIO_DYING:
        this.mario.update(
          this.input,
          this.isUnderground ? this.ugTiles : this.tiles,
          this.cameraX,
          () => {},
          () => {}
        );
        if (this.mario.deathTimer > 160) {
          this.hud.lives--;
          if (this.hud.lives > 0) {
            this.state = GameState.START_SCREEN;
            this.stateTimer = 120;
          } else {
            this.state = GameState.GAME_OVER;
            this.stateTimer = 240;
            NESAudio.playGameOver();
          }
        }
        break;

      case GameState.GAME_OVER:
        this.stateTimer--;
        if (this.stateTimer <= 0 || this.input.startPressed) {
          this.hud.lives = 3;
          this.hud.score = 0;
          this.hud.coins = 0;
          this.state = GameState.TITLE;
        }
        break;
    }
  }

  // Gameplay update
  private updatePlaying() {
    // 1. Timer countdown
    const isTimeout = this.hud.updateTime();
    if (isTimeout) {
      this.mario.die();
      this.state = GameState.MARIO_DYING;
      return;
    }

    const currentTiles = this.isUnderground ? this.ugTiles : this.tiles;

    // 2. Mario Update
    this.mario.update(
      this.input,
      currentTiles,
      this.cameraX,
      (tx, ty) => this.hitBlockFromBelow(tx, ty),
      (smoke) => this.particles.push(smoke),
      (fx, fy, dir) => this.fireballs.push(new Fireball(fx, fy, dir))
    );

    // Pit death
    if (this.mario.y > 240) {
      this.mario.die();
      this.state = GameState.MARIO_DYING;
      return;
    }

    // 3. Camera Scrolling (Smooth forward scroll)
    if (!this.isUnderground) {
      const targetCamX = this.mario.x - 110;
      if (targetCamX > this.cameraX) {
        const maxLevelX = (this.tiles[0]?.length || 200) * TILE_SIZE - CANVAS_WIDTH;
        this.cameraX = Math.min(maxLevelX, targetCamX);
      }
    }

    // 4. Spawn Enemies Ahead of Screen
    this.enemySpawns.forEach(spawn => {
      if (!spawn.spawned && spawn.x < this.cameraX + 280) {
        spawn.spawned = true;
        this.enemies.push(new Enemy(spawn.type, spawn.x, spawn.y));
      }
    });

    // 5. Update Enemies
    this.enemies.forEach(enemy => {
      enemy.update(
        currentTiles,
        this.cameraX,
        this.mario.x,
        (spawned) => this.enemies.push(spawned),
        (score) => this.particles.push(score)
      );
    });
    this.enemies = this.enemies.filter(e => !e.isDead);

    // 6. Update Bowser Boss
    if (this.bowser) {
      this.bowser.update(currentTiles, this.cameraX, this.mario.x, score => this.particles.push(score));
    }

    // 7. Update Hazards (Firebars & Podoboos)
    this.firebars.forEach(f => {
      f.update();
      if (f.checkCollision(this.mario.x, this.mario.y, this.mario.width, this.mario.height)) {
        if (this.mario.takeDamage()) {
          this.state = GameState.MARIO_DYING;
        }
      }
    });

    this.podoboos.forEach(p => {
      p.update();
      if (p.checkCollision(this.mario.x, this.mario.y, this.mario.width, this.mario.height)) {
        if (this.mario.takeDamage()) {
          this.state = GameState.MARIO_DYING;
        }
      }
    });

    // 8. Update Piranhas
    if (!this.isUnderground) {
      this.piranhas.forEach(p => p.update(this.mario.x, this.cameraX));
    }

    // 9. Update Items, Coins, Particles, Fireballs
    this.items.forEach(item => item.update(currentTiles));
    this.items = this.items.filter(item => !item.isDead);

    this.blockCoins.forEach(coin => coin.update());
    this.blockCoins = this.blockCoins.filter(coin => !coin.isDead);

    this.bouncingBlocks.forEach(b => b.update());
    this.bouncingBlocks = this.bouncingBlocks.filter(b => !b.isFinished);

    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => !p.isDead);

    this.fireballs.forEach(fb => {
      fb.update(currentTiles);

      // Fireball vs Bowser
      if (this.bowser && !this.bowser.isDead && !this.bowser.isFalling) {
        if (
          fb.x < this.bowser.x + this.bowser.width &&
          fb.x + fb.width > this.bowser.x &&
          fb.y < this.bowser.y + this.bowser.height &&
          fb.y + fb.height > this.bowser.y
        ) {
          fb.isDead = true;
          this.bowser.hitByFireball(s => this.particles.push(s));
        }
      }

      // Fireball vs Enemies
      this.enemies.forEach(enemy => {
        if (!enemy.isDead && !enemy.isFlipped) {
          if (
            fb.x < enemy.x + enemy.width &&
            fb.x + fb.width > enemy.x &&
            fb.y < enemy.y + enemy.height &&
            fb.y + fb.height > enemy.y
          ) {
            fb.isDead = true;
            if (enemy.type === 'buzzy_beetle') {
              NESAudio.playBlockBump(); // Fireball bounces off Buzzy Beetle!
            } else {
              enemy.flipDie();
              this.hud.addScore(200);
              this.particles.push(new FloatingScore(enemy.x, enemy.y, '200'));
            }
          }
        }
      });
    });
    this.fireballs = this.fireballs.filter(fb => !fb.isDead);

    // 10. Check Collisions
    this.checkMarioEnemyCollisions();
    this.checkMarioItemCollisions();

    // 11. Castle Axe Trigger
    if (this.hasAxe && Math.abs(this.mario.x - this.axeX) <= 18) {
      this.triggerCastleBridgeCollapse();
      return;
    }

    // 12. Flagpole Trigger
    if (this.flagPoleX > 0 && !this.isUnderground && !this.isCastle) {
      if (this.mario.x >= this.flagPoleX - 4 && this.mario.x <= this.flagPoleX + 16) {
        this.triggerFlagpole();
      }
    }
  }

  // Hit block from below
  private hitBlockFromBelow(tx: number, ty: number) {
    const tiles = this.isUnderground ? this.ugTiles : this.tiles;
    const tile = tiles[ty][tx];

    if (
      tile === TileType.QUESTION_COIN ||
      tile === TileType.QUESTION_MUSHROOM ||
      tile === TileType.QUESTION_STAR ||
      tile === TileType.HIDDEN_1UP
    ) {
      tiles[ty][tx] = TileType.EMPTY_BLOCK;
      this.bouncingBlocks.push(new BouncingBlock(tx, ty, tile));

      if (tile === TileType.QUESTION_COIN) {
        this.hud.addCoin();
        this.blockCoins.push(new BlockCoin(tx * TILE_SIZE, (ty - 1) * TILE_SIZE));
        this.particles.push(new FloatingScore(tx * TILE_SIZE, (ty - 1) * TILE_SIZE, '200'));
      } else if (tile === TileType.QUESTION_MUSHROOM) {
        const itemType = this.mario.form === MarioForm.SMALL ? 'mushroom' : 'flower';
        this.items.push(new Item(itemType, tx * TILE_SIZE, ty * TILE_SIZE));
      } else if (tile === TileType.QUESTION_STAR) {
        this.items.push(new Item('star', tx * TILE_SIZE, ty * TILE_SIZE));
      } else if (tile === TileType.HIDDEN_1UP) {
        this.items.push(new Item('1up', tx * TILE_SIZE, ty * TILE_SIZE));
      }

      this.defeatEnemyOnTopOfBlock(tx, ty);
    } else if (tile === TileType.BRICK) {
      if (this.mario.form === MarioForm.SMALL) {
        this.bouncingBlocks.push(new BouncingBlock(tx, ty, tile));
        NESAudio.playBlockBump();
        this.defeatEnemyOnTopOfBlock(tx, ty);
      } else {
        tiles[ty][tx] = TileType.EMPTY;
        NESAudio.playBlockBreak();
        const px = tx * TILE_SIZE;
        const py = ty * TILE_SIZE;
        this.particles.push(new BrickPiece(px, py, -2.0, -4.5));
        this.particles.push(new BrickPiece(px + 8, py, 2.0, -4.5));
        this.particles.push(new BrickPiece(px, py + 8, -1.2, -5.5));
        this.particles.push(new BrickPiece(px + 8, py + 8, 1.2, -5.5));
        this.defeatEnemyOnTopOfBlock(tx, ty);
      }
    } else if (tile === TileType.BRICK_MULTICOIN) {
      const key = `${tx},${ty}`;
      let info = this.multiCoinBricks.get(key);
      if (!info) {
        info = { hits: 0, expireFrame: this.frameCount + 240 };
        this.multiCoinBricks.set(key, info);
      }
      info.hits++;
      this.bouncingBlocks.push(new BouncingBlock(tx, ty, tile));
      this.blockCoins.push(new BlockCoin(tx * TILE_SIZE, (ty - 1) * TILE_SIZE));
      this.hud.addCoin();
      NESAudio.playCoin();
      this.defeatEnemyOnTopOfBlock(tx, ty);

      if (info.hits >= 10 || this.frameCount > info.expireFrame) {
        tiles[ty][tx] = TileType.EMPTY_BLOCK;
      }
    }
  }

  // Knock enemy walking directly on top of hit block
  private defeatEnemyOnTopOfBlock(tx: number, ty: number) {
    const blockX = tx * TILE_SIZE;
    const blockTopY = ty * TILE_SIZE;

    this.enemies.forEach(e => {
      if (!e.isDead && Math.abs(e.y + e.height - blockTopY) <= 4) {
        if (e.x + e.width > blockX && e.x < blockX + TILE_SIZE) {
          e.flipDie();
          this.hud.addScore(100);
          this.particles.push(new FloatingScore(e.x, e.y, '100'));
        }
      }
    });
  }

  // Mario vs Enemy collisions
  private checkMarioEnemyCollisions() {
    // Mario vs Bowser
    if (this.bowser && !this.bowser.isDead && !this.bowser.isFalling) {
      if (
        this.mario.x < this.bowser.x + this.bowser.width &&
        this.mario.x + this.mario.width > this.bowser.x &&
        this.mario.y < this.bowser.y + this.bowser.height &&
        this.mario.y + this.mario.height > this.bowser.y
      ) {
        if (this.mario.isStarman) {
          this.bowser.defeat(s => this.particles.push(s));
        } else if (this.mario.takeDamage()) {
          this.state = GameState.MARIO_DYING;
          return;
        }
      }

      // Mario vs Bowser Flames
      this.bowser.flames.forEach(f => {
        if (
          this.mario.x < f.x + f.width &&
          this.mario.x + this.mario.width > f.x &&
          this.mario.y < f.y + f.height &&
          this.mario.y + this.mario.height > f.y
        ) {
          if (!this.mario.isStarman && this.mario.takeDamage()) {
            this.state = GameState.MARIO_DYING;
          }
        }
      });
    }

    // Mario vs Enemies
    this.enemies.forEach(e => {
      if (e.isDead || e.isFlipped) return;

      const overlapX = Math.min(this.mario.x + this.mario.width, e.x + e.width) - Math.max(this.mario.x, e.x);
      const overlapY = Math.min(this.mario.y + this.mario.height, e.y + e.height) - Math.max(this.mario.y, e.y);

      if (overlapX > 4 && overlapY > 4) {
        if (this.mario.isStarman) {
          e.flipDie();
          this.hud.addScore(200);
          this.particles.push(new FloatingScore(e.x, e.y, '200'));
          return;
        }

        const isFallingOntoEnemy = this.mario.vy > 0 && this.mario.y + this.mario.height - this.mario.vy <= e.y + 10;

        if (isFallingOntoEnemy) {
          const didStomp = e.stomp(score => this.particles.push(score));
          if (didStomp) {
            this.mario.vy = -3.2; // Bounce off enemy
            this.hud.addScore(100);
          } else {
            // Harmed by spiked enemy (Spiny)
            if (this.mario.takeDamage()) {
              this.state = GameState.MARIO_DYING;
            }
          }
        } else {
          if (e.isShell && !e.isShellMoving) {
            const dir = this.mario.x < e.x ? 1 : -1;
            e.kickShell(dir, score => this.particles.push(score));
          } else {
            if (this.mario.takeDamage()) {
              this.state = GameState.MARIO_DYING;
            }
          }
        }
      }
    });

    // Mario vs Piranhas
    if (!this.isUnderground) {
      this.piranhas.forEach(p => {
        if (p.checkMarioCollision(this.mario.x, this.mario.y, this.mario.width, this.mario.height)) {
          if (this.mario.isStarman) {
            p.defeat();
            this.hud.addScore(200);
            this.particles.push(new FloatingScore(p.x, p.y, '200'));
          } else if (this.mario.takeDamage()) {
            this.state = GameState.MARIO_DYING;
          }
        }
      });
    }
  }

  // Mario vs Items
  private checkMarioItemCollisions() {
    this.items.forEach(item => {
      if (item.isDead) return;
      const overlapX = Math.min(this.mario.x + this.mario.width, item.x + item.width) - Math.max(this.mario.x, item.x);
      const overlapY = Math.min(this.mario.y + this.mario.height, item.y + item.height) - Math.max(this.mario.y, item.y);

      if (overlapX > 2 && overlapY > 2) {
        item.isDead = true;
        if (item.type === 'mushroom') {
          this.mario.grow();
          this.hud.addScore(1000);
          this.particles.push(new FloatingScore(item.x, item.y, '1000'));
        } else if (item.type === 'flower') {
          this.mario.form = MarioForm.FIRE;
          NESAudio.playPowerup();
          this.hud.addScore(1000);
          this.particles.push(new FloatingScore(item.x, item.y, '1000'));
        } else if (item.type === 'star') {
          this.mario.isStarman = true;
          this.mario.starTimer = 600;
          NESAudio.playStar();
          this.hud.addScore(1000);
          this.particles.push(new FloatingScore(item.x, item.y, '1000'));
        } else if (item.type === '1up') {
          this.hud.lives++;
          NESAudio.play1UP();
          this.particles.push(new FloatingScore(item.x, item.y, '1UP'));
        }
      }
    });
  }

  // -------------------------------------------------------------
  // CASTLE CLEAR & VICTORY SEQUENCE
  // -------------------------------------------------------------
  private triggerCastleBridgeCollapse() {
    this.hasAxe = false;
    const axeTileX = Math.floor(this.axeX / TILE_SIZE);
    if (this.tiles[8]) this.tiles[8][axeTileX] = TileType.EMPTY;

    // Defeat Bowser
    this.bowser?.defeat(score => this.particles.push(score));

    // Collapse bridge
    const bStart = Math.floor(this.bridgeStartX / TILE_SIZE);
    const bEnd = Math.floor(this.bridgeEndX / TILE_SIZE);
    for (let bx = bStart; bx <= bEnd; bx++) {
      if (this.tiles[9]) this.tiles[9][bx] = TileType.EMPTY;
    }

    this.state = GameState.CASTLE_WALK;
    this.mario.isWalkingToCastle = true;
    this.mario.facingRight = true;
    this.mario.vx = 1.2;
    NESAudio.stopMusic();
  }

  private updateCastleWalkSequence() {
    this.mario.x += 1.0;
    if (this.mario.x - this.cameraX > 110) {
      this.cameraX = Math.round(this.mario.x - 110);
    }
    const targetX = this.retainer ? this.retainer.x - 30 : this.axeX + 64;

    if (this.mario.x >= targetX) {
      this.mario.vx = 0;
      this.stateTimer = 0;
      this.state = this.isPeach ? GameState.GAME_VICTORY : GameState.CASTLE_CLEAR;
      NESAudio.playVictoryFanfare();
    }
  }

  private updateCastleClearSequence() {
    this.stateTimer++;
    // After delay or upon button press, advance to next world
    if (this.stateTimer > 280 || (this.stateTimer > 90 && this.input.startPressed)) {
      this.advanceStage();
    }
  }

  private updateVictorySequence() {
    this.stateTimer++;
    // Victory ending screen
    if (this.stateTimer > 600 || (this.stateTimer > 180 && (this.input.startPressed || this.input.jumpPressed))) {
      this.hud.startingWorld = 1;
      this.hud.startingStage = 1;
      this.state = GameState.TITLE;
    }
  }

  // -------------------------------------------------------------
  // FLAGPOLE & LEVEL PROGRESSION
  // -------------------------------------------------------------
  private triggerFlagpole() {
    this.state = GameState.FLAGPOLE_SLIDE;
    NESAudio.stopMusic();
    NESAudio.playFlagpole();

    this.mario.isOnFlagPole = true;
    this.mario.x = this.flagPoleX - 6;
    this.mario.vx = 0;
    this.mario.vy = 0;
    this.isFlagLowering = true;

    const remainder = this.hud.timeLeft % 10;
    if (remainder === 1) this.fireworksLeft = 1;
    else if (remainder === 3) this.fireworksLeft = 3;
    else if (remainder === 6) this.fireworksLeft = 6;
    else this.fireworksLeft = 0;
    this.fireworkTimer = 0;

    const flagHeight = Math.max(0, 192 - this.mario.y);
    let pts = 100;
    if (flagHeight > 120) pts = 5000;
    else if (flagHeight > 90) pts = 2000;
    else if (flagHeight > 60) pts = 800;
    else if (flagHeight > 30) pts = 400;

    this.hud.addScore(pts);
    this.particles.push(new FloatingScore(this.flagPoleX + 8, this.mario.y, pts.toString()));
  }

  private updateFlagpoleSequence() {
    if (this.isFlagLowering) {
      if (this.flagY < 12 * TILE_SIZE) {
        this.flagY += 2.0;
      }
    }

    this.mario.update(
      this.input,
      this.tiles,
      this.cameraX,
      () => {},
      () => {}
    );

    if (this.mario.isWalkingToCastle) {
      this.state = GameState.CASTLE_WALK;
      NESAudio.playLevelClear();
    }
  }

  private updateLevelClearTally() {
    if (this.castleFlagY > 88) {
      this.castleFlagY -= 0.5;
    }

    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => !p.isDead);

    if (this.hud.timeLeft > 0) {
      this.hud.timeLeft--;
      this.hud.addScore(50);
      if (this.hud.timeLeft % 2 === 0) {
        NESAudio.playCoin();
      }
    } else if (this.fireworksLeft > 0) {
      this.fireworkTimer++;
      if (this.fireworkTimer >= 30) {
        this.fireworkTimer = 0;
        this.fireworksLeft--;
        const fx = this.castleX + 8 + (Math.random() * 40 - 20);
        const fy = 40 + (Math.random() * 30);
        this.particles.push(new Firework(fx, fy));
        this.hud.addScore(500);
        this.particles.push(new FloatingScore(fx, fy, '500'));
      }
    } else {
      this.stateTimer++;
      if (this.stateTimer >= 180) {
        this.advanceStage();
      }
    }
  }

  // Advance to next stage (e.g. 1-1 -> 1-2 -> 1-3 -> 1-4 -> 2-1 ... -> 8-4)
  private advanceStage() {
    if (this.currentStage < 4) {
      this.currentStage++;
    } else {
      this.currentStage = 1;
      this.currentWorld++;
    }

    if (this.currentWorld > 8) {
      this.state = GameState.GAME_VICTORY;
      this.stateTimer = 0;
      NESAudio.playVictoryFanfare();
      return;
    }

    this.hud.world = `${this.currentWorld}-${this.currentStage}`;
    this.state = GameState.START_SCREEN;
    this.stateTimer = 120;
    this.startLevel();
  }

  // -------------------------------------------------------------
  // RENDER (NES 256x240)
  // -------------------------------------------------------------
  private render() {
    if (this.state === GameState.TITLE || this.state === GameState.START_SCREEN || this.state === GameState.GAME_OVER) {
      this.hud.render(this.ctx, this.state, this.isPeach);
      return;
    }

    // Render In-game World Scene
    this.renderer.renderScene(
      this.cameraX,
      this.theme,
      this.isUnderground ? this.ugTiles : this.tiles,
      this.scenery,
      this.mario,
      this.enemies,
      this.piranhas,
      this.items,
      this.blockCoins,
      this.bouncingBlocks,
      this.particles,
      this.fireballs,
      this.flagY,
      this.castleFlagY,
      this.bowser,
      this.firebars,
      this.podoboos,
      this.retainer,
      this.flagPoleX,
      this.castleX
    );

    // Render In-game HUD or Dialog Overlays
    this.hud.render(this.ctx, this.state, this.isPeach);

    // Render Autopilot retro badge
    if (this.autopilot.enabled) {
      this.ctx.save();
      this.ctx.font = '8px "Press Start 2P", monospace';
      this.ctx.fillStyle = '#00e676';
      this.ctx.fillText('🤖 AUTO-PLAY', 130, 232);
      this.ctx.restore();
    }
  }
}

// Instantiate and start game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  (window as any).__gameInstance = new Game();
});
