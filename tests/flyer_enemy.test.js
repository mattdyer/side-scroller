import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, enemies, resetGameState } from '../game.js';
import * as game from '../game.js';

describe('Flyer Enemy', () => {
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
        
        const flyer = new game.Entity(100, 150, 50, 50);
        flyer.type = 'flyer';
        flyer.vy = -2;
        enemies.push(flyer);
    });

    it('should bounce vertically when hitting boundaries', async () => {
        // Move towards top boundary (100)
        // Set y to 101, so next update it will be < 100
        enemies[0].y = 101;
        
        await game.update();
        expect(enemies[0].vy).toBe(2); // It was -2, now it's flipped to 2
        
        // Move towards bottom boundary (400)
        enemies[0].y = 401;
        await game.update();
        expect(enemies[0].vy).toBe(-2);
    });
});
