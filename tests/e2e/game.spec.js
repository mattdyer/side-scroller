import { test, expect } from '@playwright/test';

test.describe('Game End-to-End Tests', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
        // Increase timeout for slow and heavy loading
        test.setTimeout(60000);
        await page.goto('/');
        await page.waitForFunction(() => typeof window.game !== 'undefined');
        const gameKeys = await page.evaluate(() => Object.keys(window.game));
        console.log('TEST_CHECK: window.game keys?', gameKeys);
        const gameExists = await page.evaluate(() => typeof window.game !== 'undefined');
        console.log('TEST_CHECK: window.game exists?', gameExists);
    });

    test('should have the correct initial score', async ({ page }) => {
        await page.waitForFunction(() => window.game !== undefined);
        const scoreElement = page.locator('#score');
        await expect(scoreElement).toHaveText('0');
    });

    test('should update score when jumping on an enemy', async ({ page }) => {
        await page.waitForFunction(() => window.game !== undefined);
        
        // Manually trigger level load and setup player
        await page.evaluate(async () => {
            await window.game.loadLevel('assets/levels/level1.json');
            // In level1, zombie is at x: 1000, y: 500.
            // Player needs to be positioned to jump on it.
            window.game.player.x = 1000;
            window.game.player.y = 400;
            window.game.player.vy = 15;
        });
        
        // Wait for the jump and fall to complete
        await page.waitForTimeout(3500);

        const scoreElement = page.locator('#score');
        await expect(scoreElement).toHaveText('10');
    });

    test('should trigger gameover when falling in a pit', async ({ page }) => {
        await page.waitForFunction(() => window.game !== undefined);
        await page.evaluate(async () => {
            await window.game.loadLevel('assets/levels/level1.json');
            // In level1, pit is at x: 500, width: 100.
            window.game.player.x = 550;
            window.game.player.y = 300;
            window.game.player.vy = 20; // Force fast fall
        });
        
        // Wait for player to fall into the pit
        await page.waitForTimeout(3000);
        
        const gameState = await page.evaluate(() => window.game.gameState);
        expect(gameState).toBe('gameover');
    });

    test('should transition to next level when reaching finish line', async ({ page }) => {
        await page.waitForFunction(() => window.game !== undefined);
        
        // Load level 1
        await page.evaluate(async () => {
            await window.game.loadLevel('assets/levels/level1.json');
        });
    
        // Move player to finish line of level 1 (2800)
        await page.evaluate(async () => {
            window.game.player.x = 2850;
            // We might need a few update ticks
            for(let i=0; i<20; i++) {
                await window.game.update();
            }
        });
    
        // Wait for potential level transition
        await page.waitForFunction(() => window.game.currentLevelData && window.game.currentLevelData.width === 2000);
    
        // Check if player.x was reset to 100 (indicating level 2 loaded)
        // Also check if currentLevelData.width is now 2000
        const playerX = await page.evaluate(() => window.game.player.x);
        const levelWidth = await page.evaluate(() => window.game.currentLevelData.width);
    
        expect(playerX).toBe(100);
        expect(levelWidth).toBe(2000);
    });
});
