import { describe, it, expect, beforeEach, vi } from 'vitest';
import { player, setTestState, update, resetGameState, level } from '../game.js';
import * as game from '../game.js';

describe('Level Transition', () => {
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
                finishLineX: 500
            },
            score: 0,
            gameState: 'playing',
            keys: {},
            canvas: { height: 600 }
        });
        
        player.x = 450;
        player.y = 300;
        player.vx = 0;
        player.vy = 0;
        player.isGrounded = true;
        level.index = 0;
    });

    it('should transition to next level when player reaches finish line', async () => {
        // Mock fetch for loadLevel
        const mockLevelData = {
            width: 3000,
            groundLevel: 50,
            pits: [],
            spikes: [],
            enemies: [],
            powerups: [],
            finishLineX: 1000
        };
        global.fetch = vi.fn().mockResolvedValue({
            json: () => Promise.resolve(mockLevelData)
        });

        // Move player to finish line
        player.x = 550;
        
        await game.update();
        
        expect(level.index).toBe(1);
    });
});
