import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as game from '../game.js';

describe('Game Logic', () => {
    beforeEach(() => {
        // Reset the game state
        game.player.x = 100;
        game.player.y = 300;
        game.player.vx = 0;
        game.player.vy = 0;
        game.player.isGrounded = false;
        game.score = 0;
        game.gameState = 'playing';
        game.enemies.length = 0;
        game.keys = {};
        game.currentLevelData = null;

        // Mock DOM/Canvas
        game.canvas = {
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
        game.ctx = game.canvas.getContext('2d');
        game.scoreElement = { innerText: '' };

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
        game.currentLevelData = { width: 3000, enemies: [], pits: [], spikes: [] };
        game.update();
        expect(game.player.vy).toBeGreaterThan(0);
        expect(game.player.y).toBeGreaterThan(300);
    });

    it('should handle player movement left', () => {
        game.currentLevelData = { width: 3000, enemies: [], pits: [], spikes: [] };
        game.keys['ArrowLeft'] = true;
        game.update();
        expect(game.player.vx).toBe(-game.config.moveSpeed);
    });

    it('should handle player movement right', () => {
        game.currentLevelData = { width: 3000, enemies: [], pits: [], spikes: [] };
        game.keys['ArrowRight'] = true;
        game.update();
        expect(game.player.vx).toBe(game.config.moveSpeed);
    });

    it('should handle jumping', () => {
        game.currentLevelData = { width: 3000, enemies: [], pits: [], spikes: [] };
        game.player.isGrounded = true;
        game.keys['Space'] = true;
        game.update();
        expect(game.player.vy).toBe(game.config.jumpStrength);
        expect(game.player.isGrounded).toBe(false);
    });

    it('should detect enemy collision and kill enemy when jumping on top', () => {
        game.currentLevelData = { width: 3000, enemies: [], pits: [], spikes: [] };
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
        game.currentLevelData = { width: 3000, enemies: [], pits: [], spikes: [] };
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
