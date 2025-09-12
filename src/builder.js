export default class Builder {
    constructor() {
    }

    setUp(engine) {
        this.e = engine;
        this.scene = engine.scene;
        
        // Initialize challenge system
        this.challenges1 = [
            ['ran', 0.3, 0, 1],
            ['mover', 0.3, 0, 1],
            ['break', 0.3, 0, 1]
        ]; // Levels 3-4
        this.challenges2 = [
            ['mover', 0.6, 1, 2],
            ['break', 0.6, 1, 2],
            ['ran', 0.6, 1, 2]
        ]; // Levels 5-6
        this.challenges3 = [
            ['mover', 0.9, 1, 2],
            ['break', 0.9, 1, 2],
            ['ran', 0.9, 1, 2]
        ]; // Levels 7-9
        this.challenges4 = [
            ['mover', 0.9, 2, 3],
            ['break', 0.9, 2, 3],
            ['ran', 0.9, 2, 3]
        ]; // Levels 10+
        this.levelChallenges = {}; // Store assigned challenges for each level
        
        // Debug mode for testing challenges
        this.debugChallengeMode = false; // Ensure debug mode is off
        this.debugChallenge = ['ran', 0.3, 1, 2]; // The challenge to test on level 2
    }

    assignChallengeToLevel(level) {
        // Debug mode: assign debug challenge to level 2
        if (this.debugChallengeMode && level === 2) {
            return this.debugChallenge;
        }
        
        // Assign a random challenge to a level based on level range
        let challengePool = [];
        
        if (level >= 3 && level <= 4) {
            challengePool = this.challenges1;
        } else if (level >= 5 && level <= 6) {
            challengePool = this.challenges2;
        } else if (level >= 7 && level <= 9) {
            challengePool = this.challenges3;
        } else if (level >= 10) {
            challengePool = this.challenges4;
        }
        
        // If no challenges available, return null
        if (challengePool.length === 0) {
            return null;
        }
        
        // Pick a random challenge from the pool
        const randomIndex = Math.floor(Math.random() * challengePool.length);
        return challengePool[randomIndex];
    }

    generatePlatforms() {
        //console.log('Generating all platforms...');
        const platformsContainer = document.getElementById('platforms');
        platformsContainer.innerHTML = '';

        // Create starting platform below player (player starts at Y=100, so platform at Y=50)
        const startingPlatform = {
            x: this.scene.getGameWidth() / 2 - 30, // Center the platform
            y: 50,
            width: 60,
            height: 15,
            visible: false,
            element: null,
            type: 'regular', // Starting platform is always regular
            velocityX: 0,
            minX: 0,
            maxX: window.innerWidth - 60
        };
        this.scene.platforms.push(startingPlatform);
        this.createPlatformElement(startingPlatform);

        // Generate platforms for each level (up to 30 levels)
        let level = 1;
        while (level <= 30) {

            // Assign challenge to this level at the start
            this.levelChallenges[level] = this.assignChallengeToLevel(level);
            if (this.levelChallenges[level]) {
                //console.log(`Level ${level} assigned challenge: ${this.levelChallenges[level]}`);
            }
            
            // Get spacing for this level
            let spacing;
            if (level <= 15) {
                spacing = 50 + (level - 1) * (100 / 14); // 50 to 150 over 15 levels (more gradual)
            } else {
                spacing = 150; // Fixed at 150px for levels 16+
            }
            
            // Generate platforms for this level (2000 height units per level)
            let y = (level - 1) * 2000 + 50; // Start Y for this level
            while (y < level * 2000) {

                // 50% chance for varied spacing between 0.25x and 1.0x
                let currentSpacing = spacing;
                if (Math.random() < 0.5) {
                    const multiplier = 0.25 + Math.random() * 0.75; // Random between 0.25 and 1.0
                    currentSpacing *= multiplier;
                }
                
                // Create platform data inline instead of using function
                const yVariation = (Math.random() - 0.5) * 40; // ±20px variation
                
                // Determine platform type based on level challenge
                let platformType = 'regular';
                const levelChallenge = this.levelChallenges[level];
                if (levelChallenge && levelChallenge.length >= 2) {
                    const [challengeType, likelihood] = levelChallenge;
                    if (Math.random() < likelihood) {
                        if (challengeType === 'ran') {
                            // Randomly choose between mover or break
                            platformType = Math.random() < 0.5 ? 'mover' : 'break';
                        } else {
                            platformType = challengeType;
                        }
                    }
                }
                
                const platform = {
                    x: Math.random() * (this.scene.getGameWidth() - 60),
                    y: y + yVariation,
                    width: 60,
                    height: 15,
                    visible: false,
                    element: null,
                    type: platformType,
                    // Mover platform properties
                    velocityX: platformType === 'mover' ? (Math.random() < 0.5 ? 1 : -1) : 0, // Random initial direction
                    minX: 0,
                    maxX: this.scene.getGameWidth() - 60
                };
                
                // Check for overlaps and remove first overlapping platform if found
                this.checkPlatformOverlap(platform, this.scene.platforms);
                
                this.scene.platforms.push(platform);
                this.createPlatformElement(platform);
                
                y += currentSpacing;

            }
            
            level++;

        }
        
        // Create debug lines after platforms are generated
        this.scene.debugLines = [];
        this.createDebugLines();
        
        // Create bonus pellets for each level
        this.scene.pellets = [];
        this.createBonusPellets();
        
        // Create springs for each level
        this.scene.springs = [];
        this.createSprings();
        
        // Create trap blocks for higher levels
        this.scene.trapBlocks = [];
        this.createTrapBlocks();
        
        // Create bonuses at specific levels
        this.scene.bonuses = [];
        this.createBonuses();
        
        // Create enemies for each level
        this.scene.enemies = [];
        this.createEnemies();
    }

    createPlatformElement(platform) {
        const platformElement = document.createElement('div');
        platformElement.className = 'platform';
        platformElement.style.position = 'absolute';
        platformElement.style.left = platform.x + 'px';
        platformElement.style.bottom = platform.y + 'px'; // Position from bottom
        platformElement.style.width = platform.width + 'px';
        platformElement.style.height = platform.height + 'px';
        platformElement.style.borderRadius = '5px';
        platformElement.style.display = 'none'; // Start hidden
        platformElement.style.zIndex = '1';
        
        // Set color based on platform type
        switch (platform.type) {
            case 'regular':
                platformElement.style.background = '#2196F3'; // Blue (was Green)
                break;
            case 'break':
                platformElement.style.background = '#7e57c2'; // Purple (was Blue)
                break;
            case 'mover':
                platformElement.style.background = '#FFFFFF'; // White
                break;
            default:
                platformElement.style.background = '#4CAF50'; // Default green
        }
        
        // Debug numbers removed
        // platformElement.textContent = Math.round(platform.y) + 'px';
        // platformElement.style.color = '#000000'
        platformElement.style.fontSize = '10px';
        platformElement.style.textAlign = 'center';
        platformElement.style.lineHeight = platform.height + 'px';
        
        // Store reference to element in platform data
        platform.element = platformElement;
        
        document.getElementById('platforms').appendChild(platformElement);
    }

    checkPlatformOverlap(newPlatform, existingPlatforms) {
        for (let i = 0; i < existingPlatforms.length; i++) {
            const existing = existingPlatforms[i];
            
            // Don't remove the starting platform (Y=50)
            if (existing.y === 50) {
                continue;
            }
            
            // Check if platforms are too close vertically (Y position only)
            const minVerticalDistance = 20; // Minimum vertical distance between platforms
            const yDistance = Math.abs(newPlatform.y - existing.y);
            
            if (yDistance < minVerticalDistance) {
                // Remove the first platform that's too close vertically
                const removedPlatform = existingPlatforms.splice(i, 1)[0];
                if (removedPlatform.element) {
                    removedPlatform.element.remove();
                }
                //console.log(`Removed platform too close vertically at Y=${removedPlatform.y}, new platform at Y=${newPlatform.y} (distance: ${yDistance})`);
                return true; // Platform too close found and handled
            }
        }
        return false; // No platforms too close
    }

    updateMoverPlatforms() {
        // Update all visible mover platforms
        for (const platform of this.scene.platforms) {
            if (platform.type === 'mover' && platform.visible && platform.element) {
                // Update X position based on velocity
                platform.x += platform.velocityX;
                
                // Check boundaries and reverse direction
                if (platform.x <= platform.minX) {
                    platform.x = platform.minX;
                    platform.velocityX = Math.abs(platform.velocityX); // Go right
                } else if (platform.x >= platform.maxX) {
                    platform.x = platform.maxX;
                    platform.velocityX = -Math.abs(platform.velocityX); // Go left
                }
                
                // Update DOM element position
                platform.element.style.left = platform.x + 'px';
                
                // Update springs that are on this platform
                this.updateSpringsOnPlatform(platform);
            }
        }
    }

    updateSpringsOnPlatform(platform) {
        for (const spring of this.scene.springs) {
            // Check if this spring belongs to this platform
            if (spring.parentPlatform === platform) {
                // Update spring position to follow platform
                spring.x = platform.x + (platform.width - spring.width) / 2;
                spring.y = platform.y + platform.height;
                
                // Update visual position
                if (spring.element) {
                    spring.element.style.left = spring.x + 'px';
                    spring.element.style.bottom = spring.y + 'px';
                }
            }
        }
        // Also update traps on this platform
        if (this.scene.trapBlocks) {
            for (const trap of this.scene.trapBlocks) {
                if (trap.parentPlatform === platform) {
                    trap.x = platform.x + (platform.width - trap.width) / 2;
                    trap.y = platform.y + platform.height;
                    if (trap.element) {
                        trap.element.style.left = trap.x + 'px';
                        trap.element.style.bottom = trap.y + 'px';
                    }
                }
            }
        }
    }

    createBonusPellets() {
        //console.log('Creating bonus pellets...');
        const platformsDiv = document.getElementById('platforms');
        
        // Create 3 pellets per level (30 levels total = 90 pellets)
        for (let level = 1; level <= 30; level++) {
            const levelY = (level - 1) * 2000; // Start Y for this level
            const levelHeight = 2000; // Height of each level
            
            for (let i = 0; i < 3; i++) {
                let attempts = 0;
                let pellet;
                
                // Try to place pellet without overlapping platforms or other pellets
                do {
                    pellet = {
                        x: Math.random() * (this.scene.getGameWidth() - 10),
                        y: levelY + Math.random() * levelHeight,
                        width: 10,
                        height: 10,
                        visible: false,
                        element: null,
                        collected: false,
                        level: level,
                        magnetic: false,
                        originalX: 0,
                        originalY: 0
                    };
                    attempts++;
                } while (attempts < 50 && this.checkPelletOverlap(pellet));
                
                // If we couldn't find a good spot after 50 attempts, place it anyway
                if (attempts >= 50) {
                    //console.log(`Could not find good spot for pellet in level ${level}, placing anyway`);
                }
                
                this.scene.pellets.push(pellet);
                this.createPelletElement(pellet);
            }
        }
        
        //console.log(`Created ${this.scene.pellets.length} bonus pellets`);
    }

    checkPelletOverlap(pellet) {
        // Check overlap with platforms (excluding movers)
        for (const platform of this.scene.platforms) {
            if (platform.type === 'mover') continue; // Skip movers
            
            if (pellet.x < platform.x + platform.width &&
                pellet.x + pellet.width > platform.x &&
                pellet.y < platform.y + platform.height &&
                pellet.y + pellet.height > platform.y) {
                return true; // Overlaps with platform
            }
        }
        
        // Check overlap with other pellets
        for (const otherPellet of this.scene.pellets) {
            if (pellet.x < otherPellet.x + otherPellet.width &&
                pellet.x + pellet.width > otherPellet.x &&
                pellet.y < otherPellet.y + otherPellet.height &&
                pellet.y + pellet.height > otherPellet.y) {
                return true; // Overlaps with other pellet
            }
        }
        
        return false; // No overlaps
    }

    createPelletElement(pellet) {
        const pelletElement = document.createElement('div');
        pelletElement.className = 'pellet';
        pelletElement.style.position = 'absolute';
        pelletElement.style.left = pellet.x + 'px';
        pelletElement.style.bottom = pellet.y + 'px';
        pelletElement.style.width = pellet.width + 'px';
        pelletElement.style.height = pellet.height + 'px';
        pelletElement.style.backgroundColor = '#FFD700'; // Gold color
        pelletElement.style.borderRadius = '50%';
        pelletElement.style.display = 'none'; // Start hidden
        pelletElement.style.zIndex = '2';
        pelletElement.style.boxShadow = '0 0 5px #FFD700';
        
        pellet.element = pelletElement;
        document.getElementById('platforms').appendChild(pelletElement);
    }

    createSprings() {
        //console.log('Creating springs...');
        
        // Create 1-3 springs per level (30 levels total)
        for (let level = 1; level <= 30; level++) {
            const levelY = (level - 1) * 2000; // Start Y for this level
            const levelHeight = 2000; // Height of each level
            
            // Get platforms in this level (excluding break platforms)
            const levelPlatforms = this.scene.platforms.filter(platform => 
                platform.y >= levelY && platform.y < levelY + levelHeight &&
                platform.type !== 'break'
            );
            
            // Create 1-3 springs for this level
            const springCount = Math.floor(Math.random() * 3) + 1; // 1-3 springs
            
            for (let i = 0; i < springCount; i++) {
                if (levelPlatforms.length === 0) break; // No platforms to place spring on
                
                // Pick a random platform from this level that doesn't have a trap
                let randomPlatform;
                let attempts = 0;
                do {
                    randomPlatform = levelPlatforms[Math.floor(Math.random() * levelPlatforms.length)];
                    attempts++;
                } while (randomPlatform.trapWidened && attempts < 10); // Avoid platforms with traps
                
                if (attempts >= 10) break; // Skip if we can't find a platform without traps
                
                const spring = {
                    x: randomPlatform.x + (randomPlatform.width - 24) / 2, // Center on platform
                    y: randomPlatform.y + randomPlatform.height, // On top of platform
                    width: 24,
                    height: 24,
                    visible: false,
                    element: null,
                    collected: false,
                    level: level,
                    platformId: randomPlatform.id || Math.random(), // Reference to platform
                    parentPlatform: randomPlatform // Direct reference to platform object
                };
                
                this.scene.springs.push(spring);
                this.createSpringElement(spring);
            }
        }
        
        //console.log(`Created ${this.scene.springs.length} springs`);
    }

    createTrapBlocks() {
        //console.log('Creating trap blocks...');
        // For levels > 10
        for (let level = 11; level <= 30; level++) {
            const levelPlatforms = this.scene.platforms.filter(platform => 
                platform.y >= (level - 1) * 2000 &&
                platform.y < level * 2000 &&
                (platform.type === 'regular' || platform.type === 'break')
            );
            if (levelPlatforms.length === 0) continue;

            let count = 0;
            if (level <= 15) {
                count = Math.floor(Math.random() * 3) + 1; // 1-3
            } else {
                count = Math.floor(Math.random() * 4) + 3; // 3-6
            }

            for (let i = 0; i < count; i++) {
                const randomPlatform = levelPlatforms[Math.floor(Math.random() * levelPlatforms.length)];
                // Widen platform by 25% once if it has a trap
                if (!randomPlatform.trapWidened) {
                    randomPlatform.trapWidened = true;
                    randomPlatform.width = Math.floor(randomPlatform.width * 1.25);
                    if (randomPlatform.element) {
                        randomPlatform.element.style.width = randomPlatform.width + 'px';
                    }
                    // Reposition springs and other children centered on new width
                    this.updateSpringsOnPlatform(randomPlatform);
                }
                const trap = {
                    x: randomPlatform.x + (randomPlatform.width - 15) / 2,
                    y: randomPlatform.y + randomPlatform.height,
                    width: 15,
                    height: 15,
                    visible: false,
                    element: null,
                    parentPlatform: randomPlatform
                };
                this.scene.trapBlocks.push(trap);
                this.createTrapElement(trap);
            }
        }
        //console.log(`Created ${this.scene.trapBlocks.length} trap blocks`);
    }

    createTrapElement(trap) {
        const el = document.createElement('img');
        el.className = 'trap';
        el.style.position = 'absolute';
        el.style.left = trap.x + 'px';
        el.style.bottom = trap.y + 'px';
        el.style.width = Math.max(18, trap.width) + 'px';
        el.style.height = 'auto';
        el.src = 'src/images/spike.svg';
        el.style.display = 'none';
        el.style.zIndex = '3';
        trap.element = el;
        document.getElementById('platforms').appendChild(el);
    }

    createBonuses() {
        //console.log('Creating bonuses...');
        const bonusLevels = [4, 8, 12, 16];
        for (const level of bonusLevels) {
            const levelPlatforms = this.scene.platforms.filter(platform =>
                platform.y >= (level - 1) * 2000 &&
                platform.y < level * 2000 &&
                (platform.type === 'regular' || platform.type === 'break')
            );
            if (levelPlatforms.length === 0) continue;
            const randomPlatform = levelPlatforms[Math.floor(Math.random() * levelPlatforms.length)];
            const kind = Math.random() < 0.5 ? 'shield' : 'spring_shoes';
            const bonus = {
                x: randomPlatform.x + (randomPlatform.width - 18) / 2,
                y: randomPlatform.y + randomPlatform.height,
                width: 18,
                height: 18,
                visible: false,
                collected: false,
                element: null,
                parentPlatform: randomPlatform,
                type: kind,
            };
            this.scene.bonuses.push(bonus);
            this.createBonusElement(bonus);
        }
        //console.log(`Created ${this.scene.bonuses.length} bonuses`);
    }

    createBonusElement(bonus) {
        const el = document.createElement('div');
        el.className = 'bonus';
        el.style.position = 'absolute';
        el.style.left = bonus.x + 'px';
        el.style.bottom = bonus.y + 'px';
        // Make icons twice as big and keep centered over platform
        const newW = bonus.width * 2;
        const newH = bonus.height * 2;
        el.style.width = newW + 'px';
        el.style.height = newH + 'px';
        el.style.left = (bonus.x - (bonus.width / 2)) + 'px';
        el.style.display = 'none';
        el.style.zIndex = '3';

        // Use specific icon per bonus type
        const img = document.createElement('img');
        img.style.position = 'absolute';
        img.style.left = '0';
        img.style.top = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.pointerEvents = 'none';
        if (bonus.type === 'shield') {
            img.src = 'src/images/shieldIcon.png';
            el.title = 'Shield';
        } else {
            img.src = 'src/images/shoeIcon.png';
            el.title = 'Spring Shoes';
        }
        el.appendChild(img);

        bonus.element = el;
        bonus.image = img;
        document.getElementById('platforms').appendChild(el);
    }

    createSpringElement(spring) {
        const springElement = document.createElement('div');
        springElement.className = 'spring';
        springElement.style.position = 'absolute';
        springElement.style.left = spring.x + 'px';
        springElement.style.bottom = spring.y + 'px';
        springElement.style.width = spring.width + 'px';
        springElement.style.height = spring.height + 'px';
        springElement.style.display = 'none';
        springElement.style.zIndex = '3';

        // Use an <img> for the spring graphic
        const springImg = document.createElement('img');
        springImg.style.position = 'absolute';
        springImg.style.left = '0';
        springImg.style.top = '0';
        springImg.style.width = '100%';
        springImg.style.height = '100%';
        springImg.style.objectFit = 'contain';
        springImg.style.pointerEvents = 'none';
        // Default (not hit) graphic
        springImg.src = 'src/images/springer1.svg';
        springElement.appendChild(springImg);

        spring.element = springElement;
        spring.image = springImg;
        document.getElementById('platforms').appendChild(springElement);
    }

    createDebugLines() {
        //console.log('Creating debug lines...');
        const platformsDiv = document.getElementById('platforms');
        
        // Debug level lines and labels hidden
        /*
        // Create debug lines every 2000px (level boundaries)
        for (let level = 1; level <= 20; level++) {
            const levelY = level * 2000;
            
            const debugLine = document.createElement('div');
            debugLine.className = 'debug-line';
            debugLine.style.position = 'absolute';
            debugLine.style.left = '0';
            debugLine.style.width = '100%';
            debugLine.style.height = '4px';
            debugLine.style.backgroundColor = '#ff0000';
            debugLine.style.bottom = levelY + 'px'; // Position from bottom
            debugLine.style.zIndex = '1000';
            debugLine.style.opacity = '0.8';
            debugLine.style.pointerEvents = 'none';
            
            // Add label
            const levelLabel = document.createElement('div');
            levelLabel.className = 'debug-label';
            levelLabel.textContent = `Level ${level}`;
            levelLabel.style.position = 'absolute';
            levelLabel.style.left = '10px';
            levelLabel.style.bottom = (levelY + 20) + 'px'; // Position from bottom
            levelLabel.style.color = '#ff0000';
            levelLabel.style.fontSize = '14px';
            levelLabel.style.fontWeight = 'bold';
            levelLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            levelLabel.style.padding = '2px 6px';
            levelLabel.style.borderRadius = '3px';
            levelLabel.style.zIndex = '1001';
            levelLabel.style.pointerEvents = 'none';
            
            this.scene.debugLines.push({ line: debugLine, label: levelLabel, level: level, y: levelY });
            platformsDiv.appendChild(debugLine);
            platformsDiv.appendChild(levelLabel);
        }
        */
        
        //console.log(`Created ${this.scene.debugLines.length} debug lines`);
    }

    createEnemies() {
        //console.log('Creating enemies...');
        
        // Create enemies for each level based on challenge data
        for (let level = 1; level <= 30; level++) {
            const levelY = (level - 1) * 2000; // Start Y for this level
            const levelHeight = 2000; // Height of each level
            
            // Get enemy count from level challenge
            let enemyCount = 0;
            const levelChallenge = this.levelChallenges[level];
            if (levelChallenge && levelChallenge.length >= 4) {
                const [challengeType, likelihood, minEnemies, maxEnemies] = levelChallenge;
                if (minEnemies !== undefined && maxEnemies !== undefined) {
                    enemyCount = Math.floor(Math.random() * (maxEnemies - minEnemies + 1)) + minEnemies;
                }
            }
            
            // Create enemies for this level
            for (let i = 0; i < enemyCount; i++) {
                let attempts = 0;
                let enemy;
                
                // Try to place enemy without overlapping platforms
                do {
                    const isBlackHole = Math.random() < 0.25;
                    enemy = {
                        x: Math.random() * (this.scene.getGameWidth() - 100),
                        y: levelY + Math.random() * levelHeight,
                        width: 150,
                        height: 150,
                        visible: false,
                        element: null,
                        destroyed: false,
                        level: level,
                        type: isBlackHole ? 'blackhole' : 'enemy'
                    };
                    attempts++;
                } while (attempts < 50 && this.checkEnemyOverlap(enemy));
                
                // If we couldn't find a good spot after 50 attempts, place it anyway
                if (attempts >= 50) {
                    //console.log(`Could not find good spot for enemy in level ${level}, placing anyway`);
                }
                
                this.scene.enemies.push(enemy);
                this.createEnemyElement(enemy);
            }
        }
        
        //console.log(`Created ${this.scene.enemies.length} enemies`);
    }

    checkEnemyOverlap(enemy) {
        // Check overlap with regular and break platforms (excluding movers)
        for (const platform of this.scene.platforms) {
            if (platform.type === 'mover') continue; // Skip movers
            
            if (enemy.x < platform.x + platform.width &&
                enemy.x + enemy.width > platform.x &&
                enemy.y < platform.y + platform.height &&
                enemy.y + enemy.height > platform.y) {
                return true; // Overlaps with platform
            }
        }
        
        // Check overlap with other enemies
        for (const otherEnemy of this.scene.enemies) {
            if (enemy.x < otherEnemy.x + otherEnemy.width &&
                enemy.x + enemy.width > otherEnemy.x &&
                enemy.y < otherEnemy.y + otherEnemy.height &&
                enemy.y + enemy.height > otherEnemy.y) {
                return true; // Overlaps with other enemy
            }
        }
        
        return false; // No overlaps
    }

    createEnemyElement(enemy) {
        // Create main enemy container
        const enemyContainer = document.createElement('div');
        enemyContainer.className = 'enemy-container';
        enemyContainer.style.position = 'absolute';
        enemyContainer.style.left = enemy.x + 'px';
        enemyContainer.style.bottom = enemy.y + 'px';
        enemyContainer.style.width = enemy.width + 'px';
        enemyContainer.style.height = enemy.height + 'px';
        enemyContainer.style.display = 'none'; // Start hidden
        // Ensure black holes render behind platforms
        enemyContainer.style.zIndex = (enemy.type === 'blackhole') ? '0' : '4';
        
        // Create graphics div for the enemy image
        const enemyGraphics = document.createElement('div');
        enemyGraphics.className = 'enemy-graphics';
        enemyGraphics.style.position = 'absolute';
        enemyGraphics.style.width = '100%';
        enemyGraphics.style.height = '100%';
        // Use an <img> inside graphics container
        const enemyImg = document.createElement('img');
        enemyImg.style.position = 'absolute';
        enemyImg.style.left = '0';
        enemyImg.style.top = '0';
        enemyImg.style.width = '100%';
        enemyImg.style.height = '100%';
        enemyImg.style.objectFit = 'contain';
        enemyImg.style.pointerEvents = 'none';
        if (enemy.type === 'blackhole') {
            // Black hole uses static image
            enemyImg.src = 'src/images/blackHole.png';
            // Rotate the container, scale the image to avoid transform override
            enemyGraphics.classList.add('blackhole-rot');
            enemyImg.classList.add('blackhole-scale');
        } else {
            // Randomly choose monster set 1 or 2
            const useSet2 = Math.random() < 0.5;
            const ani = (useSet2 && this.e.animation.monster2Animation && this.e.animation.monster2Animation.length)
                ? this.e.animation.monster2Animation
                : this.e.animation.monsterAnimation;
            enemyImg.src = ani && ani.length ? ani[0] : 'src/images/monster1/m_1.png';
            enemy.ani = ani;
        }
        enemyGraphics.appendChild(enemyImg);
        
        // Create collision box (smaller than graphics)
        const enemyCollisionBox = document.createElement('div');
        enemyCollisionBox.className = 'enemy-collision-box';
        enemyCollisionBox.style.position = 'absolute';
        enemyCollisionBox.style.width = '60%'; // Smaller than graphics
        enemyCollisionBox.style.height = '60%'; // Smaller than graphics
        enemyCollisionBox.style.left = '20%'; // Center horizontally
        enemyCollisionBox.style.top = '20%'; // Center vertically
        enemyCollisionBox.style.backgroundColor = 'transparent';
        enemyCollisionBox.style.border = 'none';
        enemyCollisionBox.style.borderRadius = '50%';
        enemyCollisionBox.style.pointerEvents = 'none'; // Don't interfere with mouse events
        
        // Add graphics and collision box to container
        enemyContainer.appendChild(enemyGraphics);
        enemyContainer.appendChild(enemyCollisionBox);
        
        // Store references for collision detection
        enemy.element = enemyContainer;
        enemy.graphics = enemyGraphics;
        enemy.image = enemyImg;
        enemy.collisionBox = enemyCollisionBox;
        
        // Store collision box dimensions and position for collision detection
        enemy.collisionWidth = enemy.width * 0.6;
        enemy.collisionHeight = enemy.height * 0.6;
        enemy.collisionX = enemy.x + (enemy.width * 0.2);
        enemy.collisionY = enemy.y + (enemy.height * 0.2);
        
        document.getElementById('platforms').appendChild(enemyContainer);

        // Register image element for animation (src swapping) for regular enemies only
        if (enemy.type !== 'blackhole') {
            if (this.e && this.e.animation && this.e.animation.animatedSprites) {
                this.e.animation.animatedSprites.push({
                    img: enemyImg,
                    ani: enemy.ani || this.e.animation.monsterAnimation,
                    aniSpeed: 0.06,
                    aniLoop: true
                });
            }
        }
    }

    createSampleEnemy() {
        // Create a sample vortex at Y=2000 for testing
        const sampleEnemy = {
            x: 100,
            y: 1000,
            width: 150,
            height: 150,
            visible: false,
            element: null,
            destroyed: false,
            level: 1,
            type: 'blackhole'
        };
        
        this.scene.enemies.push(sampleEnemy);
        this.createEnemyElement(sampleEnemy);
        
        //console.log('Sample enemy created at 1000px for testing');
    }

    spawnSampleEnemyOnScreen() {
        // Spawn an enemy exactly like others and let visibility logic handle showing
        const width = 150;
        const height = 150;
        const screenX = Math.max(0, Math.min(window.innerWidth - width, Math.floor((window.innerWidth - width) / 2)));
        const screenY = Math.floor(window.innerHeight * 0.4);
        const worldY = this.scene.containerBottom + screenY;

        const enemy = {
            x: screenX,
            y: worldY,
            width: width,
            height: height,
            visible: false,
            element: null,
            destroyed: false,
            level: this.scene.currentLevel || 1,
            type: 'enemy'
        };

        this.scene.enemies.push(enemy);
        this.createEnemyElement(enemy);
        //console.log('Spawned on-screen sample enemy at', screenX, worldY);
    }

    // Removed large visual preview per request
}
