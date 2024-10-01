import * as THREE from 'three';
import { createScene } from './setup.js';
import { createGrid, plotMeshes } from './util.js';

// SCENE
const sc = createScene(true);
// createGrid(20, 20, sc.scene, 1, 0, 1);

sc.camera.position.set(0, 0, 5000);

sc.controls.enableDamping = true;
sc.controls.enableKeys = false;
sc.controls.enablePan = false;

// AUDIO
const listener = new THREE.AudioListener();
sc.camera.add(listener);

const audio = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

const playPauseButton = document.getElementById('play-pause');
const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
const inputElement = document.getElementById('audio-file');
const urls = [];
for (let i = 0; i < inputElement.files.length; i++) {
    urls.push(URL.createObjectURL(inputElement.files[i]));
}
console.log(urls)
inputElement.addEventListener('change', handleFiles, false);

function handleFiles() {
    const fileList = this.files;
    let index = urls.indexOf(audio.source.buffer.url);

    console.log(fileList);
    audioLoader.load(urls[index], buffer => {
        audio.setBuffer(buffer);
        playPauseButton.addEventListener('click', () => {
            audio.isPlaying ? audio.pause() : audio.play(); 
        });

        index > 0 ? prevButton.addEventListener('click', () => playPrev(index)) : prevButton.disabled = true;
        index < urls.length - 1 ? nextButton.addEventListener('click', () => playNext(index)) : nextButton.disabled = true;
    });

    function playNext(index) {
        audioLoader.load(urls[index + 1], buffer => {
            audio.setBuffer(buffer);
            audio.play();
        });
    }

    function playPrev(index) {
        audioLoader.load(urls[index - 1], buffer => {
            audio.setBuffer(buffer);
            audio.play();
        });
    }

    audio.onEnded = () => {
        if (index < urls.length - 1) {
            playNext(index);
        } else {
            audio.stop();
        }
    }
}

const analyser = new THREE.AudioAnalyser(audio, 32);

// VIZ
const uniforms = {
    u_time: { value: 0.0 },
    u_frequency: { value: 0.0 },
}

const material = new THREE.ShaderMaterial({
    wireframe: true,
    uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
})

const geometry = new THREE.IcosahedronGeometry(4, 30);
const mesh = new THREE.Mesh(geometry, material);
sc.scene.add(mesh);

function keyframes() {
    
}

// ANIMATE

let clock = new THREE.Clock();

function animate () {

    // let delta = clock.getDelta();
    // mixers.forEach(mixer => {
    //     mixer && mixer.update(delta);
    // });
    uniforms.u_frequency.value = analyser.getAverageFrequency();
    uniforms.u_time.value = clock.getElapsedTime();
    sc.renderer.render(sc.scene, sc.camera);
}
sc.renderer.setAnimationLoop(animate);