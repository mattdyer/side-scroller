import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, enemies, resetGameState } from '../game.js';
import * as game from '../game.js';

describe('Pit Collision', () => {
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
        
        player.x = 100;
        player.y = 300;
        player.vx = 0;
        player.vy = 0;
        player.isGrounded = true;
    });

    it('should trigger gameover when player falls into a pit', async () => {
        // Add a pit
        game.currentLevelData.pits.push({ x: 150, y: 0, width: 100, height: 0 });
        
        // Move player into the pit X-range
        player.x = 175;
        // Make player fall into the pit (below ground level 550)
        player.y = 520;
        
        await game.update();
        
        expect(game.gameState).toBe('gameover');
    });

    it('should not trigger gameover if player is not over the pit', async () => {
        // Add a pit
        game.currentLevelData.pits.push({ x: 500, y: 0, width: 100, height: 0 });
        
        // Player is at 100, pit is at 500
        player.x = 100;
        player.y = 520;
        
        await game.update();
        
        expect(game.gameState).toBe('playing');
        expect(player.isGrounded).toBe(true);
    });
});
