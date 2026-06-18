// Mock Image BEFORE importing game.js
if (typeof global.Image === 'undefined') {
    global.Image = class {
        constructor() {
            this.src = '';
        }
    };
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as game from '../game.js';

describe('Game Logic', () => {
    beforeEach(() => {
        // Reset the game state
        game.resetGameState();
        // We can't reassign exported let variables directly in ESM tests
        // But resetGameState already sets currentLevelData = null
        // and handles enemies.length = 0 etc.
        
        // Mock DOM/Canvas
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

        // Mock Image
        global.Image = class {
            constructor() {
                this.src = '';
            }
        };

        // Mock fetch
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    width: 3000,
                    enemies: [],
                    pits: [],
                    spikes: []
                }),
            })
        );
    });

    it('should update player position based on gravity', () => {
        game.setTestState({ currentLevelData: { width: 3000, enemies: [], pits: [], spikes: [] } });
        game.update();
        expect(game.player.vy).toBeGreaterThan(0);
        expect(game.player.y).toBeGreaterThan(300);
    });

    it('should handle player movement left', () => {
        game.setTestState({ currentLevelData: { width: 3000, enemies: [], pits: [], spikes: [] }, keys: { 'ArrowLeft': true } });
        game.update();
        expect(game.player.vx).toBe(-game.config.moveSpeed);
    });

    it('should handle player movement right', () => {
        game.setTestState({ currentLevelData: { width: 3000, enemies: [], pits: [], spikes: [] }, keys: { 'ArrowRight': true } });
        game.update();
        expect(game.player.vx).toBe(game.config.moveSpeed);
    });

    it('should handle jumping', () => {
        game.setTestState({ currentLevelData: { width: 3000, enemies: [], pits: [], spikes: [] } });
        game.player.isGrounded = true;
        game.keys['Space'] = true;
        game.update();
        expect(game.player.vy).toBe(-11.5);
        expect(game.player.isGrounded).toBe(false);
    });

    it('should detect enemy collision and kill enemy when jumping on top', () => {
        game.setTestState({ currentLevelData: { width: 3000, enemies: [], pits: [], spikes: [] } });
        game.enemies.push({
            x: 100,
            y: 300,
            width: 50,
            height: 5.0, // Small height to trigger "above" check
            vx: -2,
            type: 'zombie',
            isDead: false
        });
        game.player.x = 100;
        game.player.y = 290;
        game.player.vy = 0.5;
        
        game.update();
        
        expect(game.enemies[0].isDead).toBe(true);
        expect(game.score).toBe(10);
    });

    it('should set gameover when player hits enemy from side', () => {
        game.setTestState({ currentLevelData: { width: 3000, enemies: [], pits: [], spikes: [] } });
        game.enemies.push({
            x: 100,
            y: 300,
            width: 50,
            height: 50,
            vx: -2,
            type: 'zint',
            isDead: false
        });
        game.player.x = 110;
        game.player.y = 300;
        game.player.vy = 0;
        
        game.update();
        
        expect(game.gameState).toBe('gameover');
    });
});
