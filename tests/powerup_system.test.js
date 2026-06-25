import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, powerups, resetGameState } from '../game.js';
import * as game from '../game.js';

describe('Power-up System', () => {
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

    it('should activate speed boost when player collects speed power-up', async () => {
        const speedPowerup = new game.Entity(110, 300, 20, 20);
        speedPowerup.type = 'speed';
        powerups.push(speedPowerup);
        
        // Move player to powerup
        player.vx = 20;
        
        await game.update();
        
        expect(player.components.speedBoostTimer).toBeGreaterThan(0);
        expect(powerups.length).toBe(0);
    });

    it('should activate shield when player collects shield power-up', async () => {
        const shieldPowerup = new game.Entity(110, 300, 20, 20);
        shieldPowerup.type = 'shield';
        powerups.push(shieldPowerup);
        
        // Move player to powerup
        player.vx = 20;
        
        await game.update();
        
        expect(player.components.shieldTimer).toBeGreaterThan(0);
        expect(powerups.length).toBe(0);
    });
});
