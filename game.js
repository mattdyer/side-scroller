import { Entity } from './Entity.js';

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

export const enemies = [];

export const level = {
    width: 3000
};

export let currentLevelData = null;
export let gameState = 'playing';
export let score = 0;
export let keys = {};

if (typeof window !== 'undefined') {
    window.game = {
        get player() { return player; },
        get enemies() { return enemies; },
        get gameState() { return gameState; },
        get score() { return score; },
        get config() { return config; },
        setGameState: setTestState
    };
}

export const images = {
    player: typeof Image !== 'undefined' ? new Image() : null,
    zombie: typeof Image !== 'undefined' ? new Image() : null
};

export let canvas = null;
export let ctx = null;
export let scoreElement = null;

export function setTestState(state) {
    if (state.currentLevelData !== undefined) currentLevelData = state.currentLevelData;
    if (state.score !== undefined) score = state.score;
    if (state.gameState !== undefined) gameState = state.gameState;
    if (state.keys !== undefined) Object.assign(keys, state.keys);
    if (state.enemies !== undefined) {
        enemies.length = 0;
        state.enemies.forEach(e => enemies.push(e));
    }
    if (state.canvas !== undefined) canvas = state.canvas;
    if (state.ctx !== undefined) ctx = state.ctx;
    if (state.scoreElement !== undefined) scoreElement = state.scoreElement;
}

export async function loadLevel(levelPath) {
    try {
        const response = await fetch(levelPath);
        const levelData = await response.json();
        currentLevelData = levelData;
        
        const groundLevel = levelData.groundLevel || config.groundLevel;
        
        enemies.length = 0;
        currentLevelData.enemies.forEach(enemyData => {
            const enemy = new Entity(
                enemyData.x,
                canvas.height - groundLevel - 50,
                50,
                50
            );
            enemy.vx = -2;
            enemy.type = enemyData.type;
            enemy.isDead = false;
            enemy.image = images.zombie;
            enemies.push(
                enemy
            );
        });
        
        player.x = 100;
        player.y = 300;
        player.vx = 0;
        player.vy = 0;
        player.isDead = false;
        player.isGrounded = false;
        level.width = currentLevelData.width;
    } catch (error) {
        console.error("Failed to load level:", error);
    }
}

export function checkCollisions() {
    if (!currentLevelData || !canvas) return;

    const groundLevel = currentLevelData.groundLevel || config.groundLevel;

    if (currentLevelData.pits) {
        currentLevelData.pits.forEach(pit => {
            if (
                player.x < pit.x + pit.width &&
                player.x + player.width > pit.x &&
                player.y + player.height > canvas.height - groundLevel
            ) {
                gameState = 'gameover';
            }
        });
    }

    if (currentLevelData.spikes) {
        currentLevelData.spikes.forEach(spike => {
            const isColliding = (
                player.x < spike.x + spike.width &&
                player.x + player.width > spike.x &&
                player.y < spike.y + spike.height &&
                player.y + player.height > spike.y
            );
            if (isColliding) {
                gameState = 'gameover';
            }
        });
    }

    enemies.forEach(enemy => {
        if (enemy.isDead) return;

        const isColliding = (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        );

        if (isColliding) {
            const isHittingFromAbove = player.vy > 0 && 
                                     player.y + player.height < enemy.y + 25 && 
                                     player.y + player.height > enemy.y;

            if (isHittingFromAbove) {
                enemy.isDead = true;
                player.vy = config.jumpStrength * 0.7;
                score += 10;
                if (scoreElement) scoreElement.innerText = score;
            } else {
                gameState = 'gameover';
            }
        }
    });
}

export function update() {
    if (gameState !== 'playing') return;
    if (!currentLevelData) return;

    if (keys['ArrowLeft']) {
        player.vx = -config.moveSpeed;
    } else if (keys['ArrowRight']) {
        player.vx = config.moveSpeed;
    } else {
        player.vx = 0;
    }

    if (keys['Space'] && player.isGrounded) {
        player.vy = config.jumpStrength;
        player.isGrounded = false;
    }

    player.vy += config.gravity;
    player.update();

    const currentGroundY = canvas.height - (currentLevelData.groundLevel || config.groundLevel);
    if (player.y + player.height > currentGroundY) {
        player.y = currentGroundY - player.height;
        player.vy = 0;
        player.isGrounded = true;
    }

    enemies.forEach(enemy => {
        if (!enemy.isDead) {
            enemy.update();
            if (enemy.x < 0) enemy.x = 0;
        }
    });

    checkCollisions();

    if (keys['KeyR']) {
        location.reload();
    }
}

export function draw() {
    if (!ctx) return;
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

    player.draw(ctx);

    enemies.forEach(enemy => {
        if (!enemy.isDead) {
            enemy.draw(ctx);
        }
    });

    ctx.restore();
}
