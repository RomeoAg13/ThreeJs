import * as THREE from 'three';


let scene, camera, renderer, car, track, obstacles, finishLine;
let timerElement = document.getElementById('timer');
let startTime, elapsedTime, timerInterval;

// Initialize Three.js scene
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create track
    let trackGeometry = new THREE.PlaneGeometry(200, 400, 10, 10);
    let trackMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);

    // Create car
    let carGeometry = new THREE.BoxGeometry(5, 2, 3);
    let carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.set(0, 1, -180); // Starting position at the beginning of the track
    scene.add(car);

    // Create obstacles
    obstacles = [];
    for (let i = 0; i <=400; i++) {
        let obstacle = createObstacle();
        scene.add(obstacle);
        obstacles.push(obstacle);
    }

    // Create finish line
    let finishLineGeometry = new THREE.PlaneGeometry(10, 100, 1, 1);
    let finishLineMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.z = 190;
    scene.add(finishLine);

    // Set camera position
    camera.position.z = 50;

    // Start the game loop
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    animate();
}

// Update timer
function updateTimer() {
    elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerElement.textContent = `Time: ${elapsedTime}s`;
}

// Function to create an obstacle
function createObstacle() {
    let obstacleGeometry = new THREE.BoxGeometry(5, 5, 5);
    let obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    let obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    let minDistance = 10; // Minimum distance from the car's starting position
    let maxAttempts = 100; // Maximum attempts to find a suitable position
    let attempts = 0;
    do {
        obstacle.position.x = Math.random() * 180 - 90;
        obstacle.position.z = Math.random() * 380 - 190;
        attempts++;
    } while (car.position.distanceTo(obstacle.position) < minDistance && attempts < maxAttempts);
    return obstacle;
}

// Function to reset the game
function resetGame() {
car.position.set(0, 1, -180);
startTime = Date.now();
clearInterval(timerInterval);
timerInterval = setInterval(updateTimer, 1000);
obstacles.forEach(obstacle => scene.remove(obstacle));
obstacles = [];
for (let i = 0; i < 100; i++) {
let obstacle = createObstacle();
scene.add(obstacle);
obstacles.push(obstacle);
}
// Réinitialiser l'état des touches
keys = {};
}

// Game loop
function animate() {
    requestAnimationFrame(animate);
    update();
    render();
}

// Update game logic
function update() {
    // Move car based on keyboard input
    if (keys.ArrowUp) car.position.z -= 0.5;
    if (keys.ArrowDown) car.position.z += 0.5;
    if (keys.ArrowLeft) car.position.x -= 0.5;
    if (keys.ArrowRight) car.position.x += 0.5;

    // Check collisions with obstacles
    obstacles.forEach(obstacle => {
        if (car.position.distanceTo(obstacle.position) < 5) {
            // Collision detected
            alert('Game Over!');
            resetGame();
        }
    });

    // Check if car crosses finish line
    if (car.position.z > 190) {
        alert(`Race completed! Your time: ${elapsedTime}s`);
        clearInterval(timerInterval);
        resetGame();
    }

    // Ensure car stays on the track
    if (car.position.x < -90) car.position.x = -90;
    if (car.position.x > 90) car.position.x = 90;
    if (car.position.z < -190) car.position.z = -190;
    if (car.position.z > 190) car.position.z = 190;
}

// Render the scene
function render() {
    // Mettre la caméra derrière le véhicule
    let cameraDistance = 20;
    let cameraHeight = 10;
    let relativeCameraOffset = new THREE.Vector3(0, cameraHeight, -cameraDistance);
    let cameraOffset = relativeCameraOffset.applyMatrix4(car.matrixWorld);

    camera.position.copy(cameraOffset);
    camera.lookAt(car.position);

    renderer.render(scene, camera);
}

// Keyboard input handling
let keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

// Start the game
init();