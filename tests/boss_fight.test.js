import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, enemies, resetGameState } from '../game.js';
import * as game from '../game.js';

describe('Boss Fight', () => {
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
        
        // Add a boss
        const boss = new game.Entity(500, 300, 100, 100);
        boss.type = 'boss';
        boss.hp = 100;
        enemies.push(boss);
    });

    it('should reduce boss hp when player jumps on it', async () => {
        player.x = 500;
        // Player is at y=260, so y + height = 310.
        // Boss is at y=300.
        // isHittingFromAbove: 310 < 300 + 25 (325) AND 310 >= 300.
        player.y = 260;
        player.vy = 10; // Falling onto boss
        
        await game.update();
        
        expect(enemies[0].hp).toBe(90);
    });

    it('should trigger gameover when player hits boss from the side', async () => {
        player.x = 460; // Overlap the boss
        player.y = 300;
        player.vx = 10; // Moving towards boss
        
        await game.update();
        
 
        expect(game.gameState).toBe('gameover');
    });
});
