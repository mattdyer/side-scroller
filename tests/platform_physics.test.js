import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, platforms, resetGameState } from '../game.js';
import * as game from '../game.js';

describe('Platform Physics', () => {
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
        
        platforms.push({ x: 200, y: 400, width: 100, height: 20, vx: 2, vy: 0, range: 100, startX: 200, startY: 400, rangeY: 100 });
        
        player.x = 250;
        player.y = 355; // On top of platform (400 - 20)
        player.vx = 0;
        player.vy = 1;
        player.isGrounded = false;
    });

    it('should move the platform horizontally', async () => {
        const initialX = platforms[0].x;
        await game.update();
        expect(platforms[0].x).toBe(initialX + 2);
    });

    it('should move the player with the platform', async () => {
        const initialPlayerX = player.x;
        await game.update();
        console.log('player.vx after update:', player.vx);
        expect(player.x).toBe(initialPlayerX + 2);
    });
    
    it('should trigger range reversal for the platform', async () => {
        platforms[0].x = 300; 
        await game.update();
        expect(platforms[0].vx).toBe(-2);
    });
});
