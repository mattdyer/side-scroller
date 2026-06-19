import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as game from '../game.js';

describe('Level Loading', () => {
    beforeEach(() => {
        game.resetGameState();
        
        const mockCanvas = {
            width: 800,
            height: 600,
            getContext: vi.fn(() => ({
                clearRect: vi.fn(),
                save: vi.fn(),
                restore: vi.fn(),
                translate: vi.fn(),
                fillRect: vi.fn(),
                drawImage: vi.fn()
            }))
        };
        const mockCtx = mockCanvas.getContext('2d');
        const mockScoreElement = { innerText: '' };

        game.setTestState({
            canvas: mockCanvas,
            ctx: mockCtx,
            scoreElement: mockScoreElement
        });

        // Mock fetch
        global.fetch = vi.fn();
    });

    it('should load level data correctly', async () => {
        const levelData = {
            width: 3000,
            enemies: [
                { x: 500, y: 450, type: 'zombie' }
            ],
            pits: [],
            spikes: []
        };

        global.fetch.mockResolvedValue({
            json: () => Promise.resolve(levelData),
        });

        await game.loadLevel('assets/levels/test_level.json');

        expect(game.currentLevelData).toEqual(levelData);
        expect(game.enemies.length).toBe(1);
        expect(game.enemies[0].x).toBe(500);
        expect(game.enemies[0].type).toBe('zombie');
        expect(game.level.width).toBe(3000);
    });
});
