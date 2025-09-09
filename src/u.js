import * as THREE from 'three';

export class Utilities {

    setUp(e) {
        this.e=e;
    }

    // 2D Game Utility Functions
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    getWorldPosition(object) {
        // Returns the world position of an object
        // In our system, world position is the same as the object's x, y coordinates
        return {
            x: object.x,
            y: object.y
        };
    }

    getScreenPosition(object, containerBottom) {
        // Returns the screen position of an object relative to the viewport
        // Screen position = World position - Container offset
        const worldPos = this.getWorldPosition(object);
        return {
            x: worldPos.x,
            y: worldPos.y - containerBottom
        };
    }

    isObjectOnScreen(object, containerBottom, buffer = 0) {
        // Checks if an object is visible on screen
        const screenPos = this.getScreenPosition(object, containerBottom);
        return screenPos.y >= -buffer && screenPos.y <= window.innerHeight + buffer;
    }
  
    vectorToScreenPos2(ob, camera){

      var width = window.innerWidth;
      var height = window.innerHeight;
      var widthHalf = width / 2, heightHalf = height / 2;
    
      var vector = ob.geometry.vertices[0].clone();
      vector.applyMatrix4( ob.matrixWorld );
    
      var pos = vector.clone();
      // var pos = ob.position.clone();
    
      pos.project(camera);
      pos.x = ( pos.x * widthHalf ) + widthHalf;
      pos.y = - ( pos.y * heightHalf ) + heightHalf;
    
      var result = {x:pos.x, y:pos.y};
      
      return result;
    
    }
    
    vectorToScreenPos(ob, camera){

      const screenPosition = new THREE.Vector3();
      ob.getWorldPosition(screenPosition);
      screenPosition.project(camera);
  
      if ( screenPosition.x >= -1 && screenPosition.x <= 1 && screenPosition.y >= -1 && screenPosition.y <= 1 &&screenPosition.z >= -1 && screenPosition.z <= 1 ) {

        const px = (screenPosition.x + 1) / 2 * window.innerWidth;
        const py = (-screenPosition.y + 1) / 2 * window.innerHeight;
        
        var result = {x:px, y:py};

      }else{

        var result = {x:10000, y:10000};

      }
      
      return result;
    
    }
    
    
    lerp(start, end, amt) {
      return (1 - amt) * start + amt * end;
    }
  
    ca(ang) {
      var pi = Math.PI;
      return ang * (pi/180);
    }
  
    ca2(ang){
      var pi = Math.PI;
      return ang * (180/pi);
    }
  
    ran(num) {
      var num1 = Math.random() * num;
      var num2 = Math.floor(num1);
      
      return num2;
    }

    nran(num) {
      var num1 = Math.random() * (num*2);
      var num2 = Math.floor(num1-num);
      return num2;
    }

  
  }