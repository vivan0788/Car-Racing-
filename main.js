import * as THREE from 'three';

// 1. Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// 2. Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 5);
scene.add(light);

// 3. Track (Road)
const trackGeo = new THREE.PlaneGeometry(15, 2000);
const trackMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const track = new THREE.Mesh(trackGeo, trackMat);
track.rotation.x = -Math.PI / 2;
scene.add(track);

// 4. Car (Simple Model)
const carGroup = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 2.5), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
carGroup.add(body);
carGroup.position.y = 0.3;
scene.add(carGroup);

camera.position.set(0, 4, 8);

// 5. Game Logic & Mobile Controls
let speed = 0;
let isGas = false;
let isLeft = false;
let isRight = false;

// Button Listeners
const setupBtn = (id, press) => {
    const btn = document.getElementById(id);
    btn.onpointerdown = () => press(true);
    btn.onpointerup = () => press(false);
    btn.onpointerleave = () => press(false);
};

setupBtn('gasBtn', (v) => isGas = v);
setupBtn('leftBtn', (v) => isLeft = v);
setupBtn('rightBtn', (v) => isRight = v);

function update() {
    // Acceleration logic
    if (isGas) speed += 0.005;
    else speed *= 0.98; // Friction (slow down)

    // Steering
    if (isLeft) carGroup.position.x -= 0.1;
    if (isRight) carGroup.position.x += 0.1;

    // Boundary (Road se bahar na jaye)
    carGroup.position.x = Math.max(-6, Math.min(6, carGroup.position.x));

    // Move Car & Camera
    carGroup.position.z -= speed;
    camera.position.z = carGroup.position.z + 8;
    camera.lookAt(carGroup.position);

    document.getElementById('speed').innerText = `Speed: ${Math.round(speed * 1000)}`;
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// Handle Screen Resize
window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

animate();
