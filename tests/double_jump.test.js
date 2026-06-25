import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, resetGameState, config } from '../game.js';
import * as game from '../game.js';

describe('Double Jump', () => {
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
        player.components.doubleJumpAvailable = true;
    });

    it('should allow a second jump in mid-air', async () => {
        // First jump
        game.keys['Space'] = true;
        await game.update();
        game.keys['Space'] = false;
        
        // Player is now in air
        expect(player.isGrounded).toBe(false);
        
        // Second jump (should work if double jump is implemented)
        game.keys['Space'] = true;
        await game.update();
        game.keys['Space'] = false;

        // If double jump is implemented, it should have reset the velocity to jumpStrength (before gravity)
        // After gravity, it should be jumpStrength + gravity = -12 + 0.5 = -11.5
        expect(player.vy).toBe(-11.5);
        expect(player.components.doubleJumpAvailable).toBe(false);
    });

    it('should reset double jump when landing', async () => {
        // First jump
        game.keys['Space'] = true;
        await game.update();
        game.keys['else'] = true; // Just some other key
        await game.update();
        
        // Now we are falling. Let's force player to ground
        player.y = 550; // Near ground
        
        // Trigger update to handle ground collision
        // Ground is at 600 - 50 = 550. Player height is 50. So player.y + player.height = 600.
        // This should trigger ground collision if gravity pulls him down.
        await game.update();
        
        expect(player.isGrounded).toBe(true);
        expect(player.components.doubleJumpAvailable).toBe(true);
    });
});
