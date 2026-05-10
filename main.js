import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Environment (Road & Buildings)
const road = new THREE.Mesh(new THREE.PlaneGeometry(12, 10000), new THREE.MeshStandardMaterial({color: 0x222222}));
road.rotation.x = -Math.PI / 2;
scene.add(road);

for (let i = 0; i < 150; i++) {
    const h = Math.random() * 20 + 5;
    const b = new THREE.Mesh(new THREE.BoxGeometry(5, h, 5), new THREE.MeshStandardMaterial({color: 0x333344}));
    b.position.set(i % 2 ? -12 : 12, h/2, -i * 25);
    scene.add(b);
}

// Car
const car = new THREE.Group();
const carBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 2.5), new THREE.MeshStandardMaterial({color: 0xff0000}));
car.add(carBody);
car.position.y = 0.3;
scene.add(car);

// Traffic & Coins
const traffic = []; const coins = [];
for (let i = 1; i < 150; i++) {
    const enemy = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 2.5), new THREE.MeshStandardMaterial({color: 0x0077ff}));
    enemy.position.set((Math.random() - 0.5) * 9, 0.3, -i * 50);
    scene.add(enemy); traffic.push(enemy);

    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32), new THREE.MeshStandardMaterial({color: 0xffff00}));
    coin.rotation.x = Math.PI / 2;
    coin.position.set((Math.random() - 0.5) * 9, 0.5, -i * 20);
    scene.add(coin); coins.push(coin);
}

// Game State & Reverse Logic
let speed = 0, score = 0, isLive = true;
let moveL = false, moveR = false, moveG = false, moveRev = false;

const setup = (id, fn) => {
    const b = document.getElementById(id);
    b.onpointerdown = () => fn(true);
    b.onpointerup = () => fn(false);
};
setup('leftBtn', v => moveL = v); setup('rightBtn', v => moveR = v);
setup('gasBtn', v => moveG = v); setup('revBtn', v => moveRev = v);

function update() {
    if (!isLive) return;

    // Movement Logic
    if (moveG) speed += 0.008; 
    else if (moveRev) speed -= 0.005; // REVERSE
    else speed *= 0.98; // Friction

    if (moveL && car.position.x > -5) car.position.x -= 0.15;
    if (moveR && car.position.x < 5) car.position.x += 0.15;

    car.position.z -= speed;
    camera.position.set(car.position.x * 0.6, 4, car.position.z + 8);
    camera.lookAt(car.position.x, 1, car.position.z - 5);

    // Collisions
    traffic.forEach(en => {
        if (car.position.distanceTo(en.position) < 1.8) {
            isLive = false;
            document.getElementById('gameOverScreen').style.display = 'block';
            document.getElementById('finalScore').innerText = `Total Coins: ${score}`;
        }
    });

    coins.forEach((c, i) => {
        c.rotation.y += 0.05;
        if (car.position.distanceTo(c.position) < 1.3) {
            scene.remove(c); coins.splice(i, 1);
            score++; document.getElementById('score').innerText = `Coins: ${score}`;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
