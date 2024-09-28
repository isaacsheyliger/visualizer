// replace import with necessary assets
// import {  } from "./assets/___";
import * as THREE from 'three';
import { createScene } from './setup.js';
import { createGrid, plotMeshes } from './util.js';

/*
themes: 
black: 0x151515, 0x4AF626
musou black (oled): 0x000000, 0xE1E1E1
hillside: color + scenery
hillside night: color + scenery
hillside framed: color wireframe + scenery
light: 0xE1E1E1 (maybe change), 0x151515
*/

const sc = createScene(true); // This will create a scene with no orbit controls

createGrid(20, 20, sc.scene, 2.5, 0, 2.5);

let mixers = [];
plotMeshes(mixers, sc.scene);

// const width = 1;
// const depth = 1;
// const height = Math.floor(Math.random() * 5) + 1;

// const maxHeight = 5;
// const minHeight = 1;

// // create meshes
// var geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, depth));
// var material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );

// const mesh = new THREE.LineSegments( geometry, material );

// const x = 1;  
// const z = 1;
// mesh.position.x = x;
// mesh.position.y = height/2;
// mesh.position.z = z;

// sc.scene.add(mesh);

// // wireframe.position.x = x;
// // wireframe.position.y = height/2;
// // wireframe.position.z = z;

// // KEYFRAMES
// const positionKF = new THREE.VectorKeyframeTrack('.position', [ 0, 1, 2 ], [
//     x, height/2, z,
//     x, maxHeight/2, z,
//     x, minHeight/2, z,
// ] );
// const scaleKF = new THREE.VectorKeyframeTrack('.scale', [0, 1, 2], [
//     width, height, depth,
//     width, maxHeight, depth,
//     width, minHeight, depth,
// ]);

// const clip = new THREE.AnimationClip('Action', 3, [ positionKF, scaleKF ]);

// let mixer = new THREE.AnimationMixer(mesh);
// const action = new THREE.AnimationAction(mixer, clip);
// action.loop = THREE.LoopPingPong;

// action.play();

let clock = new THREE.Clock();

// render animation
function animate() { 
    let delta = clock.getDelta();
    mixers.forEach(mixer => {
        mixer && mixer.update(delta);
    });
    sc.renderer.render(sc.scene, sc.camera);
}
sc.renderer.setAnimationLoop(animate);