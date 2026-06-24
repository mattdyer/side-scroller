import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, enemies, resetGameState } from '../game.js';
import { Entity } from '../Entity.js';

describe('Flyer Enemy', () => {
    beforeEach(() => {
        resetGameState();
        setTestState({
            currentLevelData: {
                width: 3000,
                groundLevel: 50,
                enemies: [],
                pits: [],
                spikes: [],
                platforms: []
            },
            score: 0,
            gameState: 'playing',
            keys: {},
            canvas: { height: 600 }
        });
    });

    it('should move vertically', async () => {
        const enemy = new Entity(100, 300, 50, 50);
        enemy.type = 'flyer';
        enemy.vy = 1;
        enemies.push(enemy);

        await update();
        expect(enemy.y).toBe(301);
    });
});
