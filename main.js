import * as THREE from 'three';

// 1. Scene & Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122); // Night City Look
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// 2. Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 7);
scene.add(sun);

// 3. The Road (With White Lines)
const roadGroup = new THREE.Group();
const roadGeo = new THREE.PlaneGeometry(12, 5000);
const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const road = new THREE.Mesh(roadGeo, roadMat);
road.rotation.x = -Math.PI / 2;
roadGroup.add(road);

// Center Lines
for (let i = 0; i < 500; i++) {
    const lineGeo = new THREE.PlaneGeometry(0.2, 2);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.02, -i * 10);
    roadGroup.add(line);
}
scene.add(roadGroup);

// 4. Buildings (City Generation)
function createCity() {
    for (let i = 0; i < 100; i++) {
        const h = Math.random() * 20 + 5;
        const bGeo = new THREE.BoxGeometry(5, h, 5);
        const bMat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        
        // Left Buildings
        const bLeft = new THREE.Mesh(bGeo, bMat);
        bLeft.position.set(-12, h/2, -i * 30);
        scene.add(bLeft);

        // Right Buildings
        const bRight = new THREE.Mesh(bGeo, bMat);
        bRight.position.set(12, h/2, -i * 30);
        scene.add(bRight);
    }
}
createCity();

// 5. Car Setup
const carGroup = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 2.5), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
carGroup.add(body);
carGroup.position.y = 0.3;
scene.add(carGroup);

// 6. Logic Variables
let speed = 0;
let isGas = false, isLeft = false, isRight = false;
const ROAD_LIMIT = 5.3; // Car is raste se bahar nahi jayegi

// Mobile Button Listeners
const setupBtn = (id, press) => {
    const btn = document.getElementById(id);
    btn.onpointerdown = () => press(true);
    btn.onpointerup = () => press(false);
};
setupBtn('gasBtn', v => isGas = v);
setupBtn('leftBtn', v => isLeft = v);
setupBtn('rightBtn', v => isRight = v);

function update() {
    // Speed & Friction
    if (isGas) speed += 0.006;
    else speed *= 0.97;

    // 7. STEERING & BOUNDARY (Limit car to road)
    if (isLeft && carGroup.position.x > -ROAD_LIMIT) {
        carGroup.position.x -= 0.15;
        body.rotation.z = 0.1; 
    } else if (isRight && carGroup.position.x < ROAD_LIMIT) {
        carGroup.position.x += 0.15;
        body.rotation.z = -0.1;
    } else {
        body.rotation.z = 0;
    }

    // Move Car
    carGroup.position.z -= speed;

    // Smooth Camera Follow
    camera.position.lerp(new THREE.Vector3(carGroup.position.x, 4, carGroup.position.z + 8), 0.1);
    camera.lookAt(carGroup.position);

    document.getElementById('speed').innerText = `Speed: ${Math.round(speed * 1000)}`;
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}
animate();
