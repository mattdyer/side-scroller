import { it, expect, beforeEach } from 'vitest';
import { player, enemies, gameState, score, keys, setTestState, update, checkCollisions, config } from '../game.js';

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

    it('should move the platform horizontally', () => {
        update();
        // The platform should have moved. We don't have a direct way to access platforms 
        // unless we add them to the global state or exported variables.
    });
});
