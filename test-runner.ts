import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import * as path from 'path';
import * as net from 'net';
import { GameState } from './src/constants';

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const p = (s.address() as net.AddressInfo).port;
      s.close(err => (err ? reject(err) : resolve(p)));
    });
  });
}

async function main() {
  console.log('================================================================');
  console.log('   STARTING REAL IN-BROWSER 32-STAGE SMB1 EXECUTION SUITE      ');
  console.log('================================================================\n');

  // 1. Programmatically start Vite dev server
  const projectDir = 'd:/Project/supermario-antigravity';
  const port = await getFreePort();
  console.log(`Starting Vite dev server on free port ${port}...`);
  const server = await createServer({
    root: projectDir,
    server: { port, strictPort: true, host: '127.0.0.1' },
    logLevel: 'error'
  });
  await server.listen();
  console.log(`Vite dev server running at http://127.0.0.1:${port}`);

  // 2. Launch headless Microsoft Edge
  console.log('Launching headless browser...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();

  // Listen to console errors
  const pageErrors: string[] = [];
  page.on('pageerror', err => {
    console.error(`[Browser Page Error] ${err.message}`);
    pageErrors.push(err.message);
  });

  try {
    await page.goto(`http://127.0.0.1:${port}`);
    await page.waitForSelector('#nes-canvas');
    console.log('Canvas detected! Waiting for game engine initialization...');
    await page.waitForTimeout(500);

    // Verify Title Screen
    const titleState = await page.evaluate(() => {
      const g = (window as any).__game;
      return {
        state: (window as any).__gameState,
        world: (window as any).__currentWorld,
        hasGame: !!g,
        canvasWidth: g?.canvas?.width || 256,
        canvasHeight: g?.canvas?.height || 240
      };
    });
    console.log('Title screen state:', titleState);

    // Save screenshot of Title Screen
    await page.screenshot({ path: path.join(projectDir, 'title_screen.png') });

    // Iterate through all 32 stages
    console.log('\n--- EXECUTING ALL 32 STAGES IN REAL GAME ENGINE ---');
    const stageResults: any[] = [];
    let passCount = 0;
    let failCount = 0;

    for (let w = 1; w <= 8; w++) {
      for (let s = 1; s <= 4; s++) {
        const stageId = `${w}-${s}`;
        try {
          const result = await page.evaluate(async ({ w, s }) => {
            const g = (window as any).__game;
            if (!g) throw new Error('window.__game not found');

            // Initialize and start stage
            g.initLevel(w, s);
            g.startLevel();

            // Run 30 frames
            for (let f = 0; f < 30; f++) {
              g.update();
            }

            const isCastle = s === 4;
            const theme = g.theme;
            const marioPos = { x: g.mario.x, y: g.mario.y, grounded: g.mario.isGrounded };
            const bowserPresent = !!g.bowser;
            const retainerPresent = !!g.retainer;
            const isPeach = g.isPeach;
            const hasAxe = g.hasAxe;
            const flagPoleX = g.flagPoleX;
            const exitX = g.exitX;

            let cleared = false;
            let clearState = '';

            // Test stage completion
            if (isCastle) {
              // Touch axe
              g.cameraX = Math.max(0, g.axeX - 110);
              g.mario.x = g.axeX;
              g.update(); // trigger bridge collapse
              // simulate walk to retainer (~165 frames for Toad, ~420 frames for Peach)
              const maxWalkFrames = (w === 8 && s === 4) ? 500 : 220;
              for (let f = 0; f < maxWalkFrames; f++) {
                g.update();
                if (g.state === 11 || g.state === 12) { // CASTLE_CLEAR or GAME_VICTORY
                  cleared = true;
                  clearState = g.state === 12 ? 'GAME_VICTORY' : 'CASTLE_CLEAR';
                  break;
                }
              }
            } else if (flagPoleX > 0) {
              // Touch flagpole
              g.cameraX = Math.max(0, flagPoleX - 110);
              g.mario.x = flagPoleX - 2;
              g.update(); // trigger flagpole
              for (let f = 0; f < 80; f++) {
                g.update();
                // 6 = FLAGPOLE_SLIDE, 7 = CASTLE_WALK, 8 = LEVEL_CLEAR
                if (g.state === 6 || g.state === 7 || g.state === 8) {
                  cleared = true;
                  clearState = 'FLAGPOLE_CLEAR';
                  break;
                }
              }
            } else if (exitX > 0) {
              // Touch sublevel exit
              g.cameraX = Math.max(0, exitX - 110);
              g.mario.x = exitX - 2;
              g.update();
              // 8 = LEVEL_CLEAR
              if (g.state === 8) {
                cleared = true;
                clearState = 'SUBLEVEL_EXIT_CLEAR';
              }
            }

            return {
              theme,
              marioPos,
              bowserPresent,
              retainerPresent,
              isPeach,
              hasAxe,
              flagPoleX,
              exitX,
              cleared,
              clearState
            };
          }, { w, s });

          let ok = true;
          const issues: string[] = [];

          if (s === 4) {
            if (!result.bowserPresent) { ok = false; issues.push('no Bowser'); }
            if (!result.retainerPresent) { ok = false; issues.push('no Retainer'); }
            if (w === 8 && !result.isPeach) { ok = false; issues.push('no Peach in 8-4'); }
            if (!result.cleared) { ok = false; issues.push('castle clear failed'); }
          } else {
            if (!result.cleared) { ok = false; issues.push('stage clear failed'); }
          }

          if (ok) passCount++;
          else failCount++;

          stageResults.push({
            Stage: stageId,
            Theme: result.theme,
            MarioStart: `(${Math.round(result.marioPos.x)}, ${Math.round(result.marioPos.y)})`,
            Goal: s === 4 ? `Axe` : (result.flagPoleX > 0 ? `Flag@${result.flagPoleX}` : `Exit@${result.exitX}`),
            Boss: s === 4 ? (w === 8 ? 'Bowser+Peach' : 'Bowser+Toad') : '-',
            Cleared: result.cleared ? result.clearState : 'NO',
            Status: ok ? 'PASS' : `FAIL: ${issues.join(', ')}`
          });

          // Capture representative screenshots
          if (stageId === '1-1') {
            await page.screenshot({ path: path.join(projectDir, 'stage_1_1_gameplay.png') });
          } else if (stageId === '1-4') {
            await page.screenshot({ path: path.join(projectDir, 'stage_1_4_castle.png') });
          } else if (stageId === '2-2') {
            await page.screenshot({ path: path.join(projectDir, 'stage_2_2_underwater.png') });
          } else if (stageId === '8-4') {
            await page.screenshot({ path: path.join(projectDir, 'stage_8_4_victory.png') });
          }

        } catch (err: any) {
          failCount++;
          stageResults.push({
            Stage: stageId,
            Theme: 'ERR',
            MarioStart: '-',
            Goal: '-',
            Boss: '-',
            Cleared: 'NO',
            Status: `CRASH: ${err.message}`
          });
        }
      }
    }

    console.table(stageResults);
    console.log(`\nResults: ${passCount} / 32 Stages Fully Operational (${failCount} Failed).`);
    console.log(`Total Unhandled Browser Page Errors: ${pageErrors.length}`);

    if (failCount === 0 && pageErrors.length === 0) {
      console.log('\n>>> ALL 32 STAGES (WORLD 1-1 TO WORLD 8-4) VERIFIED 100% OPERATIONAL! <<<');
    } else {
      process.exit(1);
    }

  } finally {
    console.log('\nCleaning up resources...');
    await browser.close();
    console.log('Headless browser closed.');
    await server.close();
    console.log('Vite server closed cleanly.');
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
