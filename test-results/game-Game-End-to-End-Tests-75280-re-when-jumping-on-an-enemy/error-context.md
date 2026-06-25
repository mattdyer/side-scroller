# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.js >> Game End-to-End Tests >> should update score when jumping on an enemy
- Location: tests/e2e/game.spec.js:22:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('#score')
Expected: "10"
Received: "0"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('#score')
    14 × locator resolved to <span id="score">0</span>
       - unexpected value "0"

```

```yaml
- text: "0"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Game End-to-End Tests', () => {
  4  |     test.beforeEach(async ({ page }) => {
  5  |         page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  6  |         // Increase timeout for slow and heavy loading
  7  |         test.setTimeout(60000);
  8  |         await page.goto('/');
  9  |         await page.waitForFunction(() => typeof window.game !== 'undefined');
  10 |         const gameKeys = await page.evaluate(() => Object.keys(window.game));
  11 |         console.log('TEST_CHECK: window.game keys?', gameKeys);
  12 |         const gameExists = await page.evaluate(() => typeof window.game !== 'undefined');
  13 |         console.log('TEST_CHECK: window.game exists?', gameExists);
  14 |     });
  15 | 
  16 |     test('should have the correct initial score', async ({ page }) => {
  17 |         await page.waitForFunction(() => window.game !== undefined);
  18 |         const scoreElement = page.locator('#score');
  19 |         await expect(scoreElement).toHaveText('0');
  20 |     });
  21 | 
  22 |     test('should update score when jumping on an enemy', async ({ page }) => {
  23 |         await page.waitForFunction(() => window.game !== undefined);
  24 |         
  25 |         // Manually trigger level load and setup player
  26 |         await page.evaluate(async () => {
  27 |             await window.game.startGame('assets/levels/level1.json');
  28 |             // In level1, zombie is at x: 1000, y: 500.
  29 |             // Player needs to be positioned to jump on it.
  30 |             window.game.player.x = 1000;
  31 |             window.game.player.y = 400;
  32 |             window.game.player.vy = 15;
  33 |         });
  34 |         
  35 |         // Wait for the jump and fall to complete
  36 |         await page.waitForTimeout(3500);
  37 | 
  38 |         const scoreElement = page.locator('#score');
> 39 |         await expect(scoreElement).toHaveText('10');
     |                                    ^ Error: expect(locator).toHaveText(expected) failed
  40 |     });
  41 | 
  42 |     test('should trigger gameover when falling in a pit', async ({ page }) => {
  43 |         await page.waitForFunction(() => window.game !== undefined);
  44 |         await page.evaluate(async () => {
  45 |             await window.game.startGame('assets/levels/level1.json');
  46 |             // In level1, pit is at x: 500, width: 100.
  47 |             window.game.player.x = 550;
  48 |             window.game.player.y = 300;
  49 |             window.game.player.vy = 20; // Force fast fall
  50 |         });
  51 |         
  52 |         // Wait for player to fall into the pit
  53 |         await page.waitForTimeout(3000);
  54 |         
  55 |         const gameState = await page.evaluate(() => window.game.gameState);
  56 |         expect(gameState).toBe('gameover');
  57 |     });
  58 | 
  59 |     test('should transition to next level when reaching finish line', async ({ page }) => {
  60 |         await page.waitForFunction(() => window.game !== undefined);
  61 |         
  62 |         // Load level 1
  63 |         await page.evaluate(async () => {
  64 |             await window.game.startGame('assets/levels/level1.json');
  65 |         });
  66 |     
  67 |         // Move player to finish line of level 1 (2800)
  68 |         await page.evaluate(async () => {
  69 |             window.game.player.x = 2850;
  70 |             // We might need a few update ticks
  71 |             for(let i=0; i<20; i++) {
  72 |                 await window.game.update();
  73 |             }
  74 |         });
  75 |     
  76 |         // Wait for potential level transition
  77 |         await page.waitForFunction(() => window.game.currentLevelData && window.game.currentLevelData.width === 2000);
  78 |     
  79 |         // Check if player.x was reset to 100 (indicating level 2 loaded)
  80 |         // Also check if currentLevelData.width is now 2000
  81 |         const playerX = await page.evaluate(() => window.game.player.x);
  82 |         const levelWidth = await page.evaluate(() => window.game.currentLevelData.width);
  83 |     
  84 |         expect(playerX).toBe(100);
  85 |         expect(levelWidth).toBe(2000);
  86 |     });
  87 | });
  88 | 
```