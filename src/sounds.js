import { Howl } from 'howler';
export class Sounds {

    setUp(e) {

        this.e=e;
        this.soundArray = ["click","bounce","death","brightClick","break","coinBing","enemyDie","getItem","shoot","jump","bonus1","fall","portal","shoot","spring","achievement1"];
        this.loadedSounds = [];

        for(var i=0; i<this.soundArray.length; i++){
            this.loadSounds(this.soundArray[i]);
        }
        
    }

    loadSounds(url){

        var theSound = new Howl({
            src: ['src/sounds/'+url+".mp3"]
        });

        theSound.on('load', (event) => {
            theSound.name=url;
            this.loadedSounds.push(theSound);
        });

    }

    p(type){

        for(var i=0; i<this.loadedSounds.length; i++){

            if(this.loadedSounds[i].name===type){
                this.loadedSounds[i].play();
            }
            
        }

    }
}