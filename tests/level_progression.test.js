import { describe, it, expect, beforeEach } from 'vitest';
import { player, setTestState, update, resetGameState, levels } from '../game.js';
import * as game from '../game.js';

describe('Level Progression', () => {
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

    it('should progress to the next level when player reaches finish line', async () => {
        // Move player to finish line
        player.x = 1100;
        
        // Run update
        await game.update();
        
        // Check if level index increased
        expect(game.level.index).toBe(1);
    });

    it('should transition to victory when player reaches end of all levels and no boss is left', async () => {
        // Setup to end of levels
        game.level.index = levels.length - 1;
        player.x = 1100;
        
        // Ensure no enemies are left
        game.setTestState({ enemies: [] });
        
        // Run update
        await game.update();
        
        // Check if gameState is victory
        expect(game.gameState).toBe('victory');
    });

    it('should transition to gameover when player reaches end of all levels but boss is still alive', async () => {
        // Setup to end of levels
        game.level.index = levels.length - 1;
        player.x = 1100;

        // Add a boss that is still alive
        const boss = new game.Entity(500, 300, 50, 50);
        boss.type = 'boss';
        boss.hp = 100;
        boss.isDead = false;
        game.setTestState({
            enemies: [boss]
        });
        
        // Run update
        await game.update();
        
        // Check if gameState is gameover
        expect(game.gameState).toBe('gameover');
    });
});
