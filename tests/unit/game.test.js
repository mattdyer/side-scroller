import { expect, test } from 'vitest';
import { player, checkCollisions, gameState, setTestState, update } from '../../game.js';

test('player should be initialized', () => {
    expect(player).toBeDefined();
    expect(player.x).toBe(10.0);
});

test('collision with pit should trigger gameover', async () => {
    const levelData = {
        groundLevel: 5,
        pits: [{ x: 500, width: 100 }],
        spikes: [],
        platforms: [],
        enemies: []
    };
    
    await setTestState({
        currentLevelData: levelData,
        gameState: 'playing'
    });

    // Position player over the pit
    player.x = 550;
    player.y = 750; // Deep enough in the pit
    player.vy = 20;

    await update();
    
    expect(gameState).toBe('gameover');
});
