import * as THREE from 'three';

import AES from 'crypto-js/aes';
import enc from 'crypto-js/enc-utf8';

export default class Engine{
    constructor(input, loader, scene, sounds, utilities, endScore, builder, shoot, animation){

        this.input = input;
        this.loader = loader;
        this.s = sounds;
        this.scene = scene;
        this.u = utilities;
        this.endScore = endScore;
        this.builder = builder;
        this.shoot = shoot;
        this.animation = animation;

        this.mobile = false;
        this.isAndroid = false;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent )) {
            this.mobile = true;
        }

        var testUA = navigator.userAgent;

        if(testUA.toLowerCase().indexOf("android") > -1){
            this.mobile = true;
            this.isAndroid = true;
        }

        // Hide side blockers on tablets (UA-based detection, no measurements)
        try {
            const ua = navigator.userAgent || navigator.vendor || (window.opera ? window.opera : "");
            const isIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && 'ontouchend' in document);
            const isAndroidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);
				const isAmazonOrOtherTablet = /(Kindle|Silk|KF[A-Z]{2,}|Tablet|PlayBook)/i.test(ua);
				// Microsoft Surface / Windows tablets: Windows UA + touch capability OR explicit Surface token
				const isWindowsTablet = (/Windows/i.test(ua) && (navigator.maxTouchPoints || 0) > 0 && !/Phone/i.test(ua)) || /Surface/i.test(ua) || /Tablet PC/i.test(ua);
				this.isTablet = !!(isIPad || isAndroidTablet || isAmazonOrOtherTablet || isWindowsTablet);
            if (this.isTablet) {
                console.log("isTablet");
                const leftBlocker = document.getElementById('leftBlocker');
                const rightBlocker = document.getElementById('rightBlocker');
                if (leftBlocker) leftBlocker.style.display = 'none';
                if (rightBlocker) rightBlocker.style.display = 'none';
					// On iPad, make the splash image width 100% without stretching (height auto)
					if (isIPad) {
						const splashBgImage = document.getElementById('splashBgImage');
						if (splashBgImage) {
							splashBgImage.style.width = '100vw';
							splashBgImage.style.maxWidth = '100vw';
							splashBgImage.style.height = 'auto';
							splashBgImage.style.maxHeight = '100vh';
							splashBgImage.style.left = '50%';
							splashBgImage.style.transform = 'translateX(-50%)';
						}
					}
            }
        } catch (e) {
            // fail-safe: do nothing if UA parsing fails
        }

        this.action = "set up";
        this.count = 0;
        
        this.skipStartMenu = true;

    }

    start(){

    }

    update(){

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);

        //---deltatime--------------------------------------------------------------------------------------------------------------

        var currentTime = new Date().getTime();
        this.dt = (currentTime - this.lastTime) / 1000;
        if (this.dt > 1) {
            this.dt = 0;
        }
        this.lastTime = currentTime;

        const feedbackElement = document.getElementById("feedback");
        if (feedbackElement) {
            feedbackElement.innerHTML = "this.scene.action";
        }

        // console.log(this.action);

        if(this.action==="set up"){

            //---3D SET UP----------------------------------------------------------------------------------------------------------------

            //---scene parts--------------------------------------------------------------------------------------------------------------

            this.scene3D = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(30, 1, .1, 740); // 1:1 aspect ratio for 200x200 square
            this.scene3D.fog = new THREE.Fog(0x000000, 0, 330*1.6);

            this.mainCont = new THREE.Group();
            this.scene3D.add(this.mainCont);

            //---carmera rig--------------------------------------------------------------------------------------------------------------

            this.camContX = new THREE.Group();
            this.camContY = new THREE.Group();
            this.scene3D.add(this.camContX);
            this.scene3D.add(this.camContY);

            this.camContY.add(this.camContX)
            this.camContX.add(this.camera);

            //-----------------------

            this.camera.position.z = 8;
            this.camera.position.y = 0;

            // this.camContY.rotation.y = this.u.ca(45);
            // this.camContX.rotation.x = this.u.ca(-45);

            //---webgl--------------------------------------------------------------------------------------------------------------

            this.renderer = new THREE.WebGLRenderer({antialias:true, powerPreference: "high-performance", alpha: true})

            // this.renderer.setSize(window.innerWidth,window.innerHeight);
            this.renderer.setSize(85, 85);
            this.renderer.setPixelRatio(window.devicePixelRatio);

            this.renderer.shadowMap.enabled = false;
            this.renderer.shadowMapSoft = true;

            this.renderer.shadowCameraNear = 3;
            this.renderer.shadowCameraFar = this.camera.far;
            this.renderer.shadowCameraFov = 50;

            this.renderer.shadowMapBias = 0.0039;
            this.renderer.shadowMapDarkness = 0.5;
            this.renderer.shadowMapWidth = 2048;
            this.renderer.shadowMapHeight = 2048;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

            this.renderer.domElement.style.position="absolute"
            this.renderer.domElement.style.zIndex="2";
            // this.renderer.domElement.style.border="2px solid red";

            //---end--------------------------------------------------------------------------------------------------------------

            this.serverData = null;
            
            window.addEventListener('message', event => {
                try {
                    const message = JSON.parse(event.data);
                    if (message?.type) {
                        const _0x87c0da = 'V{vTnzr'._0x6cc90a(13);
                        if (message.type === _0x87c0da) {
                            // Case CG_API.InitGame
                            // Decrypt the data
                            const bytes  = AES.decrypt(message.data, 'DrErDE?F:nEsF:AA=A:EEDB:>C?nAABA@r>E'._0x6cc90a(13));
                            this.serverData = JSON.parse(bytes.toString(enc));
                            console.log("LOAD CRYPTO")
                        }
                    }
                } catch (e) {
                    // Ignore exception - not a message for us and couldn't JSON parse it
                    console.log("FAIL:");
                    console.log(e);
                }
            });

            //---end--------------------------------------------------------------------------------------------------------------

            this.action="load 3d";

        }else if(this.action==="load 3d"){

            // load 3d assets

            this.loader.load();
            this.action="loading 3d";

        }else if(this.action==="loading 3d"){

            // wait for 3d assets

            if(this.loader.isLoaded_3DTEXTURES===true && this.loader.isLoaded_3D===true && this.loader.isLoaded_CUBE===true){
                this.action="wait before build";
            }

        }else if(this.action==="wait before build"){

            this.count+=this.dt;
            if(this.count>.1){
                this.count=0;
                this.action="build"
            }

        }else if(this.action==="build"){

            // Add small Three.js canvas for char model - will be parented to player
            this.renderer.domElement.style.position = "absolute";
            this.renderer.domElement.style.width = "85px";
            this.renderer.domElement.style.height = "85px";
            this.renderer.domElement.style.border = "none";
            this.renderer.domElement.style.borderRadius = "0px";
            this.renderer.domElement.style.pointerEvents = "none";
            this.renderer.domElement.style.zIndex = "1000";
            this.renderer.domElement.style.transform = "translate(-50%, -50%)";
            this.renderer.domElement.style.left = "50%";
            this.renderer.domElement.style.top = "50%";
            // this.renderer.domElement.style.border = "1px solid red";
            
            // Store reference for later parenting
            this.playerCanvas = this.renderer.domElement;

            this.scene.buildScene();
            
            window.addEventListener("resize", () => {
                this.resize3D();
            })

            this.loadBack=1;

            // Always show start menu and splash background on load
            const startMenu = document.getElementById("startMenu");
            const splashBackground = document.getElementById("splashBackground");
            if (startMenu) startMenu.style.display = "block";
            if (splashBackground) splashBackground.style.display = "block";
            this.action = "wait";
            this.count = 0;

        }else if(this.action==="wait"){

            // fade out loading graphic

            this.count+=this.dt;
            if(this.count>.1){
                this.count=0;
                this.action="go"
            }


        }else if(this.action==="go"){

            // fade out loading cover

            this.loadBack-=this.dt;
            if(this.loadBack.opacity<=0){
                this.loadBack.opacity=0;
            }
            document.getElementById("loadingImage").style.opacity = this.loadBack+""
            document.getElementById("loadingBack").style.opacity = this.loadBack+""

            // loops

            this.scene.update();
            if (this.animation) {
                this.animation.animate();
            }
            this.render(); // Re-enabled Three.js rendering for char model

        }

    }

    render(){
        
        //---renderer--------------------------------------------------------------------------------------------------------------

        this.renderer.render(this.scene3D, this.camera);

    }

    resize3D(){

        console.log("resize")
    
        // Keep the small canvas at 100x100
        var width = 100;
        var height = 100;
    
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize( width, height );
    
    }

    async requestDevicePermissions() {
        try {
            // Request orientation permission
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                const orientationPermission = await DeviceOrientationEvent.requestPermission();
                console.log('Orientation permission:', orientationPermission);
            }
            
            // Request motion permission
            if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                const motionPermission = await DeviceMotionEvent.requestPermission();
                console.log('Motion permission:', motionPermission);
            }
            
            // Set up device orientation after permissions
            if (this.scene && this.scene.setupDeviceOrientation) {
                await this.scene.setupDeviceOrientation();
            }
        } catch (error) {
            console.log('Permission request failed:', error);
            // Try to set up anyway (might work on localhost)
            if (this.scene && this.scene.setupDeviceOrientation) {
                await this.scene.setupDeviceOrientation();
            }
        }
    }

}