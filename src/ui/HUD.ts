// NES Classic HUD & Screen Overlays (Title, Lives, Game Over, In-game HUD, Castle Ending)
import { SpriteSheet } from '../graphics/SpriteSheet';
import { GameState } from '../constants';

export class HUD {
  public score = 0;
  public coins = 0;
  public world = '1-1';
  public timeLeft = 400;
  public lives = 3;
  public highScore = 10000;
  public selectedPlayer: 1 | 2 = 1;

  // Starting stage selection for full 32 stages
  public startingWorld = 1;
  public startingStage = 1;

  private timerTick = 0;
  private coinAnimFrame = 0;

  public updateTime(): boolean {
    this.timerTick++;
    // NES timer counts down every ~24 frames (~0.4s)
    if (this.timerTick % 24 === 0) {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        if (this.timeLeft === 0) {
          return true; // Time out!
        }
      }
    }
    return false;
  }

  public addScore(pts: number) {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  public addCoin() {
    this.coins++;
    this.addScore(200);
    if (this.coins >= 100) {
      this.coins = 0;
      this.lives++;
    }
  }

  public resetLevelTime(initialTime = 400) {
    this.timeLeft = initialTime;
    this.timerTick = 0;
  }

  public render(ctx: CanvasRenderingContext2D, gameState: GameState, isPeach = false) {
    // Top banner is rendered in ALL states except TITLE
    if (gameState !== GameState.TITLE) {
      this.renderTopBanner(ctx);
    }

    if (gameState === GameState.TITLE) {
      this.renderTitleScreen(ctx);
    } else if (gameState === GameState.START_SCREEN) {
      this.renderStartScreen(ctx);
    } else if (gameState === GameState.GAME_OVER) {
      this.renderGameOver(ctx);
    } else if (gameState === GameState.PAUSED) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('PAUSE', 108, 120);
      ctx.restore();
    } else if (gameState === GameState.CASTLE_CLEAR || gameState === GameState.GAME_VICTORY) {
      this.renderCastleDialog(ctx, isPeach);
    }
  }

  // 1. IN-GAME TOP BANNER
  private renderTopBanner(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';

    // Headers (Mario or Luigi)
    ctx.fillText(this.selectedPlayer === 2 ? 'LUIGI' : 'MARIO', 24, 16);
    ctx.fillText('WORLD', 144, 16);
    ctx.fillText('TIME', 208, 16);

    // Score (padded to 6 digits)
    const scoreStr = this.score.toString().padStart(6, '0');
    ctx.fillText(scoreStr, 24, 25);

    // Coin icon & count
    this.coinAnimFrame = (this.coinAnimFrame + 0.1) % 4;
    const coinImg = SpriteSheet.items[`coin_${Math.floor(this.coinAnimFrame)}`];
    if (coinImg) {
      ctx.drawImage(coinImg, 88, 18, 8, 8);
    }
    const coinStr = 'x' + this.coins.toString().padStart(2, '0');
    ctx.fillText(coinStr, 98, 25);

    // World & Timer
    ctx.fillText(this.world, 152, 25);
    const timeStr = this.timeLeft.toString().padStart(3, '0');
    ctx.fillText(timeStr, 216, 25);

    ctx.restore();
  }

  // 2. TITLE SCREEN
  private renderTitleScreen(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Background is classic black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 256, 240);

    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';

    // Top HUD
    ctx.fillText('MARIO', 24, 16);
    ctx.fillText('000000', 24, 25);
    ctx.fillText('WORLD', 144, 16);
    ctx.fillText('1-1', 152, 25);
    ctx.fillText('TIME', 208, 16);

    // Big Title Box
    ctx.fillStyle = '#d82800';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText('SUPER MARIO', 40, 68);
    ctx.fillText('BROS.', 88, 90);

    // Subtitle
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#fcb000';
    ctx.fillText('★ 32 STAGES ALL-IN-ONE ★', 24, 114);

    // Player Options
    ctx.fillStyle = '#ffffff';
    ctx.fillText('1 PLAYER GAME', 72, 138);
    ctx.fillText('2 PLAYER GAME', 72, 152);

    // Mushroom Cursor (Movable via Shift / Select)
    const cursorY = this.selectedPlayer === 1 ? 131 : 145;
    const cursorImg = SpriteSheet.ui['mushroom_cursor'];
    if (cursorImg) {
      ctx.drawImage(cursorImg, 56, cursorY);
    }

    // Stage Selector (< / > Left / Right Arrow keys)
    ctx.fillStyle = '#00e8d8';
    ctx.fillText(`STAGE: < WORLD ${this.startingWorld}-${this.startingStage} >`, 40, 172);

    // High Score
    ctx.fillStyle = '#ffffff';
    const hiScoreStr = `TOP - ${this.highScore.toString().padStart(6, '0')}`;
    ctx.fillText(hiScoreStr, 80, 192);

    // Blinking Prompt
    if (Math.floor(Date.now() / 450) % 2 === 0) {
      ctx.fillStyle = '#fc9838';
      ctx.fillText('PRESS ENTER TO START', 44, 210);
    }

    // NES Nintendo Copyright
    ctx.fillStyle = '#ffffff';
    ctx.fillText('©1985 NINTENDO', 68, 228);

    ctx.restore();
  }

  // 3. START SCREEN ("WORLD X-Y x 3")
  private renderStartScreen(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 32, 256, 208);

    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';

    ctx.fillText(`WORLD  ${this.world}`, 88, 100);

    // Mario or Luigi head icon
    const playerImg = this.selectedPlayer === 2 ? SpriteSheet.luigiSmall['idle'] : SpriteSheet.marioSmall['idle'];
    if (playerImg) {
      ctx.drawImage(playerImg, 96, 120);
    }
    ctx.fillText(`x  ${this.lives}`, 122, 132);

    ctx.restore();
  }

  // 4. GAME OVER SCREEN
  private renderGameOver(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 32, 256, 208);

    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('GAME OVER', 88, 120);

    ctx.restore();
  }

  // 5. CASTLE VICTORY DIALOG (Toad or Princess Peach)
  private renderCastleDialog(ctx: CanvasRenderingContext2D, isPeach: boolean) {
    ctx.save();
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';

    const player = this.selectedPlayer === 2 ? 'LUIGI' : 'MARIO';
    ctx.fillText(`THANK YOU ${player}!`, 64, 80);

    if (!isPeach) {
      ctx.fillText('BUT OUR PRINCESS IS IN', 40, 110);
      ctx.fillText('ANOTHER CASTLE!', 68, 126);
    } else {
      ctx.fillStyle = '#fcb000';
      ctx.fillText('YOUR QUEST IS OVER.', 52, 106);
      ctx.fillText('WE PRESENT YOU A NEW QUEST.', 20, 122);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('PUSH BUTTON B TO SELECT WORLD', 12, 148);
    }

    ctx.restore();
  }
}
