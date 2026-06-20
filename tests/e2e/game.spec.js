import { test, expect } from '@playwright/test';

test.describe('Game End-to-End Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    test('should have the correct initial score', async ({ page }) => {
        const scoreElement = page.locator('#score');
        await expect(scoreElement).toHaveText('0');
    });

    test('should update score when jumping on an enemy', async ({ page }) => {
        await page.waitForFunction(() => window.game !== undefined);
        await page.evaluate(() => {
            window.game.resetGameState();
            window.game.setGameState({
                currentLevelData: {
                    width: 3000,
                    enemies: [{ x: 150, y: 250, type: 'zombie' }],
                    groundLevel: 50
                },
                canvas: { height: 600 }
            });
        });
        
        // Move player to be above the enemy and jump
        await page.evaluate(() => {
            window.game.player.x = 150;
            window.game.player.y = 250;
            window.game.player.vy = -15; // Jump up
        });

        // Wait for a bit for the collision to happen
        await page.waitForTimeout(100);

        const scoreElement = page.locator('#score');
        await expect(scoreElement).toHaveText('10');
    });
});