# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.js >> Game End-to-End Tests >> should trigger gameover when falling in a pit
- Location: tests/e2e/game.spec.js:35:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "gameover"
Received: "playing"
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
  5  |         // Increase timeout for slow loading
  6  |         test.setTimeout(60000);
  7  |         await page.goto('http://localhost:3000');
  8  |     });
  9  | 
  10 |     test('should have the correct initial score', async ({ page }) => {
  11 |         const scoreElement = page.locator('#score');
  12 |         await expect(scoreElement).toHaveText('0');
  13 |     });
  14 | 
  15 |     test('should update score when jumping on an enemy', async ({ page }) => {
  16 |         await page.waitForFunction(() => window.game !== undefined);
  17 |         
  18 |         // Manually trigger level load and setup player
  19 |         await page.evaluate(async ()	=> {
  20 |             await window.game.loadLevel('assets/levels/level1.json');
  21 |             // In level1, zombie is at x: 1000, y: 500.
  22 |             // Player needs to be positioned to jump on it.
  23 |             window.game.player.x = 1000;
  24 |             window.game.player.y = 400;
  25 |             window.game.player.vy = -15;
  26 |         });
  27 |         
  28 |         // Wait for the jump and fall to complete
  29 |         await page.waitForTimeout(3000);
  30 | 
  31 |         const scoreElement = page.locator('#score');
  32 |         await expect(scoreElement).toHaveText('10');
  33 |     });
  34 | 
  35 |     test('should trigger gameover when falling in a pit', async ({ page }) => {
  36 |         await page.waitForFunction(() => window.game !== undefined);
  37 |         await page.evaluate(async () => {
  38 |             await window.game.loadLevel('assets/levels/level1.json');
  39 |             // In level1, pit is at x: 500, width: 100.
  40 |             window.game.player.x = 550;
  41 |             window.game.player.y = 300;
  42 |         });
  43 |         
  44 |         // Wait for player to fall into the pit
  45 |         await page.waitForTimeout(3000);
  46 | 
  47 |         const gameState = await page.evaluate(() => window.game.gameState);
> 48 |         expect(gameState).toBe('gameover');
     |                           ^ Error: expect(received).toBe(expected) // Object.is equality
  49 |     });
  50 | });
  51 | 
```