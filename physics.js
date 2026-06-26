import { Entity } from './Entity.js';

export function checkCollisions(entities, currentLevelData, config, canvasHeight) {
    const { player, enemies, spikes, pits, platforms, projectiles, powerups } = entities;
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
                                       player.y + player.height < enemy.y + 50 && 
                                       player.y + player.height >= enemy.y;

            if (isHittingFromAbove) {
                if (enemy.type === 'boss') {
                    enemy.hp -= 10;
                    if (enemy.hp <= 0) enemy.isDead = true;
                    player.vy = config.jumpStrength * 0.7;
                    scoreUpdate += 10;
                } else {
                    enemy.isDead = true;
                    player.vy = config.jumpStrength * 0.7;
                    scoreUpdate += 10;
                }
            } else if (player.components.shieldTimer <= 0) {
                newState = 'gameover';
            }
        }
    });

    // Platforms
    if (platforms) {
        platforms.forEach(platform => {
            const isColliding = (
                player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y < platform.y + platform.height &&
                player.y + player.height > platform.y
            );
            if (isColliding) {
                if (player.vy > 0 && player.y + player.height < platform.y + platform.height / 2) {
                    player.y = platform.y - player.height;
                    player.vy = 0;
                    player.isGrounded = true;
                    player.vx = platform.vx || 0;
                }
            }
        });
    }

    // Powerups
    if (powerups) {
        for (let i = powerups.length - 1; i >= 0; i--) {
            const powerup = powerups[i];
            const isColliding = (
                player.x < powerup.x + powerup.width &&
                player.x + player.width > powerup.x &&
                player.y < powerup.y + powerup.height &&
                player.y + player.height > powerup.y
            );
            if (isColliding) {
                if (powerup.type === 'speed') {
                    player.components.speedBoostTimer = 300;
                }
                if (powerup.type === 'shield') {
                    player.components.shieldTimer = 300;
                }
                powerups.splice(i, 1);
            }
        }
    }

    projectiles.forEach(projectile => {
        const isColliding = (
            player.x < projectile.x + projectile.width &&
            player.x + player.width > projectile.x &&
            player.y < projectile.y + projectile.height &&
            player.y + player.height > projectile.y
        );
        if (isColliding && player.components.shieldTimer <= 0) {
            newState = 'gameover';
        }
    });

    return { scoreUpdate, gameState: newState };

}

export function updatePhysics(entities, currentLevelData, config, keys, canvasHeight) {
    const { player, enemies, platforms, projectiles, powerups } = entities;
    if (!currentLevelData) return { scoreUpdate: 0, gameState: 'playing' };

    let scoreUpdate = 0;
    let newState = 'playing';

    // 1. Player horizontal movement
    if (keys['ArrowLeft']) {
        player.vx = -config.moveSpeed;
        //player.isGrounded = false;
    } else if (keys['ArrowRight']) {
        player.vx = config.moveSpeed;
        //player.isGrounded = false;
    } else {
        player.vx = 0;
    }

    // 1.5 Apply Powerups
    if (player.components.speedBoostTimer > 0) {
        player.components.speedBoostTimer--;
        player.vx += 5;
    }

    // 2. Player jump
    if (keys['Space']) {
        if (player.isGrounded) {
            player.vy = config.jumpStrength;
            player.isGrounded = false;
        } else if (player.components.doubleJumpAvailable) {
            player.vy = config.jumpStrength;
            player.components.doubleJumpAvailable = false;
        }
    }

    
    // 3. Gravity
    if(!player.isGrounded) {
        player.vy += config.gravity;
    }else{
        player.vy = 0;
    }

    // 4. Ground/Pit physics
    const groundLevel = currentLevelData.groundLevel || config.groundLevel;
    const currentGroundY = canvasHeight - groundLevel;

    const isOverPit = currentLevelData.pits?.some(pit => 
        player.x < pit.x + pit.width &&
        player.x + player.width > pit.x
    ) ?? false;

    if (!isOverPit && player.y + player.height > currentGroundY && player.y + player.height < canvasHeight) {
        player.y = currentGroundY - player.height;
        player.vy = 0;
        player.isGrounded = true;
        player.components.doubleJumpAvailable = true;
    } else if (isOverPit && player.y + player.height > currentGroundY) {
        player.isGrounded = false;
    }

    // 5. Platform movement
    if (platforms) {
        platforms.forEach(platform => {
            if (platform.vx !== 0) {
                platform.x += platform.vx;
                if (platform.range && Math.abs(platform.x - platform.startX) > platform.range) {
                    platform.vx = -platform.vx;
                }
            }
            if (platform.vy !== 0) {
                platform.y += platform.vy;
                if (platform.rangeY && Math.abs(platform.y - platform.startY) > platform.rangeY) {
                    platform.vy = -platform.vy;
                }
            }
        });
    }

    // 6. Enemy movement
    enemies.forEach(enemy => {
        if (enemy.isDead) return;
        enemy.update();
        
        if (enemy.type === 'flyer') {
            if (enemy.y < 100 || enemy.y > 400) {
                enemy.vy = -enemy.vy;
            }
        }
        
        if (enemy.type === 'ranged' || (enemy.type === 'boss' && (enemy.hp <= 50 || enemy.hp <= 20))) {
            const frequency = enemy.hp <= 20 ? 0.3 : 0.1;
            if (Math.random() < frequency) {
                const projectile = new Entity(enemy.x, enemy.y, 10, 10);
                projectile.vx = -5;
                projectile.vy = 0;
                projectiles.push(projectile);
            }
        }
    });

    // 6.5. Projectile movement
    projectiles.forEach(projectile => {
        projectile.update();
    });

    // 7. Powerup movement
    powerups.forEach(powerup => {
        powerup.update();
    });

    // 9. Collision Detection
    const collisionResult = checkCollisions(entities, currentLevelData, config, canvasHeight);
    scoreUpdate += collisionResult.scoreUpdate;
    if (collisionResult.gameState === 'gameover') {
        newState = 'gameover';
    }

    // 8. Player Update (Moved after collision so vx/vy from collision are applied)
    player.update();

    return { scoreUpdate, gameState: newState };
}
