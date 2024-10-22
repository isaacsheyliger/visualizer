import * as THREE from 'three';
import { createScene } from './setup.js';
import { calculateTime } from './util.js';

const sc = init();

// #region CONSTANTS

const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
const audio = new THREE.Audio(listener);
const audioContext = listener.context;

sc.camera.add(listener);

const audioData = document.getElementById('audio');
const duration = document.getElementById('duration');
const seekSlider = document.getElementById('seek-slider');
const currentTime = document.getElementById('current-time');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-output');
const muteButton = document.getElementById('mute');
const playPauseButton = document.getElementById('play-pause');
const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
const track = document.getElementById('current-track');
const inputElement = document.getElementById('audio-file');

const urls = [];

const clock = new THREE.Clock();
const uniforms = {
    u_time: { value: 0.0 },
    u_frequency: { value: 0.0 },
}

// #endregion

loadElements();
createMesh(uniforms);

const analyser = new THREE.AudioAnalyser(audio, 32);
sc.renderer.setAnimationLoop(animate(sc, uniforms));

// #region HELPER FUNCTIONS

function animate(sc, uniforms) {
    uniforms.u_frequency.value = analyser.getAverageFrequency();
    uniforms.u_time.value = clock.getElapsedTime();
    sc.renderer.render(sc.scene, sc.camera);
}

function init() {
    const sc = createScene(true);
    sc.camera.position.set(0, 0, 5000);

    sc.controls.enableDamping = true;
    sc.controls.enableKeys = false;
    sc.controls.enablePan = false;
    return sc;
}

function loadElements() {
    playPauseButton.disabled = true;
    nextButton.disabled = true;
    prevButton.disabled = true;
    
    inputElement.value = null;
    inputElement.addEventListener('change', handleFiles, false);

    /* slider seek logic
    * on play click, start a timer that increments the slider value
    * on pause click, pause the timer
    * on seek, update the timer to the sought value, and update the audio offset
    * when timer value matches duration, pause the timer
    * reset the timer on track change
    */
    seekSlider.addEventListener('change', () => {
        currentTime.textContent = calculateTime(seekSlider.value);
        audio.stop();
        audio.offset = seekSlider.value;
        audio.play();
    })
    
    
    volumeSlider.addEventListener('change', () => {
        audio.setVolume(volumeSlider.value / 100);
        volumeValue.textContent = volumeSlider.value;
    });
    
    
    muteButton.addEventListener('click', () => {
        if (audio.isPlaying) {
            if (audio.getVolume() === 0) { 
                audio.setVolume(volumeSlider.value / 100)
                muteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                    </svg>
                `; 
            } else {
                audio.setVolume(0);
                muteButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                    </svg>
                `;
            }
        }
    });
    
}

function createMesh(uniforms) {
    const material = new THREE.ShaderMaterial({
        wireframe: true,
        uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    })
    const geometry = new THREE.IcosahedronGeometry(4, 30);
    const mesh = new THREE.Mesh(geometry, material);

    sc.scene.add(mesh);
}

function setSliderMax(time) {
    seekSlider.max = Math.floor(time);
}

function getFileArray(files, urls) {
    const arr = Array.from(files);
    arr.reverse();
    for (let i = 0; i < arr.length; i++) {
        urls.push(URL.createObjectURL(arr[i]));
    }
    return arr
}

async function getAudioDuration(index) {
    const source = audioContext.createBufferSource(audioData);
    const response = await fetch(urls[index]);
    const arrayBuffer = await response.arrayBuffer();
    // Decode the audio data
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    // Set the buffer to the source node
    source.buffer = buffer;
    // Log the duration
    return source.buffer.duration.toFixed(2);
}

async function handleFiles() {
    // create array from input files and reverse it to play in order
    const fileArr = getFileArray(inputElement.files, urls);
    
    let index = 0;
    const trackTime = await getAudioDuration(index)
    duration.textContent = calculateTime(trackTime);
    setSliderMax(trackTime);

    if (urls.length > 0) { playPauseButton.disabled = false; }
    else if (urls.length > 1) { 
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
        // TODO: scroll track name if >42 characters, need to figure how to determine when to stop
        if (fileArr[index].name.length > 42) {
            track.style.animation = `scroll ${(fileArr[index].name.length / 10) + 2}s linear infinite`;
        }
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

// #endregion