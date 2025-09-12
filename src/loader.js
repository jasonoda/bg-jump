import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

export class Loader{

    setUp(e){

        this.e = e;

        this.ready=false;
        
        this.modelsLoaded=0;
        this.texturesLoaded=0;
        this.modelArray=[];
        this.textureArray=[];
        
        this.isLoaded_CUBE=false;
        this.isLoaded_3DTEXTURES=false;
        this.isLoaded_3D=false;
        this.e.reflectionTexture=null;

        this.totalSkinsLoaded = 0;

        //console.log("set up loader")

    }

    loadCubeTexture(loader){
        
        //console.log("CUBE TEXTURE");
        this.isLoaded_CUBE=true;
    
    }
    
    loadTexture(loader){

        loader.texturesLoaded+=1;
        //console.log("TEXTURE: "+this.texturesLoaded+" / "+this.textureArray.length)

        if(this.modelsLoaded===this.modelArray.length){
            this.isLoaded_3DTEXTURES=true;
        }
        
    }
    
    managerLoad(obName){
    
        this.modelsLoaded+=1; 
        //console.log("MODEL: "+obName+" / "+this.modelsLoaded+" / "+this.modelArray.length)

        if(this.modelsLoaded===this.modelArray.length){
            this.isLoaded_3D=true;
        }

    }

   load(){

        var e = this.e;

        //------------------------------------------------------------------

        var loader = new THREE.CubeTextureLoader();
        loader.name="skyboxLoaderName";

        this.e.reflectionTexture = loader.load([
        './src/images/ref/pos-x.png',
        './src/images/ref/neg-x.png',
        './src/images/ref/pos-y.png',
        './src/images/ref/neg-y.png',
        './src/images/ref/pos-z.png',
        './src/images/ref/neg-z.png',
        ],  () => this.loadCubeTexture());

        this.textureArray.push("blackTemp"); this.e.blackTemp = new THREE.TextureLoader().load( './src/images/black.png', this.loadTexture(this));
        
        //------------------------------------------------------------------

        this.countit=0;
        
        this.myObject1 = "soccerBall"; this.modelArray.push(this.myObject1);
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = ((modelName) => { return () => this.managerLoad(modelName);})(this.myObject1);
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.ped=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        // Load character model with DRACO loader
        this.myObject2 = "char"; this.modelArray.push(this.myObject2);
        this.manage2 = new THREE.LoadingManager(); this.manage2.onLoad = ((modelName) => { return () => this.managerLoad(modelName);})(this.myObject2);
        
        // Use DRACOLoader for character model
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('./node_modules/three/examples/jsm/libs/draco/');
        
        this.loader2 = new GLTFLoader(this.manage2);
        this.loader2.setDRACOLoader(dracoLoader);
        
        this.loader2.load('./src/models/'+this.myObject2+'.glb', 
            // Success callback
            (gltf) => {  
                //console.log("Character model loaded successfully:", gltf);
                
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
                    //console.log("Animation name:", clip.name);
                });
                
                // Store the entire gltf object like temp3 does
                e.char = gltf;
                
                //console.log("Character gltf stored:", e.char);
                //console.log("Character animations:", gltf.animations);
            },
            // Progress callback
            (progress) => {
                //console.log("Character loading progress:", progress);
            },
            // Error callback
            (error) => {
                //console.error("Error loading character model:", error);
            }
        );

    }

}