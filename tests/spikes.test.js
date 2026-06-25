import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, enemies, spikes, platforms, resetGameState } from '../game.js';
import * as game from '../game.js';

describe('Spike Collision', () => {
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

    it('should trigger gameover when player hits a spike', async () => {
        game.currentLevelData.spikes.push({ x: 150, y: 300, width: 20, height: 20 });
        
        // Move player towards spike
        player.vx = 50; 
        game.keys['ArrowRight'] = true;
        
        await game.update();
        
        expect(game.gameState).toBe('gameover');
    });
});
