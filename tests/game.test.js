import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as game from '../game.js';
import { Entity } from '../Entity.js';

describe('Game Logic', () => {
    beforeEach(() => {
        // Reset the game state
        game.resetGameState();
        
        // Mock DOM/Canvas
        const mockCanvas = {
            width: 800, // Just some values
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
                }),
            })
        );
    });

    it('should update player position based on gravity', () => {
        game.setTestState({ currentLevelData: { width: 3000, enemies: [], groundLevel: 50 } });
        game.update();
        expect(game.player.vy).toBeGreaterThan(0);
        expect(game.player.y).toBeGreaterThan(300);
    });

    it('should handle player movement left', () => {
        game.setTestState({ currentLevelData: { width: 3000, enemies: [], groundLevel: 50 }, keys: { 'ArrowLeft': true } });
        game.update();
        expect(game.player.vx).toBe(-game.config.moveSpeed);
    });

    it('should handle player movement right', () => {
        game.setTestState({ currentLevelData: { width: 3000, enemies: [], groundLevel: 50 }, keys: { 'ArrowRight': true } });
        game.update();
        expect(game.player.vx).toBe(game.config.moveSpeed);
    });

    it('should handle jumping', () => {
        game.setTestState({ currentLevelData: { width: 3000, enemies: [], groundLevel: 50 } });
        game.player.isGrounded = true;
        game.keys['Space'] = true;
        game.update();
        expect(game.player.vy).toBe(-11.5);
        expect(game.player.isGrounded).toBe(false);
    });

    it('should detect enemy collision and kill enemy when jumping on top', () => {
        game.setTestState({ currentLevelData: { width: 3000, enemies: [], groundLevel: 50 } });
        const enemy = new Entity(100, 300, 50, 50);
        enemy.type = 'zombie';
        game.enemies.push(enemy);
        
        game.player.x = 100;
        game.player.y = 260;
        game.player.vy = 0.5;
        
        game.update();
        
        expect(enemy.isDead).toBe(true);
        expect(game.score).toBe(10);
    });

    it('should restart the game when pressing space in gameover state', async () => {
        game.setTestState({ 
            currentLevelData: { width: 3000, enemies: [], groundLevel: 50 },
            gameState: 'gameover'
        });
        game.keys['Space'] = true;
        
        // We need to mock loadLevel and startGame to prevent actual fetch
        // But they are exported and use fetch.
        // Since we already mocked fetch in beforeEach, it should work.
        
        await game.update();
        
        expect(game.gameState).toBe('playing');
        expect(game.player.x).toBe(100);
    });
});
