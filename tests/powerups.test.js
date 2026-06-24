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
        // Run a few updates to ensure collision
        for (let i = 0; i < 10; i++) {
            await game.update();
        }

        // Check if powerup was removed (it should be removed if collision was handled)
        // Wait, I haven't implemented removal yet.
        // Check if the timer is active and then starts decreasing
        expect(player.components.speedBoostTimer).toBe(300);
        await game.update();
        expect(player.components.speedBoostTimer).toBe(299);
    });
});
