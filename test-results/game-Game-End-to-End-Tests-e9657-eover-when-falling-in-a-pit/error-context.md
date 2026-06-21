# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.js >> Game End-to-End Tests >> should trigger gameover when falling in a pit
- Location: tests/e2e/game.spec.js:34:5

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
  19 |         await page.evaluate(async () => {
  20 |             await window.game.loadLevel('assets/levels/level1.json');
  21 |             // We need to make sure player starts above the enemy to allow a jump/fall
  22 |             window.game.player.x = 1000;
  23 |             window.game.player.y = 400;
  24 |             window.game.player.vy = -15;
  25 |         });
  26 |         
  27 |         // Wait for the jump and fall to complete
  28 |         await page.waitForTimeout(3000);
  29 | 
  30 |         const scoreElement = page.locator('#score');
  31 |         await expect(scoreElement).toHaveText('10');
  32 |     });
  33 | 
  34 |     test('should trigger gameover when falling in a pit', async ({ page }) => {
  35 |         await page.waitForFunction(() => window.game !== undefined);
  36 |         await page.evaluate(async () => {
  37 |             await window.game.loadLevel('assets/levels/level1.json');
  38 |             // We need to make sure player starts above the pit
  39 |             window.game.player.x = 550;
  40 |             window.game.player.y = 300;
  41 |         });
  42 |         
  43 |         // Wait for player to fall into the pit
  44 |         await page.waitForTimeout(3000);
  45 | 
  46 |         const gameState = await page.evaluate(() => window.game.gameState);
> 47 |         expect(gameState).toBe('gameover');
     |                           ^ Error: expect(received).toBe(expected) // Object.is equality
  48 |     });
  49 | });
  50 | 
```