import { describe, it, expect, beforeEach, vi } from 'vitest';
import { player, setTestState, update, enemies, projectiles, resetGameState } from '../game.js';
import * as game from '../game.js';

describe('Ranged Enemy', () => {
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
        
        const ranged = new game.Entity(100, 150, 50, 50);
        ranged.type = 'ranged';
        enemies.push(ranged);
    });

    it('should fire projectiles when random roll is low', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.05);
        
        await game.update();
        
        expect(projectiles.length).toBe(1);
        expect(projectiles[0].vx).toBe(-5);
    });

    it('should not fire projectiles when random roll is high', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.9);
        
        await game.update();
        
        expect(projectiles.length).toBe(0);
    });
});
