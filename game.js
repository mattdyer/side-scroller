import { Entity } from './Entity.js';
export { Entity };
import { updatePhysics, checkCollisions as physicsCheckCollisions } from './physics.js';
export { checkCollisions } from './physics.js';

export const config = {
    gravity: 0.5,
    jumpStrength: -12,
    moveSpeed: 3,
    groundLevel: 5.0,
    canvasWidth: 800,
    canvasHeight: 600
};

export const player = new Entity(10.0, 300, 50, 50);
player.image = typeof Image !== 'undefined' ? new Image() : null;
if(player.image){
    player.image.src = 'assets/images/player.png';
}

export const enemies = [];
export let projectiles = [];
export let platforms = [];
export let powerups = [];

export const level = {
    width: 3000,
    finishLineX: 0,
    index: 0
};

export const levels = ['assets/levels/level1.json', 'assets/levels/level2.json', 'assets/levels/for_boss.json', 'assets/levels/level3.json', 'assets/levels/level4.json', 'assets/levels/level5.json', 'assets/levels/level6.json', 'assets/levels/level7.json', 'assets/levels/level8.json', 'assets/levels/level9.json', 'assets/levels/level10.json'];
let isTransitioning = false;

export let currentLevelData = null;
export let gameState = 'menu';
export let score = 0;
export let highScore = (typeof localStorage !== 'undefined') ? parseInt(localStorage.getItem('pixelZombieHighScore')) || 0 : 0;
export let keys = {};
export let scoreElement = null;
export let highScoreElement = null;
export let canvas = null;
export let ctx = null;

export function updateHighScore(newScore) {
    if (newScore > highScore) {
        highScore = newScore;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('pixelZombieHighScore', highScore.toString());
        }
    }
}

export function setTestState(state) {
    if (state.currentLevelData !== undefined) {
        currentLevelData = state.currentLevelData;
        if (state.currentLevelData.finishLineX !== undefined) {
            level.finishLineX = state.currentLevelData.finishLineX;
        }
    }
    if (state.score !== undefined) score = state.score;
    if (state.highScore !== undefined) highScore = state.highScore;
    if (state.gameState !== undefined) gameState = state.gameState;
    if (state.keys !== undefined) Object.assign(keys, state.keys);
    if (state.enemies !== undefined) {
        enemies.length = 0;
        state.enemies.forEach(e => enemies.push(e));
    }
    if (state.platforms !== undefined) {
        platforms.length = 0;
        state.platforms.forEach(p => platforms.push(p));
    }
    if (state.canvas !== undefined) canvas = state.canvas;
    if (state.ctx !== undefined) ctx = state.ctx;
    if (state.scoreElement !== undefined) scoreElement = state.scoreElement;
    if (state.highScoreElement !== undefined) highScoreElement = state.highScoreElement;
}

if (typeof window !== 'undefined') {
    scoreElement = document.getElementById('score');
    canvas = document.getElementById('gameCanvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    window.game = {
        get player() { return player; },
        get enemies() { return enemies; },
        get gameState() { return gameState; },
        get score() { return score; },
        get config() { return config; },
        get currentLevelData() { return currentLevelData; },
         loadLevel: loadLevel,
          startGame: startGame,
          update: update,
          setGameState: setTestState,
          resetGameState: resetGameState
    };
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

}

export const images = {
    player: typeof Image !== 'undefined' ? new Image() : null,
    zombie: typeof Image !== 'undefined' ? new Image() : null
};

export function resetGameState() {
    player.x = 100;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    player.isDead = false;
    player.isGrounded = false;
    player.components.shieldTimer = 0;
    player.components.speedBoostTimer = 0;
    player.components.doubleJumpAvailable = true;
    enemies.length = 0;
    platforms.length = 0;
    projectiles.length = 0;
    powerups.length = 0;
    currentLevelData = null;
    gameState = 'playing';
    score = 0;
    level.width = 3000;
    level.index = 0;
    level.finishLineX = 0;
    keys = {};
    if (scoreElement) scoreElement.innerText = '0';
    if (highScoreElement) highScoreElement.innerText = highScore.toString();
}

export async function loadLevel(levelPath) {
    try {
        if (typeof window !== 'undefined') {
            scoreElement = document.getElementById('score');
        }
        const response = await fetch(levelPath);
        const levelData = await response.json();
        currentLevelData = levelData;
        const canvasHeight = canvas ? canvas.height : config.canvasHeight;
        player.x = 100;
        player.y = 300;
        player.vx = 0;
        player.vy = 0;

        const groundLevel = levelData.groundLevel || config.groundLevel;
        
        enemies.length = 0;
        platforms.length = 0;
        if (levelData.enemies) {
            levelData.enemies.forEach(enemyData => {
                const enemy = new Entity(
                    enemyData.x,
                    canvasHeight - groundLevel - 50,
                    50,
                    50
                );
                enemy.vx = -2;
                enemy.type = enemyData.type;
                enemy.isDead = false;
                enemy.image = images.zombie;
                enemies.push(enemy);
            });
        }
        if (levelData.platforms) {
            levelData.platforms.forEach(plat => {
                const platform = new Entity(
                    plat.x,
                    plat.y,
                    plat.width,
                    plat.height
                );
                platform.vx = plat.vx || 0;
                platform.vy = plat.vy || 0;
                platform.type = 'platform';
                platforms.push(platform);
            });
        }
        if (levelData.finishLineX) {
            level.finishLineX = levelData.finishLineX;
        }
        level.width = levelData.width || 3000;

    } catch (error) {
        console.error("Failed to load level:", error);
    }
}

export async function startGame(levelPath) {
    await loadLevel(levelPath);
    gameState = 'playing';
}

export function update() {
    if (gameState === 'menu' || gameState === 'gameover' || gameState === 'victory') {
        const startBtn = document.getElementById('startBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (keys['Space']) {
            resetGameState();
            startGame(levels[0]).then(() => {
                gameState = 'playing';
            });
        }
        return;
    }
    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.style.display = 'none';

    if (gameState !== 'playing') return;
    const entities = { player, enemies, platforms, projectiles, powerups };
    const canvasHeight = canvas ? canvas.height : config.canvasHeight;
    const physicsResult = updatePhysics(entities, currentLevelData, config, keys, canvasHeight);
    
    score += physicsResult.scoreUpdate;
    updateHighScore(score);
    if (scoreElement) scoreElement.innerText = score.toString();
    if (highScoreElement) highScoreElement.innerText = highScore.toString();
    if (physicsResult.scoreUpdate > 0) {
        console.log('Score updated! New score:', score);
    }
    if (physicsResult.gameState === 'gameover') {
        gameState = 'gameover';
    }
    
    // Level Progression
    if (currentLevelData && level.finishLineX > 0 && player.x >= level.finishLineX) {
        const nextLevelIndex = level.index + 1;
        if (nextLevelIndex < levels.length) {
            level.index = nextLevelIndex;
            loadLevel(levels[nextLevelIndex]).then(() => {
                // level transition logic
            });
        } else {
            const bossAlive = enemies.some(e => e.type === 'boss' && !e.isDead);
            if (bossAlive) {
                gameState = 'gameover';
            } else {
                gameState = 'victory';
            }
        }
    }
}

export function draw() {
    if (gameState === 'menu') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Pixel Zombie Side-Scroller', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText('Press Space to Start', canvas.width / 2, canvas.height / 2 + 20);
        
        // Add High Score display
        ctx.font = '18px Arial';
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 100);
        return;
    }

    if (gameState === 'gameover' || gameState === 'victory') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        const text = gameState === 'victory' ? 'VICTORY!' : 'GAME OVER';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 50);

        // Add High Score display
        ctx.font = '18px Arial';
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 100);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cameraX = Math.max(0, Math.min(player.x - canvas.width / 2, level.width - canvas.width));

    ctx.save();
    ctx.translate(-cameraX, 0);

    const groundLevel = currentLevelData?.groundLevel || config.groundLevel;

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - groundLevel, level.width, groundLevel);

    if (currentLevelData && currentLevelData.pits) {
        ctx.fillStyle = '#87CEEB';
        currentLevelData.pits.forEach(pit => {
            ctx.fillRect(pit.x, canvas.height - groundLevel, pit.width, groundLevel);
        });
    }

    if (currentLevelData && currentLevelData.spikes) {
        ctx.fillStyle = 'red';
        currentLevelData.spikes.forEach(spike => {
            ctx.fillRect(spike.x, canvas.height - groundLevel - spike.height, spike.width, spike.height);
        });
    }

    if (currentLevelData && currentLevelData.platforms) {
        platforms.forEach(platform => {
            platform.draw(ctx);
        });
    }

    player.draw(ctx);

    enemies.forEach(enemy => {
        if (!enemy.isDead) {
            enemy.draw(ctx);
            if (enemy.type === 'boss' && enemy.hp !== undefined) {
                ctx.fillStyle = 'red';
                const barWidth = enemy.width;
                const barHeight = 5;
                const healthPercent = enemy.hp / 100; 
                ctx.fillRect(enemy.x, enemy.y - 10, barWidth, barHeight);
                ctx.fillStyle = 'green';
                ctx.fillRect(enemy.x, enemy.y - 10, barWidth * healthPercent, barHeight);
            }
        }
    });

    ctx.restore();
}

if (typeof window !== 'undefined') {
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
}
