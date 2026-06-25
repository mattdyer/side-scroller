import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, powerups, resetGameState } from '../game.js';
import * as game from '../game.js';

describe('Powerups', () => {
    beforeEach(() => {
        resetGameState();
        
        setTestState({
            currentLevelData: {
                width: 3000,
                groundLevel: 50,
                pits: [],
                spikes: [],
                enemies: [],
                powerups: []
            },
            score: 0,
            gameState: 'playing',
            keys: { ArrowRight: true },
            canvas: { height: 600 }
        });

        // Add a speed boost powerup
        const powerup = new game.Entity(200, 300, 30, 30);
        powerup.type = 'speed';
        powerup.color = 'gold';
        powerups.push(powerup);
        
        player.x = 150;
        player.y = 300;
        player.vx = 5; // Move towards powerup
        player.vy = 0;
    });

    it('should activate speed boost on collision', async () => {
        // Setup: Player and powerup are overlapping
        player.x = 200;
        player.y = 300;
        
        // Call update - this should trigger collision detection
        await game.update();
        
        // Check that the timer was set
        expect(player.components.speedBoostTimer).toBe(300);
        
        // Check that the powerup was removed
        expect(powerups.length).toBe(0);

        // Call update again - the timer should decrease
        await game.update();
        expect(player.components.speedBoostTimer).toBe(299);
    });
});
