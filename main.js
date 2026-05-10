import * as THREE from 'three';

// 1. Setup & Camera (Portrait Optimized)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x131313);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// 2. Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5);
scene.add(sun);

// 3. Road & City
const roadGeo = new THREE.PlaneGeometry(10, 10000);
const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const road = new THREE.Mesh(roadGeo, roadMat);
road.rotation.x = -Math.PI / 2;
scene.add(road);

// Side Buildings
for (let i = 0; i < 200; i++) {
    const h = Math.random() * 15 + 5;
    const b = new THREE.Mesh(new THREE.BoxGeometry(4, h, 4), new THREE.MeshStandardMaterial({color: 0x444444}));
    b.position.set(i % 2 ? -8 : 8, h/2, -i * 15);
    scene.add(b);
}

// 4. Player Car
const car = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2), new THREE.MeshStandardMaterial({color: 0xff0000}));
car.add(body);
car.position.y = 0.3;
scene.add(car);

// 5. Traffic & Coins
const traffic = [];
const coins = [];
function spawnItems() {
    for (let i = 1; i < 100; i++) {
        // Traffic Cars (Blue)
        const enemy = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2), new THREE.MeshStandardMaterial({color: 0x0000ff}));
        enemy.position.set((Math.random() - 0.5) * 8, 0.3, -i * 40);
        scene.add(enemy);
        traffic.push(enemy);

        // Yellow Coins
        const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32), new THREE.MeshStandardMaterial({color: 0xffff00}));
        coin.rotation.x = Math.PI / 2;
        coin.position.set((Math.random() - 0.5) * 8, 0.5, -i * 15);
        scene.add(coin);
        coins.push(coin);
    }
}
spawnItems();

// 6. Game States
let speed = 0, score = 0, isLive = true;
let moveL = false, moveR = false, moveG = false;

// Buttons
document.getElementById('leftBtn').onpointerdown = () => moveL = true;
document.getElementById('leftBtn').onpointerup = () => moveL = false;
document.getElementById('rightBtn').onpointerdown = () => moveR = true;
document.getElementById('rightBtn').onpointerup = () => moveR = false;
document.getElementById('gasBtn').onpointerdown = () => moveG = true;
document.getElementById('gasBtn').onpointerup = () => moveG = false;

function update() {
    if (!isLive) return;

    if (moveG) speed += 0.007; else speed *= 0.98;
    if (moveL && car.position.x > -4.5) car.position.x -= 0.15;
    if (moveR && car.position.x < 4.5) car.position.x += 0.15;

    car.position.z -= speed;
    camera.position.set(0, 5, car.position.z + 8);
    camera.lookAt(car.position.x, 0, car.position.z - 5);

    // Collision Detection
    traffic.forEach(en => {
        if (car.position.distanceTo(en.position) < 1.5) {
            isLive = false;
            document.getElementById('gameOverScreen').style.display = 'block';
            document.getElementById('finalScore').innerText = `Total Coins: ${score}`;
        }
    });

    // Coin Collection
    coins.forEach((c, i) => {
        c.rotation.y += 0.05;
        if (car.position.distanceTo(c.position) < 1.2) {
            scene.remove(c);
            coins.splice(i, 1);
            score++;
            document.getElementById('score').innerText = `Coins: ${score}`;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}
animate();
