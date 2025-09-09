export default class Shoot {
    constructor() {
    }

    setUp(engine) {
        this.e = engine;
        this.scene = engine.scene;
    }

    initBallPool() {
        this.createBallsContainer();
        
        for (let i = 0; i < this.scene.ballPoolSize; i++) {
            const ballElement = this.createBallElement();
            const ball = {
                element: ballElement,
                x: 0,
                y: 0,
                width: 45,
                height: 45,
                velocityY: 0,
                velocityX: 0,
                action: 'inactive',
                index: i
            };
            this.scene.ballPool.push(ball);
            
            // Add ball element to the balls container
            document.getElementById('balls').appendChild(ballElement);
        }
    }

    createBallsContainer() {
        const ballsContainer = document.createElement('div');
        ballsContainer.id = 'balls';
        ballsContainer.style.position = 'absolute';
        ballsContainer.style.width = '100%';
        ballsContainer.style.height = '100%';
        ballsContainer.style.pointerEvents = 'none';
        ballsContainer.style.zIndex = '200';
        document.getElementById('gameContainer').appendChild(ballsContainer);
        return ballsContainer;
    }

    createBallElement() {
        const ballElement = document.createElement('div');
        ballElement.style.position = 'absolute';
        ballElement.style.width = '45px';
        ballElement.style.height = '45px';
        ballElement.style.backgroundImage = 'url(./src/images/fireball.png)';
        ballElement.style.backgroundSize = 'contain';
        ballElement.style.backgroundRepeat = 'no-repeat';
        ballElement.style.backgroundPosition = 'center';
        ballElement.style.borderRadius = '50%';
        ballElement.style.zIndex = '200'; // Higher than player (z-index 100)
        ballElement.style.left = '-100px';
        ballElement.style.bottom = '-100px';
        return ballElement;
    }

    shootBall(clickX) {
        console.log('shootBall called with clickX:', clickX);
        console.log('Ball pool length:', this.scene.ballPool.length);
        console.log('Current ball index:', this.scene.currentBallIndex);
        
        // Find next inactive ball
        let ball = this.scene.ballPool[this.scene.currentBallIndex];
        let attempts = 0;
        
        while (ball && ball.action !== 'inactive' && attempts < this.scene.ballPoolSize) {
            this.scene.currentBallIndex = (this.scene.currentBallIndex + 1) % this.scene.ballPoolSize;
            ball = this.scene.ballPool[this.scene.currentBallIndex];
            attempts++;
        }
        
        // If pool is saturated, recycle the current ball
        if (ball && ball.action !== 'inactive') {
            console.log('Recycling active ball due to pool saturation');
            // Force reset and reuse
            ball.action = 'inactive';
        }

        if (ball && ball.action === 'inactive') {
            // Set ball position to player position
            ball.x = this.scene.player.x + this.scene.player.width / 2 - ball.width / 2;
            ball.y = this.scene.player.y + this.scene.player.height;
            ball.velocityY = 22; // Positive for upward movement
            
            // Calculate X velocity based on click position
            const centerX = window.innerWidth / 2;
            const velocityMultiplier = 8;
            ball.velocityX = (clickX - centerX) / centerX * velocityMultiplier;
            
            // Calculate and set initial rotation angle based on velocity direction
            // Add 90 degrees counter-clockwise to orient the fireball correctly
            // const angle = Math.atan2(ball.velocityY, -ball.velocityX) * (180 / Math.PI) - 90;
            // ball.element.style.transform = `rotate(${angle}deg)`;
            
            ball.action = 'shoot';
            ball.element.style.display = 'block';
            this.scene.currentBallIndex = (this.scene.currentBallIndex + 1) % this.scene.ballPoolSize;
        }
    }

    updateBalls() {
        for (const ball of this.scene.ballPool) {
            if (ball.action === 'shoot') {
                // Update ball position
                const dt = this.e.dt || this.e.deltaTime || 1/60;
                const speedScale = (this.scene.gameSpeed || 60);
                ball.y += ball.velocityY * dt * speedScale;
                ball.x += ball.velocityX * dt * speedScale;
                
                // Update visual position
                ball.element.style.left = ball.x + 'px';
                ball.element.style.bottom = ball.y + 'px';
                
                // Update rotation based on current velocity direction
                // Add 90 degrees counter-clockwise to orient the fireball correctly
                const angle = Math.atan2(ball.velocityY, -ball.velocityX) * (180 / Math.PI) + 90;
                ball.element.style.transform = `rotate(${angle}deg)`;
                
                // Check if ball went off screen using our utility function
                if (!this.e.u.isObjectOnScreen(ball, this.scene.containerBottom)) {
                    ball.action = 'reset';
                }
            } else if (ball.action === 'reset') {
                // Move ball off screen and reset
                ball.element.style.left = '-100px';
                ball.element.style.bottom = '-100px';
                ball.element.style.display = 'none';
                ball.action = 'inactive';
                ball.velocityY = 0;
                ball.velocityX = 0;
            }
        }
    }

    setupShootingControls() {
        document.addEventListener('click', (e) => {
            console.log('Click detected:', { action: this.scene.action, mobile: this.e.mobile, ballPoolLength: this.scene.ballPool.length });
            if (this.scene.action === 'game' && this.e.mobile === false) {
                const currentTime = Date.now();
                if (currentTime - this.scene.lastShotTime > this.scene.shotCooldown) {
                    console.log('Shooting ball from click');
                    this.shootBall(e.clientX);
                    this.scene.lastShotTime = currentTime;
                } else {
                    console.log('Shot on cooldown');
                }
            }
        });

        document.addEventListener('touchstart', (e) => {
            console.log('Touch detected:', { action: this.scene.action, mobile: this.e.mobile, ballPoolLength: this.scene.ballPool.length });
            if (this.scene.action === 'game' && this.e.mobile === true) {
                const currentTime = Date.now();
                if (currentTime - this.scene.lastShotTime > this.scene.shotCooldown) {
                    console.log('Shooting ball from touch');
                    this.shootBall(e.touches[0].clientX);
                    this.scene.lastShotTime = currentTime;
                } else {
                    console.log('Shot on cooldown');
                }
            }
        });
    }
}
