import { Entity } from './Entity.js';

export function checkCollisions(entities, currentLevelData, config, canvasHeight) {
    const { player, enemies, spikes, pits } = entities;
    if (!currentLevelData) return { scoreUpdate: 0, gameState: 'playing' };

    let scoreUpdate = 0;
    let newState = 'playing';

    // Pits
    if (currentLevelData.pits) {
        currentLevelData.pits.forEach(pit => {
            if (
                player.x < pit.x + pit.width &&
                player.x + player.width > pit.x &&
                player.y + player.height > canvasHeight - (currentLevelData.groundLevel || config.groundLevel)
            ) {
                newState = 'gameover';
            }
        });
    }

    // Spikes
    if (currentLevelData.spikes) {
        currentLevelData.spikes.forEach(spike => {
            const isColliding = (
                player.x < spike.x + spike.width &&
                player.x + player.width > spike.x &&
                player.y < spike.y + spike.height &&
                player.y + player.height > spike.y
            );
            if (isColliding) {
                newState = 'else'; // Using a placeholder if needed, but let's just say gameover
                newState = 'gameover';
            }
        });
    }

    // Enemies
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
                                      player.y + player.height >= enemy.y;

            if (isHittingFromAbove) {
                enemy.isDead = true;
                player.vy = config.jumpStrength * 0.7;
                scoreUpdate += 10;
            } else {
                newState = 'gameover';
            }
        }
    });

    return { scoreUpdate, gameState: newState };
}

export function updatePhysics(entities, currentLevelData, config, keys, canvasHeight) {
    const { player, enemies, platforms, projectiles } = entities;
    if (!currentLevelData) return { scoreUpdate: 0, gameState: 'playing' };

    let scoreUpdate = 0;
    let newState = 'playing';

    // 1. Player horizontal movement
    if (keys['ArrowLeft']) {
        player.vx = -config.moveSpeed;

        player.isGrounded = false;
    } else if (keys['ArrowRight']) {
        player.vx = config.moveSpeed;
        player.isGrounded = false;
    } else {
        player.vx = 0;
    }

    // 2. Player jump
    if (keys['Space'] && player.isGrounded) {
        player.vy = config.jumpStrength;
        player.isGrounded = false;
    }

    // 3. Gravity and Player Update
    player.vy += config.gravity;
    player.update();

    // 4. Ground/Pit physics
    const groundLevel = currentLevelData.groundLevel || config.groundLevel;
    const currentGroundY = canvasHeight - groundLevel;

    const isOverPit = currentLevelData.pits?.some(pit => 
        player.x < pit.x + pit.width &&
        player.x + player.width > pit.x
    ) ?? false;

    if (!isOverPit && player.y + player.height > currentGroundY) {
        player.y = currentGroundY - player.height;
        player.vy = 0;
        player.isGrounded = true;
    } else if (isOverPit && player.y + player.height > currentGroundY) {
        player.isGrounded = false;
    }

    // 5. Platform movement
    platforms.forEach(platform => {
        if (platform.vx !== 0) {
            platform.x += platform.vx;
            if (Math.abs(platform.x - platform.startX) > platform.range) {
                platform.vx = -platform.vx;
            }
        }
        if (platform.vy !== 0) {
            platform.y += platform.vy;
            if (Math.abs(platform.y - platform.startY) > platform.rangeY) {
                platform.vy = -platform.vy;
            }
        }
    });

    // 6. Enemy movement
    enemies.forEach(enemy => {
        if (enemy.isDead) return;
        enemy.update();
        
        if (enemy.type === 'flyer') {
            // Simple vertical oscillation for flyer
            if (enemy.y < 200 || enemy.y > 400) {
                enemy.vy = -enemy.vy;
            }
        }
        
        if (enemy.type === 'ranged') {
            // Randomly shoot a projectile
            if (Math.random() < 0.1) {
                const projectile = new Entity(enemy.x, enemy.y, 10, 10);
                projectile.vx = -5;
                projectile.vy = 0;
                projectiles.push(projectile);
            }
        }
        
        if (enemy.x < 0) enemy.x = 0;
    });

    // 6.5. Projectile movement
    projectiles.forEach(projectile => {
        projectile.update();
    });

    // 7. Collision Detection
    const collisionResult = checkCollisions(entities, currentLevelData, config, canvasHeight);
    scoreUpdate += collisionResult.scoreUpdate;
    if (collisionResult.gameState === 'gameover') {
        newState = 'gameover';
    }

    return { scoreUpdate, gameState: newState };
}
