import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 0);
camera.lookAt(0, 0, 0);
camera.up.set(0, 0, -1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x707070 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const carGeometry = new THREE.BoxGeometry(1, 0.5, 2);
const carMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const car = new THREE.Mesh(carGeometry, carMaterial);
car.position.set(-10, 0.25, 10.5);
scene.add(car);

const startPoint = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
startPoint.position.set(-10, 0.25, 10.5);
scene.add(startPoint);

const endPoint = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
endPoint.position.set(10, 0.25, -10.5);
scene.add(endPoint);

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let timerStarted = false;
let startTime;
let elapsedTime = 0;

// Utilisez l'élément div existant pour le timer
const timerElement = document.getElementById('timer');

function updateTimer() {
    if (timerStarted) {
        elapsedTime = Date.now() - startTime;
        timerElement.textContent = `Time: ${(elapsedTime / 1000).toFixed(2)} s`;
    }
}

document.addEventListener('keydown', function(event) {
    if (!timerStarted && [37, 38, 39, 40].includes(event.keyCode)) {
        startTime = Date.now();
        timerStarted = true;
    }
    switch (event.keyCode) {
        case 37: moveLeft = true; break;
        case 38: moveForward = true; break;
        case 39: moveRight = true; break;
        case 40: moveBackward = true; break;
    }
});

document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 37: moveLeft = false; break;
        case 38: moveForward = false; break;
        case 39: moveRight = false; break;
        case 40: moveBackward = false; break;
    }
    if (!moveLeft && !moveRight && !moveForward && !moveBackward && timerStarted) {
        if (car.position.distanceTo(startPoint.position) < 1) {
            timerStarted = false;
            elapsedTime = Date.now() - startTime;
            timerElement.textContent = `Final Time: ${(elapsedTime / 1000).toFixed(2)} s`;
        }
    }
});

const carSpeed = 0.1;
const carTurnSpeed = Math.PI / 100;

function updateCar() {
    if (moveForward) car.translateZ(-carSpeed);
    if (moveBackward) car.translateZ(carSpeed);
    if (moveLeft) car.rotation.y += carTurnSpeed;
    if (moveRight) car.rotation.y -= carTurnSpeed;
}
document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 37: moveLeft = false; break;
        case 38: moveForward = false; break;
        case 39: moveRight = false; break;
        case 40: moveBackward = false; break;
    }
    // Vérifie si aucune touche n'est active et si le timer est lancé
    if (!moveLeft && !moveRight && !moveForward && !moveBackward && timerStarted) {
        // Vérifie si la voiture est proche du point rouge (point d'arrivée)
        if (car.position.distanceTo(endPoint.position) < 1) {
            timerStarted = false;
            elapsedTime = Date.now() - startTime;
            timerElement.textContent = `Final Time: ${(elapsedTime / 1000).toFixed(2)} s`;
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    updateCar();
    updateTimer();
    renderer.render(scene, camera);
}

animate();
