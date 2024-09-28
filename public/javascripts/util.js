import * as THREE from 'three';

export function createGrid(size, divisions, scene, x = 0, y = 0, z = 0) {
    const gridHelper = new THREE.GridHelper( size, divisions );
    gridHelper.position.x = x;
    gridHelper.position.y = y;
    gridHelper.position.z = z;
    scene.add( gridHelper );
}

export function plotMeshes(mixers = [], scene) {
    
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const width = 1;
            const depth = 1;
            const height = Math.floor(Math.random() * 10) + 1;
    
            const maxHeight = 5;
            const minHeight = 1;
    
            // create meshes
            var material = new THREE.MeshPhongMaterial( {
            color: 0xFFFFFF,
                polygonOffset: true,
                polygonOffsetFactor: 1, // positive value pushes polygon further away
                polygonOffsetUnits: 1
            });
            var mesh = new THREE.Mesh( new THREE.BoxGeometry(width, height, depth), material );
    
            const x = i +1 ;  
            const z = j + 1;
            mesh.position.x = x;
            mesh.position.y = height/2;
            mesh.position.z = z;
            
            scene.add(mesh);
    
            var geometry = new THREE.EdgesGeometry( mesh.geometry );
            var material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
    
            const wireframe = new THREE.LineSegments( geometry, material );
    
            mesh.add(wireframe);
    
            // KEYFRAMES
            let positionKF;
    
            let scaleKF;
    
            if (height == 1) {
                scaleKF = new THREE.VectorKeyframeTrack('.scale', [0, 1, 2], [
                    width, 1, depth,
                    width, 1, depth,
                    width, 1, depth,
                ]);
                positionKF = new THREE.VectorKeyframeTrack('.position', [ 0, 1, 2 ], [
                    x, 0.5, z,
                    x, 0.5, z,
                    x, 0.5, z,
                ] );
            }
            else {
                for (let i = 0; i < height; i++) {
                    if (i + 2 == height) {
                        scaleKF = new THREE.VectorKeyframeTrack('.scale', [0, 1, 2], [
                            width, 1, depth,
                            width, 1 / height, depth,
                            width, 1, depth,
                        ]);
                        positionKF = new THREE.VectorKeyframeTrack('.position', [ 0, 1, 2 ], [
                            x, 1, z,
                            x, 0.5, z,
                            x, 1, z,
                        ]);
                    }
                }
            }
            
            mixers.push(new THREE.AnimationMixer(mesh));
            const clip = new THREE.AnimationClip('Action', 2, [ scaleKF, positionKF ]);
            const action = mixers.at(-1).clipAction(clip);
            action.loop = THREE.LoopPingPong;
            action.play();
        }
    }
}