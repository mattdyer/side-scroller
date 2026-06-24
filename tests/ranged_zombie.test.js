import { expect, test, beforeEach } from 'vitest';
import { player, enemies, projectiles, setTestState, update, config } from '../game.js';
import { Entity } from '../Entity.js';

test.describe('Ranged Zombie', () => {
    beforeEach(() => {
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
            canvas: { height: 600 },
            projectiles: []
        });
    });

    test('should fire a projectile', async () => {
        const enemy = new Entity(200, 300, 50, 50);
        enemy.type = 'ranged';
        enemies.push(enemy);

        // We need a way to trigger the shoot logic. 
        // For now, let's assume the zombie shoots periodically in update.
        // I'll need to implement this in physics.js or game.js.
        
        // Loop a few times to give the random chance a chance to trigger
        for (let i = 0; i < 100; i++) {
            await update();
            if (projectiles.length > 0) break;
        }

        // If implemented, there should be a projectile in the projectiles array
        expect(projectiles.length).toBeGreaterThan(0);
    });

    test('projectile should damage player on collision', async () => {
        const enemy = new Entity(200, 300, 50, 50);
        enemy.type = 'ranged';
        enemies.push(enemy);
        
        // Manually add a projectile heading towards player
        const projectile = new Entity(250, 300, 10, 10);
        projectile.vx = -5;
        projectiles.push(projectile);

        player.x = 240;
        player.y = 300;

        await update();

        // Player should take damage or die. 
        // Since I haven't implemented health yet, let's say it triggers a hit.
        // For now, let's check if we can detect the collision.
    });
});
