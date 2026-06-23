# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.js >> Game End-to-End Tests >> should have the correct initial score
- Location: tests/e2e/game.spec.js:16:5

# Error details

```
Test timeout of 60000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForFunction: Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic: "Score: 0"
  - generic: Arrows to Move | Space to Jump | F to Fullscreen
  - button "Fullscreen" [ref=e2] [cursor=pointer]
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
> 9  |         await page.waitForFunction(() => typeof window.game !== 'undefined');
     |                    ^ Error: page.waitForFunction: Test timeout of 60000ms exceeded.
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
  27 |             await window.game.loadLevel('assets/levels/level1.json');
  28 |             // In level1, zombie is at x: 1000, y: 500.
  29 |             // Player needs to be positioned to jump on it.
  30 |             window.game.player.x = 1000;
  31 |             window.game.player.y = 400;
  32 |             window.game.player.vy = -15;
  33 |         });
  34 |         
  35 |         // Wait for the jump and fall to complete
  36 |         await page.waitForTimeout(3000);
  37 | 
  38 |         const scoreElement = page.locator('#score');
  39 |         await expect(scoreElement).toHaveText('10');
  40 |     });
  41 | 
  42 |     test('should trigger gameover when falling in a pit', async ({ page }) => {
  43 |         await page.waitForFunction(() => window.game !== undefined);
  44 |         await page.evaluate(async () => {
  45 |             await window.game.loadLevel('assets/levels/level1.json');
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
  58 | });
  59 | 
```