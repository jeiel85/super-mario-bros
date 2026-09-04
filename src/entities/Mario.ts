// Mario Player Entity - 100% Faithful NES Physics & State Machine
import {
  TILE_SIZE,
  WALK_ACCEL,
  RUN_ACCEL,
  WALK_MAX_SPEED,
  RUN_MAX_SPEED,
  FRICTION,
  SKID_DECEL,
  GRAVITY,
  JUMP_GRAVITY,
  TERMINAL_VELOCITY,
  JUMP_IMPULSE_WALK,
  JUMP_IMPULSE_RUN,
  JUMP_HOLD_MAX_FRAMES,
  MarioForm,
  Character
} from '../constants';
import { SpriteSheet } from '../graphics/SpriteSheet';
import { InputManager } from '../input/InputManager';
import { NESAudio } from '../audio/NESAudio';
import { SkidSmoke } from './Particle';

export class Mario {
  // Position & Dimensions
  public x = 40;
  public y = 192; // Standing on ground row 12 (12 * 16 = 192)
  public width = 16;
  public height = 16;

  // Velocity
  public vx = 0;
  public vy = 0;
  public prevVy = 0;
  public wasInAir = false;

  // State
  public character: Character = Character.MARIO;
  public form: MarioForm = MarioForm.SMALL;
  public isGrounded = false;
  public isJumping = false;
  public isSkidding = false;
  public isCrouching = false;
  public facingRight = true;
  public throwTimer = 0;

  // Jump Hold tracking
  private jumpHoldTimer = 0;

  // Transformation & Invulnerability
  public isTransforming = false;
  public transformTimer = 0;
  public isInvulnerable = false;
  public invulnerableTimer = 0;

  // Starman power
  public isStarman = false;
  public starTimer = 0;

  // Underwater swimming mode
  public isUnderwater = false;

  // Death
  public isDead = false;
  public deathTimer = 0;

  // Flagpole & Castle sequence
  public isOnFlagPole = false;
  public isWalkingToCastle = false;
  public flagPoleBottomY = 192;
  public castleDoorX = 204 * TILE_SIZE;

  // Pipe entrance sequence
  public isEnteringPipe = false;
  public pipeTimer = 0;
  public pipeTarget: 'underground' | 'surface' | null = null;

  // Animation
  private animTimer = 0;
  private walkFrame = 1; // 1, 2, 3

  constructor() {}

  public reset(startX = 40, startY = 192) {
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.form = MarioForm.SMALL;
    this.height = 16;
    this.isGrounded = false;
    this.isJumping = false;
    this.isSkidding = false;
    this.isCrouching = false;
    this.facingRight = true;
    this.isTransforming = false;
    this.isInvulnerable = false;
    this.isStarman = false;
    this.isDead = false;
    this.isOnFlagPole = false;
    this.isWalkingToCastle = false;
    this.isEnteringPipe = false;
  }

  // Set Super / Big Mario
  public grow() {
    if (this.form === MarioForm.SMALL) {
      this.form = MarioForm.SUPER;
      this.height = 32;
      this.y -= 16; // Shift up to avoid getting stuck in floor
      this.isTransforming = true;
      this.transformTimer = 35;
      NESAudio.playPowerup();
    }
  }

  // Take damage
  public takeDamage(): boolean {
    if (this.isInvulnerable || this.isDead || this.isTransforming) return false;

    if (this.form !== MarioForm.SMALL) {
      // Shrink to small
      this.form = MarioForm.SMALL;
      this.height = 16;
      this.y += 16;
      this.isTransforming = true;
      this.transformTimer = 35;
      this.isInvulnerable = true;
      this.invulnerableTimer = 120; // 2 seconds of invulnerability
      NESAudio.playPipe();
      return false; // Still alive
    } else {
      // Small Mario dies
      this.die();
      return true; // Dead
    }
  }

  public die() {
    if (this.isDead) return;
    this.isDead = true;
    this.vx = 0;
    this.vy = 0;
    this.deathTimer = 0;
    NESAudio.playDeath();
  }

  // -------------------------------------------------------------
  // UPDATE TICK (60 FPS)
  // -------------------------------------------------------------
  public update(
    input: InputManager,
    tiles: number[][],
    cameraX: number,
    onHitBlock: (tileX: number, tileY: number) => void,
    onSpawnSmoke: (smoke: SkidSmoke) => void,
    onShootFireball?: (x: number, y: number, dir: number) => void
  ) {
    // 1. Death Sequence
    if (this.isDead) {
      this.deathTimer++;
      if (this.deathTimer === 25) {
        this.vy = -5.5; // Jump up after brief freeze
      } else if (this.deathTimer > 25) {
        this.y += this.vy;
        this.vy += GRAVITY * 0.8;
      }
      return;
    }

    // 2. Growth / Shrink freeze frame
    if (this.isTransforming) {
      this.transformTimer--;
      if (this.transformTimer <= 0) {
        this.isTransforming = false;
      }
      return;
    }

    // 3. Invulnerability flicker counter
    if (this.isInvulnerable) {
      this.invulnerableTimer--;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    // 4. Starman power timer
    if (this.isStarman) {
      this.starTimer--;
      if (this.starTimer <= 0) {
        this.isStarman = false;
        NESAudio.playOverworld();
      }
    }

    // 5. Flagpole slide & Castle walk sequence
    if (this.isOnFlagPole) {
      if (this.y < this.flagPoleBottomY) {
        this.y += 2.0; // Slide down pole
      } else {
        this.y = this.flagPoleBottomY;
        this.isOnFlagPole = false;
        this.isWalkingToCastle = true;
        this.facingRight = true;
        this.vx = 1.2;
      }
      return;
    }

    if (this.isWalkingToCastle) {
      this.x += this.vx;
      this.animTimer++;
      if (this.animTimer % 6 === 0) {
        this.walkFrame = (this.walkFrame % 3) + 1;
      }
      if (this.x >= this.castleDoorX) {
        this.vx = 0; // Disappear into castle
      }
      return;
    }

    // 6. Pipe entrance sequence
    if (this.isEnteringPipe) {
      this.pipeTimer++;
      this.y += 0.8; // Slide down into pipe
      return;
    }

    // -----------------------------------------------------------
    // NORMAL GAMEPLAY CONTROLS & PHYSICS
    // -----------------------------------------------------------

    const isRunning = input.run;
    const accel = isRunning ? RUN_ACCEL : WALK_ACCEL;
    const maxSpeed = isRunning ? RUN_MAX_SPEED : WALK_MAX_SPEED;

    // Check crouch (Super/Fire Mario only)
    if (input.down && this.form !== MarioForm.SMALL && this.isGrounded) {
      this.isCrouching = true;
      // Allow sliding friction while crouching
      if (this.vx > 0) this.vx = Math.max(0, this.vx - FRICTION * 1.5);
      else if (this.vx < 0) this.vx = Math.min(0, this.vx + FRICTION * 1.5);
    } else {
      this.isCrouching = false;
    }

    // Horizontal Movement
    if (!this.isCrouching) {
      if (input.right) {
        this.facingRight = true;
        if (this.vx < 0) {
          // Skidding to right
          this.vx += SKID_DECEL;
          this.isSkidding = true;
          if (this.isGrounded && Math.abs(this.vx) > 0.8) {
            NESAudio.playSkid();
            onSpawnSmoke(new SkidSmoke(this.x, this.y + this.height - 8));
          }
        } else {
          this.isSkidding = false;
          this.vx = Math.min(maxSpeed, this.vx + accel);
        }
      } else if (input.left) {
        this.facingRight = false;
        if (this.vx > 0) {
          // Skidding to left
          this.vx -= SKID_DECEL;
          this.isSkidding = true;
          if (this.isGrounded && Math.abs(this.vx) > 0.8) {
            NESAudio.playSkid();
            onSpawnSmoke(new SkidSmoke(this.x + 8, this.y + this.height - 8));
          }
        } else {
          this.isSkidding = false;
          this.vx = Math.max(-maxSpeed, this.vx - accel);
        }
      } else {
        // Apply friction
        this.isSkidding = false;
        if (this.vx > 0) {
          this.vx = Math.max(0, this.vx - FRICTION);
        } else if (this.vx < 0) {
          this.vx = Math.min(0, this.vx + FRICTION);
        }
      }
    }

    // Underwater Swimming Physics
    if (this.isUnderwater) {
      if (input.jumpPressed) {
        this.vy = -2.8; // Swimming kick upward
        NESAudio.playJumpSmall();
      }
      this.vy = Math.min(1.8, this.vy + GRAVITY * 0.35); // Slower fall in water
      if (this.y < 16) {
        this.y = 16;
        if (this.vy < 0) this.vy = 0;
      }
    } else {
      // Standard Jump Initiation (A button pressed this frame)
      if (input.jumpPressed && this.isGrounded && !this.isCrouching) {
        const impulse = Math.abs(this.vx) > WALK_MAX_SPEED ? JUMP_IMPULSE_RUN : JUMP_IMPULSE_WALK;
        this.vy = impulse;
        this.isGrounded = false;
        this.isJumping = true;
        this.jumpHoldTimer = JUMP_HOLD_MAX_FRAMES;

        if (this.form === MarioForm.SMALL) {
          NESAudio.playJumpSmall();
        } else {
          NESAudio.playJumpSuper();
        }
      }

      // Variable Jump Height: Holding Jump Sustains Upward Momentum (NES JumpSwimSub)
      if (input.jump && this.isJumping && this.jumpHoldTimer > 0 && this.vy < 0) {
        this.jumpHoldTimer--;
        this.vy += JUMP_GRAVITY;
      } else {
        this.isJumping = false;
        this.vy = Math.min(TERMINAL_VELOCITY, this.vy + GRAVITY);
      }
    }

    // Horizontal Move & Tile Collision
    this.x += this.vx;
    // Don't allow Mario to go past camera left edge
    if (this.x < cameraX) {
      this.x = cameraX;
      this.vx = 0;
    }
    this.resolveHorizontalCollision(tiles);

    // Vertical Move & Tile Collision
    this.prevVy = this.vy;
    this.wasInAir = !this.isGrounded;
    this.y += this.vy;
    this.resolveVerticalCollision(tiles, onHitBlock);

    // Walking animation cycle
    if (this.isGrounded && Math.abs(this.vx) > 0.1) {
      this.animTimer += Math.abs(this.vx) * 0.4;
      this.walkFrame = (Math.floor(this.animTimer) % 3) + 1;
    }

    if (this.throwTimer > 0) {
      this.throwTimer--;
    }

    // Fireball throw (Fire Mario)
    if (this.form === MarioForm.FIRE && input.runPressed && onShootFireball) {
      const dir = this.facingRight ? 1 : -1;
      onShootFireball(this.x + (this.facingRight ? 14 : -6), this.y + 12, dir);
      NESAudio.playFireball();
      this.throwTimer = 8;
    }

    // Pit death check
    if (this.y > 250) {
      this.die();
    }
  }

  // -------------------------------------------------------------
  // COLLISION RESOLUTION (NES AABB TILEMAP)
  // -------------------------------------------------------------
  private resolveHorizontalCollision(tiles: number[][]) {
    const tileY1 = Math.floor(this.y / TILE_SIZE);
    const tileY2 = Math.floor((this.y + this.height - 1) / TILE_SIZE);

    if (this.vx > 0) {
      const tileX = Math.floor((this.x + this.width) / TILE_SIZE);
      if (this.isSolid(tiles, tileX, tileY1) || this.isSolid(tiles, tileX, tileY2)) {
        this.x = tileX * TILE_SIZE - this.width;
        this.vx = 0;
      }
    } else if (this.vx < 0) {
      const tileX = Math.floor(this.x / TILE_SIZE);
      if (this.isSolid(tiles, tileX, tileY1) || this.isSolid(tiles, tileX, tileY2)) {
        this.x = (tileX + 1) * TILE_SIZE;
        this.vx = 0;
      }
    }
  }

  private resolveVerticalCollision(
    tiles: number[][],
    onHitBlock: (tileX: number, tileY: number) => void
  ) {
    const tileX1 = Math.floor(this.x / TILE_SIZE);
    const tileX2 = Math.floor((this.x + this.width - 1) / TILE_SIZE);

    if (this.vy > 0) {
      // Falling down
      const tileY = Math.floor((this.y + this.height) / TILE_SIZE);
      if (this.isSolid(tiles, tileX1, tileY) || this.isSolid(tiles, tileX2, tileY)) {
        this.y = tileY * TILE_SIZE - this.height;
        this.vy = 0;
        this.isGrounded = true;
      } else {
        this.isGrounded = false;
      }
    } else if (this.vy < 0) {
      // Moving up (Hit head on block)
      const tileY = Math.floor(this.y / TILE_SIZE);
      const hitLeft = this.isSolid(tiles, tileX1, tileY);
      const hitRight = this.isSolid(tiles, tileX2, tileY);

      if (hitLeft || hitRight) {
        this.y = (tileY + 1) * TILE_SIZE;
        this.vy = 0;
        this.isJumping = false;

        // Choose which block to hit (prefer left if overlapping more)
        const hitX = hitLeft ? tileX1 : tileX2;
        onHitBlock(hitX, tileY);
      }
    }
  }

  private isSolid(tiles: number[][], tx: number, ty: number): boolean {
    if (ty < 0 || ty >= tiles.length || tx < 0 || tx >= (tiles[0]?.length || 0)) return false;
    const t = tiles[ty][tx];
    // Empty, Flagpole, Flag Top, Castle Door, Coin are non-solid
    return t !== 0 && t !== 13 && t !== 14 && t !== 16 && t !== 20;
  }

  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  public render(ctx: CanvasRenderingContext2D, cameraX: number) {
    // Invulnerability flashing (blink every 4 frames)
    if (this.isInvulnerable && Math.floor(this.invulnerableTimer / 3) % 2 === 0) {
      return;
    }

    const isLuigi = this.character === Character.LUIGI;
    const smallSprites = isLuigi ? SpriteSheet.luigiSmall : SpriteSheet.marioSmall;
    const superSprites = isLuigi ? SpriteSheet.luigiSuper : SpriteSheet.marioSuper;
    const fireSprites = isLuigi ? SpriteSheet.luigiFire : SpriteSheet.marioFire;

    // Death frame
    if (this.isDead) {
      const img = smallSprites['die'];
      if (img) ctx.drawImage(img, Math.round(this.x - cameraX), Math.round(this.y));
      return;
    }

    // Transformation flashing
    let currentSprites = smallSprites;
    if (this.isTransforming && Math.floor(this.transformTimer / 4) % 2 === 0) {
      currentSprites = superSprites;
    } else if (this.form === MarioForm.SUPER) {
      currentSprites = superSprites;
    } else if (this.form === MarioForm.FIRE) {
      currentSprites = fireSprites;
    }

    // Starman 4-stage color cycling
    if (this.isStarman) {
      const cycle = Math.floor(this.starTimer / 4) % 4;
      if (cycle === 1) currentSprites = fireSprites;
      else if (cycle === 2) currentSprites = isLuigi ? SpriteSheet.marioSuper : SpriteSheet.luigiSuper;
      else if (cycle === 3) currentSprites = superSprites;
    }

    // Determine current pose
    let spriteName = 'idle';

    if (this.isOnFlagPole) {
      spriteName = 'flag';
    } else if (this.throwTimer > 0 && (this.form === MarioForm.FIRE || this.form === MarioForm.SUPER)) {
      spriteName = 'throw';
    } else if (!this.isGrounded) {
      spriteName = 'jump';
    } else if (this.isCrouching) {
      spriteName = 'crouch';
    } else if (this.isSkidding) {
      spriteName = 'skid';
    } else if (Math.abs(this.vx) > 0.1) {
      spriteName = `walk${this.walkFrame}`;
    }

    let img = currentSprites[spriteName] || currentSprites['idle'];
    if (!img) return;

    const drawX = Math.round(this.x - cameraX);
    const drawY = Math.round(this.y);
    const isFlip = (!this.facingRight && spriteName !== 'skid') || (this.facingRight && spriteName === 'skid');

    if (isFlip) {
      ctx.save();
      ctx.translate(drawX + img.width, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(img, drawX, drawY);
    }
  }
}
