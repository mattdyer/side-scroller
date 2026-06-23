import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as game from '../game.js';
import { player, setTestState, update } from '../game.js';

describe('Moving Platforms', () => {
    beforeEach(() => {
        setTestState({
            currentLevelData: {
                width: 3000,
                groundLevel: 50,
                platforms: [
                    { x: 200, y: 400, width: 100, height: 20, vx: 2, range: 100, startX: 200 }
                ],
                enemies: []
            },
            score: 0,
            gameState: 'playing',
            keys: {},
            canvas: { height: 600 }
        });
        player.x = 250;
        player.y = 350;
        player.vx = 0;
        player.vy = 0;
        player.isGrounded = false;
    });

    it('should move the platform horizontally', async () => {
        game.setTestState({
            currentLevelData: {
                width: 3000,
                groundLevel: 50,
                platforms: [
                    { x: 200, y: 400, width: 100, height: 20, vx: 2, range: 100, startX: 200 }
                ],
                enemies: []
            },
            score: 0,
            gameState: 'playing',
            keys: {},
            canvas: { height: 600 }
        });

        const initialX = game.platforms[0].x;
        await game.update();
        expect(game.platforms[0].x).toBe(initialX + 2);

        // Move it far enough to trigger range reversal
        game.platforms[0].x = 300; 
        await game.update();
        expect(game.platforms[0].vx).toBe(-2);
    });
});
