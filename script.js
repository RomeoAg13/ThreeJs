import * as THREE from 'three';

let scene, camera, renderer, car, track, startLine, finishLine, obstacles = [];
let timerElement = document.getElementById('timer');
let startTime, ResetTime, timerInterval;
let keys = {};
let carDirection = new THREE.Vector3(0, 0, 1); // Direction initiale de la voiture

// Initialize Three.js scene
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
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
 // Ajouter une texture au sol
 const textureLoader = new THREE.TextureLoader();
 const groundTexture = textureLoader.load('img/images.png');
 groundTexture.wrapS = THREE.RepeatWrapping;
 groundTexture.wrapT = THREE.RepeatWrapping;
 groundTexture.repeat.set(10, 10); // Répétition de la texture sur le sol

 const groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });

 const groundGeometry = new THREE.PlaneGeometry(200, 200); // Géométrie pour représenter le sol
 const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
 groundMesh.rotation.x = -Math.PI / 2; // Pour que le sol soit horizontal

 scene.add(groundMesh); // Ajout du sol à la scène

    // Create track (circular)
    createTrack();

    // Create car
    let carGeometry = new THREE.BoxGeometry(5, 2, 3);
    let carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(carGeometry, carMaterial);
car.position.set(0, 1, -85);
car.hasCrossedFinishLine = false; // Initialize flag as false
scene.add(car);

    // Create start line (green)
    let startLineGeometry = new THREE.PlaneGeometry(5, 50);
    let startLineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
    startLine.rotation.x = -Math.PI / 2;
    startLine.position.z = -80; // Adjust start line position to be closer to the center of the track
    scene.add(startLine);

    // Create finish line (red)
    let finishLineGeometry = new THREE.PlaneGeometry(5, 50);
    let finishLineMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.z = -90; // Déplacée derrière la ligne de départ
    finishLine.position.x = -10; // Ajustement pour être au centre du circuit
    scene.add(finishLine);

    // Set camera position
    camera.position.set(0, 10, -20); // Initial camera position
    camera.lookAt(car.position);

    // Start the game loop
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    animate();
}

// Update timer
function updateTimer() {
    ResetTime = Math.floor((Date.now() - startTime) / 1000);
    timerElement.textContent = `Time: ${ResetTime}s`;
}


function createObstacle(x, z) {
    let obstacleGeometry = new THREE.BoxGeometry(10, 10, 10); // Customize the size of the obstacle
    let obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Customize the color of the obstacle
    let obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(x, 5, z); // Set the position of the obstacle
    scene.add(obstacle);
    obstacles.push(obstacle);
}



// Function to create the circular track
function createTrack() {
    // Create track (circular)
    let trackGeometry = new THREE.CircleGeometry(100, 64);
    let trackMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);

    // Create outer barriers (circular)
    let outerBarrierMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    let numBarriers = 36; // Number of barriers
    let radius = 95; // Radius of the circle
    let barrierHeight = 5; // Height of the barriers
    for (let i = 0; i < numBarriers; i++) {
        let angle = (i / numBarriers) * Math.PI * 2;
        let x = radius * Math.cos(angle);
        let z = radius * Math.sin(angle);
        let barrierGeometry = new THREE.BoxGeometry(1, barrierHeight, 20); // Long barriers
        let barrier = new THREE.Mesh(barrierGeometry, outerBarrierMaterial);
        barrier.position.set(x, barrierHeight / 2, z);
        barrier.rotation.y = -angle; // Rotate by the angle of the circle
        scene.add(barrier);
        obstacles.push(barrier);
    }

    // Create inner barriers (circular)
    let innerBarrierMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
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

// Function to reset the game
function resetGame() {
    car.position.set(0, 1, -85); // Reset car position to start
    car.hasCrossedFinishLine = false;  // Reset the finish line crossing flag
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    // Reset key state
    keys = {};
}

// Game loop
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// Update game logic
function update() {
    // Move the car
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

    // Check if the car crosses the finish line
    checkFinishLine();

    // Keep the car on the track
    if (car.position.x < -90) car.position.x = -90;
    if (car.position.x > 90) car.position.x = 90;
    if (car.position.z < -90) car.position.z = -90;
    if (car.position.z > 90) car.position.z = 90;

    // Update camera position
    updateCamera();
    // Check collisions with obstacles
    obstacles.forEach(obstacle => {
        if (car.position.distanceTo(obstacle.position) < 5) {
            alert('Game Over!');
            resetGame();
        }
    });
    
}

// Function to update camera position
function updateCamera() {
    // Follow the car with the camera
    let relativeCameraOffset = new THREE.Vector3(0, 10, -20); // Camera position relative to the car
    let cameraOffset = relativeCameraOffset.applyMatrix4(car.matrixWorld);
    camera.position.copy(cameraOffset);
    camera.lookAt(car.position);
}


function checkFinishLine() {
    // Check if car crosses finish line
    if (car.position.z > finishLine.position.z && Math.abs(car.position.x - finishLine.position.x) < 2.5 && !car.hasCrossedFinishLine){
        alert(`Race completed! Your time: ${ResetTime}s`);
        car.hasCrossedFinishLine = true;  // Set flag that car has finished the race 

        // Reset the timer
        clearInterval(timerInterval); // Stop the current timer
        startTime = Date.now(); // Reset the start time to the current time
        timerInterval = setInterval(updateTimer, 1000); // Restart the timer interval
        ResetTime = 0; // Reset elapsed time
        timerElement.textContent = `Time: 0s`; // Update timer display

        // Reset the finish line crossing flag
        car.hasCrossedFinishLine = false;
    }
}




// Keyboard input handling
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

// Start the game
init();
