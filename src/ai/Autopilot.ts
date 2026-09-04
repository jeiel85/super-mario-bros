// Autopilot AI Controller for Super Mario Bros.
// Automatically controls Mario to navigate, sprint, leap over pits, stomp enemies, and clear stages.

import { Mario } from '../entities/Mario';
import { Enemy, PiranhaPlant } from '../entities/Enemy';
import { Bowser } from '../entities/Bowser';
import { Firebar, Podoboo } from '../entities/CastleHazards';
import { InputManager } from '../input/InputManager';
import { TileType, TILE_SIZE, GameState, MarioForm } from '../constants';

export class Autopilot {
  public enabled = false;
  private jumpHoldTimer = 0;
  private fireballCooldown = 0;
  private swimTimer = 0;
  private waitTimer = 0;

  public toggle(): boolean {
    this.enabled = !this.enabled;
    this.jumpHoldTimer = 0;
    this.fireballCooldown = 0;
    return this.enabled;
  }

  public update(
    input: InputManager,
    gameState: GameState,
    mario: Mario,
    tiles: number[][],
    enemies: Enemy[],
    piranhas: PiranhaPlant[],
    bowser: Bowser | null,
    _firebars: Firebar[],
    _podoboos: Podoboo[],
    _cameraX: number,
    hasAxe: boolean,
    axeX: number,
    flagPoleX: number,
    theme: string
  ) {
    if (!this.enabled) return;

    // Reset synthetic controls
    input.left = false;
    input.right = false;
    input.up = false;
    input.down = false;
    input.jump = false;
    input.run = false;
    input.jumpPressed = false;
    input.runPressed = false;
    input.startPressed = false;

    // 1. Menu & Transition State Handling
    if (gameState === GameState.TITLE) {
      this.waitTimer++;
      if (this.waitTimer > 40) {
        input.startPressed = true;
        this.waitTimer = 0;
      }
      return;
    }

    if (gameState === GameState.CASTLE_CLEAR || gameState === GameState.GAME_VICTORY) {
      this.waitTimer++;
      if (this.waitTimer > 150) {
        input.startPressed = true;
        this.waitTimer = 0;
      }
      return;
    }

    if (gameState === GameState.GAME_OVER) {
      this.waitTimer++;
      if (this.waitTimer > 180) {
        input.startPressed = true;
        this.waitTimer = 0;
      }
      return;
    }

    if (gameState !== GameState.PLAYING) {
      return;
    }

    // 2. Default: Move forward and sprint
    input.right = true;
    input.run = true;

    // 3. Underwater Mode Navigation
    if (theme === 'underwater' || mario.isUnderwater) {
      this.swimTimer++;
      // Swim stroke to maintain safe middle altitude (avoid bottom corals & top ceiling)
      if (mario.y > 130 && this.swimTimer > 24) {
        input.jump = true;
        input.jumpPressed = true;
        this.swimTimer = 0;
      } else if (mario.y > 165) {
        input.jump = true;
        input.jumpPressed = true;
      }
      return;
    }

    // 4. Continue holding jump if currently in an active jump
    if (this.jumpHoldTimer > 0) {
      this.jumpHoldTimer--;
      input.jump = true;
      return;
    }

    const marioTileX = Math.floor(mario.x / TILE_SIZE);

    // 5. Gap / Pit Detection Ahead
    let gapDetected = false;
    for (let dx = 1; dx <= 3; dx++) {
      const tx = marioTileX + dx;
      let hasGround = false;
      for (let ty = 12; ty <= 14; ty++) {
        if (tiles[ty] && this.isSolid(tiles[ty][tx])) {
          hasGround = true;
          break;
        }
      }
      if (!hasGround) {
        gapDetected = true;
        break;
      }
    }

    if (gapDetected && mario.isGrounded) {
      this.triggerJump(input, 26);
      return;
    }

    // 6. Wall / Pipe / Stair Obstacle Detection Ahead
    let obstacleDetected = false;
    for (let dx = 1; dx <= 2; dx++) {
      const tx = marioTileX + dx;
      // Check block at knee/waist/head height
      const checkY1 = Math.floor((mario.y + mario.height - 8) / TILE_SIZE);
      const checkY2 = Math.floor((mario.y + mario.height - 24) / TILE_SIZE);

      if (
        (tiles[checkY1] && this.isSolid(tiles[checkY1][tx])) ||
        (tiles[checkY2] && this.isSolid(tiles[checkY2][tx]))
      ) {
        obstacleDetected = true;
        break;
      }
    }

    if (obstacleDetected && mario.isGrounded) {
      this.triggerJump(input, 24);
      return;
    }

    // 7. Enemy Threat Detection & Attack
    if (this.fireballCooldown > 0) this.fireballCooldown--;

    const nearbyEnemy = enemies.find(
      e => !e.isDead && !e.isFlipped && e.x > mario.x - 12 && e.x < mario.x + 85
    );

    if (nearbyEnemy) {
      // If Mario is Fire Mario and enemy is ahead, shoot fireball!
      if (mario.form === MarioForm.FIRE && this.fireballCooldown <= 0 && nearbyEnemy.x > mario.x + 20) {
        input.run = false;
        input.runPressed = true;
        this.fireballCooldown = 18;
      }

      // Jump over or stomp enemy
      if (mario.isGrounded && nearbyEnemy.x - mario.x < 48) {
        this.triggerJump(input, 20);
        return;
      }
    }

    // 8. Piranha Plant in Pipe Detection
    const nearPiranha = piranhas.find(
      p => !p.isDead && Math.abs(p.x - mario.x) < 55 && p.y < 192
    );
    if (nearPiranha && mario.isGrounded) {
      this.triggerJump(input, 25);
      return;
    }

    // 9. Castle Bowser & Axe Battle
    if (theme === 'castle' && hasAxe) {
      if (bowser && !bowser.isDead && !bowser.isFalling) {
        const distToBowser = bowser.x - mario.x;
        // If close to Bowser, time jump to leap over him or sprint under if he leaps
        if (distToBowser < 60 && distToBowser > -30) {
          if (bowser.y < 160) {
            // Bowser is in mid-air jumping -> sprint underneath to Axe!
            input.right = true;
            input.run = true;
          } else if (mario.isGrounded) {
            // Leap high over Bowser
            this.triggerJump(input, 28);
            return;
          }
        }
      }
      // Run to touch the Axe
      if (mario.x < axeX + 16) {
        input.right = true;
        input.run = true;
      }
    }

    // 10. Flagpole High Leap
    if (flagPoleX > 0 && Math.abs(flagPoleX - mario.x) < 40 && mario.isGrounded) {
      this.triggerJump(input, 30);
      return;
    }
  }

  private triggerJump(input: InputManager, frames: number) {
    input.jump = true;
    input.jumpPressed = true;
    this.jumpHoldTimer = frames;
  }

  private isSolid(tile: number): boolean {
    return (
      tile !== TileType.EMPTY &&
      tile !== TileType.FLAG_POLE &&
      tile !== TileType.FLAG_TOP &&
      tile !== TileType.CASTLE_DOOR &&
      tile !== TileType.COIN
    );
  }
}
