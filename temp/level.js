import * as THREE from 'three';
import { gsap } from "gsap";
import { Howl } from 'howler';
import AES from 'crypto-js/aes';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export class Level {

  // This is MESSAGE_FACTORY (I am obfuscating the name)
  _0x8db29a(name, data) {
    return JSON.stringify({
      type: name,
      data: data,
    });
  }

  // Add missing string decryption function
  _0xd7a82c(key, n = 126) {
    let result = '';
    for (let i = 0; i < this.length; i++) {
      const charCode = this.charCodeAt(i);
      result += String.fromCharCode(charCode ^ key);
    }
    return result;
  }

  setUp(e) {

    this.e=e;

    this.action="start";

    this.curColor1 = "";
    this.curColor2 = "";

    this.movePlayer=false
    this.lock=false;
    this.onGround=true;
    this.isTweening=false;
    this.gameTimeGo=false;

    this.totalTime=0;
    this.count=0;
    this.isRotating=0;
    this.gameSpeed=0;
    this.curGameSpeed=75;
    this.subBack=0;
    this.playerRot=0;
    this.turnWait=0;
    this.penaltyCount=0;
    this.etheScore=0;
    this.etheTotal=0;
    this.currentLevel = 0;
    this.spikeSets = 0;
    this.scoreSubtractTotal=0;
    this.badCoins = 0;

    this.saveCharacterCol = '3fe0ee';

    this.raycaster = new THREE.Raycaster();

    // arrays ------------------------------------

    this.groundParts = [];
    this.allBitArray = [];
    this.allCoinPositions = [];

    this.allTunnels=[];
    this.ttPlaces=[];
    this.speedChanges=[];
    this.lockChanges=[];

    this.allEthe = [];
    this.allEtheConts = [];
    this.toothArray = [];
    this.allSparks = [];

    this.cp1 = [];
    this.cp2 = [];
    this.cp3 = [];
    this.cp4 = [];
    this.cp5 = [];
    this.cp6 = [];
    this.cp7 = [];
    this.cp8 = [];
    this.cp9 = [];
    this.cp10 = [];

    this.coinsFound=[];
    this.coinsFoundThisLevel=[];
    this.bcArray=[];

    // scores -----------------------------------

    this.score=0;
    this.pointScore=0;
    this.spikePenaltyScore=0;
    this.penaltyScore=0;

    this.smallEthe=0;
    this.mediumEthe=0;
    this.largeEthe=0;
    this.spikeHits=0;

    this.smallEtheTotal=0;
    this.mediumEtheTotal=0;
    this.largeEtheTotal=0;
    this.totalToothPlaces=0;

    this.levelScore1 = 0;
    this.levelScore2 = 0;
    this.levelScore3 = 0;
    this.levelScore4 = 0;
    this.levelScore5 = 0;
    this.levelScore6 = 0;
    this.levelScore7 = 0;
    this.levelScore8 = 0;
    this.levelScore9 = 0;
    this.levelScore10 = 0;

    this.levelTime = 0;

    this.scoreLog = [];

    this.levelText = document.getElementById("levelText");

  }

  buildLevel(){

    document.getElementById("startMenuContainer").style.position = "absolute";
    document.getElementById("startMenuContainer").style.bottom = "30px";

    // main containers

    this.mainCont = new THREE.Group();
    this.e.scene.add(this.mainCont)

    this.levelCont = new THREE.Group();
    this.mainCont.add(this.levelCont)

    //-----------------------------------------------------------------------------------------------------------------

    // Shadow offset for light following
    this.shadowOffset = 0;

    // LIGHT

    this.dl = new THREE.DirectionalLight(0xffffff, 1);
    this.dl.position.x=0;
    this.dl.position.z=-30;
    this.dl.position.y=30;
    this.mainCont.add(this.dl);

    this.dl.castShadow=true;

    // Create target for the directional light
    this.dl.target = new THREE.Object3D();
    this.dl.target.position.set(0, 0, 0);
    this.mainCont.add(this.dl.target);

    // Debug shadow setup
    console.log("Setting up shadows for directional light:", this.dl);
    console.log("Light position:", this.dl.position);
    console.log("Light target:", this.dl.target);
    console.log("Light castShadow:", this.dl.castShadow);

    this.dl.shadow.mapSize.width = 4096;
    this.dl.shadow.mapSize.height = 4096;

    this.sSize = 42.5;
    this.dl.shadow.camera.near = 0.1;
    this.dl.shadow.camera.far = 380;
    this.dl.shadow.camera.left = -this.sSize / 2;
    this.dl.shadow.camera.right = this.sSize / 2;
    this.dl.shadow.camera.top = this.sSize;
    this.dl.shadow.camera.bottom = -this.sSize;
    this.dl.shadow.radius = 2;
    
    // Position shadow camera to focus on player's feet
    this.dl.shadow.camera.position.set(0, 0, 0);
    this.dl.shadow.camera.lookAt(0, -1, 0);

    // Additional shadow settings
    this.dl.shadow.bias = -0.0001;
    this.dl.shadow.normalBias = 0.02;

    //---

    this.ambLight = new THREE.AmbientLight( 0xe4eee5, .9 );
    this.mainCont.add( this.ambLight );



    //-----------------------------------------------------------------------------------------------------------------

    // make outer tunnels

    for(var i=0; i<50; i++){

      this.tunnelModel = this.e.tunnelSolidModel.clone();

      this.mainCont.add(this.tunnelModel);
      this.tunnelModel.scale.x=this.tunnelModel.scale.y=2
      this.tunnelModel.position.z=(99.8*i)
      this.tunnelModel.renderOrder=-2;

      this.tunnelModel.traverse( ( object ) =>  {

        if ( object.isMesh ){

          var mat = new THREE.MeshBasicMaterial( {transparent: true, opacity: .4, map: this.e.tt1, side: THREE.DoubleSide} );
          object.material = mat;

          object.receiveShadow=false;
          object.castShadow=false;

          this.tunnelModel.tube = object;

        }

      });

      this.allTunnels.push(this.tunnelModel)

    }

    this.colorChanges=[];

    //level builder

    this.colorSchemes =[
      ["49487f","8864aa", "b65fce"],
      ["334e5c","74a49c", "75d4d7"],
      ["8a7ab8","f7c9f7", "ffbdf8"],
      ["0c2127","030b0d", "244e5c"],
      ["569591","d3c8a7", "ffe1a8"],

      ["201934","5441be", "6f3ffd"],
      ["dc3838","c0e2c8", "9ce7d6"],
      ["58a783","d4cf9b", "dff5d6"],
      ["5a5a58","c3a49d", "eaa9a9"],
      ["83c9bc","243b3d", "6eb2b4"],

      ["83c9bc","243b3d", "6eb2b4"],
      ["263336","f44b48", "ff8280"],
      ["263336","f44b48", "ff8280"],

      ["49487f","8864aa", "b65fce"],
      ["334e5c","74a49c", "75d4d7"],
      ["8a7ab8","f7c9f7", "ffbdf8"],

      ["212121","8e908f", "d4d4d3"]
    ];

    // set color changes to every 600 distance units

    for( var i=0; i<this.colorSchemes.length; i++){

      var scheme = this.e.u.ap(this.colorSchemes);

      var dist = 700*(i+1);
      var fog = scheme[0];
      var tube = scheme[1];
      var char = scheme[2];

      this.colorChange(dist,fog,tube,char);

    }

    this.colorChange(5000, "091125","161c3c", "091125");

    //start position

    var ex=50; // offset factor for tube texture changes

    this.setTT(700+ex, this.e.tt2);
    this.setTT(1400+ex, this.e.tt3);
    this.setTT(2100+ex, this.e.tt4);
    this.setTT(2800+ex, this.e.tt5);
    this.setTT(3500+ex, this.e.tt6);
    this.setTT(4200+ex, this.e.tt1);

    // this.makeRanLevelData();
    this.addLevelParts();

    //----------------------------------------------------------

    // make the 6 tubes

    for(var i=0; i<9; i++){

      this.makeTube((i*700)+700-20);

    }

    // make the 26 rings

    for(var i=0; i<26; i++){

      this.makeTube2((i*200)-20);

    }

    //----------------------------------------------------------

    // create the end portal

    var endPortal = this.e.endPortal.clone();
    endPortal.traverse( ( object ) =>  {

      if ( object.isMesh ){

        if(object.name==="outside"){

          this.groundParts.push( object )

        }else if(object.name==="flash"){

          this.flashMat = new THREE.MeshStandardMaterial({color: 0xffffff, wireframe: false});
          object.material=this.flashMat;

        }

      }

    });

    endPortal.position.z = 7000;
    this.levelCont.add( endPortal );

    //-----------------------------------------------------------------------------------------------------------------

    // player parts

    this.playerCont = new THREE.Group();
    this.mainCont.add(this.playerCont)

    this.playerCont.position.y=-2.5
    this.playerCont.position.z=-38

    // Add a subtle back light to give the player more volume
    this.backLight = new THREE.PointLight(0x4fd1ff, 1.5, 25, 3.0);
    this.backLight.castShadow = false;
    // Slightly above and behind the player (relative to player's forward)
    this.backLight.position.set(0, .9, -.8);
    this.playerCont.add(this.backLight);

    // Debug helper to visualize the light position
    this.backLightHelper = new THREE.PointLightHelper(this.backLight, 0.2, 0x4fd1ff);
    this.playerCont.add(this.backLightHelper);

    // Additional small debug box at the light location
    this.backLightDebug = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x4fd1ff })
    );
    this.backLightDebug.position.copy(this.backLight.position);
    // this.playerCont.add(this.backLightDebug);

    // this.playerCont.rotation.y = this.e.u.ca(180)

    this.playerGeo = new THREE.PlaneGeometry( 2.8, 2.8, 1, 1 );
    this.playerMat = new THREE.MeshStandardMaterial({color: 0x3fe0ee, transparent: true,  wireframe: false, visible: false});
    this.playerPlane = new THREE.Mesh( this.playerGeo, this.playerMat );
    this.playerPlane.position.x = 0;
    this.playerPlane.position.y = 0.4;
    this.playerPlane.position.z = 0;
    this.playerPlane.material.opacity = 0;
    this.playerPlane.rotation.y = this.e.u.ca(180)
    this.playerCont.add( this.playerPlane );

    this.glowGeo = new THREE.PlaneGeometry( 1,1, 1, 1 );
    this.glowMat = new THREE.MeshStandardMaterial({map: this.e.gradGlowWhite, side: THREE.DoubleSide, color: 0xdecd9c, transparent: true,  wireframe: false});
    this.glowPlane = new THREE.Mesh( this.glowGeo, this.glowMat );
    this.glowPlane.position.x = 0;
    this.glowPlane.position.y = 0.3;
    this.glowPlane.position.z = 0;
    // this.mainCont.add( this.glowPlane );

    this.glowPlane.material.opacity=.6

    gsap.to(  this.glowPlane.material, { opacity: .8, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut"});

    this.ghost = this.e.ghost.clone();
    // this.playerCont.add(this.ghost);
    this.ghost.scale.x=this.ghost.scale.y=this.ghost.scale.z=.1
    this.ghost.position.y=-.9;

    // Load and setup character model
    if (this.e.char) {
        // Use SkeletonUtils.clone like temp3 does
        this.character = SkeletonUtils.clone(this.e.char.scene);
        
        // Add to player container
        this.playerCont.add(this.character);
        
        // Position relative to player container
        this.character.position.set(0, -1, 0);
        this.character.rotation.set(0, 0, 0);
        this.character.scale.set(0.4, 0.4, 0.4);
        
        // Enable shadows
        this.character.castShadow = true;
        this.character.receiveShadow = true;
        
        // Setup animation mixer on the cloned character like temp3 does
        this.character.animMixer = new THREE.AnimationMixer(this.character);
        
        // Set up animations using the proper temp3 pattern
        if (this.e.char.animations && this.e.char.animations.length > 0) {
          console.log("Available animations:", this.e.char.animations.map(anim => anim.name));
          
          // Find idle animation
          this.idleClip = THREE.AnimationClip.findByName(this.e.char.animations, "idle");
          if (this.idleClip) {
            this.character.idleAction = this.character.animMixer.clipAction(this.idleClip);
            this.character.idleAction.name = "idle";
            this.character.idleAction.setLoop(THREE.LoopRepeat);
            this.character.idleAction.clampWhenFinished = false;
            console.log("Idle action created:", this.character.idleAction);
          }
          
          // Find run animation
          this.runClip = THREE.AnimationClip.findByName(this.e.char.animations, "run2");
          if (this.runClip) {
            this.character.runAction = this.character.animMixer.clipAction(this.runClip);
            this.character.runAction.name = "run2";
            this.character.runAction.setLoop(THREE.LoopRepeat);
            this.character.runAction.clampWhenFinished = false;
            console.log("Run2 action created:", this.character.runAction);
          }
          
          // Set current animation and play idle
          if (this.character.idleAction) {
            this.character.currentAnimation = this.character.idleAction;
            this.character.idleAction.play();
            console.log("Playing idle animation");
          }
        } else {
          console.warn("No animations available in this.e.char.animations");
        }
    }

    this.ghost.traverse( ( object ) =>  {

      if ( object.isMesh ){

        if(object.name==="body"){

          this.ghostMaterial = new THREE.MeshStandardMaterial({ wireframe: false, transparent:true, metalness: 0, roughness: 0.3, color: 0x55bef6});
          object.material = this.ghostMaterial

          gsap.to(  object.scale, { y: 1, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut"});
          gsap.to(  object.position, { y: .4, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut"});

          this.ghostBody = object;

        }else if(object.name==="eyes"){

          object.material = new THREE.MeshStandardMaterial({ wireframe: false, transparent:true, color: 0xbf6440});

          gsap.to(  object.position, { y: .5, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut"});

          this.ghostEyes = object;

        }else if(object.name==="crown"){

          gsap.to(  object.position, { y: .4, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut"});

          object.material = new THREE.MeshStandardMaterial({ wireframe: false, color: 0xbf6440});

          this.ghostCrown = object;

        }else if(object.name==="shad"){

          var saveMap = object.material.map
          object.material = new THREE.MeshBasicMaterial({ wireframe: false, color: 0x000000, transparent: true, opacity: .75, map: saveMap });

          // this.ghostShad = object;
          // this.ghostShad.material.opacity = .75;
          // this.ghostShad.metalness = 0;
          // this.ghostShad.roughness = 0;
          // this.ghostShad.color = 0x00000;
        }

      }

    });

    this.crownFlames=[];

    // for(var i=0; i<15; i++){

    //   this.cf = this.e.crownFlame.clone();
    //   this.playerCont.add(this.cf);
    //   this.cf.scale.x=this.cf.scale.y=this.cf.scale.z=.3
    //   this.cf.position.y=.6;
    //   this.cf.rotation.y = this.e.u.ca(this.e.u.ran(360));

    //   this.cf.traverse( ( object ) =>  {

    //     if ( object.isMesh ){

    //       if(object.name==="flame"){

    //         object.material = new THREE.MeshStandardMaterial({ wireframe: false, color: 0xbf6440});
    //         object.material.side = THREE.DoubleSide;

    //         object.position.z = 1.1;

    //         this.cf.ob = object;
    //         this.cf.ob.action="set"

    //       }

    //     }

    //   });

    //   this.crownFlames.push( this.cf );

    // }

    //----------------------------------------------------------------------------------------------------------------------------

    // model at start of game

    this.startModel = this.e.startModel.clone();

    this.mainCont.add(this.startModel);
    this.startModel.scale.x=5.75;
    this.startModel.scale.y=this.startModel.scale.z=4.5
    this.startModel.rotation.y=this.e.u.ca(180)
    this.startModel.position.y=-3.45;
    this.startModel.position.z=-41;

    this.startModel.traverse( ( object ) =>  {

      if ( object.isMesh ){

        console.log(object.name);

        if(object.name==="frame"){

          var mat = new THREE.MeshBasicMaterial( {map: object.material.map} );
          object.material = mat;
          object.castShadow=true;
          object.material.visible=false

        }else if(object.name==="Curve"){

          object.material.visible=false
          // object.castShadow=false

        }else if(object.name==="nfts"){

          var mat = new THREE.MeshBasicMaterial( {map: object.material.map} );
          object.material = mat;
          // object.castShadow=false;
          object.material.visible=false

          this.nftMat = object.material;
          mat.map.wrapS =  mat.map.wrapT = THREE.RepeatWrapping;

        }else if(object.name==="goldGate1"){

          var mat = new THREE.MeshBasicMaterial( {map: object.material.map, transparent: true} );
          object.material = mat;
          object.material.map.anisotropy = this.e.renderer.getMaxAnisotropy();
          object.material.map.magFilter = THREE.NearestFilter;
          object.castShadow=false;

        }else if(object.name==="startPlat1"){

        }else if(object.name==="platform"){

          object.receiveShadow=true;
          // object.castShadow=false;
          var materialShine = new THREE.MeshStandardMaterial( {color: 0x101642, envMap: this.e.reflectionTexture} );
          object.material=materialShine;
          object.material.metalness = .55;
          object.material.roughness = 0.6;
          object.material.envMapIntensity=1;

          this.platform = object;

        }else if(object.material.name==="blackStart"){

          var mat = new THREE.MeshStandardMaterial( {color: 0x8c77ff} );
          object.material = mat
          // object.receiveShadow=false;
          object.castShadow=false;
          object.material.metalness = 0;
          object.material.roughness = 0;

          this.blackStart = object;

        }else if(object.material.name==="red"){

          var mat = new THREE.MeshStandardMaterial( {color:  0x222e6d} );
          object.material = mat;

          object.receiveShadow=true;
          object.castShadow=false;

        }else if(object.material.name==="fire"){

          var mat = new THREE.MeshBasicMaterial( {color: 0xd1732e} );
          object.material = mat;

          // object.receiveShadow=false;
          object.castShadow=false;

        }else if(object.name==="innerFrame"){

          object.material.transparent=true;
          object.material.visible=false;
          // object.castShadow=false;

        }

        if(object.name==="growPlat"){

          this.growPlat=object;
          this.groundParts.push(this.growPlat)

        }

      }else{

        if(object.name==="startPlat"){

          this.startPlat=object;

        }

      }

    });

    //-----------------------------------------------------------------------------------------------------------------

    // make curves

    this.curvesInner = [];
    this.curvesOuter = [];

    for(var i=0; i<3; i++){

      this.curve = this.e.curveModel.clone();
      this.mainCont.add(this.curve);
      this.curve.scale.x=this.curve.scale.y=this.curve.scale.z=24
      this.curve.position.z=-27+(42*i);

      this.curve.traverse( ( object ) =>  {

        if ( object.isMesh ){

          if(object.name.substring(0,5)==="outer"){

            var mat = new THREE.MeshBasicMaterial( {color: 0x0b0f22} );
            object.material.metalness = 1;
            object.material = mat;
            object.castShadow=false;
            object.recieveShadow=false;

            this.curvesOuter.push(object);

            object.rotation.z = this.e.u.ca(360);

          }else if(object.name.substring(0,5)==="inner"){

            var mat = new THREE.MeshBasicMaterial( {color: 0x030c1b} );
            object.material.metalness = 1;
            object.material = mat;
            object.castShadow=false;
            object.recieveShadow=false;

            this.curvesInner.push(object);

            object.rotation.z = this.e.u.ca(360);

          }

          object.speed = 1 + (this.e.u.ran(260)/260)

          if(object.name.substring(5,6)==="1"){

            object.position.z=1.8

          }else if(object.name.substring(5,6)==="2"){

            object.position.z=1.2

          }else if(object.name.substring(5,6)==="3"){

            object.position.z=.6

          }

        }

      });

    }

    //-----------------------------------------------------------------------------

    // make spark containers

    this.spConts = [];

    for(var i=0; i<10; i++){

      this.spCont = new THREE.Group();
      this.spCont.position.y=-10000;
      this.spCont.scale.x=this.spCont.scale.y=this.spCont.scale.z=.75
      this.levelCont.add(this.spCont);

      this.spCont.sparks = [];

      for(var j=0; j<10; j++){

        this.tbGeo = new THREE.SphereGeometry( 10, 4, 2 );
        this.tbMat = new THREE.MeshBasicMaterial({color: 0xf7ff7c, wireframe: false});
        this.sp = new THREE.Mesh( this.tbGeo, this.tbMat );
        this.spCont.add(this.sp);

        this.spCont.sparks.push(this.sp);

        this.spCont.action="ready";

        this.allSparks.push(this.sp);

      }

      this.spConts.push(this.spCont);

    }

    //-----------------------------------------------------------------------------

    // artistic debug tools

    document.getElementById("reloadTube").addEventListener("click", event => {

      this.e.loader.reloadTube();

    });

    document.getElementById("startMixer").addEventListener("click", event => {

      this.action="mixer"

    });

    // start game listeners

    // Handle play button click
    const playButton = document.getElementById("playButton");
    if(playButton) {
      playButton.addEventListener("click", event => {
        // Play fanfare sound effect
        this.e.s.p('fanfare');
        
        // Create portal effect
        const splashBackgroundDiv = document.getElementById("splashBackground");
        const splashImg = splashBackgroundDiv ? splashBackgroundDiv.querySelector("img") : null;
        
        if(splashBackgroundDiv && splashImg) {
          // Create white transition div
          const whiteTransition = document.createElement("div");
          whiteTransition.id = "whiteTransition";
          whiteTransition.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 2000;
            opacity: 0;
            pointer-events: none;
          `;
          document.body.appendChild(whiteTransition);
          
          // Portal zoom effect - scale up the splash image
          gsap.to(splashImg, {
            scale: 3,
            duration: 0.4,
            ease: "power3.in",
            transformOrigin: "center center"
          });
          
          // White div fades in during zoom
          gsap.to(whiteTransition, {
            opacity: 1,
            duration: 0.4,
            ease: "power3.in"
          });
          
          // After zoom completes, hide splash and fade out white div
          setTimeout(() => {
            splashBackgroundDiv.style.display = "none";
            gsap.to(whiteTransition, {
              opacity: 0,
              duration: 2,
              ease: "power2.out",
              onComplete: () => {
                document.body.removeChild(whiteTransition);
              }
            });
          }, 400);
        }
        
        // Fade out start menu immediately
        const startMenu = document.getElementById("startMenu");
        if(startMenu) {
          startMenu.style.transition = "opacity 0.3s ease-out";
          startMenu.style.opacity = "0";
          
          // Disable pointer events after fade
          setTimeout(() => {
            startMenu.style.pointerEvents = "none";
          }, 300);
        }
        
        // Set action to start the game after portal effect completes (0.4s zoom + 2s white fade)
        setTimeout(() => {
          this.action = "instructions pressed";
        }, 2400);
      });
    }

    // Handle instructions button click
    const instructionsButton = document.getElementById("instructionsButton");
    if(instructionsButton) {
      instructionsButton.addEventListener("click", event => {
        const instructionsOverlay = document.getElementById("instructionsOverlay");
        if(instructionsOverlay) {
          instructionsOverlay.style.display = "flex";
        }
      });
    }

    // Handle close instructions button click
    const closeInstructionsButton = document.getElementById("closeInstructionsButton");
    if(closeInstructionsButton) {
      closeInstructionsButton.addEventListener("click", event => {
        const instructionsOverlay = document.getElementById("instructionsOverlay");
        if(instructionsOverlay) {
          instructionsOverlay.style.display = "none";
        }
      });
    }

    document.addEventListener("touchstart", event => {

      if(this.action==="instructions"){
        // this.action="instructions pressed"
      }

    });

    //---------------------------------------------block----------------------------

    // sound effect for when off track

    this.buzzLoop = new Howl({src: ['./src/sounds/buzzLoop.mp3'], volume:0, loop:true});
    this.buzzLoop.play();

  }

  addLevelParts(){

    //----------------------------------------------------------------------------------------------------------------------------

    // instantiate floor bits

    for(var i=0; i<this.e.serverData.allBitArray.length; i++){

      // get data from bit array
      var z = this.e.serverData.allBitArray[i][0];
      var scale = this.e.serverData.allBitArray[i][1];
      var rot = this.e.serverData.allBitArray[i][2];

      // instantiate copy of floor bit
      var bit = this.e.floorBit.clone();
      bit.traverse( ( object ) =>  {

        if ( object.isMesh ){
          this.bitMat = new THREE.MeshStandardMaterial({color: 0x57a6a8, wireframe: false});
          object.material=this.bitMat;
          object.receiveShadow=true;
          object.castShadow=false;

          this.groundParts.push( object )
        }

      });

      bit.position.z = z; // set floor to distance amount position
      bit.scale.z = scale; // set the size of the bit
      bit.rotation.z = rot; // rotate bit
      this.levelCont.add( bit ); // add to container

    }

    //----------------------------------------------------------------------------------------------------------------------------

    // instantiate coins

    for(var i=0; i<this.e.serverData.allCoinPositions.length; i++){

      var z = this.e.serverData.allCoinPositions[i][0];
      var rot = this.e.serverData.allCoinPositions[i][1];
      var type = this.e.serverData.allCoinPositions[i][2];
      var lev = this.e.serverData.allCoinPositions[i][3];

      this.makeEthe(z, rot, type, lev); // make the coin

    }

    //----------------------------------------------------------------------------------------------------------------------------

  }

  makeEthe(z, rot, type, level){

    this.etheTotal+=1

    if(rot>=10){
      rot-=10;
    }

    // create container

    this.etheCont = new THREE.Group();
    this.levelCont.add(this.etheCont)

    // create material

    this.tbMat = new THREE.MeshBasicMaterial({color: 0xf7ff7c, wireframe: false});

    // create ethe

    var etheType = this.e.u.ran(4);

    if(etheType===0){
      this.etheShape = this.e.b_ring.clone();
    }else if(etheType===1){
      this.etheShape = this.e.b_coin.clone();
    }else if(etheType===2){
      this.etheShape = this.e.b_diamond.clone();
    }else if(etheType===3){
      this.etheShape = this.e.b_star.clone();
    }

    this.etheShape.traverse( ( object ) =>  {

      if ( object.isMesh ){

        this.ethe = object;
        this.ethe.material = this.tbMat;
        this.etheCont.add(this.ethe);
        this.ethe.position.y=-2.9;

      }
    });

    this.ethe.num = rot;
    this.ethe.level = level;

    //----------------------------------

    // make glow

    this.glowGeo = new THREE.PlaneGeometry( 1, 1, 1, 1 );
    this.glowMat = new THREE.MeshStandardMaterial({map: this.e.gradGlowWhite2, side: THREE.DoubleSide, color: 0xdecd9c, transparent: true,  wireframe: false});
    this.glowPlane2 = new THREE.Mesh( this.glowGeo, this.glowMat );

    // this.etheCont.add( this.glowPlane2 );
    this.glowPlane2.position.y = -2.9;

    this.glowPlane2.material.opacity=.6

    this.ethe.glow = this.glowPlane2;

    // size ethe

    if(type==="l"){
      this.ethe.scale.x = this.ethe.scale.y = this.ethe.scale.z = .4
      this.glowPlane2.scale.x = this.glowPlane2.scale.y = this.glowPlane2.scale.z = 3;
      this.largeEtheTotal+=1;
    }else if(type==="m"){
      this.ethe.scale.x = this.ethe.scale.y = this.ethe.scale.z = .2
      this.glowPlane2.scale.x = this.glowPlane2.scale.y = this.glowPlane2.scale.z = 2;
      this.mediumEtheTotal+=1;
    }else if(type==="s"){
      this.ethe.scale.x = this.ethe.scale.y = this.ethe.scale.z = .1
      this.glowPlane2.scale.x = this.glowPlane2.scale.y = this.glowPlane2.scale.z = 1;
      this.smallEtheTotal+=1;
    }

    this.ethe.type = type;

    // position z

    this.etheCont.position.z = z + this.levelCont.position.z;
    this.etheCont.rotation.z = this.e.u.ca(rot*-36);

    //----------------------------------

    this.etheCont.ethe = this.ethe;
    this.etheCont.glow = this.glowPlane2;

    this.allEthe.push(this.ethe)
    this.allEtheConts.push(this.etheCont)

  }

  etheCollide(){

    this.playerRot=Math.round(this.e.u.ca2(this.levelCont.rotation.z)/36);

    for(var i=0; i<10; i++){

      if(this.playerRot>=10){
        this.playerRot-=10;
      }else if(this.playerRot<0){
        this.playerRot+=10;
      }

    }

    for(var i=0; i<this.toothArray.length; i++){

      var t = this.toothArray[i];

      var e_res = new THREE.Vector3();
      t.getWorldPosition( e_res )

      var p_res = new THREE.Vector3();
      this.playerPlane.getWorldPosition( p_res )

      if( Math.abs(e_res.z-p_res.z)<3 && t.gotYet!==true){

        // console.log(this.playerRot+" / "+t.num)

        if(this.playerRot===t.num){

          t.gotYet=true;

          this.e.s.p("bwah")
          // this.score-=1000;
          this.spikePenaltyScore+=500;
          this.spikeHits+=1;

          this.e.ui.makeScore("-500", "r");

          this.e.ui.faderRed.alpha=.4;
          gsap.to(  this.e.ui.faderRed, {alpha: 0, duration: 1, ease: "linear"});

          this.gameSpeed=5;

        }

      }

    }

    for(var i=0; i<this.allEthe.length; i++){

      var eth = this.allEthe[i];

      var e_res = new THREE.Vector3();
      eth.getWorldPosition( e_res )

      var p_res = new THREE.Vector3();
      this.playerPlane.getWorldPosition( p_res )

      if( Math.abs(e_res.z-p_res.z)<3 && this.allEthe[i].gotYet!==true){

        if(this.playerRot===eth.num){

          this.coinCheck(this.progress, this.playerRot);

          for(var j=0; j<this.spConts.length; j++){

            if(this.spConts[j].action==="ready"){

              this.spConts[j].action="set"

              eth.add(this.spConts[j]);

              this.spConts[j].position.x = 0;
              this.spConts[j].position.y = 0;
              this.spConts[j].position.z = 0;

              j=20;

            }

          }

          eth.material.visible=false;
          eth.glow.material.visible=false;

          this.allEthe[i].gotYet=true;

          if(eth.type==="l"){

            this.e.s.p("ethe2")
            this.pointScore+=250;
            this.largeEthe+=1;
            this.e.ui.loadBack.alpha=.15;
            this.e.ui.makeScore("+250", "y");
            // console.log("get large "+this.largeEthe+" / "+this.progress)
            this.addLevelScore(eth.level,250);

          }else if(eth.type==="m"){

            this.e.s.p("ethe")
            this.pointScore+=100;
            this.mediumEthe+=1;
            this.e.ui.loadBack.alpha=.10;
            this.e.ui.makeScore("+100", "y");
            // console.log("get med "+this.mediumEthe+" / "+this.progress)
            this.addLevelScore(eth.level,100);

          }else if(eth.type==="s"){

            this.e.s.p("ethe3")
            this.pointScore+=50;
            this.smallEthe+=1;
            this.e.ui.loadBack.alpha=.05;
            this.e.ui.makeScore("+50", "y");
            // console.log("get sm "+this.smallEthe+" / "+this.progress)
            this.addLevelScore(eth.level,50);

          }

          this.scoreLog.push( new Array(eth.level, eth.type, e_res.z, eth.num, this.pointScore) );

          gsap.to(  this.e.ui.loadBack, {alpha: 0, duration: .3, ease: "linear"});

        }

      }

    }

  }

  coinCheck(dist, rot){

    this.coinsFound.push( new Array(dist, rot) );
    this.coinsFoundThisLevel.push( new Array(dist, rot) );

  }

  addLevelScore(lev,num){

    console.log(lev+" / "+num+" / "+this.pointScore)

    if(lev<=1){

      this.levelScore1+=num;

    }else if(lev===2){

      this.levelScore2+=num;

    }else if(lev===3){

      this.levelScore3+=num;

    }else if(lev===4){

      this.levelScore4+=num;

    }else if(lev===5){

      this.levelScore5+=num;

    }else if(lev===6){

      this.levelScore6+=num;

    }else if(lev===7){

      this.levelScore7+=num;

    }else if(lev===8){

      this.levelScore8+=num;

    }else if(lev===9){

      this.levelScore9+=num;

    }else if(lev===10){

      this.levelScore10+=num;

    }

    this.totalEarnedScore+=num;

  }

  spControl(){

    this.sparkSpeed=50;

    for(var i=0; i<this.spConts.length; i++){

      var sp = this.spConts[i];

      if(sp.action==="ready"){

        //

      }else if(sp.action==="set"){

        for(var j=0; j<this.spConts[i].sparks.length; j++){

          var spark = this.spConts[i].sparks[j];
          spark.position.x=spark.position.y=spark.position.z=0;
          spark.scale.x=spark.scale.y=spark.scale.z=(this.e.u.ran(3)+2)/40;

          gsap.to(spark.scale, { x:0, y:0, z:0, duration: .75})

          spark.xspeed = this.e.u.nran(10)/3
          spark.yspeed = this.e.u.nran(10)/3
          spark.zspeed = this.e.u.nran(10)/3

        }

        this.useFlyers = true;

        sp.count = 0;
        sp.action="go"

      }else if(sp.action==="go"){

        for(var j=0; j<this.spConts[i].sparks.length; j++){

          var spark = this.spConts[i].sparks[j];
          spark.position.x+=spark.xspeed*this.e.dt*this.sparkSpeed;
          spark.position.y+=spark.yspeed*this.e.dt*this.sparkSpeed;
          spark.position.z+=spark.zspeed*this.e.dt*this.sparkSpeed;

          spark.yspeed+=this.e.dt*50;

        }

        sp.count+=this.e.dt;

        if(sp.count>1){

          sp.count=0;

          sp.action="reset"

        }

      }else if(sp.action==="reset"){

        sp.position.y=-10000;
        for(var j=0; j<this.spConts[i].sparks.length; j++){

          var spark = this.spConts[i].sparks[j];
          spark.position.x=0;
          spark.position.y=0;
          spark.position.z=0;

        }

        this.levelCont.add(spark);

        sp.action="ready"

      }

    }

  }

  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------

  // COLOR CHANGES

  colorChange(dist,fog,tube,char){

    this.colorChanges.push( new Array(dist,fog,tube,char) );

  }

  checkForColorChange(){

    // CHECK FOR CHANGE BY DISTANCE

    if(this.colorChanges.length>0){

      if(this.playerCont.position.z>this.colorChanges[0][0]){

        gsap.to(this.e.bgColor, { duration: 2.0, backgroundColor: '#'+this.colorChanges[0][1]})
        gsap.to(this.e.obColor, { duration: 2.0, backgroundColor: '#'+this.colorChanges[0][2]})
        gsap.to(this.e.chColor, { duration: 2.0, backgroundColor: '#'+this.colorChanges[0][3]})

        this.curColor1=this.colorChanges[0][1];
        this.curColor2=this.colorChanges[0][2];
        this.curColor3=this.colorChanges[0][3];

        this.saveCharacterCol = this.colorChanges[0][3];

        this.colorChanges.shift();

      }

    }

    // APPLY THE COLORS

    this.e.scene.background = new THREE.Color( this.e.bgColor.style.backgroundColor );
    this.e.scene.fog = new THREE.Fog(this.e.bgColor.style.backgroundColor, 50, 271);

    // this.tube.material.color.setHex( this.rgbToHex(this.e.bgColor.style.backgroundColor) );

    if(this.onGround===true){
      this.playerPlane.material.color.setHex( this.rgbToHex(document.getElementById("chColor").style.backgroundColor) );
      // this.ghostBody.material.color.setHex( this.rgbToHex(document.getElementById("chColor").style.backgroundColor) );
      this.ghostBody.material.color.setHex( 0xf2e6c3 );
      // this.ghostEyes.material.color.setHex( this.rgbToHex(document.getElementById("chColor").style.backgroundColor) );
    }else{
      this.playerPlane.material.color.setHex( 0xff0000 );
      this.ghostBody.material.color.setHex( 0xff0000 );
    }


    for(var i=0; i<this.groundParts.length; i++){

        if(this.groundParts[i].material!==undefined){

            this.groundParts[i].material.color.setHex( this.rgbToHex(document.getElementById("obColor").style.backgroundColor) );

        }

    }


    for(var i=0; i<this.e.effects.bfArray.length; i++){

      if(this.e.effects.bfArray[i].box.material!==undefined){

        this.e.effects.bfArray[i].box.material.color.setHex( this.rgbToHex(document.getElementById("obColor").style.backgroundColor) );

      }

    }


  }

  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------

  // TUBE TEXTURE CHANGES

  setTT(loc, tt){

    this.ttPlaces.push( new Array(loc, tt) );

  }

  checkForTTChange(){

    if(this.ttPlaces.length>0){

      if(this.playerCont.position.z>this.ttPlaces[0][0]){

        // console.log(this.ttPlaces[0][1])

        for(var i=0; i<this.allTunnels.length; i++){
          this.allTunnels[i].tube.material.map = this.ttPlaces[0][1];
        }

        this.ttPlaces.shift();

      }

    }

  }

  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------

  // SPEED CHANGES

  setLockChange(loc, speed, rot){

    this.lockChanges.push( new Array(loc, speed, rot) )

  }

  checkForLockChange(){

    if(this.lockChanges.length>0){

      if(this.playerCont.position.z>this.lockChanges[0][0]){

        this.lock=this.lockChanges[0][1]

        if(this.lock===true){
          gsap.to(  this.levelCont.rotation, {z: this.e.u.ca(this.lockChanges[0][2]*36), duration: .2, ease: "sine.out"});
        }

        this.lockChanges.shift();

      }

    }

  }

  setSpeedChange(loc, speed){

    this.speedChanges.push( new Array(loc, speed) )

  }

  checkForSpeedChange(){

    if(this.speedChanges.length>0){

      if(this.playerCont.position.z>this.speedChanges[0][0]){

        this.curGameSpeed=this.speedChanges[0][1]
        this.speedChanges.shift();

      }

    }

  }

  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------

  // CONVERSION

  rgbToHex(rgb) {

    var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
    var result, r, g, b, hex = "";
    if ( (result = rgbRegex.exec(rgb)) ) {
        r = this.componentFromStr(result[1], result[2]);
        g = this.componentFromStr(result[3], result[4]);
        b = this.componentFromStr(result[5], result[6]);

        hex = "0x" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return hex;

  }

  componentFromStr(numStr, percent) {
    var num = Math.max(0, parseInt(numStr, 10));
    return percent ?
        Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
  }

  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------

  makeTube(loc){

    this.tubeModel = this.e.tubeModel.clone();

    this.tubeModel.traverse( ( object ) =>  {

      if ( object.isMesh ){
        this.tubeModelMat = new THREE.MeshStandardMaterial({color: 0x57a6a8, wireframe: false});
        object.material=this.tubeModelMat;

        object.castShadow=false;
        object.receiveShadow=true;

        this.groundParts.push( object )
      }

    });

    this.tubeModel.position.z = loc;
    this.tubeModel.scale.z = 2;
    this.levelCont.add( this.tubeModel );

    this.groundParts.push( this.tubeModel )

    //-------------------------------------------------------------

    this.spikeSets+=1;

    this.toothPlace = [10,1,2,3,4,5,6,7,8,9];

    this.totalToothPlaces+=1;

    if(this.spikeSets===0){
      this.numberOfTeeth=4;
    }else if(this.spikeSets===1){
      this.numberOfTeeth=5;
    }else if(this.spikeSets===2){
      this.numberOfTeeth=5;
    }else if(this.spikeSets===3){
      this.numberOfTeeth=6;
    }else if(this.spikeSets===4){
      this.numberOfTeeth=6;
    }else if(this.spikeSets===5){
      this.numberOfTeeth=6;
    }else if(this.spikeSets===6){
      this.numberOfTeeth=7;
    }else if(this.spikeSets===7){
      this.numberOfTeeth=7;
    }else if(this.spikeSets===8){
      this.numberOfTeeth=7;
    }else{
      this.numberOfTeeth=7;
    }

    for(var i=0; i<this.numberOfTeeth; i++){

      var rot = this.e.u.apr(this.toothPlace);

      this.toothModel = this.e.tooth.clone();
      this.toothModel.position.z = loc+(i*8)+15;
      this.toothModel.rotation.z = this.e.u.ca(rot*36);
      this.toothModel.num = 10-rot;
      this.levelCont.add( this.toothModel );

      this.toothModel.traverse( ( object ) =>  {

        if ( object.isMesh ){
          this.toothModelMat = new THREE.MeshStandardMaterial({color: 0xf44b48, wireframe: false});
          object.material=this.toothModelMat;
          this.toothModel.ob = object;

          this.orColor = new THREE.Color(0xffffff);
          gsap.to(  object.material.color, { r: this.orColor.r, g: this.orColor.g, b: this.orColor.b, duration: .7, repeat: -1, yoyo: true, ease: "linear"});
          gsap.to(  object.position, { y: -1,  duration: .7, repeat: -1, yoyo: true, ease: "linear"});
        }

      });

      this.toothArray.push(this.toothModel);

    }

  }

  makeTube2(loc){

    this.tubeModel = this.e.tubeModel.clone();

      this.tubeModel.traverse( ( object ) =>  {

        if ( object.isMesh ){
          this.tubeModelMat = new THREE.MeshStandardMaterial({color: 0x57a6a8, wireframe: false});
          object.material=this.tubeModelMat;
          object.castShadow=false;

          this.groundParts.push( object )
        }

      });

      this.tubeModel.position.z = loc;
      this.levelCont.add( this.tubeModel );

      this.tubeModel.scale.z = .01;

      this.groundParts.push( this.tubeModel )

  }

  makeTube3(loc, rotPos){

    this.tubeModel = this.e.tube3Model.clone();

      this.tubeModel.traverse( ( object ) =>  {

        if ( object.isMesh ){
          this.tubeModelMat = new THREE.MeshStandardMaterial({color: 0xff0000, wireframe: false});
          object.material=this.tubeModelMat;

          this.groundParts.push( object )
        }

      });

      this.tubeModel.rotation.z = this.e.u.ca(36*rotPos);
      this.tubeModel.position.z = loc+this.sp;
      this.levelCont.add( this.tubeModel );

      this.groundParts.push( this.tubeModel )

  }

  makeTubeSky(loc, rotPos){

    this.tubeModel = this.e.tubeSkyModel.clone();

      this.tubeModel.traverse( ( object ) =>  {

        if ( object.isMesh ){
          this.tubeModelMat = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: false});
          object.material=this.tubeModelMat;

          this.groundParts.push( object )
        }

      });

      this.tubeModel.rotation.z = this.e.u.ca(36*rotPos);
      this.tubeModel.position.z = loc+this.sp;
      this.levelCont.add( this.tubeModel );

      this.groundParts.push( this.tubeModel )

  }

  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------

  callLevel(){

    this.lsTime=.75;
    this.lsDelay=1;

    this.currentLevel+=1;
    if(this.currentLevel<=9){
      this.levelText.innerHTML = ""+(this.currentLevel+1)+" / 10"
      this.levelText.style.opacity = "0";
      this.levelText.style.position = "absolute";
      this.levelText.style.top = "22%";

      gsap.to(this.levelText, { 
        top: "30%", 
        opacity: 1,  
        duration: .15, 
        ease: "sine.out"
      });

      gsap.to(this.levelText, { 
        opacity: 0,  
        duration: this.lsTime, 
        delay: this.lsDelay, 
        ease: "linear"
      });
    }
    
    this.e.s.p("woosh1");

    this.breadCrumb();
    
    this.levelTime=0


  }

  breadCrumb(){

    console.log("-------------------------------");
    console.log("bread crumb: "+this.currentLevel);

    let score = 0;
    switch (this.currentLevel) {
      case 1:
        score = this.levelScore1;
        break;
      case 2:
        score = this.levelScore2;
        break;
      case 3:
        score = this.levelScore3;
        break;
      case 4:
        score = this.levelScore4;
        break;
      case 5:
        score = this.levelScore5;
        break;
      case 6:
        score = this.levelScore6;
        break;
      case 7:
        score = this.levelScore7;
        break;
      case 8:
        score = this.levelScore8;
        break;
      case 9:
        score = this.levelScore9;
        break;
      case 10:
        score = this.levelScore10;
        break;
    }

    console.log("bc score: "+score);
    console.log("level time: "+this.levelTime);

    const payload = {
      level: this.currentLevel,
      coinsFoundThisLevel: this.coinsFoundThisLevel,
      scoreThisLevel: score,
      levelTime: this.levelTime
    }
    var ciphertext = AES.encrypt(JSON.stringify(payload), 
      typeof String.prototype._0xd7a82c === 'function' 
        ? 'DrErDE?F:nEsF:AA=A:EEDB:>C?nAABA@r>E'._0xd7a82c(13)
        : 'DrErDE?F:nEsF:AA=A:EEDB:>C?nAABA@r>E'
    ).toString();
    // var ciphertext = AES.encrypt(JSON.stringify(payload), 'DrErDE?F:nEsF:AA=A:EEDB:>C?nAABA@r>E'._0x6cc90a(13)).toString();
    // var message = this._0x8db29a('OrnqPzo'._0x6cc90a(13), ciphertext);
    var message = JSON.stringify({ 
      type: typeof String.prototype._0xd7a82c === 'function' 
        ? 'Sv{ny`p|r'._0xd7a82c(13)
        : 'Sv{ny`p|r', 
      data: ciphertext 
    });
    window.parent.postMessage(message, "*");
    this.coinsFoundThisLevel = [];
    
  }

  update(){

    this.score = this.pointScore - this.penaltyScore - this.spikePenaltyScore;

    // Score is now displayed in the centered scoreTimeContainer
   
    // this.playerCont.rotation.y+=this.e.dt;

    //-------------------------------------------------------------------------

    this.progress = this.playerCont.position.z;

    // Update directional light target to follow player
    if (this.dl && this.dl.target) {
      this.dl.target.position.set(this.playerCont.position.x,this.dl.target.position.y,this.playerCont.position.z);
      this.dl.target.updateMatrixWorld();
      
      // Update light position to follow player (like temp4)
      this.dl.position.x = this.playerCont.position.x;
      this.dl.position.z = this.playerCont.position.z + 70 + this.shadowOffset;
      this.dl.updateMatrixWorld();
    }

    //---------------------------------------------

    // at end of each level

    this.lsOffset=75;
    this.levelLength=700;

    if(this.progress>(this.levelLength*1)+this.lsOffset && this.currentLevel===0){

      this.callLevel();

    }else if(this.progress>(this.levelLength*2)+this.lsOffset && this.currentLevel===1){

      this.callLevel();

    }else if(this.progress>(this.levelLength*3)+this.lsOffset && this.currentLevel===2){

      this.callLevel();

    }else if(this.progress>(this.levelLength*4)+this.lsOffset && this.currentLevel===3){

      this.callLevel();

    }else if(this.progress>(this.levelLength*5)+this.lsOffset && this.currentLevel===4){

      this.callLevel();

    }else if(this.progress>(this.levelLength*6)+this.lsOffset && this.currentLevel===5){

      this.callLevel();

    }else if(this.progress>(this.levelLength*7)+this.lsOffset && this.currentLevel===6){

      this.callLevel();

    }else if(this.progress>(this.levelLength*8)+this.lsOffset && this.currentLevel===7){

      this.callLevel();

    }else if(this.progress>(this.levelLength*9)+this.lsOffset && this.currentLevel===8){

      this.callLevel();

    }else if(this.progress>(this.levelLength*10) && this.currentLevel===9){

      this.callLevel();

    }

    //---------------------------------------------

    // change ethe colors

    if(this.etheColorCount===undefined){

      // this.etheColors = ["ffff00", "ff4444", "44ffff", "44ff44", "ff44ff"];
      this.etheColors = ["ffffff"];
      this.etheColorCue = 0;
      this.etheColorCount = 0;
      this.e.etColor = document.getElementById("etColor");

      gsap.to(this.e.etColor, { duration: 0, backgroundColor: '#'+this.etheColors[this.etheColorCue]})

    }

    this.etheColorCount+=this.e.dt;

    if(this.etheColorCount>2){

      this.etheColorCount=0;

      gsap.to(this.e.etColor, { duration: 2, backgroundColor: '#'+this.etheColors[this.etheColorCue]})

      this.etheColorCue+=1;
      if(this.etheColorCue>=this.etheColors.length){
        this.etheColorCue=0;
      }


    }

    for(var i=0; i<this.allEtheConts.length; i++){

      var ec = this.allEtheConts[i];

      ec.ethe.material.color.setHex( this.rgbToHex(this.e.etColor.style.backgroundColor) );
      ec.glow.material.color.setHex( this.rgbToHex(this.e.etColor.style.backgroundColor) );

    }

    for(var i=0; i<this.allSparks.length; i++){

      var ec = this.allSparks[i];

      ec.material.color.setHex( this.rgbToHex(this.e.etColor.style.backgroundColor) );

    }

    //----------------------------------------

    this.spControl()

    for(var i=0; i<this.crownFlames.length; i++){

      var c = this.crownFlames[i].ob;

      if(c.action==="set"){

        c.count = 0;
        c.delay = this.e.u.ran(10)/20;
        c.action="delay"

      }else if(c.action==="delay"){

        c.count+=this.e.dt;
        if(c.count>c.delay){
          c.count=0;
          c.position.y=.1;
          c.alpha=1;
          c.scale.x=c.scale.y=c.scale.z=.3
          this.crownFlames[i].position.z=0;
          c.rotation.y = this.e.u.ca(this.e.u.ran(360));
          c.action="move"
        }

      }else if(c.action==="move"){

        gsap.to(  c, {alpha: 0, duration: .5, ease: "sine.out"});
        gsap.to(  c.scale, {x: 0, y: 0, z: 0, duration: .5, ease: "sine.out"});
        gsap.to(  c.position, {y: 1+this.e.u.ran(7)/10, duration: .5, ease: "sine.out"});

        c.action="wait"

      }else if(c.action==="wait"){

        if(this.movePlayer===true){
          this.crownFlames[i].position.z-=this.e.dt*25;
        }

        c.count+=this.e.dt;
        if(c.count>.5){
          c.count=0;
          c.delay = this.e.u.ran(10)/30;
          c.action="delay"
        }

      }


    }

    if(this.ghostBody!==undefined){
      this.ghostEyes.material.opacity = (this.e.u.ran(50)+50)/100;
      this.ghostBody.material.opacity = (this.e.u.ran(10)+90)/100;

      this.glowPlane.position.x = this.playerCont.position.x;
      this.glowPlane.position.y = this.playerCont.position.y+.275+(this.ghostBody.position.y*.5);
      this.glowPlane.position.z = this.playerCont.position.z;

      // this.ghostBody.material.opacity = document.getElementById("test1").value/100;
      // this.ghostBody.material.metalness = document.getElementById("test2").value/100;
      // this.ghostBody.material.roughness = document.getElementById("test3").value/100;

      this.ghostCrown.rotation.y += this.e.dt*.6;
      this.ghostBody.rotation.y -= this.e.dt*.6;

    }


    // document.getElementById("scoretext").innerHTML = Math.round(this.score)+" PTS"

    if(this.isTweening===false){

      if(this.levelCont.rotation.z<0){

        this.levelCont.rotation.z+=this.e.u.ca(360)

      }else if(this.levelCont.rotation.z>this.e.u.ca(360)){

        this.levelCont.rotation.z-=this.e.u.ca(360)

      }

    }

    //-------------------------------------------------------------------------

    if(this.action==="start"){

      // wait for press

      this.action="to instructions"

    }else if(this.action==="to instructions"){

      gsap.to(  this.e.ui.enter, {alpha: 1, duration: .5, delay: .5, ease: "linear"});

      gsap.to(  this.startPlat.position, {y: 0, duration: 2, delay: 0, ease: "expo.out"});
      gsap.to(  this.growPlat.position, {y: 0, duration: 2, delay: 0, ease: "expo.out"});
      gsap.to(  this.growPlat.scale, {z: 400, duration: 5, delay: 2, ease: "expo.out"});

      this.action="instructions wait"

    }else if(this.action==="instructions wait"){

      this.count+=this.e.dt;
      if(this.count>.5){

        this.count=0;
        this.action="instructions"

      }

    }else if(this.action==="instructions"){

      // Title sprite removed
      this.e.ui.playButton.alpha = (this.e.u.ran(40)+60)/100;

      if(this.e.mobile===true){
        this.e.ui.instructionsMobile.alpha = (this.e.u.ran(40)+60)/100;
        this.e.ui.instructions.alpha = 0;
      }else{
        this.e.ui.instructionsMobile.alpha = 0;
        this.e.ui.instructions.alpha = (this.e.u.ran(40)+60)/100;
      }

      this.playerPlane.material.opacity = (this.e.u.ran(50)+40)/100;
      this.playerPlane.material.opacity=0

    }else if(this.action==="mixer"){

      this.e.camContX.position.z = 470;
      this.tunnelModel.position.z = this.e.camContX.position.z-200;
      this.e.ui.frameWords_1.alpha=0
      this.e.ui.frameWords_2.alpha=0

    }else if(this.action==="instructions pressed"){

      gsap.to(  this.e.ui.title, {alpha: 0, duration: .5, ease: "linear"});
      gsap.to(  this.e.ui.playButton, {alpha: 0, duration: .5, ease: "linear"});

      this.playerPlane.material.opacity=0;

      this.e.ui.instructions.buttonMode=false;
      this.e.ui.instructions.interactive=false;

      gsap.to(  this.e.ui.instructions, {alpha: 0, duration: .5, ease: "linear"});
      gsap.to(  this.e.ui.instructionsMobile, {alpha: 0, duration: .5, ease: "linear"});
      gsap.to(  this.e.ui.frameWords_1, {alpha: 0, duration: .5, ease: "linear"});
      gsap.to(  this.e.ui.frameWords_2, {alpha: 0, duration: .5, ease: "linear"});

      gsap.to(  this.playerCont.rotation, {y: 0, duration: 1.5, ease: "expo.inOut"});

      gsap.to(  this.e.ui.enter, {alpha: 0, duration: .5, ease: "linear"});

      gsap.to(  this.e.ui.wallet, {alpha: 1, duration: .5, ease: "linear"});
      gsap.to(  this.e.ui.walletWriting, {alpha: 1, duration: .5, ease: "linear"});

      this.musicLoop = new Howl({src: ['./src/sounds/loopAmbient.mp3'], volume:0, loop:true});
      // this.musicLoop.volume = 0;
      this.musicLoop.play();
      this.musicLoopVolume = 0;

      // this.e.s.p("fanfare")

      this.action="go wait"

    }else if(this.action==="go wait"){

      this.count+=this.e.dt;
      if(this.count>1.5){

        this.count=0;
        this.action="go"
        this.gameTimeGo=true;

        this.movePlayer=true;

        this.e.effects.bfLim=.1;

        this.shrink=.8;

        gsap.to(  this.playerPlane.scale, {x: this.playerPlane.scale.x*this.shrink, y:this.playerPlane.scale.y*this.shrink, duration: .5, ease: "linear"});
        gsap.to(  this.playerPlane.position, {y:this.playerPlane.position.y-.3, duration: .5, ease: "linear"});

      }

    }else if(this.action==="go"){

      if(this.e.mobile===true){
        this.e.ui.leftBut.interactive = true
        this.e.ui.rightBut.interactive = true
      }

      // Switch to run animation when game starts
      if (this.character && this.character.animMixer && this.character.runAction) {
        console.log("Switching to run animation using properFade");
        
        // Set the run animation speed
        this.character.runAction.setEffectiveTimeScale(1.5);
        
        // Use properFade to switch from idle to run
        this.properFade(
          this.character,           // player
          this.character.runAction, // next animation
          0.5,                      // fade time
          1,                        // time scale
          false,                    // back to idle
          0,                        // jump to time
          0.6                       // fade back
        );
      } else {
        console.warn("Cannot switch to run animation:", {
          character: !!this.character,
          animMixer: !!(this.character && this.character.animMixer),
          runAction: !!(this.character && this.character.runAction)
        });
      }

      this.totalTime+=this.e.dt;

      if(this.progress>0){
        this.levelTime+=this.e.dt;
      }

      // console.log(this.totalTime);


      this.etheCollide()

      if(this.e.soundOn===false){
        this.musicLoopVolume=0
      }else{

        if(this.musicLoopVolume <= 1){
          this.musicLoopVolume += this.e.dt*.4;
        }
  
      }

      this.musicLoop.volume(this.musicLoopVolume);

      if(this.progress<700){

        this.level=1;

      }else if(this.progress<1400){

        this.level=2;

      }else if(this.progress<2100){

        this.level=3;

      }else if(this.progress<2800){

        this.level=4;

      }else if(this.progress<3500){

        this.level=5;

      }else if(this.progress<4200){

        this.level=6;

      }else if(this.progress<4900){

        this.level=7;

      }

      if(this.progress>7000){

        this.musicLoop.volume(0);
        this.buzzLoop.volume(0);

        this.e.s.p("transitionLogo")

        this.movePlayer=false;
        this.action="end1"

      }

      if(this.progress<180){
        this.gameSpeed = this.e.u.lerp(this.gameSpeed, this.curGameSpeed, .5*this.e.dt);
      }else{
        this.gameSpeed = this.e.u.lerp(this.gameSpeed, this.curGameSpeed, 3*this.e.dt);
      }

      if(this.subBack<4){
        // this.subBack+=this.e.dt*6;
      }

      if(this.movePlayer===true){
        this.playerCont.position.z+=this.e.dt*this.gameSpeed
        this.e.camContX.position.z=this.playerCont.position.z+38+this.subBack;
      }

      this.rayTest();

    }else if(this.action==="end1"){

      if(this.e.mobile===true){
        this.e.ui.leftBut.interactive = false
        this.e.ui.rightBut.interactive = false
      }

      this.gameDone=true;

      this.musicLoop.volume(0);
      this.buzzLoop.volume(0);

      this.e.ui.loadBack.alpha=1;
      gsap.to(  this.e.ui.loadBack, {alpha:0, duration: 2, ease: "linear"});

      document.getElementById("toprightdiv").style.display = "none";

      this.playerCont.position.y=100;
      this.e.camContX.position.z=7200;

      // Create stats array for endScore
      const statsArray = [
        ["Large Coins", this.largeEthe + " / " + this.largeEtheTotal],
        ["Medium Coins", this.mediumEthe + " / " + this.mediumEtheTotal],
        ["Small Coins", this.smallEthe + " / " + this.smallEtheTotal],
        ["Spike Hits", "-" + this.spikeHits + " / " + this.spikePenaltyScore],
        ["Off-Track Penalty", "-" + Math.round(this.penaltyScore).toLocaleString()],
        ["Total Score", Math.round(this.score).toLocaleString()]
      ];

      // Call endScore system
      this.e.endScore.createFinalScoreOverlay(this.score, statsArray);

      this.action="done"

    }else if(this.action==="done"){

      this.gameTimeGo=false;

    }

    if(this.gameTimeGo===true){
      this.e.gameTime+=this.e.dt;
    }

    //-------------------------------------------------------------------------

    this.effects();
    this.controls();
    this.checkForColorChange();
    this.checkForTTChange();
    this.checkForSpeedChange();
    this.checkForLockChange();

    // Update character animation mixer
    if (this.character && this.character.animMixer) {
        this.character.animMixer.update(this.e.dt);
        
        // Debug animation state
        // if (this.character.runAction) {
        //     console.log("Run action state:", {
        //         isRunning: this.character.runAction.isRunning(),
        //         weight: this.character.runAction.weight,
        //         time: this.character.runAction.time,
        //         duration: this.character.runAction.getClip().duration
        //     });
        // }
    }
    
    // Debug character positioning
    // if (this.character && this.character.parent) {
    //     console.log("PlayerCont position:", this.playerCont.position);
    //     console.log("Character world position:", this.character.getWorldPosition(new THREE.Vector3()));
    //     console.log("Character local position:", this.character.position);
    // }
  }

  // Animation fade function from temp3
  properFade(player, next, time, timeScale, backToIdle, jumpTo, fadeBack) {
    if (next === player.deathAction && player.noMoreAnimations === undefined) {
      player.currentAnimation.weight = 0;
      
      for (var i = 0; i < player.animMixer._actions.length; i++) {
        if (player.animMixer._actions[i].name !== "Death") {
          player.animMixer._actions[i].weight = 0;
        }
      }
      
      player.deathAction.reset();
      player.deathAction.setEffectiveTimeScale(1);
      player.deathAction.play();
      player.noMoreAnimations = true;
    } else if (player.noMoreAnimations === true) {
      // prevent fall death bug
    } else {
      if (timeScale === undefined) {
        timeScale = 1;
      }
      
      var timeDiv = 1 / timeScale;
      
      if (player.currentAnimation !== next) {
        next.reset();
        next.setEffectiveTimeScale(timeScale);
        next.play();
        
        if (jumpTo !== 0) {
          next.time = jumpTo;
        }
        
        player.currentAnimation.fadeOut(time);
        next.fadeIn(time);
        player.currentAnimation = next;
        
        if (fadeBack === undefined) {
          fadeBack = 0.6;
        }
        
        if (backToIdle === true) {
          setTimeout(() => {
            if (player.currentAnimation !== player.idleAction && player.currentAnimation !== player.deathAction) {
              this.properFade(player, player.idleAction, 1.3, 0.8, false, 0, 0);
            } else if (player.currentAnimation === player.deathAction) {
              player.noMoreAnimations = true;
            }
          }, (next.duration * timeDiv - fadeBack) * 500);
        }
      }
    }
  }

  onPointerMove( event ) {

    this.pointer = new THREE.Vector2();
    this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  }

  rayTest(){

    var raycaster = new THREE.Raycaster(this.playerCont.position, new THREE.Vector3( 0, -1, 0 ), 0, 100);
    var intersects = raycaster.intersectObjects( this.groundParts, true );

    this.subPenaltyFactor = 250;

    if(intersects.length===0 && this.progress>0 && this.gameDone!==true){

      // player is off the track, penalty
      // add to penalty count (dt count)

      this.penaltyCount+=this.e.dt;

      if(this.penaltyCount>.01){
        // add to the number that creates the red negative score text above players head
        this.scoreSubtractTotal+=this.e.dt*this.subPenaltyFactor;
      }

      this.glowPlane.material.visible=false;

    }else{

      //player is on the track, ok

      if(this.scoreSubtractTotal!==0){
        // if was previously off the track make the red score text
        this.e.ui.makeScore(Math.round(-this.scoreSubtractTotal),"r")
      }

      this.scoreSubtractTotal=0
      this.penaltyCount=0;

      this.glowPlane.material.visible=true;

    }

    if(this.penaltyCount>.01 && this.lock===false && this.progress>0 && this.gameDone!==true){

      this.penaltyScore+=this.e.dt*this.subPenaltyFactor;

      if(this.e.soundOn===true){
        this.buzzLoop.volume(1)
      }
      this.onGround=false;

    }else{

      this.onGround=true;
      this.buzzLoop.volume(0)

    }

  }

  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------

  controls(){

    //-------------------------------------------------------------------------

    // CONTROLS

    if(this.isRotating>0){
      this.isRotating-=this.e.dt;
    }

    this.turnDur=.1;

    if(this.lock===false){

      if(this.e.input.keyLeft===true && this.isRotating<=0){

        console.log("left")

        gsap.to(  this.levelCont.rotation, {z: this.levelCont.rotation.z-this.e.u.ca(36), duration: this.turnDur, ease: "expo.out"});
        this.isRotating=this.turnDur;
        this.e.input.keyLeft=false

        this.turnWait=.1

      }

      if(this.e.input.keyRight===true && this.isRotating<=0){

        console.log("right")

        gsap.to(  this.levelCont.rotation, {z: this.levelCont.rotation.z+this.e.u.ca(36), duration: this.turnDur, ease: "expo.out"});
        this.isRotating=this.turnDur;
        this.e.input.keyRight=false

        this.turnWait=.1

      }

    }

    if(this.turnWait>0){
      this.isTweening=true
      this.turnWait-=this.e.dt;
    }else{
      this.isTweening=false;
    }

  }

  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------------------------------------------

  effects(){

    //-------------------------------------------------------------------------

    // MOVE TUBE

    for(var i=0; i<this.allTunnels.length; i++){
      if(this.allTunnels[i]!==null){
        this.allTunnels[i].tube.material.map.offset.x+=this.e.dt*.015;
        this.allTunnels[i].tube.material.map.offset.y-=this.e.dt*.015;
      }

    }

    //-------------------------------------------------------------------------

    // ROTATE ETHE

    for(var i=0; i<this.allEthe.length; i++){

      this.allEthe[i].rotation.y+=this.e.dt;

    }

    //-------------------------------------------------------------------------

    // ROTATE CURVES

    for(var i=0; i<this.curvesInner.length; i++){

      this.curvesInner[i].rotation.z+=this.e.dt/this.curvesInner[i].speed/2;

    }

    for(var i=0; i<this.curvesOuter.length; i++){

      this.curvesOuter[i].rotation.z-=this.e.dt/this.curvesOuter[i].speed/2;

    }

  }

}
