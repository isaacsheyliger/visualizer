import * as THREE from 'three';
import { createScene } from './setup.js';
import { calculateTime } from './util.js';

// #region SCENE
const sc = createScene(true);

sc.camera.position.set(0, 0, 5000);

sc.controls.enableDamping = true;
sc.controls.enableKeys = false;
sc.controls.enablePan = false;
// #endregion

// #region AUDIO
const listener = new THREE.AudioListener();
sc.camera.add(listener);

const audio = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

const audioData = document.getElementById('audio');
const audioContext = new AudioContext();

const duration = document.getElementById('duration');
const playPauseButton = document.getElementById('play-pause');
const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
playPauseButton.disabled = true;
nextButton.disabled = true;
prevButton.disabled = true;

const track = document.getElementById('current-track');

const inputElement = document.getElementById('audio-file');
const urls = [];
inputElement.value = null;
inputElement.addEventListener('change', handleFiles, false);

async function handleFiles() {
    const fileArr = Array.from(inputElement.files);
    fileArr.reverse();
    for (let i = 0; i < fileArr.length; i++) {
        urls.push(URL.createObjectURL(fileArr[i]));
    }
    
    let index = 0;
    duration.textContent = await getAudioDuration(index);

    if (urls.length > 0) { playPauseButton.disabled = false; }
    // TODO: fix indexing
    if (urls.length > 1) { 
        nextButton.disabled = false; 
        prevButton.addEventListener('click', () => {
            index = playPrev(index); 
        });
        nextButton.addEventListener('click', () => {
            index = playNext(index)
        });
    }
    
    audioLoader.load(urls[index], buffer => {
        audio.setBuffer(buffer);
        document.getElementById('file-loader').style.display = 'none';
        track.textContent = fileArr[index].name;
        playPauseButton.addEventListener('click', () => {
            audio.isPlaying ? audio.pause() : audio.play(); 
        });
    });

    function playNext(index) {
        index++;
        audio.stop();
        audioLoader.load(urls[index], buffer => {
            audio.setBuffer(buffer);
            track.textContent = fileArr[index].name;
            audio.play();
            index >= urls.length - 1 ? nextButton.disabled = true : nextButton.disabled = false;
            prevButton.disabled = false;
        });
        return index;
    }

    function playPrev(index) {
        index--;
        audio.stop();
        audioLoader.load(urls[index], buffer => {
            audio.setBuffer(buffer);
            track.textContent = fileArr[index].name;
            audio.play();
            index <= 0 ? prevButton.disabled = true : prevButton.disabled = false;
            nextButton.disabled = false;
        });
        return index;
    }

    audio.onEnded = () => {
        if (index < urls.length - 1) {
            playNext(index);
            index++;
        } else if (index === urls.length - 1) {
            index = 0;
        } else {
            audio.stop();
        }
    }
}

const analyser = new THREE.AudioAnalyser(audio, 32);
// #endregion

// #region VIZ
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
// #endregion

// #region ANIMATE
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
// #endregion

// #region HELPER FUNCTIONS
async function getAudioDuration(index) {
    const source = audioContext.createBufferSource(audioData);
    const response = await fetch(urls[index]);
    const arrayBuffer = await response.arrayBuffer();
// Decode the audio data
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    // Set the buffer to the source node
    source.buffer = buffer;
    // Log the duration
    const time = calculateTime(source.buffer.duration.toFixed(2));
    return time;
}
// #endregion