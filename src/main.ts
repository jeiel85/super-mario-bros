// Super Mario Bros. (NES 1985) - Main Game Engine
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

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;
  private hud: HUD;
  private renderer: Renderer;

  private state: GameState = GameState.TITLE;
  private stateTimer = 0;
  private frameCount = 0;

  // Level Data
  private isUnderground = false;
  private tiles: number[][] = [];
  private enemySpawns: EnemySpawn[] = [];
  private scenery: SceneryItem[] = [];
  private flagPoleX = 198 * TILE_SIZE;
  private castleX = 202 * TILE_SIZE;

  // Underground Cache
  private ugTiles: number[][] = [];
  private ugCoins: Array<{ x: number; y: number }> = [];
  private ugExitPipeX = 16 * TILE_SIZE;

  // Active Entities
  private mario: Mario;
  private enemies: Enemy[] = [];
  private piranhas: PiranhaPlant[] = [];
  private items: Item[] = [];
  private blockCoins: BlockCoin[] = [];
  private bouncingBlocks: BouncingBlock[] = [];
  private particles: IParticle[] = [];
  private fireballs: Fireball[] = [];
  private multiCoinBricks: Map<string, { hits: number; expireFrame: number }> = new Map();

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
    this.initLevel();

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

  // Setup Level 1-1 and Underground
  private initLevel() {
    const data = World1_1.createLevelData();
    this.tiles = data.tiles;
    this.enemySpawns = data.enemies;
    this.scenery = data.scenery;
    this.flagPoleX = data.flagPoleX;
    this.castleX = data.castleX;
    this.piranhas = data.piranhas.map(p => new PiranhaPlant(p.pipeX, p.pipeTopY));

    const ugData = World1_1.createUndergroundData();
    this.ugTiles = ugData.tiles;
    this.ugCoins = ugData.coins;
    this.ugExitPipeX = ugData.exitPipeX;

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

    this.hud.resetLevelTime();
  }

  // Start Level Playing
  private startLevel() {
    this.initLevel();
    this.mario.character = this.hud.selectedPlayer === 2 ? Character.LUIGI : Character.MARIO;
    this.mario.reset(40, 192);
    this.state = GameState.PLAYING;
    NESAudio.playOverworld();
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
    this.frameCount++;

    switch (this.state) {
      case GameState.TITLE:
        if (this.input.selectPressed) {
          NESAudio.unlock();
          this.hud.selectedPlayer = this.hud.selectedPlayer === 1 ? 2 : 1;
          NESAudio.playCoin();
        }
        if (this.input.startPressed || this.input.jumpPressed) {
          NESAudio.unlock();
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
      (tx, ty) => this.handleHitBlock(tx, ty),
      (smoke) => this.particles.push(smoke),
      (fx, fy, dir) => {
        if (this.fireballs.length < 2) {
          this.fireballs.push(new Fireball(fx, fy, dir));
        }
      }
    );

    // Check Mario Death
    if (this.mario.isDead) {
      this.state = GameState.MARIO_DYING;
      return;
    }

    // 3. Camera Scrolling (Overworld only, strictly rightward)
    if (!this.isUnderground) {
      const scrollThreshold = this.cameraX + 112;
      if (this.mario.x > scrollThreshold) {
        this.cameraX = Math.min(
          this.mario.x - 112,
          World1_1.WIDTH * TILE_SIZE - CANVAS_WIDTH
        );
      }
    }

    // 4. Enemy Spawning Ahead of Camera
    if (!this.isUnderground) {
      this.enemySpawns.forEach(spawn => {
        if (!spawn.spawned && spawn.x <= this.cameraX + CANVAS_WIDTH + 32) {
          spawn.spawned = true;
          this.enemies.push(new Enemy(spawn.type, spawn.x, spawn.y));
        }
      });
    }

    // 5. Update Enemies & Piranhas
    this.enemies.forEach(e => {
      e.update(currentTiles, this.cameraX, (score) => {
        this.particles.push(score);
        this.hud.addScore(parseInt(score.text, 10) || 100);
      });
    });

    if (!this.isUnderground) {
      this.piranhas.forEach(p => {
        p.update(this.mario.x, this.cameraX);

        // Check collision with Mario
        if (!this.mario.isInvulnerable && p.checkMarioCollision(this.mario.x, this.mario.y, this.mario.width, this.mario.height)) {
          if (this.mario.isStarman) {
            p.defeat();
            this.hud.addScore(200);
            this.particles.push(new FloatingScore(p.x, p.y, '200'));
          } else {
            this.mario.takeDamage();
          }
        }
      });
    }

    // 6. Update Items & Block Coins
    this.items.forEach(item => item.update(currentTiles));
    this.blockCoins.forEach(coin => coin.update());

    // 7. Update Bouncing Blocks
    this.bouncingBlocks.forEach(b => b.update());
    this.bouncingBlocks = this.bouncingBlocks.filter(b => !b.isFinished);

    // 8. Update Particles & Fireballs
    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => !p.isDead);

    this.fireballs.forEach(fb => fb.update(currentTiles));
    this.fireballs = this.fireballs.filter(fb => !fb.isDead);

    // Fireball vs Enemy/Piranha collision
    this.fireballs.forEach(fb => {
      if (fb.isDead) return;
      this.enemies.forEach(e => {
        if (e.isDead || e.isFlipped) return;
        if (Math.abs(fb.x + 4 - (e.x + 8)) < 12 && Math.abs(fb.y + 4 - (e.y + e.height / 2)) < 12) {
          fb.isDead = true;
          e.flipDie(fb.vx > 0 ? 1 : -1);
          this.hud.addScore(100);
          this.particles.push(new FloatingScore(e.x, e.y, '100'));
        }
      });

      if (!this.isUnderground) {
        this.piranhas.forEach(p => {
          if (p.isDead || p.state === 'HIDDEN') return;
          if (Math.abs(fb.x + 4 - (p.x + 8)) < 12 && fb.y + 8 > p.y && fb.y < p.pipeTopY) {
            fb.isDead = true;
            p.defeat();
            this.hud.addScore(200);
            this.particles.push(new FloatingScore(p.x, p.y, '200'));
          }
        });
      }
    });

    // 9. Underground coin collection
    if (this.isUnderground) {
      this.ugCoins = this.ugCoins.filter(c => {
        const dist = Math.hypot(this.mario.x - c.x, this.mario.y - c.y);
        if (dist < 14) {
          this.hud.addCoin();
          NESAudio.playCoin();
          this.particles.push(new FloatingScore(c.x, c.y, '200'));
          return false;
        }
        return true;
      });
    }

    // 10. Check Collisions: Mario vs Enemies
    this.checkMarioEnemyCollisions();

    // 11. Check Collisions: Shell vs Enemies
    this.checkShellEnemyCollisions();

    // 12. Check Collisions: Mario vs Items
    this.checkMarioItemCollisions();

    // 13. Check Pipe Down Entrance (Pipe 4 -> Underground)
    if (!this.isUnderground && this.input.down && this.mario.isGrounded) {
      const tileX = Math.floor((this.mario.x + 8) / TILE_SIZE);
      const tileY = Math.floor((this.mario.y + this.mario.height) / TILE_SIZE);
      if ((tileX === 57 || tileX === 58) && tileY === 9) {
        this.enterUnderground();
      }
    }

    // 14. Check Underground Exit Pipe -> Surface
    if (this.isUnderground && this.mario.x >= this.ugExitPipeX && this.input.right) {
      this.exitUnderground();
    }

    // 15. Check Flagpole Collision (End of Level)
    if (!this.isUnderground && !this.mario.isOnFlagPole && this.mario.x >= this.flagPoleX - 4 && this.mario.x <= this.flagPoleX + 8) {
      this.triggerFlagpole();
    }
  }

  // -------------------------------------------------------------
  // TILE BLOCK HITTING (Underneath bump)
  // -------------------------------------------------------------
  private handleHitBlock(tx: number, ty: number) {
    const tiles = this.isUnderground ? this.ugTiles : this.tiles;
    const tile = tiles[ty][tx];

    // Check Question Blocks
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
        // Mushroom if Small, Flower if Super
        const itemType = this.mario.form === MarioForm.SMALL ? 'mushroom' : 'flower';
        this.items.push(new Item(itemType, tx * TILE_SIZE, ty * TILE_SIZE));
      } else if (tile === TileType.QUESTION_STAR) {
        this.items.push(new Item('star', tx * TILE_SIZE, ty * TILE_SIZE));
      } else if (tile === TileType.HIDDEN_1UP) {
        this.items.push(new Item('1up', tx * TILE_SIZE, ty * TILE_SIZE));
      }

      this.defeatEnemyOnTopOfBlock(tx, ty);
    }
    // Check Breakable Brick
    else if (tile === TileType.BRICK) {
      if (this.mario.form === MarioForm.SMALL) {
        // Small Mario bumps block
        this.bouncingBlocks.push(new BouncingBlock(tx, ty, tile));
        NESAudio.playBlockBump();
        this.defeatEnemyOnTopOfBlock(tx, ty);
      } else {
        // Super Mario shatters brick into 4 pieces
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
    }
    // Multi-coin Brick (Hits dispense coins until timer expires)
    else if (tile === TileType.BRICK_MULTICOIN) {
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

  // -------------------------------------------------------------
  // COLLISION RESOLUTION (Mario vs Enemies, Items, Shells)
  // -------------------------------------------------------------
  private checkMarioEnemyCollisions() {
    this.enemies.forEach(e => {
      if (e.isDead || e.isFlipped) return;

      const overlapX = Math.min(this.mario.x + this.mario.width, e.x + e.width) - Math.max(this.mario.x, e.x);
      const overlapY = Math.min(this.mario.y + this.mario.height, e.y + e.height) - Math.max(this.mario.y, e.y);

      if (overlapX > 3 && overlapY > 3) {
        // 1. Starman Mario instant kill
        if (this.mario.isStarman) {
          e.flipDie();
          this.hud.addScore(200);
          this.particles.push(new FloatingScore(e.x, e.y, '200'));
          return;
        }

        // 2. Mario Stomps Enemy from above
        // Mario is falling and his bottom is in the top 40% of the enemy
        const isStomp = this.mario.vy > 0 && (this.mario.y + this.mario.height - this.mario.vy) <= (e.y + 10);

        if (isStomp) {
          const wasStomped = e.stomp((score) => {
            this.particles.push(score);
            this.hud.addScore(parseInt(score.text, 10) || 100);
          });
          if (wasStomped) {
            // Bounce Mario upward
            this.mario.vy = this.input.jump ? -4.5 : -3.2;
            this.mario.y = e.y - this.mario.height;
          }
          return;
        }

        // 3. Stationary Shell Kick
        if (e.isShell && !e.isShellMoving) {
          const kickDir = this.mario.x < e.x ? 1 : -1;
          e.kickShell(kickDir, (score) => {
            this.particles.push(score);
            this.hud.addScore(parseInt(score.text, 10) || 400);
          });
          this.mario.x = kickDir === 1 ? e.x - this.mario.width - 2 : e.x + e.width + 2;
          return;
        }

        // 4. Mario takes damage
        if (!e.isStomped) {
          this.mario.takeDamage();
        }
      }
    });
  }

  private checkShellEnemyCollisions() {
    this.enemies.forEach(shell => {
      if (!shell.isShell || !shell.isShellMoving || shell.isDead) return;

      this.enemies.forEach(target => {
        if (shell === target || target.isDead || target.isFlipped) return;

        const overlapX = Math.min(shell.x + shell.width, target.x + target.width) - Math.max(shell.x, target.x);
        const overlapY = Math.min(shell.y + shell.height, target.y + target.height) - Math.max(shell.y, target.y);

        if (overlapX > 4 && overlapY > 4) {
          const dir = shell.vx > 0 ? 1 : -1;
          target.flipDie(dir);
          shell.shellComboCount++;
          const pts = [100, 200, 400, 800, 1000, 2000, 4000, 8000][Math.min(7, shell.shellComboCount)];
          this.hud.addScore(pts);
          this.particles.push(new FloatingScore(target.x, target.y, pts.toString()));
        }
      });
    });
  }

  private checkMarioItemCollisions() {
    this.items.forEach(item => {
      if (item.isDead || item.isSprouting) return;

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
          this.mario.grow();
          this.hud.addScore(1000);
          this.particles.push(new FloatingScore(item.x, item.y, '1000'));
        } else if (item.type === 'star') {
          this.mario.isStarman = true;
          this.mario.starTimer = 600; // 10 seconds
          this.hud.addScore(1000);
          NESAudio.playStar();
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
  // WARP & UNDERGROUND
  // -------------------------------------------------------------
  private enterUnderground() {
    NESAudio.playPipe();
    this.isUnderground = true;
    this.cameraX = 0;
    this.mario.x = 2 * TILE_SIZE;
    this.mario.y = 2 * TILE_SIZE;
    this.mario.vx = 0;
    this.mario.vy = 0;
    NESAudio.playUnderground();
  }

  private exitUnderground() {
    NESAudio.playPipe();
    this.isUnderground = false;
    // Surface near Pipe 5 at x = 163
    this.cameraX = 150 * TILE_SIZE;
    this.mario.x = 163 * TILE_SIZE + 4;
    this.mario.y = 11 * TILE_SIZE;
    this.mario.vx = 0;
    this.mario.vy = 0;
    NESAudio.playOverworld();
  }

  // -------------------------------------------------------------
  // FLAGPOLE & LEVEL CLEAR
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

    // In NES SMB, if the timer ends in 1, 3, or 6, fireworks will explode!
    const remainder = this.hud.timeLeft % 10;
    if (remainder === 1) this.fireworksLeft = 1;
    else if (remainder === 3) this.fireworksLeft = 3;
    else if (remainder === 6) this.fireworksLeft = 6;
    else this.fireworksLeft = 0;
    this.fireworkTimer = 0;

    // Score points by height touched
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
    // Flag lowers down the pole
    if (this.isFlagLowering) {
      if (this.flagY < 12 * TILE_SIZE) {
        this.flagY += 2.0;
      }
    }

    // Mario sliding down
    this.mario.update(
      this.input,
      this.tiles,
      this.cameraX,
      () => {},
      () => {}
    );

    // Once Mario hits bottom of pole, walk to castle
    if (this.mario.isWalkingToCastle) {
      this.state = GameState.CASTLE_WALK;
      NESAudio.playLevelClear();
    }
  }

  private updateCastleWalkSequence() {
    this.mario.update(
      this.input,
      this.tiles,
      this.cameraX,
      () => {},
      () => {}
    );

    // Castle flag ascends up the turret
    if (this.castleFlagY > 88) {
      this.castleFlagY -= 0.5;
    }

    // Mario enters castle door
    if (this.mario.x >= this.castleX + 32) {
      this.state = GameState.LEVEL_CLEAR;
      this.stateTimer = 0;
    }
  }

  private updateLevelClearTally() {
    // Castle flag ascends up the turret
    if (this.castleFlagY > 88) {
      this.castleFlagY -= 0.5;
    }

    // Update fireworks and particles
    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => !p.isDead);

    // 1. Tally remaining time to score
    if (this.hud.timeLeft > 0) {
      this.hud.timeLeft--;
      this.hud.addScore(50);
      if (this.hud.timeLeft % 2 === 0) {
        NESAudio.playCoin();
      }
    } 
    // 2. Explode fireworks if any are scheduled!
    else if (this.fireworksLeft > 0) {
      this.fireworkTimer++;
      if (this.fireworkTimer >= 30) {
        this.fireworkTimer = 0;
        this.fireworksLeft--;
        const fx = 204 * TILE_SIZE + 8 + (Math.random() * 40 - 20);
        const fy = 40 + (Math.random() * 30);
        this.particles.push(new Firework(fx, fy));
        this.hud.addScore(500);
        this.particles.push(new FloatingScore(fx, fy, '500'));
      }
    }
    // 3. Finished tally & fireworks, reset to 1-1 after delay
    else {
      this.stateTimer++;
      if (this.stateTimer >= 180) {
        this.stateTimer = 120;
        this.state = GameState.START_SCREEN;
        this.startLevel();
      }
    }
  }

  // -------------------------------------------------------------
  // RENDER (NES 256x240)
  // -------------------------------------------------------------
  private render() {
    if (this.state === GameState.TITLE || this.state === GameState.START_SCREEN || this.state === GameState.GAME_OVER) {
      this.hud.render(this.ctx, this.state);
      return;
    }

    // Render In-game World
    this.renderer.renderScene(
      this.cameraX,
      this.isUnderground,
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
      this.castleFlagY
    );

    // Render In-game HUD
    this.hud.render(this.ctx, this.state);
  }
}

// Instantiate and start game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
