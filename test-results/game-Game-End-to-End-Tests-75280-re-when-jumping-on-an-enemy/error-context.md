# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.js >> Game End-to-End Tests >> should update score when jumping on an enemy
- Location: tests/e2e/game.spec.js:13:5

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
  5  |         await page.goto('http://localhost:3000');
  6  |     });
  7  | 
  8  |     test('should have the correct initial score', async ({ page }) => {
  9  |         const scoreElement = page.locator('#score');
  10 |         await expect(scoreElement).toHaveText('0');
  11 |     });
  12 | 
  13 |     test('should update score when jumping on an enemy', async ({ page }) => {
  14 |         await page.waitForFunction(() => window.game !== undefined);
  15 |         await page.evaluate(() => {
  16 |             window.game.resetGameState();
  17 |             window.game.setGameState({
  18 |                 currentLevelData: {
  19 |                     width: 3000,
  20 |                     enemies: [{ x: 150, y: 250, type: 'zombie' }],
  21 |                     groundLevel: 50
  22 |                 },
  23 |                 canvas: { height: 600 }
  24 |             });
  25 |         });
  26 |         
  27 |         // Move player to be above the enemy and jump
  28 |         await page.evaluate(() => {
  29 |             window.game.player.x = 150;
  30 |             window.game.player.y = 250;
  31 |             window.game.player.vy = -15; // Jump up
  32 |         });
  33 | 
  34 |         // Wait for a bit for the collision to happen
  35 |         await page.waitForTimeout(100);
  36 | 
  37 |         const scoreElement = page.locator('#score');
> 38 |         await expect(scoreElement).toHaveText('10');
     |                                    ^ Error: expect(locator).toHaveText(expected) failed
  39 |     });
  40 | });
```