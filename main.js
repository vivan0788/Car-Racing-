import * as THREE from 'three';

// 1. Scene & Camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// 2. Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(0, 10, 5);
scene.add(dirLight);

// 3. Road & Environment
const trackGeo = new THREE.PlaneGeometry(15, 5000);
const trackMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const track = new THREE.Mesh(trackGeo, trackMat);
track.rotation.x = -Math.PI / 2;
scene.add(track);

// 4. Advanced Car (Body + Wheels for Animation)
const carGroup = new THREE.Group();
const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.5, 2.5), 
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
carGroup.add(carBody);

// Wheels (Basic)
const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
const wheels = [];
const wheelPositions = [[-0.7, -0.1, 0.8], [0.7, -0.1, 0.8], [-0.7, -0.1, -0.8], [0.7, -0.1, -0.8]];

wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...pos);
    carGroup.add(wheel);
    wheels.push(wheel);
});

carGroup.position.y = 0.4;
scene.add(carGroup);

// 5. Coins System
const coins = [];
const coinGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32);
const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });

function spawnCoins() {
    for (let i = 0; i < 50; i++) {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.rotation.x = Math.PI / 2;
        coin.position.set((Math.random() - 0.5) * 10, 0.5, -i * 20 - 20);
        scene.add(coin);
        coins.push(coin);
    }
}
spawnCoins();

// 6. Game State
let speed = 0;
let score = 0;
let isGas = false, isLeft = false, isRight = false;

// Controls
const setupBtn = (id, press) => {
    const btn = document.getElementById(id);
    btn.onpointerdown = () => press(true);
    btn.onpointerup = () => press(false);
};
setupBtn('gasBtn', v => isGas = v);
setupBtn('leftBtn', v => isLeft = v);
setupBtn('rightBtn', v => isRight = v);

function update() {
    // Speed Logic
    if (isGas) speed += 0.005;
    else speed *= 0.98;

    // 7. Driving Animation (Leaning Effect)
    if (isLeft) {
        carGroup.position.x -= 0.12;
        carBody.rotation.z = THREE.MathUtils.lerp(carBody.rotation.z, 0.15, 0.1); // Lean left
        carBody.rotation.y = THREE.MathUtils.lerp(carBody.rotation.y, 0.1, 0.1);  // Turn front
    } else if (isRight) {
        carGroup.position.x += 0.12;
        carBody.rotation.z = THREE.MathUtils.lerp(carBody.rotation.z, -0.15, 0.1); // Lean right
        carBody.rotation.y = THREE.MathUtils.lerp(carBody.rotation.y, -0.1, 0.1);
    } else {
        carBody.rotation.z = THREE.MathUtils.lerp(carBody.rotation.z, 0, 0.1);
        carBody.rotation.y = THREE.MathUtils.lerp(carBody.rotation.y, 0, 0.1);
    }

    // Wheel Rotation
    wheels.forEach(w => w.rotation.x -= speed * 2);

    carGroup.position.z -= speed;
    camera.position.set(carGroup.position.x * 0.5, 4, carGroup.position.z + 8);
    camera.lookAt(carGroup.position);

    // 8. Coin Collection & Rotation
    coins.forEach((coin, index) => {
        coin.rotation.y += 0.05; // Spin coin
        
        // Distance check (Collision)
        const dist = carGroup.position.distanceTo(coin.position);
        if (dist < 1.5) {
            scene.remove(coin);
            coins.splice(index, 1);
            score += 10;
            document.getElementById('speed').innerText = `Score: ${score} | Speed: ${Math.round(speed * 1000)}`;
        }
    });

    if (coins.length === 0) spawnCoins(); // Respawn if all collected
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}
animate();
