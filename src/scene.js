import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import Engine from './engine.js';
import CryptoJS from 'crypto-js';

export class Scene {
    constructor() {
        this.e = new Engine();
        this.action = "setup";
        this.skipStartMenu = false;
        this.deviceOrientationWorking = false;
    }

    setUp(engine) {
        this.e = engine;

         /**
        * Obfuscate a plaintext string with a simple rotation algorithm similar to
        * the rot13 cipher.
        * @param  {[type]} key rotation index between 0 and n
        * @param  {Number} n   maximum char that will be affected by the algorithm
        * @return {[type]}     obfuscated string
        */
         String.prototype._0x083c9db = function(key, n = 126) {
        // return String itself if the given parameters are invalid
        if (!(typeof(key) === 'number' && key % 1 === 0)
            || !(typeof(key) === 'number' && key % 1 === 0)) {
            return this.toString();
        }

        var chars = this.toString().split('');

        for (var i = 0; i < chars.length; i++) {
            var c = chars[i].charCodeAt(0);

            if (c <= n) {
            chars[i] = String.fromCharCode((chars[i].charCodeAt(0) + key) % n);
            }
        }

        return chars.join('');
        };

        /**
        * De-obfuscate an obfuscated string with the method above.
        * @param  {[type]} key rotation index between 0 and n
        * @param  {Number} n   same number that was used for obfuscation
        * @return {[type]}     plaintext string
        */
        String.prototype._0xd7a82c = function(key, n = 126) {
        // return String itself if the given parameters are invalid
        if (!(typeof(key) === 'number' && key % 1 === 0)
            || !(typeof(key) === 'number' && key % 1 === 0)) {
            return this.toString();
        }

        return this.toString()._0x083c9db(n - key);
        };
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

        this.count=0;

        this.levelStartTime = performance.now();
        
        ////console.log("3D scene initialized for char model");
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
            ////console.log("Available animations:", this.e.char.animations.map(anim => anim.name));
            
            // Try to find jump animation first, then any animation
            this.jumpClip = THREE.AnimationClip.findByName(this.e.char.animations, "jump");
            if (!this.jumpClip) {
                // If no jump animation, try to find any animation
                this.jumpClip = this.e.char.animations[0];
                ////console.log("Using first available animation:", this.jumpClip.name);
            }
            
            if (this.jumpClip) {
                this.jumpAction = this.characterAnimMixer.clipAction(this.jumpClip);
                this.jumpAction.name = this.jumpClip.name;
                this.jumpAction.setLoop(THREE.LoopOnce, 0);
                this.jumpAction.clampWhenFinished = true;
                this.jumpAction.setEffectiveWeight(1.0);
                this.jumpAction.timeScale = 0.7; // Make animation slower
                this.jumpAction.play();
                ////console.log("Animation started:", this.jumpClip.name);
                
                // Debug animation state
                ////console.log("Animation mixer:", this.characterAnimMixer);
                ////console.log("Animation action:", this.jumpAction);
                ////console.log("Animation weight:", this.jumpAction.weight);
                ////console.log("Animation enabled:", this.jumpAction.enabled);
            } else {
                ////console.warn("No animations found at all");
            }
        } else {
            ////console.warn("No animations available in this.e.char.animations");
        }
        
        ////console.log("Character setup complete");
    }

    restartJumpAnimation() {
        if (this.jumpAction && this.characterAnimMixer) {
            this.jumpAction.reset();
            this.jumpAction.play();
            ////console.log("Jump animation restarted");
        }
    }

    update() {
        if (this.action === "setup") {

            this.action = "load";

        } else if (this.action === "load") {

            this.action = "start";

        } else if (this.action === "start") {
            // Show splash/start menu and wait for Play button
            const startMenu = document.getElementById('startMenu');
            if (startMenu) startMenu.style.display = 'block';

            // Bind play button once
            if (!this.startBound) {
                this.startBound = true;
                const playButton = document.getElementById('playButton');
                const instructionsButton = document.getElementById('instructionsButton');
                const closeInstructionsButton = document.getElementById('closeInstructionsButton');
                const instructionsOverlay = document.getElementById('instructionsOverlay');
                
                if (playButton) {
                    playButton.addEventListener('click', () => {
                        // Fade out splash
                        const splash = document.getElementById('splashBackground');
                        if (splash) splash.style.opacity = '0';
                        if (startMenu) startMenu.style.display = 'none';
                        // Ensure character is set up
                        if (this.e.char && !this.character) {
                            this.setupCharacter();
                        }
                        // Start game
                        this.init2DGame();
                        this.action = 'countdown';
                        this.countdownTime = 3;
                        this.count = 0;
                        // Request device permissions when game starts
                        this.e.requestDevicePermissions();
                    });
                }
                
                // Bind instructions button
                if (instructionsButton && instructionsOverlay) {
                    instructionsButton.addEventListener('click', () => {
                        instructionsOverlay.style.display = 'flex';
                    });
                }
                
                // Bind close instructions button
                if (closeInstructionsButton && instructionsOverlay) {
                    closeInstructionsButton.addEventListener('click', () => {
                        instructionsOverlay.style.display = 'none';
                    });
                }
                
                // Update movement instruction based on device type
                const movementInstruction = document.getElementById('movementInstruction');
                if (movementInstruction) {
                    if (this.e.mobile) {
                        movementInstruction.textContent = 'Tilt phone or use arrow keys to move';
                    } else {
                        movementInstruction.textContent = 'Use arrow keys to move left or right';
                    }
                }
            }
            // Stay in start state until Play clicked
            return;

        } else if (this.action === "countdown") {
            
            // Create countdown display if it doesn't exist
            if (!this.countdownDisplay) {
                this.createCountdownDisplay();
                // Freeze character animation during countdown
                if (this.jumpAction && this.characterAnimMixer) {
                    this.jumpAction.time = 0.5;
                    this.jumpAction.paused = true;
                    this.characterAnimMixer.timeScale = 0;
                }
            }
            
            // Update platform visibility during countdown so player can see them
            this.updatePlatformVisibility();
            
            // Update player position during countdown
            this.updatePlayerPosition();
            
            // Update countdown
            this.count += this.e.dt;
            if (this.count >= 1) {
                this.count = 0;
                this.countdownTime--;
                
                // Update countdown display
                const countdownText = document.getElementById('countdownText');
                if (countdownText) {
                    if (this.countdownTime > 0) {
                        countdownText.textContent = this.countdownTime;
                        // Play beep for each number
                        if (this.e && this.e.s && this.e.s.p) this.e.s.p('startBeep1');
                    } else {
                        countdownText.textContent = 'GO!';
                        // Play different beep for GO!
                        if (this.e && this.e.s && this.e.s.p) this.e.s.p('startBeep2');
                    }
                }
                
                // Start game when countdown reaches 0
                if (this.countdownTime <= 0) {
                    this.action = 'game';
                    // Hide countdown display
                    const countdownOverlay = document.getElementById('countdownOverlay');
                    if (countdownOverlay) {
                        countdownOverlay.style.display = 'none';
                    }
                }
            }

        } else if (this.action === "game") {
            
            // Unfreeze character animation when game starts
            if (this.jumpAction && this.characterAnimMixer && this.characterAnimMixer.timeScale === 0) {
                this.jumpAction.paused = false;
                this.characterAnimMixer.timeScale = 1;
            }

            this.update2DGame();
        // this.updateParticles();

        } else if (this.action === 'time_up_freeze') {

            // Freeze player animation when game pauses
            if (this.jumpAction && !this.animationFrozen) {
                this.jumpAction.time = 0.5;
                this.jumpAction.paused = true;
                this.animationFrozen = true;
            }
            if (this.characterAnimMixer) this.characterAnimMixer.timeScale = 0;

            // Game is frozen, wait for summit message
            this.count += this.e.dt;
            if (this.count > 0.5) {
                this.count = 0;
                this.action = 'summit_reached';
                // Create and show "SUMMIT REACHED!" message
                const summitMsg = document.createElement('div');
                summitMsg.id = 'summitMessage';
                summitMsg.innerHTML = 'SUMMIT REACHED!';
                summitMsg.style.position = 'fixed';
                summitMsg.style.top = '50%';
                summitMsg.style.left = '50%';
                summitMsg.style.transform = 'translate(-50%, -50%)';
                summitMsg.style.fontSize = '48px';
                summitMsg.style.fontWeight = 'bold';
                summitMsg.style.color = 'white';
                summitMsg.style.fontFamily = '"Montserrat", sans-serif';
                summitMsg.style.textAlign = 'center';
                summitMsg.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
                summitMsg.style.zIndex = '20000';
                summitMsg.style.opacity = '0';
                document.body.appendChild(summitMsg);

                this.e.s.p("shine");
                
                if (window.gsap) {
                    window.gsap.to(summitMsg, {
                        duration: 0.5,
                        opacity: 1,
                        scale: 1.2,
                        ease: 'power2.out'
                    });
                }
            }

        } else if (this.action === 'summit_reached') {

            // Show summit message for 2 seconds
            this.count += this.e.dt;
            if (this.count > 2) {
                this.count = 0;
                this.action = 'player_fly_off';
                // Hide summit message
                const summitMsg = document.getElementById('summitMessage');
                if (summitMsg && window.gsap) {
                    window.gsap.to(summitMsg, {
                        duration: 0.5,
                        opacity: 0,
                        scale: 0.8,
                        ease: 'power2.in',
                        onComplete: () => {
                            if (summitMsg.parentNode) {
                                summitMsg.parentNode.removeChild(summitMsg);
                            }
                        }
                    });
                }
            }

        } else if (this.action === 'player_fly_off') {

            this.e.s.p("whooshShot");

            // Player flies off top of screen
            const playerElement = document.getElementById('player');

            window.gsap.to(playerElement, {
                duration: 1,
                y: '-=2000',
                ease: 'sine.out'
            });

            this.action='showing fly off'

        } else if (this.action === 'showing fly off') {

            // Fallback if GSAP not available
            this.count += this.e.dt;
            if (this.count > 2) {
                this.count = 0;
                this.action = 'dead';
            }

        } else if (this.action === 'enemy_hit') {

            const playerEl = document.getElementById('player');
            if (playerEl && !this.shakeStarted) {
                this.shakeStarted = true;
                // White screen flash using #fader
                const fader = document.getElementById('fader');
                if (fader) {
                    fader.style.background = '#ffffff';
                    fader.style.opacity = '0.5';
                    fader.style.display = 'block';
                    window.gsap.to(fader, {
                        duration: 0.5,
                        opacity: 0,
                        ease: 'power2.out'
                    });
                }
                if (window.gsap) {
                    window.gsap.to(playerEl, {
                        duration: 0.01,
                        x: "+=6",
                        repeat: 38,
                        yoyo: true,
                        ease: "power2.inOut"
                    });
                }
            }

            this.count+=this.e.dt;
            if(this.count>.5){
                this.count=0;
                this.action='enemy_hit_wait'
            }

        } else if (this.action === 'enemy_hit_wait') {

            // nothing

            this.count+=this.e.dt;
            if(this.count>1.25){
                this.count=0;
                this.action='death_fall'
                if (this.e && this.e.s && this.e.s.p) this.e.s.p('fall');
            }

        } else if (this.action === 'death_fall') {
            
            this.player.y -= 14 * this.e.dt * this.gameSpeed;
            this.updatePlayerPosition();

            // Spin the 3D character model on Y axis during fall
            if (this.character) {
                this.character.rotation.y += this.e.dt * 4; // 3 radians per second
            }

            this.count+=this.e.dt;
            if(this.count>3){
                this.count=0;
                //console.log('dead');
                this.action='dead'
            }
            
         } else if (this.action === 'vortex_death') {
             
             const playerEl = document.getElementById('player');
             if (playerEl && !this.vortexTweenStarted) {

                 this.vortexTweenStarted = true;
                 
                 let vortexX = window.innerWidth / 2;
                 let vortexY = window.innerHeight / 2;
                 
                 if (this.hitVortex && !this.hitVortex.destroyed) {
                     vortexX = this.hitVortex.x + this.hitVortex.width / 2;
                     vortexY = this.hitVortex.y + this.hitVortex.height / 2;
                 }
                 
                 window.gsap.to(playerEl, {
                     duration: 1.5,
                     left: vortexX - this.player.width / 2,
                     bottom: vortexY - this.player.height / 2,
                     scale: 0.01,
                     rotation: 360,
                     ease: "power2.in"
                 });

             }

             this.count+=this.e.dt;
             if(this.count>1.5){
                 this.count=0;
                 //console.log('dead');
                 this.action='dead'
             }
            
        } else if (this.action === 'dead') {

            this.e.s.p("achievement1");
          
            // Compute final score and show end screen
            const coinsCollected = this.pelletCount || 0;
            const heightScore = Math.max(0, Math.floor(this.maxHeight));
            const coinScore = coinsCollected * 25; // 25 points per coin
            const finalScore = heightScore + coinScore;
            
            // Set the final score before sending validate breadcrumb
            this.score = finalScore;

            // Call validate breadcrumb at end of game
            this.breadCrumb("validate");

            // Build stats array: HEIGHT and COINS
            const stats = [
                ['HEIGHT', heightScore],
                ['COINS', coinScore]
            ];

            if (this.e && this.e.endScore && this.e.endScore.createFinalScoreOverlay) {
                this.e.endScore.createFinalScoreOverlay(finalScore, stats);
            }

            this.action="endScore"

        }
        
        // Update character animation
        if (this.characterAnimMixer) {
            this.characterAnimMixer.update(this.e.dt);
            
            // Debug animation state every 60 frames
            if (Math.floor(this.e.gameTime * 60) % 60 === 0) {
                ////console.log("Animation update - time:", this.e.gameTime, "dt:", this.e.dt);
                if (this.jumpAction) {
                    ////console.log("Animation time:", this.jumpAction.time, "weight:", this.jumpAction.weight);
                }
            }
        }
        
        // Update character rotation based on movement direction (only during active gameplay)
        if (this.character && this.action === 'game') {
            // Calculate rotation proportional to velocity, capped at 30 degrees
            const maxRotation = Math.PI / 6; // 30 degrees
            const velocityFactor = Math.max(-1, Math.min(1, this.player.velocityX / 5.0)); // Normalize velocity to -1 to 1
            this.targetRotationY = velocityFactor * maxRotation;
            
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
        if (playerElement) {
            // Ensure no glow/outline on player container
            playerElement.style.outline = 'none';
            playerElement.style.boxShadow = 'none';
            playerElement.style.filter = 'none';
        }
        if (playerElement && this.e.playerCanvas) {
            // Remove canvas from body if it's there
            if (this.e.playerCanvas.parentNode) {
                this.e.playerCanvas.parentNode.removeChild(this.e.playerCanvas);
            }
            // Add to player element
            playerElement.appendChild(this.e.playerCanvas);
            ////console.log("Canvas parented to player element");
        }
        
        // ===== GAME CONFIGURATION VARIABLES =====
        // Player physics
        this.player = {
            x: this.getGameWidth() / 2 - 15,
            y: 200, // start higher from bottom of container
            width: 30,
            height: 30,
            velocityX: 0,
            velocityY: 0, // Start with no velocity
            lastY: 200,
            onGround: false,
            jumpPower: 10.5, // Positive for upward jump
            gravity: 0.25,
            friction: 0.98,
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
        
        // Particle system
        this.particles = [];
        this.particlePool = [];
        this.particlePoolSize = 50;
        this.lastParticleTime = 0;
        this.particleSpawnRate = 50; // milliseconds between particles
        
        // Device orientation settings
        this.eventCount = 0;
        this.xMovementMultiplier = 18.0; // Multiplier for X movement
        this.gravityEnabled = true; // Toggle for gravity
        this.screenPushThreshold = 325; // Screen push threshold in pixels
        
        // Simple damper for smooth controls
        
        // Debug mode - set to true to enable debug features
        this.debugMode = false;
        
        // FPS counter
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsTime = performance.now();

        // Initialize platforms array
        this.platforms = [];
        
        // Initialize ball system
        this.e.shoot.initBallPool();
        
        // Initialize particle system
        this.initParticlePool();

        // Generate platforms
        this.e.builder.generatePlatforms();
        
        // Debug enemy removed

        // Set up controls
        this.setupControls();
        
        // Set up shooting controls
        this.e.shoot.setupShootingControls();
        
        // Mobile debug display enabled
        // this.createMobileDebugDisplay();

        // Position player element
        this.updatePlayerPosition();
        
        // Debug start shield removed

        // Mark game start time and reset end flag
        this.startedAt = performance.now();
        this.isEnding = false;

        // Initialize level tracking for breadcrumbs
        this.previousLevel = 1;
        this.levelStartTime = performance.now();

    }

    getGameWidth() {
        const gc = document.getElementById('gameContainer');
        return (gc && gc.clientWidth) ? gc.clientWidth : window.innerWidth;
    }

    setupControls() {
        // Keyboard controls
        this.keys = {
            left: false,
            right: false
        };

        // Remove existing listeners to prevent duplicates
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
        }

        this.keydownHandler = (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.keys.left = true;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.keys.right = true;
            }
            // Toggle debug mode with 'D' key
            if (e.code === 'KeyD' && e.ctrlKey) {
                this.debugMode = !this.debugMode;
                //console.log('Debug mode:', this.debugMode ? 'ON' : 'OFF');
            }
        };

        this.keyupHandler = (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.keys.left = false;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.keys.right = false;
            }
        };

        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);

        // Device orientation setup function - only request permission on user gesture
        this.setupDeviceOrientation = async () => {
            ////console.log('Setting up device orientation listener...');
            
            // Don't remove existing listener if it's already working
            if (this.deviceOrientationHandler && this.deviceOrientationWorking) {
                ////console.log('Device orientation already working, skipping setup');
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
                    ////console.log('Requesting device orientation permission...');
                    orientationPermission = await DeviceOrientationEvent.requestPermission();
                    ////console.log('Orientation permission result:', orientationPermission);
                } else {
                    ////console.log('DeviceOrientationEvent.requestPermission not available (localhost?)');
                }
                
                // Check if permission API exists
                if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                    ////console.log('Requesting device motion permission...');
                    motionPermission = await DeviceMotionEvent.requestPermission();
                    ////console.log('Motion permission result:', motionPermission);
                } else {
                    ////console.log('DeviceMotionEvent.requestPermission not available (localhost?)');
                }
                
                // On localhost, permission APIs might not exist, so try anyway
                if (orientationPermission !== 'granted' && motionPermission !== 'granted') {
                    ////console.log('Both permissions denied or not available, trying anyway (localhost mode)');
                    const orientationStatus = document.getElementById('orientationStatus');
                    if (orientationStatus) orientationStatus.textContent = 'Trying without permission (localhost)';
                } else {
                    ////console.log('At least one permission granted, proceeding...');
                }
            } catch (error) {
                ////console.log('Permission request failed, trying anyway (localhost mode):', error);
                const orientationStatus = document.getElementById('orientationStatus');
                if (orientationStatus) orientationStatus.textContent = 'Trying without permission (localhost)';
            }
            
            this.deviceOrientationHandler = (e) => {
                ////console.log('Device orientation/motion event received:', e.type, {
                //     gamma: e.gamma,
                //     alpha: e.alpha,
                //     beta: e.beta,
                //     accelerationX: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.x : 'null',
                //     accelerationY: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.y : 'null',
                //     accelerationZ: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.z : 'null'
                // });
                
                // Mark device orientation as working (regardless of mobile detection)
                this.deviceOrientationWorking = true;
                this.eventCount++;
                
                // Update status to show it's working
                const orientationStatus = document.getElementById('orientationStatus');
                if (orientationStatus) orientationStatus.textContent = 'Working - Events Received';
                
                // Update debug display
                this.updateMobileDebug(e);
                
                // Standard mobile tilt control implementation
                let tiltValue = null;
                
                // Use only accelerationIncludingGravity.x - the standard approach for mobile games
                if (e.accelerationIncludingGravity && e.accelerationIncludingGravity.x !== null) {
                    tiltValue = e.accelerationIncludingGravity.x;
                    //console.log('Using acceleration X:', tiltValue);
                }
                
                if (tiltValue !== null) {
                    // Normalize acceleration data from -9.8 to +9.8 to -1 to +1
                    const normalizedTilt = Math.max(-1, Math.min(1, tiltValue / 9.8));
                    
                    // Apply X movement multiplier to get the target movement amount
                    // Reverse direction for Android due to different coordinate system
                    const tiltDirection = this.e.isAndroid ? -normalizedTilt : normalizedTilt;
                    const targetVelocity = tiltDirection * this.xMovementMultiplier;
                    
                    // Only apply movement if device orientation is working AND we're on mobile
                    if (this.deviceOrientationWorking && this.e.mobile) {
                        this.player.velocityX = targetVelocity * 0.6;
                    }
                }
            };
            
            // Try both deviceorientation and devicemotion
            window.addEventListener('deviceorientation', this.deviceOrientationHandler);
            window.addEventListener('devicemotion', this.deviceOrientationHandler);
            ////console.log('Device orientation and motion listeners added');
            
            // Test if we can detect any events at all
            window.addEventListener('orientationchange', (e) => {
                ////console.log('Orientation change event:', e);
            });
            
            // Test if we can detect any events at all
            window.addEventListener('resize', (e) => {
                ////console.log('Resize event (test):', e);
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
        ////console.log('Mobile detection:', this.e.mobile);
        ////console.log('User agent:', navigator.userAgent);
        ////console.log('Device orientation available:', typeof DeviceOrientationEvent !== 'undefined');
        ////console.log('Device motion available:', typeof DeviceMotionEvent !== 'undefined');

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
        
        ////console.log('Mobile debug panel created');

        // Add a floating Enable Accelerometer button (upper-left)
        // Hook EA functionality onto Play button
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.addEventListener('click', () => {
                const permissionButton = document.getElementById('requestPermission');
                if (permissionButton) {
                    permissionButton.click();
                } else {
                    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                        DeviceOrientationEvent.requestPermission().catch(()=>{});
                    }
                    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                        DeviceMotionEvent.requestPermission().catch(()=>{});
                    }
                }
            });
        }
        
        // Add screen push threshold adjustment buttons
        const decScreenPushButton = document.getElementById('decScreenPush');
        const incScreenPushButton = document.getElementById('incScreenPush');
        const screenPushValue = document.getElementById('screenPushValue');
        
        if (decScreenPushButton) {
            decScreenPushButton.addEventListener('click', () => {
                this.screenPushThreshold = Math.max(50, this.screenPushThreshold - 5);
                if (screenPushValue) screenPushValue.textContent = this.screenPushThreshold;
                ////console.log('Screen push threshold decreased to:', this.screenPushThreshold);
            });
        }
        
        if (incScreenPushButton) {
            incScreenPushButton.addEventListener('click', () => {
                this.screenPushThreshold = Math.min(500, this.screenPushThreshold + 5);
                if (screenPushValue) screenPushValue.textContent = this.screenPushThreshold;
                ////console.log('Screen push threshold increased to:', this.screenPushThreshold);
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
                ////console.log('X Movement decreased to:', this.xMovementMultiplier);
            });
        }
        
        if (incXMovement) {
            incXMovement.addEventListener('click', () => {
                this.xMovementMultiplier +=.1
                if (xMovementValue) xMovementValue.textContent = this.xMovementMultiplier.toFixed(1);
                ////console.log('X Movement increased to:', this.xMovementMultiplier);
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
                ////console.log('Gravity decreased to:', this.player.gravity);
            });
        }
        
        if (incGravity) {
            incGravity.addEventListener('click', () => {
                this.player.gravity = Math.min(2.0, this.player.gravity + 0.1);
                if (gravityValue) gravityValue.textContent = this.player.gravity.toFixed(1);
                ////console.log('Gravity increased to:', this.player.gravity);
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
                ////console.log('Gravity toggled:', this.gravityEnabled ? 'ON' : 'OFF');
            });
        }
        
        // Add permission request button
        const permissionButton = document.getElementById('requestPermission');
        const clearDataInstructions = document.getElementById('clearDataInstructions');
        if (permissionButton) {
            permissionButton.addEventListener('click', async () => {
                ////console.log('Permission button clicked');
                permissionButton.textContent = 'Requesting...';
                permissionButton.style.background = '#ffc107';
                if (clearDataInstructions) clearDataInstructions.style.display = 'none';
                
                try {
                    await this.setupDeviceOrientation();
                    permissionButton.textContent = 'Permission Requested';
                    permissionButton.style.background = '#28a745';
                } catch (error) {
                    ////console.log('Permission request failed:', error);
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
        ////console.log('Device orientation values:', {
        //     gamma: e.gamma,
        //     alpha: e.alpha,
        //     beta: e.beta,
        //     accelerationX: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.x : 'null',
        //     accelerationY: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.y : 'null',
        //     accelerationZ: e.accelerationIncludingGravity ? e.accelerationIncludingGravity.z : 'null',
        //     velocityX: this.player.velocityX
        // });
    }

    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
            this.frameCount = 0;
            this.lastFpsTime = now;
            
            // Update FPS display
            const fpsDisplay = document.getElementById('fpsValue');
            if (fpsDisplay) {
                fpsDisplay.textContent = this.fps;
            }
        }
    }

    createMobileDebugDisplay() {
        // Create debug overlay
        const debugOverlay = document.createElement('div');
        debugOverlay.id = 'mobileDebugOverlay';
        debugOverlay.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 500000;
            display: block;
        `;
        
        debugOverlay.innerHTML = `
            <div>FPS: <span id="fpsValue">0</span></div>
            <div>Orientation: <span id="orientationStatus">Not Working</span></div>
            <div>Gamma: <span id="gammaValue">0°</span></div>
            <div>Alpha: <span id="alphaValue">0°</span></div>
            <div>Beta: <span id="betaValue">0°</span></div>
            <div>Accel X: <span id="accelXValue">0</span></div>
            <div>Accel Y: <span id="accelYValue">0</span></div>
            <div>Accel Z: <span id="accelZValue">0</span></div>
            <div>Velocity X: <span id="velocityXValue">0</span></div>
            <div>Player Y: <span id="playerYValue">0</span></div>
        `;
        
        document.body.appendChild(debugOverlay);
    }

    updateMobileDebug(e) {
        const orientationStatus = document.getElementById('orientationStatus');
        const gammaValue = document.getElementById('gammaValue');
        const alphaValue = document.getElementById('alphaValue');
        const betaValue = document.getElementById('betaValue');
        const accelXValue = document.getElementById('accelXValue');
        const accelYValue = document.getElementById('accelYValue');
        const accelZValue = document.getElementById('accelZValue');
        const velocityXValue = document.getElementById('velocityXValue');
        const playerYValue = document.getElementById('playerYValue');
        
        if (orientationStatus) orientationStatus.textContent = this.deviceOrientationWorking ? 'Working' : 'Not Working';
        if (gammaValue) gammaValue.textContent = (e && e.gamma !== null && e.gamma !== undefined) ? e.gamma.toFixed(1) + '°' : 'null';
        if (alphaValue) alphaValue.textContent = (e && e.alpha !== null && e.alpha !== undefined) ? e.alpha.toFixed(1) + '°' : 'null';
        if (betaValue) betaValue.textContent = (e && e.beta !== null && e.beta !== undefined) ? e.beta.toFixed(1) + '°' : 'null';
        if (accelXValue) accelXValue.textContent = (e && e.accelerationIncludingGravity && e.accelerationIncludingGravity.x !== null) ? e.accelerationIncludingGravity.x.toFixed(2) : 'null';
        if (accelYValue) accelYValue.textContent = (e && e.accelerationIncludingGravity && e.accelerationIncludingGravity.y !== null) ? e.accelerationIncludingGravity.y.toFixed(2) : 'null';
        if (accelZValue) accelZValue.textContent = (e && e.accelerationIncludingGravity && e.accelerationIncludingGravity.z !== null) ? e.accelerationIncludingGravity.z.toFixed(2) : 'null';
        if (velocityXValue) velocityXValue.textContent = this.player ? this.player.velocityX.toFixed(2) : '0.00';
        if (playerYValue) playerYValue.textContent = this.player ? this.player.y.toFixed(0) : '0';
    }

    updateDebugDisplay() {
        // Update debug display even when no orientation events
        const velocityXValue = document.getElementById('velocityXValue');
        const playerYValue = document.getElementById('playerYValue');
        
        if (velocityXValue) velocityXValue.textContent = this.player ? this.player.velocityX.toFixed(2) : '0.00';
        if (playerYValue) playerYValue.textContent = this.player ? this.player.y.toFixed(0) : '0';
    }

    createCountdownDisplay() {
        // Create countdown overlay
        const countdownOverlay = document.createElement('div');
        countdownOverlay.id = 'countdownOverlay';
        countdownOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20000;
            pointer-events: none;
            background: transparent;
        `;
        
        const countdownText = document.createElement('div');
        countdownText.id = 'countdownText';
        countdownText.textContent = '3';
        countdownText.style.cssText = `
            font-size: 90px;
            font-weight: bold;
            color: #87CEEB;
            text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
            text-align: center;
            user-select: none;
            font-family: 'Olympus Mount', Arial, sans-serif;
            line-height: 1;
            margin: 0;
            padding: 25px 0 0 0;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, calc(-50% - 25px));
        `;
        
        countdownOverlay.appendChild(countdownText);
        document.body.appendChild(countdownOverlay);
        
        // Mark as created
        this.countdownDisplay = true;
    }


    update2DGame() {
        // Update FPS counter
        this.updateFPS();
        
        // Update debug display
        this.updateDebugDisplay();
        
        // Update game time
        this.gameTime -= this.e.dt;
        if (this.gameTime <= 0) {
            this.gameTime = 0;
            this.action = 'time_up_freeze';
            this.count = 0;
        }

        // Update platform visibility BEFORE collisions so platforms exist for landing
        this.updatePlatformVisibility();

        // Update player physics
        this.updatePlayerPhysics();

        // Check platform collisions
        this.checkPlatformCollisions();

        // Update container position based on player
        this.updateContainerPosition();

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

        const playerScreenPos = this.e.u.getScreenPosition(this.player, this.containerBottom);
       
        if (playerScreenPos.y < -20) {
            
            //console.log('fell off bottom');
            
            if (this.debugMode) {
                // Debug mode: Jump back up instead of dying
                this.player.velocityY = this.player.jumpPower;
                this.player.y = this.containerBottom + 100; // Reset position
                //console.log('Debug mode: Jumped back up');
            } else {
                // Normal mode: Die
                this.action = 'death_fall';
                this.handleFallOffBottom();
            }
           
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
        // Always check for keyboard controls first (works on both mobile and desktop)
        if (this.keys.left) {
            this.player.velocityX -= this.keyboardSpeedXMult * this.e.dt * this.gameSpeed;
        }
        if (this.keys.right) {
            this.player.velocityX += this.keyboardSpeedXMult * this.e.dt * this.gameSpeed;
        }
        
        // Also use device orientation if available and working on mobile
        if (typeof DeviceOrientationEvent !== 'undefined' && this.deviceOrientationWorking && this.e.mobile) {
            // Use device orientation velocity (proportional to tilt)
            // velocityX is already set by device orientation handler
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
        // Track previous Y to prevent tunneling through thin platforms on low FPS
        this.player.lastY = this.player.y;
        this.player.x += this.player.velocityX * this.e.dt * this.gameSpeed;
        this.player.y += this.player.velocityY * this.e.dt * this.gameSpeed;

        // Screen wrapping - wrap player to other side when going off screen
        // Add buffer so player doesn't wrap too early
        const buffer = 20; // Buffer pixels before wrapping
        
        if (this.player.x < -buffer) {
            this.player.x = this.getGameWidth() - this.player.width + buffer;
        }
        if (this.player.x > this.getGameWidth() - this.player.width + buffer) {
            this.player.x = -buffer;
        }
    }

    checkPlatformCollisions() {
        this.player.onGround = false;

        // Only check collisions against visible platforms for efficiency
        for (const platform of this.platforms) {
            if (!platform.visible || platform.broken) continue; // Skip invisible or broken platforms
            
            // Enhanced collision detection for low FPS
            const platformTop = platform.y + platform.height;
            const playerBottom = this.player.y + this.player.height;
            const playerBottomLast = this.player.lastY + this.player.height;
            
            // Check if player is falling and would intersect with platform
            const isFalling = this.player.velocityY < 0;
            const wouldIntersect = (
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                playerBottom >= platform.y &&
                this.player.y <= platformTop
            );
            
            // Enhanced swept collision for low FPS
            const sweptCollision = (
                isFalling &&
                // Player was above platform last frame
                playerBottomLast > platformTop &&
                // Player is now at or below platform top
                playerBottom <= platformTop &&
                // X overlap during the sweep
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x
            );
            
            // Additional check for low FPS: if player is very close to platform top
            const nearPlatformTop = (
                isFalling &&
                playerBottom >= platformTop - 5 && // Within 5 pixels
                playerBottom <= platformTop + 5 &&
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x
            );

            if ((wouldIntersect || sweptCollision || nearPlatformTop) &&
                this.player.velocityY < 0 &&
                // Require player's bottom to be at or above platform's bottom (landing from above)
                this.player.y >= platform.y) {
                
                this.player.y = platform.y + platform.height;
                if (this.e && this.e.s && this.e.s.p) this.e.s.p('jump');
                this.player.velocityY = 0;
                this.player.onGround = true;
                
                // Handle break platforms
                if (platform.type === 'break') {
                    if (this.e && this.e.s && this.e.s.p) this.e.s.p('break');
                    // Remove break platform from DOM and mark as broken
                    if (platform.element) {
                        platform.element.remove();
                    }
                    platform.broken = true;
                    platform.visible = false;
                    ////console.log('Break platform broken!');
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
                
                // Platform bounce animation
                if (platform.element) {
                    window.gsap.to(platform.element, {
                        duration: 0.125,
                        y: "+=8",
                        ease: "power2.out",
                        onComplete: () => {
                            window.gsap.to(platform.element, {
                                duration: 0.125,
                                y: "-=8",
                                ease: "power2.out"
                            });
                        }
                    });
                }
               
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
        // Preserve horizontal centering while moving vertically
        gameContainer.style.left = '50%';
        gameContainer.style.transform = `translate(-50%, ${this.containerBottom}px)`;
    }

    updatePlatformVisibility() {
        // Debug: log viewport bounds every 60 frames
        if (Math.floor(this.e.time * 60) % 60 === 0) {
            const screenTop = this.containerBottom;
            const screenBottom = this.containerBottom + window.innerHeight;
            ////console.log(`Screen viewport: ${screenTop} to ${screenBottom}, Container: ${this.containerBottom}`);
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
                if (this.e && this.e.s && this.e.s.p) this.e.s.p('coinBing');
                this.pelletCount++;
                ////console.log(`Pellet collected! Score: ${this.score}, Pellets: ${this.pelletCount}`);
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
                if (this.e && this.e.s && this.e.s.p) this.e.s.p('spring');
                this.player.onGround = false;
                
                // Restart jump animation
                this.restartJumpAnimation();
                
                // Mark spring as used (but don't remove it, springs can be used multiple times)
                ////console.log(`Spring activated! Jump power: ${this.player.jumpPower * 1.5}`);
                
                // Swap spring graphic to hit state (persist in 2 state) and add bounce feedback
                if (spring.image) {
                    spring.image.src = 'src/images/springer2.svg';
                }
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
                    // Spike hit: enter enemy_hit state (reuse same death sequence)
                    this.action = 'enemy_hit';
                    this.count = 0;
                    this.enemyHitTweenStarted = false;
                    if (this.e && this.e.s && this.e.s.p) this.e.s.p('death');
                    // Freeze player's current animation pose
                    if (this.characterAnimMixer) this.characterAnimMixer.timeScale = 0;
                    if (this.jumpAction) this.jumpAction.paused = true;
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
                if (this.e && this.e.s && this.e.s.p) this.e.s.p('getItem');
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
        const playerEl = document.getElementById('player');
        // Create or update a radial-gradient shield overlay that fully wraps the player
        if (playerEl) {
            // Remove any existing outline/glow
            playerEl.style.outline = '';
            playerEl.style.boxShadow = '';
            playerEl.style.filter = '';

            // Ensure a container-relative context
            if (getComputedStyle(playerEl).position === 'static') {
                playerEl.style.position = 'relative';
            }

            // Reuse if exists
            let shield = playerEl.querySelector('#playerShield');
            if (!shield) {
                shield = document.createElement('div');
                shield.id = 'playerShield';
                playerEl.appendChild(shield);
            }

            // Style the spherical shield (bigger, brighter, more 3D)
            shield.style.position = 'absolute';
            shield.style.left = '50%';
            shield.style.top = 'calc(50% - 6px)';
            // Slightly larger radius
            shield.style.width = '195%';
            shield.style.height = '195%';
            shield.style.transform = 'translate(-50%, -50%)';
            shield.style.borderRadius = '50%';
            shield.style.pointerEvents = 'none';
            shield.style.zIndex = '1002';
            // Green, slightly transparent radial gradient for spherical look
            shield.style.background = 'radial-gradient(circle at 60% 60%, rgba(60, 255, 140, 0) 0%, rgba(60, 255, 140, 0.35) 100%';
            // shield.style.border = '1px solid rgba(40, 230, 110, 0.55)';
            // Outer green glow + soft bloom + inner rim light
            // shield.style.boxShadow = '0 0 16px rgba(60, 255, 140, 0.45), 0 0 40px rgba(40, 230, 110, 0.22), inset 0 0 12px rgba(255, 255, 255, 0.18)';
        }

        this._shieldTimeout = setTimeout(() => {
            this.shieldActive = false;
            const playerEl2 = document.getElementById('player');
            if (playerEl2) {
                const shield2 = playerEl2.querySelector('#playerShield');
                if (shield2 && shield2.parentNode) shield2.parentNode.removeChild(shield2);
            }
        }, DURATION_MS);
    }

    activateSpringShoes() {
        this.springJumpsLeft = 6;
        const playerEl = document.getElementById('player');
        // Disable green outline/glow
        if (playerEl) {
            playerEl.style.outline = '';
            playerEl.style.boxShadow = '';
            playerEl.style.filter = '';
        }
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
            
            // Update collision box position (in case enemy moved)
            enemy.collisionX = enemy.x + (enemy.width * 0.2);
            enemy.collisionY = enemy.y + (enemy.height * 0.2);
            
            // Check collision with player using collision box
            if (this.player.x < enemy.collisionX + enemy.collisionWidth &&
                this.player.x + this.player.width > enemy.collisionX &&
                this.player.y < enemy.collisionY + enemy.collisionHeight &&
                this.player.y + this.player.height > enemy.collisionY) {
                // Vortex/black hole: always lethal, no bounce
                if (enemy.type === 'blackhole') {
                    if (!this.shieldActive) {
                        ////console.log('Player hit black hole - Game Over!');
                        this.hitVortex = enemy; // Save the specific vortex that was hit
                        this.action = 'vortex_death';
                        this.vortexTweenStarted = false;
                        if (this.e && this.e.s && this.e.s.p) this.e.s.p('portal');
                        return;
                    }
                } else {
                    // Regular enemy: allow bounce only when landing from above
                    if (this.player.velocityY < 0 &&
                        this.player.y + this.player.height > enemy.y + enemy.height * 0.7) {
                        // Bounce up like a spring (1.5x normal jump power)
                        this.player.velocityY = this.player.jumpPower * 1.75;
                        if (this.e && this.e.s && this.e.s.p) this.e.s.p('bounce');
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
                        ////console.log('Player bounced off enemy! Jump power:', this.player.jumpPower * 1.5);
            } else {
                        // Enemy side/bottom hit: enter enemy_hit action (DT-driven, no timeouts)
                        if (!this.shieldActive) {
                            this.action = 'enemy_hit';
                            this.count = 0;
                            this.enemyHitTweenStarted = false;
                            // Freeze player's current animation pose
                            if (this.characterAnimMixer) this.characterAnimMixer.timeScale = 0;
                            if (this.jumpAction) this.jumpAction.paused = true;
                            if (this.e && this.e.s && this.e.s.p) this.e.s.p('death');
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
                    
                    // Calculate enemy collision box center position
                    const enemyCenterX = enemy.collisionX + enemy.collisionWidth / 2;
                    const enemyCenterY = enemy.collisionY + enemy.collisionHeight / 2;
                    
                    // Calculate distance between centers
                    const dx = ballCenterX - enemyCenterX;
                    const dy = ballCenterY - enemyCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Check if ball is within enemy collision box bounds (with some tolerance)
                    const collisionDistance = (enemy.collisionWidth / 2) + (ball.width / 2) + 10; // 10px tolerance
                    
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
                        if (this.e && this.e.s && this.e.s.p) this.e.s.p('enemyDie');
                        ////console.log('Enemy destroyed by ball! Distance:', distance, 'Collision distance:', collisionDistance);
                        
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
        
        // Check if player reached a new level
        if (this.currentLevel > this.previousLevel) {
            // Send breadcrumb for completed level
            this.breadCrumb("level");
            
            // Update tracking for next level
            this.previousLevel = this.currentLevel;
            this.levelStartTime = performance.now();
        }
    }

    gameOver() {
        ////console.log('Game Over!');
        // Reset the game
        this.init2DGame();
        // this.action = "game over"
    }
    
    handleFallOffBottom(){
        // Set animation to 0.5 seconds in and then freeze
        if (this.jumpAction) {
            this.jumpAction.time = 0.5;
            this.jumpAction.paused = true;
        }
        if (this.characterAnimMixer) this.characterAnimMixer.timeScale = 0;
       
        const container = document.getElementById('gameContainer');
        const endBottom = this.containerBottom - 1500;
        
        if (this.e && this.e.s && this.e.s.p) this.e.s.p('fall');
        window.gsap.to(this, { duration: .7, containerBottom: endBottom, ease: 'sine.Out', onUpdate: () => {
            // Preserve horizontal centering while moving vertically
            container.style.left = '50%';
            container.style.transform = `translate(-50%, ${this.containerBottom}px)`;
        }, onComplete: () => {  } });
        
    }

    //------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------

    // Particle System
    initParticlePool() {
        for (let i = 0; i < this.particlePoolSize; i++) {
            const particle = {
                element: null,
                x: 0,
                y: 0,
                size: 0,
                opacity: 0,
                velocityY: 0,
                life: 0,
                maxLife: 0,
                active: false
            };
            this.particlePool.push(particle);
        }
    }

    spawnParticle() {
        // Find inactive particle from pool
        let particle = this.particlePool.find(p => !p.active);
        if (!particle) return; // Pool exhausted

        // Create element if needed
        if (!particle.element) {
            particle.element = document.createElement('div');
            particle.element.style.position = 'absolute';
            particle.element.style.pointerEvents = 'none';
            particle.element.style.zIndex = '50';
            document.getElementById('gameContainer').appendChild(particle.element);
        }

        // Random position near player (wider spread)
        const offsetX = (Math.random() - 0.5) * 30; // ±40px
        const offsetY = (Math.random() - 0.5) * 28; // ±24px
        
        particle.x = this.player.x + this.player.width / 2 + offsetX;
        particle.y = this.player.y + this.player.height / 2 + offsetY;
        
        // Random size (3-4px) a bit bigger and more pronounced
        particle.size = Math.random() * 1 + 3;
        
        // Set initial properties
        particle.opacity = 0.95; // stronger
        particle.velocityY = 0; // no upward movement
        particle.life = 0;
        particle.maxLife = 600 + Math.random() * 300; // slightly quicker
        particle.active = true;

        // Update visual
        particle.element.style.left = particle.x + 'px';
        particle.element.style.bottom = particle.y + 'px';
        particle.element.style.width = particle.size + 'px';
        particle.element.style.height = particle.size + 'px';
        particle.element.style.borderRadius = '50%';
        particle.element.style.background = `radial-gradient(circle, rgba(255,255,255,${particle.opacity}) 0%, rgba(180,200,255,${particle.opacity * 0.5}) 60%, rgba(150,170,255,0.2) 85%, transparent 100%)`;
        particle.element.style.display = 'block';
    }

    updateParticles() {
        const currentTime = performance.now();
        
        // Spawn new particles
        if (currentTime - this.lastParticleTime > this.particleSpawnRate) {
            this.spawnParticle();
            this.lastParticleTime = currentTime;
        }

        // Update existing particles
        for (const particle of this.particlePool) {
            if (!particle.active) continue;

            particle.life += this.e.dt * 500; // Convert to milliseconds
            // No vertical drift
            // particle.y unchanged; no gravity

            // Shrink and fade
            const lifeRatio = particle.life / particle.maxLife;
            const currentSize = particle.size * (1.1 - lifeRatio * 0.6); // Shrink to 40% of original
            const currentOpacity = particle.opacity * (.5 - lifeRatio);

            // Update visual
            particle.element.style.left = particle.x + 'px';
            particle.element.style.bottom = particle.y + 'px';
            particle.element.style.width = currentSize + 'px';
            particle.element.style.height = currentSize + 'px';
            particle.element.style.background = `radial-gradient(circle, rgba(255,255,255,${currentOpacity}) 0%, rgba(180,200,255,${currentOpacity * 0.5}) 60%, rgba(150,170,255,0.2) 85%, transparent 100%)`;

            // Remove when life is over
            if (particle.life >= particle.maxLife) {
                particle.active = false;
                particle.element.style.display = 'none';
            }
        }
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

    breadCrumb(type){

        //console.log("---------BREADCRUMB----------------------------------------------------------");

        if (typeof CryptoJS !== 'undefined') {

        this.levelElapsedTime = (performance.now() - this.levelStartTime) / 1000;
        //console.log("Level duration (in seconds):", this.levelElapsedTime);

        const breadCrumbPayload = {

            score: this.score,
            // levelScore: this.levelScore,
            heightScore: Math.floor(this.maxHeight),
            pelletCount: this.pelletCount,
            gameTime: Math.floor(this.gameTime),
            levelTime: this.levelElapsedTime,
            currentLevel: this.previousLevel // Use previousLevel because it's the level that was just completed

        }
        
        console.log("=== BREADCRUMB DEBUG ===");
        console.log("Breadcrumb type:", type);
        console.log("Breadcrumb payload:", breadCrumbPayload);
        // console.log("Total game score:", this.score);

        if (type==="validate") {

            //---------------------------------------------------------------------------------------------------------------------
            //----END GAME VALIDATE------------------------------------------------------------------------------------------------
            //---------------------------------------------------------------------------------------------------------------------

            const finalPayload = {

                score: this.score,
                metadata: {
                    breadcrumb: breadCrumbPayload,
                }

            };

            try {

                var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(finalPayload), 'DrErDE?F:nEsF:AA=A:EEDB:>C?nAABA@r>E'._0xd7a82c(13)).toString();
                const message = JSON.stringify({ type: 'Sv{ny`p|r'._0xd7a82c(13), data: ciphertext });
                if (window.parent) {
                    window.parent.postMessage(message, "*")
                } else {
                    console.log(`no parent`);
                }

                } catch {

                console.log('Not configured properly 1');

            }

            this.breadCrumbDone = true;

        } else {

            //---------------------------------------------------------------------------------------------------------------------
            //----BREAD CRUMB------------------------------------------------------------------------------------------------------
            //---------------------------------------------------------------------------------------------------------------------

            try {

            var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(breadCrumbPayload), 'DrErDE?F:nEsF:AA=A:EEDB:>C?nAABA@r>E'._0xd7a82c(13)).toString();
            var message = JSON.stringify({type: 'OrnqPzo'._0xd7a82c(13), data: ciphertext});
            if (window.parent) {
                window.parent.postMessage(message, "*");
            } else {
                console.log('no parent');
            }

            } catch {

                console.log('Not configured properly 2');

            }

            

        }

        } else {

            console.log('CryptoJS is not defined');

        }

        console.log("=========================");

        //---------------------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------------------

    }

}