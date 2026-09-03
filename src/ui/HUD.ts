// NES Classic HUD & Screen Overlays (Title, Lives, Game Over, In-game HUD)
import { SpriteSheet } from '../graphics/SpriteSheet';
import { GameState } from '../constants';

export class HUD {
  public score = 0;
  public coins = 0;
  public world = '1-1';
  public timeLeft = 400;
  public lives = 3;
  public highScore = 10000;

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

  public resetLevelTime() {
    this.timeLeft = 400;
    this.timerTick = 0;
  }

  public render(ctx: CanvasRenderingContext2D, gameState: GameState) {
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
    }
  }

  // 1. IN-GAME TOP BANNER
  private renderTopBanner(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';

    // Headers
    ctx.fillText('MARIO', 24, 16);
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

    // Background is classic black/blue
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
    ctx.fillText('SUPER MARIO', 40, 75);
    ctx.fillText('BROS.', 88, 98);

    // Subtitle
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#fcb000';
    ctx.fillText('★ 1985 NES WEB EDITION ★', 28, 125);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('1 PLAYER GAME', 72, 160);

    // High Score
    const hiScoreStr = `TOP - ${this.highScore.toString().padStart(6, '0')}`;
    ctx.fillText(hiScoreStr, 80, 185);

    // Blinking Prompt
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = '#fc9838';
      ctx.fillText('PRESS ENTER TO START', 44, 212);
    }

    ctx.restore();
  }

  // 3. START SCREEN ("WORLD 1-1 x 3")
  private renderStartScreen(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 32, 256, 208);

    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';

    ctx.fillText(`WORLD  ${this.world}`, 88, 100);

    // Mario head icon
    const marioImg = SpriteSheet.marioSmall['idle'];
    if (marioImg) {
      ctx.drawImage(marioImg, 96, 120);
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
}
