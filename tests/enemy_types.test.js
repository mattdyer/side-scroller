import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, enemies, resetGameState, projectiles } from '../game.js';
import * as game from '../game.js';

describe('Enemy Types', () => {
    beforeEach(() => {
        resetGameState();
        
        setTestState({
            currentLevelData: {
                width: 3000,
                groundLevel: 50,
                pits: [],
                spikes: [],
                enemies: [],
                powerups: [],
                finishLineX: 1000
            },
            score: 0,
            gameState: 'playing',
            keys: {},
            canvas: { height: 600 }
        });
    });

    it('should move flyer vertically', async () => {
        const flyer = new game.Entity(200, 50, 50, 50); // y = 50, which is < 100
        flyer.type = 'flyer';
        flyer.vy = 1;
        enemies.push(flyer);
        
        await game.update();
        
        // After one update, it should have toggled vy
        expect(flyer.vy).toBe(-1);
    });

    it('should fire projectiles as ranged zombie', async () => {
        const ranged = new game.Entity(200, 300, 50, 50);
        ranged.type = 'ranged';
        enemies.push(ranged);
        
        // We can't easily control Math.random() without mocking it.
        // Let's try to run many updates and see if projectiles are added.
        for (let i = 0; i < 100; i++) {
            await game.update();
        }
        
        // Check if projectiles were added
        expect(projectiles.length).toBeGreaterThan(0);
    });
});
