import * as THREE from 'three';
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class Loader{

    setUp(e){

        this.e = e;

        this.ready=false;
        this.objectsLoaded=0;
        this.loaderArray=[];
        
        this.totalModels = 0;
        this.totalModelsLoaded = 0;
        this.texture3dLoaded = 0;

        this.isLoaded_3D=false;
        this.e.reflectionTexture=null;

    }

    loadTexture(loader){

        this.objectsLoaded+=1;
        this.texture3dLoaded+=1;
        // console.log("TEXTURE 3D: "+this.texture3dLoaded)

    }
    
    loadCubeTexture(loader){
        
        // console.log("CUBE TEXTURE loaded")
    
    }
    
   managerLoad(obName){
    
        this.objectsLoaded+=1;
        this.totalModelsLoaded+=1;

        // console.log("MODEL: "+obName+" - "+this.objectsLoaded+" / "+this.loaderArray.length)

        if(this.objectsLoaded===this.loaderArray.length){
            this.isLoaded_3D=true;
        }

   }

   reloadTube(){

        for(var i=0; i<this.e.level.allTunnels.length; i++){
            this.e.level.allTunnels[i].tube.material.map = this.e.tt4;
          }

   }

   load(){

        var e = this.e;

        //------------------------------------------------------------------

        var loader = new THREE.CubeTextureLoader();
        loader.name="skyboxLoaderName";

        this.e.reflectionTexture = loader.load([
        './src/img/ref/pos-x.png',
        './src/img/ref/neg-x.png',
        './src/img/ref/pos-y.png',
        './src/img/ref/neg-y.png',
        './src/img/ref/pos-z.png',
        './src/img/ref/neg-z.png',
        ], this.loadCubeTexture);

        this.loaderArray.push("gradGlowWhite"); this.e.gradGlowWhite = new THREE.TextureLoader().load( './src/img/gradGlowWhite.png', this.loadTexture(this)); 
        this.loaderArray.push("gradGlowWhite2"); this.e.gradGlowWhite2 = new THREE.TextureLoader().load( './src/img/gradGlowWhite2.png', this.loadTexture(this)); 
       
        this.loaderArray.push("tt1"); this.e.tt1 = new THREE.TextureLoader().load( './src/img/tt1.png', this.loadTexture(this));
        this.e.tt1.wrapS = this.e.tt1.wrapT = THREE.RepeatWrapping;
        this.e.tt1.repeat.set( 30, 30 );
        this.e.tt1.anisotropy = this.e.renderer.capabilities.getMaxAnisotropy();

        this.loaderArray.push("tt2"); this.e.tt2 = new THREE.TextureLoader().load( './src/img/tt2.png', this.loadTexture(this));
        this.e.tt2.wrapS = this.e.tt2.wrapT = THREE.RepeatWrapping;
        this.e.tt2.repeat.set( 30, 30 );
        this.e.tt2.anisotropy = this.e.renderer.capabilities.getMaxAnisotropy();

        this.loaderArray.push("tt3"); this.e.tt3 = new THREE.TextureLoader().load( './src/img/tt3.png', this.loadTexture(this));
        this.e.tt3.wrapS = this.e.tt3.wrapT = THREE.RepeatWrapping;
        this.e.tt3.repeat.set( 40, 40 );
        this.e.tt3.anisotropy = this.e.renderer.capabilities.getMaxAnisotropy();

        this.loaderArray.push("tt4"); this.e.tt4 = new THREE.TextureLoader().load( './src/img/tt4.png', this.loadTexture(this));
        this.e.tt4.wrapS = this.e.tt4.wrapT = THREE.RepeatWrapping;
        this.e.tt4.repeat.set( 40, 40 );
        this.e.tt4.anisotropy = this.e.renderer.capabilities.getMaxAnisotropy();

        this.loaderArray.push("tt5"); this.e.tt5 = new THREE.TextureLoader().load( './src/img/tt5.png', this.loadTexture(this));
        this.e.tt5.wrapS = this.e.tt5.wrapT = THREE.RepeatWrapping;
        this.e.tt5.repeat.set( 20, 20 );
        this.e.tt5.anisotropy = this.e.renderer.capabilities.getMaxAnisotropy();

        this.loaderArray.push("tt6"); this.e.tt6 = new THREE.TextureLoader().load( './src/img/tt6.png', this.loadTexture(this));
        this.e.tt6.wrapS = this.e.tt6.wrapT = THREE.RepeatWrapping;
        this.e.tt6.repeat.set( 20, 20 );
        this.e.tt6.anisotropy = this.e.renderer.capabilities.getMaxAnisotropy();

        //------------------------------------------------------------------

        // console.log("BEGIN LOADER");

        this.myObject1 = "start"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage);
        this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {
        
            gltf.scene.traverse( function( object ) {

                e.startModel=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=false;
                    object.receiveShadow=true;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "tube1"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.tubeModel=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "tube3"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.tube3Model=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "tubeSky"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.tubeSkyModel=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=false;
                    object.receiveShadow=false;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "curves"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.curveModel=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=false;
                    object.receiveShadow=false;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        //-----------------------------------------------------------------------------------------------------------------

        this.myObject1 = "tunnel"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.tunnelModel=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.DoubleSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "tunnelSolid"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.tunnelSolidModel=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.DoubleSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "floorBit"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.floorBit=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "tooth"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.tooth=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=false;
                    object.receiveShadow=false;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "ghost"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.ghost=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "crownFlame"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.crownFlame=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);
        
        this.myObject1 = "endPortal"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.endPortal=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "b_ring"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.b_ring=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=false;
                    object.receiveShadow=false;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "b_coin"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.b_coin=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=false;
                    object.receiveShadow=false;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "b_star"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.b_star=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=false;
                    object.receiveShadow=false;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "b_diamond"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.b_diamond=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=false;
                    object.receiveShadow=false;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        // Load character model
        this.myObject1 = "char"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        
        // Use DRACOLoader for character model
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('./jsm/libs/draco/');
        
        this.loader = new GLTFLoader(this.manage);
        this.loader.setDRACOLoader(dracoLoader);
        
        this.loader.load('./src/models/'+this.myObject1+'.glb', 
            // Success callback
            (gltf) => {  
                console.log("Character model loaded successfully:", gltf);
                
                gltf.scene.traverse(function (object) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                    
                    if (object.isSkinnedMesh) {
                        object.material.metalness = 0;
                        object.material.roughness = 0.6;
                        object.material.side = THREE.FrontSide;
                    }
                });
                
                gltf.animations.forEach((clip) => {
                    console.log("Animation name:", clip.name);
                });
                
                // Store the entire gltf object like temp3 does
                e.char = gltf;
                
                console.log("Character gltf stored:", e.char);
                console.log("Character animations:", gltf.animations);
            },
            // Progress callback
            (progress) => {
                console.log("Character loading progress:", progress);
            },
            // Error callback
            (error) => {
                console.error("Error loading character model:", error);
            }
        );
   }

}