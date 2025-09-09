import './main.css';
import './shared.css';

import Engine from "./engine.js"; 
import { Input } from "./input.js";
import { Loader } from "./loader.js";
import { Scene } from "./scene.js";
import { Sounds } from "./sounds.js";
import { Utilities } from "./u.js";
import { EndScore } from "./endScore.js";
import Builder from "./builder.js";
import Shoot from "./shoot.js";

var input = new Input();
var loader = new Loader();
var scene = new Scene();
var sounds = new Sounds();
var utilities = new Utilities();
var endScore = new EndScore();
var builder = new Builder();
var shoot = new Shoot();

/**
 * De-obfuscate an obfuscated string with the method above.
 * @param  {[type]} key rotation index between 0 and n
 * @param  {Number} n   same number that was used for obfuscation
 * @return {[type]}     plaintext string
 */
String.prototype._0x6cc90a = function(key, n = 126) {
  // return String itself if the given parameters are invalid
  if (!(typeof(key) === 'number' && key % 1 === 0)
      || !(typeof(key) === 'number' && key % 1 === 0)) {
    return this.toString();
  }

  return this.toString()._0xa68b0d(n - key);
};

/**
 * Obfuscate a plaintext string with a simple rotation algorithm similar to
 * the rot13 cipher.
 * @param  {[type]} key rotation index between 0 and n
 * @param  {Number} n   maximum char that will be affected by the algorithm
 * @return {[type]}     obfuscated string
 */
String.prototype._0xa68b0d = function(key, n = 126) {
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

var engine = new Engine(input,loader,scene,sounds,utilities,endScore,builder,shoot);
  
utilities.setUp(engine);
loader.setUp(engine);
scene.setUp(engine);
sounds.setUp(engine);
input.setUp(engine);
endScore.setUp(engine);
builder.setUp(engine);
shoot.setUp(engine);
  
engine.start(engine);

function update() {
    engine.update();
    requestAnimationFrame(update);
}

// Wait for DOM to be loaded before starting the update loop
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        requestAnimationFrame(update);
    });
} else {
    requestAnimationFrame(update);
}

if (module.hot) {
  module.hot.accept();
}
