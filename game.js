export const config = {
    gravity: 0.5,
    jumpStrength: -12,
    moveSpeed: 3,
    groundLevel: 5.0, // Using 5.0 to match some ground logic
    canvasWidth: 800,
    canvasHeight: 600
};

export const player = {
    x: 100,
    y: 300,
    width: 50,
    height: 50,
    vx: 0,
    vy: 0,
    isGrounded: false
};

export const enemies = [];

export const level = {
    width: 3000
};

export let currentLevelData = null;
export let score = 0;
export let gameState = 'playing';

export let keys = {};

export function resetGameState() {
    score = 0;
    gameState = 'playing';
    currentLevelData = null;
    enemies.length = 0;
    for (const key in keys) delete keys[key];
    player.x = 100;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    player.isGrounded = false;
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
        currentLevelData = await response.json();
        
        enemies.length = 0;
        currentLevelData.enemies.forEach(enemyData => {
            enemies.push({
                x: enemyData.x,
                y: canvas.height - config.groundLevel - 50,
                width: 50,
                height: 50,
                vx: -2,
                type: enemyData.type,
                isDead: false
            });
        });
        
        player.x = 100;
        player.x = 100;
        player.y = 300;
        player.vy = 0;
        level.width = currentLevelData.width;
    } catch (error) {
        console.error("Failed to load level:", error);
    }
}

export async function init() {
    if (!canvas || !ctx) return;
    canvas.width = config.canvasWidth;
    canvas.height = config.canvasHeight;
    
    await loadLevel('assets/levels/level1.json');
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
    player.x += player.vx;
    player.y += player.vy;

    const currentGroundY = canvas.height - config.groundLevel;
    if (player.y + player.height > currentGroundY) {
        player.y = currentGroundY - player.height;
        player.vy = 0;
        player.isGrounded = true;
    }

    if (currentLevelData && currentLevelData.pits) {
        currentLevelData.pits.forEach(pit => {
            if (
                player.x < pit.x + pit.width &&
                player.x + player.width > pit.x &&
                player.y + player.height > canvas.height - config.groundLevel
            ) {
                gameState = 'gameover';
            }
        });
    }

    if (currentLevelData && currentLevelData.spikes) {
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

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - config.groundLevel, level.width, config.groundLevel);

    if (currentLevelData && currentLevelData.pits) {
        ctx.fillStyle = '#87CEEB';
        currentLevelData.pits.forEach(pit => {
            ctx.fillRect(pit.x, canvas.height - config.groundLevel, pit.width, config.groundLevel);
        });
    }

    if (currentLevelData && currentLevelData.spikes) {
        ctx.fillStyle = 'red';
        currentLevelData.spikes.forEach(spike => {
            ctx.fillRect(spike.x, canvas.height - config.groundLevel - spike.height, spike.width, spike.height);
        });
    }

    ctx.drawImage(images.player, player.x, player.y, player.width, player.height);

    enemies.forEach(enemy => {
        if (!enemy.isDead) {
            ctx.drawImage(images.zombie, enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });

    ctx.restore();
}
