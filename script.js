import * as THREE from 'three';

let car, track, startLine, finishLine, obstacles = [];
const scene = new THREE.Scene();
let timerElement = document.getElementById('timer');
let startTime, ResetTime, timerInterval;
let keys = {};
let carDirection = new THREE.Vector3(0, 0, 1); // Direction initiale de la voiture
    
const viewportSize = {
    width: 800,
    height: 600
    };
    const camera = new THREE.PerspectiveCamera(
        100, // FOV
    viewportSize.width / viewportSize.height // aspect ratio
    );

    const canvas = document.querySelector('canvas#webgl');
    const renderer = new THREE.WebGLRenderer({
        canvas,
    });
    renderer.setSize(viewportSize.width, viewportSize.height);


    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    const loader = new THREE.CubeTextureLoader();
    loader.load([
        'img/fff.jpg',
        'img/fff.jpg',
        'img/fff.jpg',
        'img/fff.jpg',
        'img/fff.jpg',
        'img/fff.jpg'
    ], function(texture) {
        scene.background = texture;
    }, undefined, function(error) {
        console.error('An error occurred while loading the skybox texture:', error);
    });


 const textureLoader = new THREE.TextureLoader();
 const groundTexture = textureLoader.load('img/Stylized_Stone_Floor_005_basecolor.jpg');
 groundTexture.wrapS = THREE.RepeatWrapping;
 groundTexture.wrapT = THREE.RepeatWrapping;
 groundTexture.repeat.set(10, 10); // Répétition de la texture sur le sol

 const groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });

 const groundGeometry = new THREE.PlaneGeometry(200, 200); // Géométrie pour représenter le sol
 const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
 groundMesh.rotation.x = -Math.PI / 2; // Pour que le sol soit horizontal

 scene.add(groundMesh); // Ajout du sol à la scène

    createTrack();

    let carGeometry = new THREE.BoxGeometry(5, 2, 3);
    let carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(carGeometry, carMaterial);
car.position.set(0, 1, -85);
car.hasCrossedFinishLine = false; // Initialize flag as false
scene.add(car);

    // START LINE
    let startLineGeometry = new THREE.PlaneGeometry(10, 60);
    let startLineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
    startLine.rotation.x = -Math.PI / 2;
    startLine.position.z = -80; // Adjust start line position to be closer to the center of the track
    startLine.position.y= 0.1; 

    scene.add(startLine);

    // FINISH LINE 
    let finishLineGeometry = new THREE.PlaneGeometry(10, 60);
    let finishLineMaterial = new THREE.MeshBasicMaterial({ color: 0xff0010 });
    finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.z = -80; 
    finishLine.position.x = -15;
    finishLine.position.y= 0.1; 
    scene.add(finishLine);




    // POSITION CAMERA
    camera.position.set(0, 10, -20); // Initial camera position
    camera.lookAt(car.position);



    // START GAME 
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    function animate() {
        requestAnimationFrame(animate);
        update();
        renderer.render(scene, camera);
    }
    animate();
    
    // Update timer
    function updateTimer() {
        ResetTime = Math.floor((Date.now() - startTime) / 1000);
        timerElement.textContent = `Time: ${ResetTime}s`;
    }


function createObstacle(x, z) {
    let obstacleGeometry = new THREE.BoxGeometry(3, 10, 5); // Customize the size of the obstacle
    let obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0x563b29 }); // Customize the color of the obstacle
    let obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(x, 5, z); // Set the position of the obstacle
    scene.add(obstacle);
    obstacles.push(obstacle);
}



// Function to create the circular track
function createTrack() {
    // Create track (circular)
    let trackGeometry = new THREE.CircleGeometry(0, 0);
    let trackMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: false });

    track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);

    // Create outer barriers (circular)
    let outerBarrierMaterial = new THREE.MeshBasicMaterial({ color: 0x2e2017 });
    let numBarriers = 36; // Number of barriers
    let radius = 95; // Radius of the circle
    let barrierHeight = 5; 
    for (let i = 0; i < numBarriers; i++) {
        let angle = (i / numBarriers) * Math.PI * 2;
        let x = radius * Math.cos(angle);
        let z = radius * Math.sin(angle);
        let barrierGeometry = new THREE.BoxGeometry(1, barrierHeight,17); // Long barriers
        let barrier = new THREE.Mesh(barrierGeometry, outerBarrierMaterial);
        barrier.position.set(x, barrierHeight / 2, z);
        barrier.rotation.y = -angle; // Rotate by the angle of the circle
        scene.add(barrier);
        obstacles.push(barrier);
    }

    // Create inner barriers (circular)
    let innerBarrierMaterial = new THREE.MeshBasicMaterial({ color: 0x2e2017 });
    let innerNumBarriers = 36; // Number of inner barriers
    let innerRadius = 60; // Radius of the inner circle
    for (let i = 0; i < innerNumBarriers; i++) {
        let angle = (i / innerNumBarriers) * Math.PI * 2;
        let x = innerRadius * Math.cos(angle);
        let z = innerRadius * Math.sin(angle);
        let barrierGeometry = new THREE.BoxGeometry(1, barrierHeight, 20); // Long barriers
        let barrier = new THREE.Mesh(barrierGeometry, innerBarrierMaterial);
        barrier.position.set(x, barrierHeight / 2, z);
        barrier.rotation.y = -angle; // Rotate by the angle of the circle
        scene.add(barrier);
        obstacles.push(barrier);
    }

    createObstacle(80, 0);
    createObstacle(0, 80);
    createObstacle(30, -80);
    createObstacle(-50, 80);
    createObstacle(-20, 80);
    createObstacle(-80, 0);
    createObstacle(60, 30);
    createObstacle(-60, -30);

}

function resetGame() {
    car.position.set(0, 1, -85);
    car.hasCrossedFinishLine = false;  
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    keys = {};
}



function update() {
    let speed = 0.2;
    if (keys.ArrowUp) {
        car.position.add(carDirection.clone().multiplyScalar(speed));
    }
    if (keys.ArrowDown) {
        car.position.sub(carDirection.clone().multiplyScalar(speed));
    }
    if (keys.ArrowLeft) {
        car.rotateY(0.05);
        carDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.05);
    }
    if (keys.ArrowRight) {
        car.rotateY(-0.05);
        carDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.05);
    }

    if (car.position.x < -90) car.position.x = -90;
    if (car.position.x > 90) car.position.x = 90;
    if (car.position.z < -90) car.position.z = -90;
    if (car.position.z > 90) car.position.z = 90;
    updateCamera();

    checkFinishLine();

    obstacles.forEach(obstacle => {
        if (car.position.distanceTo(obstacle.position) < 5) {
            alert('Game Over!');
            resetGame();
        }
    });
}

function updateCamera() {
    let relativeCameraOffset = new THREE.Vector3(0, 10, -20); 
    let cameraOffset = relativeCameraOffset.applyMatrix4(car.matrixWorld);
    camera.position.copy(cameraOffset);
    camera.lookAt(car.position);
}

function checkFinishLine() {
    const distanceToFinishLine = car.position.distanceTo(new THREE.Vector3(finishLine.position.x, car.position.y, finishLine.position.z));
    const withinFinishLineThreshold = distanceToFinishLine < 5; 
    let points = ResetTime*600;

    if (withinFinishLineThreshold && !car.hasCrossedFinishLine) {
        alert(`Race completed! Your time: ${ResetTime}s`+`\nScore : ${points}`);
        car.hasCrossedFinishLine = true;  
        resetGame();
    }
}






window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

init();
