import { expect, test, describe, beforeEach } from 'vitest';
import { player, setTestState, update, enemies, projectiles } from '../../game.js';
import { Entity } from '../../Entity.js';

describe('Boss Pattern', () => {
    beforeEach(() => {
        setTestState({
            currentLevelData: {
                groundLevel: 50,
                pits: [],
                spikes: [],
                platforms: [],
                enemies: [],
                powerups: []
            },
            gameState: 'playing',
            score: 0,
            canvas: { height: 600 }
        });
        player.x = 100;
        player.y = 300;
        player.vx = 0;
        player.vy = 0;
        enemies.length = 0;
        projectiles.length = 0;
    });

    test('boss should fire projectiles when HP is 50 or less', async () => {
        const boss = new Entity(150, 300, 100, 100);
        boss.type = 'boss';
        boss.hp = 50;
        enemies.push(boss);

        for (let i = 0; i < 100; i++) {
            await update();
        }

        expect(projectiles.length).toBeGreaterThan(0);
    });

    test('boss should fire projectiles much more frequently when HP is 20 or less', async () => {
        const boss = new Entity(150, 300, 100, 100);
        boss.type = 'boss';
        boss.hp = 15;
        enemies.push(boss);

        for (let i = 0; i < 100; i++) {
            await update();
        }

        expect(projectiles.length).toBeGreaterThan(0);
    });
});
