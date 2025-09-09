import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import Engine from './engine.js';

export class Scene {
    constructor() {
        this.e = new Engine();
        this.action = "setup";
        this.skipStartMenu = false;
        this.deviceOrientationWorking = false;
    }

    setUp(engine) {
        this.e = engine;
    }

    buildScene() {
        this.init3DScene();
    }

    init3DScene() {
        // Create a simple scene for the char model
        this.scene3D = this.e.scene3D;
        this.camera3D = this.e.camera;
        this.renderer3D = this.e.renderer;
        
        // Create a simple lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 2.6);
        this.scene3D.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 8);
        directionalLight.position.set(5, 5, 5);
        // directionalLight.castShadow = true;
        this.scene3D.add(directionalLight);
        
        // Create a simple ground plane
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -2.5;
        this.ground.receiveShadow = true;
        // this.scene3D.add(this.ground);
        
        // Create a red test cube
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        this.testCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        this.testCube.position.set(0, 0, 0);
        this.testCube.castShadow = true;
        this.testCube.receiveShadow = true;
        // this.scene3D.add(this.testCube);
        
        // Character will be added when loaded
        this.character = null;
        this.characterAnimMixer = null;
        this.jumpAction = null;
        
        console.log("3D scene initialized for char model");
    }

    setupCharacter() {
        if (!this.e.char) return;
        
        // Use SkeletonUtils.clone like temp3 does
        this.character = SkeletonUtils.clone(this.e.char.scene);
        
        // Add to scene
        this.scene3D.add(this.character);
        
        // Position and scale the character for 100x100 canvas
        this.character.position.set(0, -1, 0);
        this.character.rotation.set(0, 0, 0);
        this.character.scale.set(0.6, 0.6, 0.6);
        
        // Initialize rotation properties
        this.targetRotationY = 0;
        this.currentRotationY = 0;
        
        // Enable shadows
        this.character.castShadow = true;
        this.character.receiveShadow = true;
        
        // Setup animation mixer
        this.characterAnimMixer = new THREE.AnimationMixer(this.character);
        
        // Find and setup jump animation
        if (this.e.char.animations && this.e.char.animations.length > 0) {
            console.log("Available animations:", this.e.char.animations.map(anim => anim.name));
            
            // Try to find jump animation first, then any animation
            this.jumpClip = THREE.AnimationClip.findByName(this.e.char.animations, "jump");
            if (!this.jumpClip) {
                // If no jump animation, try to find any animation
                this.jumpClip = this.e.char.animations[0];
                console.log("Using first available animation:", this.jumpClip.name);
            }
            
            if (this.jumpClip) {
                this.jumpAction = this.characterAnimMixer.clipAction(this.jumpClip);
                this.jumpAction.name = this.jumpClip.name;
                this.jumpAction.setLoop(THREE.LoopRepeat);
                this.jumpAction.clampWhenFinished = false;
                this.jumpAction.setEffectiveWeight(1.0);
                this.jumpAction.timeScale = 0.7; // Make animation slower
                this.jumpAction.play();
                console.log("Animation started:", this.jumpClip.name);
                
                // Debug animation state
                console.log("Animation mixer:", this.characterAnimMixer);
                console.log("Animation action:", this.jumpAction);
                console.log("Animation weight:", this.jumpAction.weight);
                console.log("Animation enabled:", this.jumpAction.enabled);
            } else {
                console.warn("No animations found at all");
            }
        } else {
            console.warn("No animations available in this.e.char.animations");
        }
        
        console.log("Character setup complete");
    }

    restartJumpAnimation() {
        if (this.jumpAction && this.characterAnimMixer) {
            this.jumpAction.reset();
            this.jumpAction.play();
            console.log("Jump animation restarted");
        }
    }

    update() {
        if (this.action === "setup") {
            this.action = "load";
        } else if (this.action === "load") {
            this.action = "start";
        } else if (this.action === "start") {
            // Check if character model is loaded and set it up
            if (this.e.char && !this.character) {
                this.setupCharacter();
            }
            this.init2DGame();
            this.action = "game";
        } else if (this.action === "game") {
            this.update2DGame();
        }
        
        // Update character animation
        if (this.characterAnimMixer) {
            this.characterAnimMixer.update(this.e.dt);
            
            // Debug animation state every 60 frames
            if (Math.floor(this.e.gameTime * 60) % 60 === 0) {
                console.log("Animation update - time:", this.e.gameTime, "dt:", this.e.dt);
                if (this.jumpAction) {
                    console.log("Animation time:", this.jumpAction.time, "weight:", this.jumpAction.weight);
                }
            }
        }
        
        // Update character rotation based on movement direction
        if (this.character) {
            // Determine target rotation based on velocity
            if (this.player.velocityX > 0.1) {
                this.targetRotationY = Math.PI / 6; // 30 degrees right
            } else if (this.player.velocityX < -0.1) {
                this.targetRotationY = -Math.PI / 6; // 30 degrees left
            } else {
                this.targetRotationY = 0; // Face forward when not moving
            }
            
            // Smoothly interpolate rotation
            const rotationSpeed = 8.0; // Adjust for faster/slower rotation
            this.currentRotationY = THREE.MathUtils.lerp(this.currentRotationY, this.targetRotationY, rotationSpeed * this.e.dt);
            
            // Apply rotation to character
            this.character.rotation.y = this.currentRotationY;
        }
        
        // Canvas is now parented to player element, so it follows automatically
        
    }

    init2DGame() {
        // Show the 2D game container
        document.getElementById('gameContainer').style.display = 'block';
        
        // Add the Three.js canvas to the player element
        const playerElement = document.getElementById('player');
        if (playerElement && this.e.playerCanvas) {
            // Remove canvas from body if it's there
            if (this.e.playerCanvas.parentNode) {
                this.e.playerCanvas.parentNode.removeChild(this.e.playerCanvas);
            }
            // Add to player element
            playerElement.appendChild(this.e.playerCanvas);
            console.log("Canvas parented to player element");
        }
        
        // ===== GAME CONFIGURATION VARIABLES =====
        // Player physics
        this.player = {
            x: window.innerWidth / 2 - 15,
            y: 100, // 100px from bottom of container
            width: 30,
            height: 30,
            velocityX: 0,
            velocityY: 0,
            onGround: false,
            jumpPower: 10.5, // Positive for upward jump
            gravity: 0.25,
            friction: 0.95,
            maxSpeed: 18
        };
        
        // Game settings
        this.gameSpeed = 70;
        this.gameTime = 120; // 2 minutes
        this.maxHeight = 0;
        this.score = 0;
        this.pelletCount = 0;
        this.containerBottom = 0; // Position of main container from bottom of screen
        this.keyboardSpeedXMult = 0.5;
        
        // Level system
        this.currentLevel = 1;
        this.maxLevel = 20;
        
        // Ball system
        this.ballPool = [];
        this.ballPoolSize = 20;
        this.currentBallIndex = 0;
        this.lastShotTime = 0;
        this.shotCooldown = 100;
        
        // Device orientation settings
        this.eventCount = 0;
        this.xMovementMultiplier = 18.0; // Multiplier for X movement
        this.gravityEnabled = true; // Toggle for gravity
        this.screenPushThreshold = 325; // Screen push threshold in pixels

        // Initialize platforms array
        this.platforms = [];
        
        // Initialize ball system
        this.e.shoot.initBallPool();

        // Generate platforms
        this.e.builder.generatePlatforms();

        // Set up controls
        this.setupControls();
        
        // Set up shooting controls
        this.e.shoot.setupShootingControls();
        
        // Create mobile debug display
        if (this.e.mobile && !this.mobileDebugCreated) {
            this.createMobileDebug();
            this.mobileDebugCreated = true;
        }

        // Position player element
        this.updatePlayerPosition();
        
    }

    setupControls() {
        // Keyboard controls
        this.keys = {
            left: false,
            right: false
        };

        document.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.keys.left = true;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.keys.right = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.keys.left = false;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.keys.right = false;
            }
        });

        // Device orientation setup function - only request permission on user gesture
        this.setupDeviceOrientation = async () => {
            console.log('Setting up device orientation listener...');
            
            // Don't remove existing listener if it's already working
            if (this.deviceOrientationHandler && this.deviceOrientationWorking) {
                console.log('Device orientation already working, skipping setup');
                return;
            }
            
            // Remove any existing listeners first
            if (this.deviceOrientationHandler) {
                window.removeEventListener('deviceorientation', this.deviceOrientationHandler);
                window.removeEventListener('devicemotion', this.deviceOrientationHandler);
            }
            
            // Try to request permission first (this must be called from a user gesture)
            try {
                let orientationPermission = 'granted';
                let motionPermission = 'granted';
                
                // Check if permission API exists
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    console.log('Requesting device orientation permission...');
                    orientationPermission = await DeviceOrientationEvent.requestPermission();
                    console.log('Orientation permission result:', orientationPermission);
                } else {
                    console.log('DeviceOrientationEvent.requestPermission not available (localhost?)');
                }
                
                // Check if permission API exists
                if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                    console.log('Requesting device motion permission...');
                    motionPermission = await DeviceMotionEvent.requestPermission();
                    console.log('Motion permission result:', motionPermission);
                } else {
                    console.log('DeviceMotionEvent.requestPermission not available (localhost?)');
                }
                
                // On localhost, permission APIs might not exist, so try anyway
                if (orientationPermission !== 'granted' && motionPermission !== 'granted') {
                    console.log('Both permissions denied or not available, trying anyway (localhost mode)');
                    const orientationStatus = document.getElementById('orientationStatus');
                    if (orientationStatus) orientationStatus.textContent = 'Trying without permission (localhost)';
                } else {
                    console.log('At least one permission granted, proceeding...');
                }
            } catch (error) {
                console.log('Permission request failed, trying anyway (localhost mode):', error);
                const orientationStatus = document.getElementById('orientationStatus');
                if (orientationStatus) orientationStatus.textContent = 'Trying without permission (localhost)';
            }
            
            this.deviceOrientationHandler = (e) => {
                console.log('Device orientation/motion event received:', e.type, {
                    gamma: e.gamma,
                    alpha: e.alpha,
                    beta: e.beta,
                    accelerationX: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.x : 'null',
                    accelerationY: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.y : 'null',
                    accelerationZ: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.z : 'null'
                });
                
                // Mark device orientation as working (regardless of mobile detection)
                this.deviceOrientationWorking = true;
                this.eventCount++;
                
                // Update status to show it's working
                const orientationStatus = document.getElementById('orientationStatus');
                if (orientationStatus) orientationStatus.textContent = 'Working - Events Received';
                
                // Update debug display
                this.updateMobileDebug(e);
                
                // Try both gamma (orientation) and acceleration (motion)
                let tiltValue = null;
                
                if (e.gamma !== null && e.gamma !== undefined && !isNaN(e.gamma)) {
                    tiltValue = e.gamma;
                    console.log('Using gamma:', tiltValue);
                } else if (e.accelerationIncludingGravity && e.accelerationIncludingGravity.x !== null) {
                    tiltValue = e.accelerationIncludingGravity.x;
                    console.log('Using acceleration X:', tiltValue);
                }
                
                if (tiltValue !== null) {
                    // Normalize gamma to -1 to 1 range based on 90 degrees
                    const normalizedGamma = Math.max(-1, Math.min(1, tiltValue / 90));
                    
                    // Apply X movement multiplier to get the actual movement amount
                    const movementAmount = normalizedGamma * this.xMovementMultiplier;
                    
                    // Only apply movement if above threshold, otherwise stop
                    this.player.velocityX = movementAmount;
                    
                    console.log('Tilt processing:', {
                        originalGamma: tiltValue,
                        normalizedGamma: normalizedGamma,
                        movementAmount: movementAmount,
                        threshold: threshold,
                        velocityX: this.player.velocityX
                    });
                }
            };
            
            // Try both deviceorientation and devicemotion
            window.addEventListener('deviceorientation', this.deviceOrientationHandler);
            window.addEventListener('devicemotion', this.deviceOrientationHandler);
            console.log('Device orientation and motion listeners added');
            
            // Test if we can detect any events at all
            window.addEventListener('orientationchange', (e) => {
                console.log('Orientation change event:', e);
            });
            
            // Test if we can detect any events at all
            window.addEventListener('resize', (e) => {
                console.log('Resize event (test):', e);
            });
            
            // Update status immediately
            const orientationStatus = document.getElementById('orientationStatus');
            if (orientationStatus) orientationStatus.textContent = 'Listeners Added';
            
            // Set a timeout to show if no events are received
            setTimeout(() => {
                if (!this.deviceOrientationWorking) {
                    const status = document.getElementById('orientationStatus');
                    if (status) status.textContent = 'No Events - Try Tilt';
                }
            }, 3000);
        };

        // Device orientation controls (primary for mobile)
        // Only enable on user gesture - not automatically
        
        // Debug mobile detection
        console.log('Mobile detection:', this.e.mobile);
        console.log('User agent:', navigator.userAgent);
        console.log('Device orientation available:', typeof DeviceOrientationEvent !== 'undefined');
        console.log('Device motion available:', typeof DeviceMotionEvent !== 'undefined');

        // No touch controls - device orientation only

        // Mobile controls use device orientation only
    }


    createMobileDebug() {
        // Create mobile debug display
        const debugPanel = document.createElement('div');
        debugPanel.id = 'mobileDebug';
        debugPanel.style.position = 'fixed';
        debugPanel.style.top = '10px';
        debugPanel.style.left = '10px';
        debugPanel.style.color = 'white';
        debugPanel.style.fontSize = '12px';
        debugPanel.style.zIndex = '5000';
        debugPanel.style.backgroundColor = 'rgba(0,0,0,0.8)';
        debugPanel.style.padding = '10px';
        debugPanel.style.borderRadius = '5px';
        debugPanel.style.fontFamily = 'monospace';
        debugPanel.innerHTML = `
            <div>Device Orientation Status: <span id="orientationStatus">Not Started</span></div>
            <div>Gamma: <span id="gammaValue">0°</span></div>
            
            <div>X Movement: <span id="xMovementValue">18.0</span> <button id="decXMovement" style="padding: 2px 5px; margin: 2px;">-</button> <button id="incXMovement" style="padding: 2px 5px; margin: 2px;">+</button></div>
            <div>Screen Push: <span id="screenPushValue">200</span> <button id="decScreenPush" style="padding: 2px 5px; margin: 2px;">-</button> <button id="incScreenPush" style="padding: 2px 5px; margin: 2px;">+</button></div>
            <div>Gravity: <span id="gravityValue">0.4</span> <button id="decGravity" style="padding: 2px 5px; margin: 2px;">-</button> <button id="incGravity" style="padding: 2px 5px; margin: 2px;">+</button></div>
            <button id="requestPermission" style="margin-top: 10px; padding: 5px 10px; background: #007AFF; color: white; border: none; border-radius: 3px;">Request Permission</button>
            <button id="toggleGravity" style="margin-top: 5px; padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px;">Disable Gravity</button>
            <div id="clearDataInstructions" style="margin-top: 10px; font-size: 10px; color: #ff6b6b; display: none;">
                If denied: iOS Settings → Safari → Advanced → Website Data → Delete this site → Reload
            </div>
        `;
        document.body.appendChild(debugPanel);
        // Hide debug panel by default
        debugPanel.style.display = 'none';
        
        console.log('Mobile debug panel created');

        // Add a floating Enable Accelerometer button (upper-left)
        let accelBtn = document.getElementById('enableAccelerometerBtn');
        if (!accelBtn) {
            accelBtn = document.createElement('button');
            accelBtn.id = 'enableAccelerometerBtn';
            accelBtn.textContent = 'EA';
            accelBtn.style.position = 'fixed';
            accelBtn.style.top = '10px';
            accelBtn.style.left = '10px';
            accelBtn.style.zIndex = '6000';
            accelBtn.style.padding = '6px 10px';
            accelBtn.style.background = '#007AFF';
            accelBtn.style.color = '#fff';
            accelBtn.style.border = 'none';
            accelBtn.style.borderRadius = '4px';
            accelBtn.style.cursor = 'pointer';
            document.body.appendChild(accelBtn);
        }
        accelBtn.onclick = () => {
            const permissionButton = document.getElementById('requestPermission');
            if (permissionButton) {
                permissionButton.click();
            } else {
                // Fallback: directly try to request permissions
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission().catch(()=>{});
                }
                if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                    DeviceMotionEvent.requestPermission().catch(()=>{});
                }
            }
        };
        
        // Add screen push threshold adjustment buttons
        const decScreenPushButton = document.getElementById('decScreenPush');
        const incScreenPushButton = document.getElementById('incScreenPush');
        const screenPushValue = document.getElementById('screenPushValue');
        
        if (decScreenPushButton) {
            decScreenPushButton.addEventListener('click', () => {
                this.screenPushThreshold = Math.max(50, this.screenPushThreshold - 5);
                if (screenPushValue) screenPushValue.textContent = this.screenPushThreshold;
                console.log('Screen push threshold decreased to:', this.screenPushThreshold);
            });
        }
        
        if (incScreenPushButton) {
            incScreenPushButton.addEventListener('click', () => {
                this.screenPushThreshold = Math.min(500, this.screenPushThreshold + 5);
                if (screenPushValue) screenPushValue.textContent = this.screenPushThreshold;
                console.log('Screen push threshold increased to:', this.screenPushThreshold);
            });
        }
        
        // Add X Movement controls
        const decXMovement = document.getElementById('decXMovement');
        const incXMovement = document.getElementById('incXMovement');
        const xMovementValue = document.getElementById('xMovementValue');
        
        if (decXMovement) {
            decXMovement.addEventListener('click', () => {
                this.xMovementMultiplier = Math.max(0.1, this.xMovementMultiplier - 0.1);
                if (xMovementValue) xMovementValue.textContent = this.xMovementMultiplier.toFixed(1);
                console.log('X Movement decreased to:', this.xMovementMultiplier);
            });
        }
        
        if (incXMovement) {
            incXMovement.addEventListener('click', () => {
                this.xMovementMultiplier +=.1
                if (xMovementValue) xMovementValue.textContent = this.xMovementMultiplier.toFixed(1);
                console.log('X Movement increased to:', this.xMovementMultiplier);
            });
        }
        
        
        // Add Gravity controls
        const decGravity = document.getElementById('decGravity');
        const incGravity = document.getElementById('incGravity');
        const gravityValue = document.getElementById('gravityValue');
        
        if (decGravity) {
            decGravity.addEventListener('click', () => {
                this.player.gravity = Math.max(0.1, this.player.gravity - 0.1);
                if (gravityValue) gravityValue.textContent = this.player.gravity.toFixed(1);
                console.log('Gravity decreased to:', this.player.gravity);
            });
        }
        
        if (incGravity) {
            incGravity.addEventListener('click', () => {
                this.player.gravity = Math.min(2.0, this.player.gravity + 0.1);
                if (gravityValue) gravityValue.textContent = this.player.gravity.toFixed(1);
                console.log('Gravity increased to:', this.player.gravity);
            });
        }
        
        // Add Toggle Gravity button
        const toggleGravityButton = document.getElementById('toggleGravity');
        if (toggleGravityButton) {
            toggleGravityButton.addEventListener('click', () => {
                this.gravityEnabled = !this.gravityEnabled;
                if (this.gravityEnabled) {
                    toggleGravityButton.textContent = 'Disable Gravity';
                    toggleGravityButton.style.background = '#dc3545';
                } else {
                    toggleGravityButton.textContent = 'Enable Gravity';
                    toggleGravityButton.style.background = '#28a745';
                }
                console.log('Gravity toggled:', this.gravityEnabled ? 'ON' : 'OFF');
            });
        }
        
        // Add permission request button
        const permissionButton = document.getElementById('requestPermission');
        const clearDataInstructions = document.getElementById('clearDataInstructions');
        if (permissionButton) {
            permissionButton.addEventListener('click', async () => {
                console.log('Permission button clicked');
                permissionButton.textContent = 'Requesting...';
                permissionButton.style.background = '#ffc107';
                if (clearDataInstructions) clearDataInstructions.style.display = 'none';
                
                try {
                    await this.setupDeviceOrientation();
                    permissionButton.textContent = 'Permission Requested';
                    permissionButton.style.background = '#28a745';
                } catch (error) {
                    console.log('Permission request failed:', error);
                    permissionButton.textContent = 'Failed';
                    permissionButton.style.background = '#dc3545';
                    if (clearDataInstructions) clearDataInstructions.style.display = 'block';
                }
            });
        }
        
    }


    updateMobileDebug(e) {
        // Update debug display with current values
        const orientationStatus = document.getElementById('orientationStatus');
        const gammaValue = document.getElementById('gammaValue');
        const alphaValue = document.getElementById('alphaValue');
        const betaValue = document.getElementById('betaValue');
        const keysLeft = document.getElementById('keysLeft');
        const keysRight = document.getElementById('keysRight');
        const eventCount = document.getElementById('eventCount');
        
        if (orientationStatus) orientationStatus.textContent = this.deviceOrientationWorking ? 'Working' : 'Not Working';
        if (gammaValue) gammaValue.textContent = e.gamma !== null ? e.gamma.toFixed(1) + '°' : 'null';
        if (alphaValue) alphaValue.textContent = e.alpha !== null ? e.alpha.toFixed(1) + '°' : 'null';
        if (betaValue) betaValue.textContent = e.beta !== null ? e.beta.toFixed(1) + '°' : 'null';
        if (keysLeft) keysLeft.textContent = this.player.velocityX.toFixed(2);
        if (keysRight) keysRight.textContent = this.player.velocityX.toFixed(2);
        if (eventCount) eventCount.textContent = this.eventCount;
        
        // Log the actual values for debugging
        console.log('Device orientation values:', {
            gamma: e.gamma,
            alpha: e.alpha,
            beta: e.beta,
            accelerationX: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.x : 'null',
            accelerationY: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.y : 'null',
            accelerationZ: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.z : 'null',
            velocityX: this.player.velocityX
        });
    }



    update2DGame() {
        // Update game time
        this.gameTime -= this.e.dt;
        if (this.gameTime <= 0) {
            this.gameTime = 0;
            // this.gameOver();
        }

        // Update player physics
        this.updatePlayerPhysics();

        // Check platform collisions
        this.checkPlatformCollisions();

        // Update container position based on player
        this.updateContainerPosition();

        // Update platform visibility
        this.updatePlatformVisibility();

        // Update mover platforms
        this.e.builder.updateMoverPlatforms();

        // Update player position
        this.updatePlayerPosition();

        // Update level and height display
        this.updateLevel();
        this.updateHeightDisplay();

        // Update balls
        this.e.shoot.updateBalls();

        // Check pellet collisions
        this.checkPelletCollisions();

        // Check spring collisions
        this.checkSpringCollisions();

        // Check trap collisions
        this.checkTrapCollisions();

        // Check bonus collisions
        this.checkBonusCollisions();

        // Check enemy collisions
        this.checkEnemyCollisions();

        // Check if player fell off bottom of screen
        if (!this.e.u.isObjectOnScreen(this.player, this.containerBottom)) {
            this.gameOver();
        }
    }

    updatePlayerPhysics() {
        // Apply gravity (positive gravity pulls down, so subtract from velocityY)
        // Only apply gravity if it's enabled
        if (this.gravityEnabled) {
            this.player.velocityY -= this.player.gravity * this.e.dt * this.gameSpeed;
        } else {
            this.player.velocityY = 0;
        }

        // Apply horizontal movement
        // Use device orientation if available, otherwise use keyboard
        if (typeof DeviceOrientationEvent !== 'undefined' && this.deviceOrientationWorking) {
            // Use device orientation velocity (proportional to tilt)
            // velocityX is already set by device orientation handler
        } else {
            // Use keyboard controls for desktop
            if (this.keys.left) {
                this.player.velocityX -= this.keyboardSpeedXMult * this.e.dt * this.gameSpeed;
            }
            if (this.keys.right) {
                this.player.velocityX += this.keyboardSpeedXMult * this.e.dt * this.gameSpeed;
            }
        }

        // Apply friction
        this.player.velocityX *= this.player.friction;

        // Limit horizontal speed
        if (this.player.velocityX > this.player.maxSpeed) {
            this.player.velocityX = this.player.maxSpeed;
        }
        if (this.player.velocityX < -this.player.maxSpeed) {
            this.player.velocityX = -this.player.maxSpeed;
        }

        // Update position
        this.player.x += this.player.velocityX * this.e.dt * this.gameSpeed;
        this.player.y += this.player.velocityY * this.e.dt * this.gameSpeed;

        // Screen wrapping - wrap player to other side when going off screen
        // Add buffer so player doesn't wrap too early
        const buffer = 20; // Buffer pixels before wrapping
        
        if (this.player.x < -buffer) {
            this.player.x = window.innerWidth - this.player.width + buffer;
        }
        if (this.player.x > window.innerWidth - this.player.width + buffer) {
            this.player.x = -buffer;
        }
    }

    checkPlatformCollisions() {
        this.player.onGround = false;

        // Only check collisions against visible platforms for efficiency
        for (const platform of this.platforms) {
            if (!platform.visible || platform.broken) continue; // Skip invisible or broken platforms
            
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y < platform.y + platform.height &&
                this.player.y + this.player.height > platform.y &&
                this.player.velocityY < 0 &&
                // Require player's bottom to be at or above platform's bottom
                this.player.y >= platform.y) { // Valid landing from above
                
                this.player.y = platform.y + platform.height;
                this.player.velocityY = 0;
                this.player.onGround = true;
                
                // Handle break platforms
                if (platform.type === 'break') {
                    // Remove break platform from DOM and mark as broken
                    if (platform.element) {
                        platform.element.remove();
                    }
                    platform.broken = true;
                    platform.visible = false;
                    console.log('Break platform broken!');
                    // Also remove any trap attached to this platform
                    if (this.trapBlocks && this.trapBlocks.length) {
                        for (const trap of this.trapBlocks) {
                            if (trap.parentPlatform === platform) {
                                trap.visible = false;
                                if (trap.element) {
                                    trap.element.remove();
                                }
                            }
                        }
                    }
                }
                
                // Apply spring shoes buff if active
                if (this.springJumpsLeft && this.springJumpsLeft > 0) {
                    this.player.velocityY = this.player.jumpPower * 1.5;
                    this.springJumpsLeft -= 1;
                    if (this.springJumpsLeft <= 0) {
                        const playerEl = document.getElementById('player');
                        if (playerEl) playerEl.style.outline = '';
                    }
                } else {
                    this.player.velocityY = this.player.jumpPower;
                }
                this.player.onGround = false;
                
                // Restart jump animation
                this.restartJumpAnimation();
               
                break;
            }
        }
    }

    updateContainerPosition() {
        // Only move container down when player is above threshold from bottom of screen
        // Calculate player's screen position relative to viewport
        const playerScreenPos = this.e.u.getScreenPosition(this.player, this.containerBottom);
        const threshold = this.screenPushThreshold; // Screen push threshold in pixels
        
        // If player is above threshold, move container down
        if (playerScreenPos.y > threshold) {
            const targetContainerBottom = this.player.y - threshold;
            // Only move down, never up
            this.containerBottom = Math.max(this.containerBottom, targetContainerBottom);
        }
        
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.style.transform = `translateY(${this.containerBottom}px)`;
    }

    updatePlatformVisibility() {
        // Debug: log viewport bounds every 60 frames
        if (Math.floor(this.e.time * 60) % 60 === 0) {
            const screenTop = this.containerBottom;
            const screenBottom = this.containerBottom + window.innerHeight;
            console.log(`Screen viewport: ${screenTop} to ${screenBottom}, Container: ${this.containerBottom}`);
        }
        
        for (const platform of this.platforms) {
            // Skip broken platforms
            if (platform.broken) continue;
            
            // Platform is visible if it's within the screen viewport
            const shouldBeVisible = this.e.u.isObjectOnScreen(platform, this.containerBottom);
            
            if (shouldBeVisible && !platform.visible) {
                // Show platform
                platform.visible = true;
                platform.element.style.display = 'block';
            } else if (!shouldBeVisible && platform.visible) {
                // Hide platform
                platform.visible = false;
                platform.element.style.display = 'none';
            }
        }
        
        // Update pellet visibility
        this.updatePelletVisibility();
        
        // Update spring visibility
        this.updateSpringVisibility();
        
        // Update trap visibility
        if (this.trapBlocks && this.trapBlocks.length) {
            this.updateTrapVisibility();
        }
        
        // Update bonus visibility
        if (this.bonuses && this.bonuses.length) {
            this.updateBonusVisibility();
        }
        
        // Update enemy visibility
        this.updateEnemyVisibility();
    }

    updatePelletVisibility() {
        for (const pellet of this.pellets) {
            // Skip collected pellets
            if (pellet.collected) continue;
            
            // Pellet is visible if it's within the screen viewport
            const shouldBeVisible = this.e.u.isObjectOnScreen(pellet, this.containerBottom);
            
            if (shouldBeVisible && !pellet.visible) {
                // Show pellet
                pellet.visible = true;
                pellet.element.style.display = 'block';
            } else if (!shouldBeVisible && pellet.visible) {
                // Hide pellet
                pellet.visible = false;
                pellet.element.style.display = 'none';
            }
        }
    }

    checkPelletCollisions() {
        for (const pellet of this.pellets) {
            // Skip collected or invisible pellets
            if (pellet.collected || !pellet.visible) continue;
            
            // Calculate distance to player
            const dx = (this.player.x + this.player.width/2) - (pellet.x + pellet.width/2);
            const dy = (this.player.y + this.player.height/2) - (pellet.y + pellet.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If within 80 pixels, activate magnetic attraction (one-time activation)
            if (distance < 80 && !pellet.magnetic) {
                pellet.magnetic = true;
                pellet.originalX = pellet.x;
                pellet.originalY = pellet.y;
                // Add enhanced glow effect when magnetic
                pellet.element.style.boxShadow = '0 0 15px #FFD700, 0 0 25px #FFD700';
            }
            
            // If magnetic, continue lerping towards player
            if (pellet.magnetic) {
                // Lerp towards player
                const lerpSpeed = 0.15;
                pellet.x += dx * lerpSpeed;
                pellet.y += dy * lerpSpeed;
                
                // Update visual position
                pellet.element.style.left = pellet.x + 'px';
                pellet.element.style.bottom = pellet.y + 'px';
            }
            
            // Check collision with player (now easier due to magnetic effect)
            if (this.player.x < pellet.x + pellet.width &&
                this.player.x + this.player.width > pellet.x &&
                this.player.y < pellet.y + pellet.height &&
                this.player.y + this.player.height > pellet.y) {
                
                // Collect pellet
                pellet.collected = true;
                pellet.visible = false;
                pellet.element.style.display = 'none';
                
                // Update score and pellet count
                this.score += 10;
                this.pelletCount++;
                console.log(`Pellet collected! Score: ${this.score}, Pellets: ${this.pelletCount}`);
            }
        }
    }

    updateSpringVisibility() {
        for (const spring of this.springs) {
            // Skip collected springs
            if (spring.collected) continue;
            
            // Spring is visible if it's within the screen viewport
            const shouldBeVisible = this.e.u.isObjectOnScreen(spring, this.containerBottom);
            
            if (shouldBeVisible && !spring.visible) {
                // Show spring
                spring.visible = true;
                spring.element.style.display = 'block';
            } else if (!shouldBeVisible && spring.visible) {
                // Hide spring
                spring.visible = false;
                spring.element.style.display = 'none';
            }
        }
    }

    updateTrapVisibility() {
        for (const trap of this.trapBlocks) {
            const shouldBeVisible = this.e.u.isObjectOnScreen(trap, this.containerBottom);
            if (shouldBeVisible && !trap.visible) {
                trap.visible = true;
                trap.element.style.display = 'block';
            } else if (!shouldBeVisible && trap.visible) {
                trap.visible = false;
                trap.element.style.display = 'none';
            }
        }
    }

    updateBonusVisibility() {
        for (const bonus of this.bonuses) {
            if (bonus.collected) continue;
            const shouldBeVisible = this.e.u.isObjectOnScreen(bonus, this.containerBottom);
            if (shouldBeVisible && !bonus.visible) {
                bonus.visible = true;
                bonus.element.style.display = 'block';
            } else if (!shouldBeVisible && bonus.visible) {
                bonus.visible = false;
                bonus.element.style.display = 'none';
            }
        }
    }

    checkSpringCollisions() {
        for (const spring of this.springs) {
            // Skip collected or invisible springs
            if (spring.collected || !spring.visible) continue;
            
            // Check collision with player (only when falling down)
            if (this.player.velocityY < 0 && // Player is falling
                this.player.x < spring.x + spring.width &&
                this.player.x + this.player.width > spring.x &&
                this.player.y < spring.y + spring.height &&
                this.player.y + this.player.height > spring.y) {
                
                // Activate spring jump (1.5x normal jump power)
                this.player.velocityY = this.player.jumpPower * 1.75;
                this.player.onGround = false;
                
                // Restart jump animation
                this.restartJumpAnimation();
                
                // Mark spring as used (but don't remove it, springs can be used multiple times)
                console.log(`Spring activated! Jump power: ${this.player.jumpPower * 1.5}`);
                
                // Add visual feedback - make spring bounce
                spring.element.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    if (spring.element) {
                        spring.element.style.transform = 'scale(1.0)';
                    }
                }, 100);
            }
        }
    }

    checkTrapCollisions() {
        if (!this.trapBlocks) return;
        for (const trap of this.trapBlocks) {
            if (!trap.visible) continue;
            if (this.player.x < trap.x + trap.width &&
                this.player.x + this.player.width > trap.x &&
                this.player.y < trap.y + trap.height &&
                this.player.y + this.player.height > trap.y) {
                // Only lethal when falling (negative Y velocity), and not shielded
                if (this.player.velocityY < 0 && !this.shieldActive) {
                    this.gameOver();
                    return;
                }
            }
        }
    }

    checkBonusCollisions() {
        if (!this.bonuses) return;
        for (const bonus of this.bonuses) {
            if (!bonus.visible || bonus.collected) continue;
            if (this.player.x < bonus.x + bonus.width &&
                this.player.x + this.player.width > bonus.x &&
                this.player.y < bonus.y + bonus.height &&
                this.player.y + this.player.height > bonus.y) {
                // Collect bonus
                bonus.visible = false;
                bonus.collected = true;
                // Move far offscreen to ensure it never reappears
                bonus.x = 100000;
                bonus.y = 100000;
                if (bonus.element) {
                    bonus.element.style.left = bonus.x + 'px';
                    bonus.element.style.bottom = bonus.y + 'px';
                    bonus.element.style.display = 'none';
                }
                if (bonus.type === 'shield') {
                    this.activateShield();
                } else if (bonus.type === 'spring_shoes') {
                    this.activateSpringShoes();
                }
            }
        }
    }

    activateShield() {
        this.shieldActive = true;
        const DURATION_MS = 15000;
        clearTimeout(this._shieldTimeout);
        this._shieldTimeout = setTimeout(() => {
            this.shieldActive = false;
            const playerEl = document.getElementById('player');
            if (playerEl) playerEl.style.boxShadow = '';
        }, DURATION_MS);
        const playerEl = document.getElementById('player');
        if (playerEl) playerEl.style.boxShadow = '0 0 20px #00C2FF';
    }

    activateSpringShoes() {
        this.springJumpsLeft = 6;
        const playerEl = document.getElementById('player');
        if (playerEl) playerEl.style.outline = '2px solid #00FF88';
        // Relocate nearby offscreen enemies/blackholes to a safe X position
        this.relocateNearbyOffscreenEnemies();
    }

    relocateNearbyOffscreenEnemies() {
        if (!this.enemies || this.enemies.length === 0) return;
        const SAFE_X = 1000; // requested ex position
        for (const enemy of this.enemies) {
            // Skip already destroyed
            if (enemy.destroyed) continue;
            // Only those not currently on screen
            const onScreen = this.e.u.isObjectOnScreen(enemy, this.containerBottom, 0);
            if (onScreen) continue;
            // Within 1000px (euclidean distance in world space)
            const dx = (enemy.x + enemy.width / 2) - (this.player.x + this.player.width / 2);
            const dy = (enemy.y + enemy.height / 2) - (this.player.y + this.player.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 1000) {
                enemy.x = SAFE_X;
                if (enemy.element) {
                    enemy.element.style.left = enemy.x + 'px';
                }
            }
        }
    }

    updateEnemyVisibility() {
        for (const enemy of this.enemies) {
            // Skip destroyed enemies
            if (enemy.destroyed) continue;
            
            // Enemy is visible if it's within the screen viewport with buffer
            const shouldBeVisible = this.e.u.isObjectOnScreen(enemy, this.containerBottom, 200);
            
            if (shouldBeVisible && !enemy.visible) {
                // Show enemy
                enemy.visible = true;
                enemy.element.style.display = 'block';
            } else if (!shouldBeVisible && enemy.visible) {
                // Hide enemy
                enemy.visible = false;
                enemy.element.style.display = 'none';
            }
        }
    }

    checkEnemyCollisions() {
        for (const enemy of this.enemies) {
            // Skip destroyed or invisible enemies
            if (enemy.destroyed || !enemy.visible) continue;
            
            // Check collision with player
            if (this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y) {
                // Vortex/black hole: always lethal, no bounce
                if (enemy.type === 'blackhole') {
                    if (!this.shieldActive) {
                        console.log('Player hit black hole - Game Over!');
                        this.gameOver();
                        return;
                    }
                } else {
                    // Regular enemy: allow bounce only when landing from above
                    if (this.player.velocityY < 0 &&
                        this.player.y + this.player.height > enemy.y + enemy.height * 0.7) {
                        // Bounce up like a spring (1.5x normal jump power)
                        this.player.velocityY = this.player.jumpPower * 1.75;
                        this.player.onGround = false;
                        
                        // Restart jump animation
                        this.restartJumpAnimation();
                        // Add visual feedback - make enemy bounce
                        enemy.element.style.transform = 'scale(1.2)';
                        setTimeout(() => {
                            if (enemy.element) {
                                enemy.element.style.transform = 'scale(1.0)';
                            }
                        }, 100);
                        console.log('Player bounced off enemy! Jump power:', this.player.jumpPower * 1.5);
            } else {
                        // Game over for side or bottom collisions (unless shielded)
                        if (!this.shieldActive) {
                            console.log('Player hit enemy - Game Over!');
                            this.gameOver();
                            return;
                        }
                    }
                }
            }
            
            // Check collision with balls (destroy enemy) - black holes are invulnerable
            for (const ball of this.ballPool) {
                if (ball.action === 'shoot') {
                    // Calculate ball center position
                    const ballCenterX = ball.x + ball.width / 2;
                    const ballCenterY = ball.y + ball.height / 2;
                    
                    // Calculate enemy center position
                    const enemyCenterX = enemy.x + enemy.width / 2;
                    const enemyCenterY = enemy.y + enemy.height / 2;
                    
                    // Calculate distance between centers
                    const dx = ballCenterX - enemyCenterX;
                    const dy = ballCenterY - enemyCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Check if ball is within enemy bounds (with some tolerance)
                    const collisionDistance = (enemy.width / 2) + (ball.width / 2) + 10; // 10px tolerance
                    
                    if (distance < collisionDistance) {
                        if (enemy.type === 'blackhole') {
                            // Black holes cannot be destroyed; absorb the ball instead
                            ball.action = 'reset';
                            continue;
                        }
                        // Destroy enemy
                        enemy.destroyed = true;
                        enemy.visible = false;
                        enemy.element.style.display = 'none';
                        console.log('Enemy destroyed by ball! Distance:', distance, 'Collision distance:', collisionDistance);
                        
                        // Reset ball
                        ball.action = 'inactive';
                        ball.x = -1000;
                        ball.y = -1000;
                        ball.velocityX = 0;
                        ball.velocityY = 0;
                        ball.element.style.display = 'none';
                        break; // Exit the ball loop since we found a collision
                    }
                }
            }
        }
    }

    updatePlayerPosition() {
        const playerElement = document.getElementById('player');
        playerElement.style.left = this.player.x + 'px';
        playerElement.style.bottom = this.player.y + 'px'; // Position from bottom
    }

    updateLevel() {
        // Calculate level based on current player height, not max height
        this.currentLevel = Math.min(Math.floor(this.player.y / 2000) + 1, this.maxLevel);
    }

    gameOver() {
        console.log('Game Over!');
        // Reset the game
        this.init2DGame();
        // this.action = "game over"
    }

    //------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------

    // UI

    updateHeightDisplay() {
        // Update max height
        if (this.player.y > this.maxHeight) {
            this.maxHeight = this.player.y;
        }

        // Update displays
        document.getElementById('timeDisplay').textContent = this.e.u.formatTime(this.gameTime);
        document.getElementById('scoreDisplay').textContent = Math.floor(this.maxHeight);
        document.getElementById('pelletCount').textContent = `x${this.pelletCount}`;
        const visibleCount = this.platforms.filter(p => p.visible).length;
        const totalCount = this.platforms.length;
        const playerWorldPos = this.e.u.getWorldPosition(this.player);
        const playerScreenPos = this.e.u.getScreenPosition(this.player, this.containerBottom);
        const currentChallenge = this.e.builder.levelChallenges[this.currentLevel] || 'No Challenge';
        const debugModeText = this.e.builder.debugChallengeMode ? ' [DEBUG MODE]' : '';
        // Hide debug display on mobile, show on desktop
        if (this.e.mobile) {
            document.getElementById('debugDisplay').style.display = 'none';
        } else {
            document.getElementById('debugDisplay').textContent = `Level: ${this.currentLevel} | Challenge: ${currentChallenge}${debugModeText} | Visible: ${visibleCount} | Total: ${totalCount} | Player World Y: ${Math.round(playerWorldPos.y)} | Player Screen Y: ${Math.round(playerScreenPos.y)}`;
        }
    }

}