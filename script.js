
import * as THREE from 'three';


let track, startLine, finishLine, obstacles = [];

const scene = new THREE.Scene();
const viewportSize = {
    width: 800,
    height: 600
};


const camera = new THREE.PerspectiveCamera(
    100,
    viewportSize.width / viewportSize.height
);


const canvas = document.querySelector('canvas#webgl');


const renderer = new THREE.WebGLRenderer({
    canvas,
});

renderer.setSize(viewportSize.width, viewportSize.height);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const FondTexture = new THREE.TextureLoader().load(`img/fff.jpg`);
scene.background = FondTexture;
const loader = new THREE.CubeTextureLoader();
loader.load([
    'img/fff.jpg',
], function(texture) {
    scene.background = texture;
}, undefined, function(error) {
    console.error('An error occurred while loading the skybox texture:', error);
});


const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('img/Stylized_Stone_Floor_005_basecolor.jpg');
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);


const groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);


createTrack();
let car= [];

// voiture
const carTexture = new THREE.TextureLoader().load('img/car-top-view-clipart-design-illustration-free-png.webp');
const carMaterial = new THREE.MeshBasicMaterial({ map: carTexture });
const carGeometry = new THREE.BoxGeometry(2, 1, 6);
car = new THREE.Mesh(carGeometry, carMaterial);
car.position.set(0, 1, -85);
car.hasCrossedFinishLine = false;
scene.add(car);


// depart
let startLineGeometry = new THREE.PlaneGeometry(10, 50);
let startLineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
startLine.rotation.x = -Math.PI / 2;
startLine.position.z = -70;
startLine.position.y = 0.1;
scene.add(startLine);

// fin
let finishLineGeometry = new THREE.PlaneGeometry(10, 50);
let finishLineMaterial = new THREE.MeshBasicMaterial({ color: 0xff0010 });
finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
finishLine.rotation.x = -Math.PI / 2;
finishLine.position.z = -70;
finishLine.position.x = -15;
finishLine.position.y = 0.1;
scene.add(finishLine);

// camera position
camera.position.set(0, 10, -20);
camera.lookAt(car.position);


// chrono
let  timerInterval;
let startTime;
startTime = Date.now();
timerInterval = setInterval(updateTimer, 1000);
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}
let ResetTime;

let timerElement = document.getElementById('timer');
// maj chrono
function updateTimer() {
    ResetTime = Math.floor((Date.now() - startTime) / 1000);
    timerElement.textContent = `Time: ${ResetTime}s`;
}

// obstacle
function createObstacle(x, z) {
    let obstacleGeometry = new THREE.BoxGeometry(3, 10, 5);
    let obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0x563b29 });
    let obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(x, 5, z);
    scene.add(obstacle);
    obstacles.push(obstacle);
}



// creation circuit
function createTrack() {
    let trackGeometry = new THREE.CircleGeometry(0, 0);
    let trackMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: false });
    track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);

    let outerBarrierMaterial = new THREE.MeshBasicMaterial({ color: 0x2e2017 });
    let numBarriers = 36;
    let radius = 95;
    let barrierHeight = 5;
    for (let i = 0; i < numBarriers; i++) {
        let angle = (i / numBarriers) * Math.PI * 2;
        let x = radius * Math.cos(angle);
        let z = radius * Math.sin(angle);
        let barrierGeometry = new THREE.BoxGeometry(1, barrierHeight, 17);
        let barrier = new THREE.Mesh(barrierGeometry, outerBarrierMaterial);
        barrier.position.set(x, barrierHeight / 2, z);
        barrier.rotation.y = -angle;
        scene.add(barrier);
        obstacles.push(barrier);
    }

    let innerBarrierMaterial = new THREE.MeshBasicMaterial({ color: 0x2e2017 });
    let innerNumBarriers = 36;
    let innerRadius = 60;
    for (let i = 0; i < innerNumBarriers; i++) {
        let angle = (i / innerNumBarriers) * Math.PI * 2;
        let x = innerRadius * Math.cos(angle);
        let z = innerRadius * Math.sin(angle);
        let barrierGeometry = new THREE.BoxGeometry(1, barrierHeight, 20);
        let barrier = new THREE.Mesh(barrierGeometry, innerBarrierMaterial);
        barrier.position.set(x, barrierHeight / 2, z);
        barrier.rotation.y = -angle;
        scene.add(barrier);
        obstacles.push(barrier);
    }

    createObstacle(80, 0);
    createObstacle(0, 65);
    createObstacle(30, -70);
    createObstacle(-50, 50);
    createObstacle(-20, 80);
    createObstacle(-80, 20);
    createObstacle(10, 70);
    createObstacle(-60, -20);
    createObstacle(65, -10);
}


let keys = {};
// reset jeu
function resetGame() {
    car.position.set(0, 1, -85);
    car.hasCrossedFinishLine = false;
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    keys = {};
}

let carDirection = new THREE.Vector3(0, 0, 1);
// maj jeu
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

    obstacles.forEach(obstacle => {
        if (car.position.distanceTo(obstacle.position) < 5) {
            alert('Game Over!');
            resetGame();
        }
    });
    checkFinishLine();
}

// maj camera 
function updateCamera() {
    let relativeCameraOffset = new THREE.Vector3(0, 10, -20);
    let cameraOffset = relativeCameraOffset.applyMatrix4(car.matrixWorld);
    camera.position.copy(cameraOffset);
    camera.lookAt(car.position);
}

// check la ligne arrivee
function checkFinishLine() {
    const distanceToFinishLine = car.position.distanceTo(new THREE.Vector3(finishLine.position.x, car.position.y, finishLine.position.z));
    const withinFinishLineThreshold = distanceToFinishLine < 5;
    let points = 100000 / ResetTime;

    if (withinFinishLineThreshold && !car.hasCrossedFinishLine) {
        alert(`Race completed! Your time: ${ResetTime}s\nScore : ${points}`);
        car.hasCrossedFinishLine = true;
        resetGame();
    }
}




// permet gestionnaire evenement clavier
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

animate();