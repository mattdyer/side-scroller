import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, platforms, resetGameState } from '../game.js';
import * as game from '../game.js';

describe('Moving Platforms', () => {
    beforeEach(() => {
        // IMPORTANT: resetGameState clears platforms
        resetGameState();
        
        // We must re-add the platforms because resetGameState cleared them
        // and setTestState only adds if they are in the state.
        // However, we want to simulate a level load.
        
        // We can't easily use loadLevel here because it uses fetch.
        // Instead, let's manually populate the platforms array.
        
        setTestState({
            currentLevelData: {
                width: 3000,
                groundLevel: 50,
                pits: [],
                spikes: [],
                enemies: []
            },
            score: 0,
            gameState: 'playing',
            keys: {},
            canvas: { height: 600 }
        });

        // Manually add the platform to the exported platforms array
        platforms.push({ x: 200, y: 400, width: 100, height: 20, vx: 2, range: 100, startX: 200 });
        
        player.x = 250;
        player.y = 350;
        player.vx = 0;
        player.vy = 0;
        player.isGrounded = false;
    });

    it('should move the platform horizontally', async () => {
        expect(platforms.length).toBeGreaterThan(0);
        
        const initialX = platforms[0].x;
        await game.update();
        expect(platforms[0].x).toBe(initialX + 2);

        // Move it far enough to trigger range reversal
        platforms[0].x = 300; 
        await game.update();
        expect(platforms[0].vx).toBe(-2);
    });
});
