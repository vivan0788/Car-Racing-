const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ---------------- PLAYER ----------------
let car = {
    x: canvas.width / 2,
    y: canvas.height - 180,
    w: 60,
    h: 120,
    speed: 7,
    type: 0
};

// ---------------- GAME DATA ----------------
let traffic = [];
let coins = 0;
let score = 0;
let highScore = localStorage.getItem("high") || 0;

let weather = "normal"; // rain / night / normal

let keys = {};

// ---------------- CAR SKINS ----------------
let cars = ["red", "blue", "green"];

// ---------------- INPUT ----------------
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Touch support
document.addEventListener("touchmove", e => {
    let x = e.touches[0].clientX;
    car.x = x - car.w / 2;
});

// ---------------- TRAFFIC ----------------
function spawnTraffic() {

    traffic.push({
        x: Math.random() * (canvas.width - 60),
        y: -120,
        w: 60,
        h: 120,
        speed: 5 + Math.random() * 4
    });
}

// ---------------- COIN ----------------
let coinObj = {
    x: Math.random() * canvas.width,
    y: -200
};

// ---------------- COLLISION ----------------
function collide(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

// ---------------- UPDATE ----------------
function update() {

    // Movement
    if (keys["ArrowLeft"]) car.x -= car.speed;
    if (keys["ArrowRight"]) car.x += car.speed;

    if (car.x < 0) car.x = 0;
    if (car.x > canvas.width - car.w) car.x = canvas.width - car.w;

    // Traffic
    traffic.forEach((t, i) => {
        t.y += t.speed;

        if (collide(car, t)) {
            gameOver();
        }

        if (t.y > canvas.height) {
            traffic.splice(i, 1);
            score++;
        }
    });

    // Coin logic
    coinObj.y += 6;

    if (collide(car, coinObj)) {
        coins += 1;
        coinObj.y = -200;
        coinObj.x = Math.random() * canvas.width;
    }

    if (coinObj.y > canvas.height) {
        coinObj.y = -200;
        coinObj.x = Math.random() * canvas.width;
    }

    // Spawn traffic
    if (Math.random() < 0.03) {
        spawnTraffic();
    }

    // Weather switch
    if (score % 20 === 0 && score > 0) {
        weather = "rain";
    }
}

// ---------------- DRAW ----------------
function draw() {

    // Background
    if (weather === "night") ctx.fillStyle = "#111";
    else ctx.fillStyle = "#333";

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rain effect
    if (weather === "rain") {
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        for (let i = 0; i < 100; i++) {
            ctx.fillRect(Math.random() * canvas.width,
                         Math.random() * canvas.height,
                         2, 10);
        }
    }

    // Road
    ctx.fillStyle = "white";
    for (let i = 0; i < 10; i++) {
        ctx.fillRect(canvas.width/2 - 5, i * 120, 10, 60);
    }

    // Player car
    ctx.fillStyle = cars[car.type];
    ctx.fillRect(car.x, car.y, car.w, car.h);

    // Traffic
    ctx.fillStyle = "blue";
    traffic.forEach(t => {
        ctx.fillRect(t.x, t.y, t.w, t.h);
    });

    // Coin
    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.arc(coinObj.x, coinObj.y, 10, 0, Math.PI*2);
    ctx.fill();

    // UI
    ctx.fillStyle = "yellow";
    ctx.font = "24px Arial";

    ctx.fillText("Score: " + score, 20, 40);
    ctx.fillText("Coins: " + coins, 20, 70);
    ctx.fillText("High: " + highScore, 20, 100);
}

// ---------------- GAME OVER ----------------
function gameOver() {

    if (score > highScore) {
        localStorage.setItem("high", score);
    }

    alert("Game Over! Score: " + score);

    location.reload();
}

// ---------------- LOOP ----------------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
