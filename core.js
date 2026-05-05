const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const overlayEl = document.getElementById("overlay");
const stars = [];
const STAR_COUNT = 80;

let isDying = false;
let respawnTimer = null;

function gameOver(){
    if(isDying) return;

    explodeSnake();

    isDying = true;
    gameStarted = false; // estää inputin

    // Reset the timing so we don't "fast forward" after death.
    accumulator = 0;
    lastTime = 0;

    clearTimeout(respawnTimer);
    respawnTimer = setTimeout(()=>{
        resetGame();
        gameStarted = true;
        isDying = false;
    }, 650);
}

function initStars(){
    stars.length = 0;

    for(let i=0;i<STAR_COUNT;i++){
        stars.push({
            x: Math.random(),
            y: Math.random(),
            size: Math.random()*1.2,
            alpha: Math.random()*0.4 + 0.1
        });
    }
}

function drawStars(ctx, canvas){
    for(let s of stars){
        // twinkle
        s.alpha += (Math.random()-0.5)*0.01;
        if(s.alpha < 0.1) s.alpha = 0.1;
        if(s.alpha > 0.5) s.alpha = 0.5;

        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fillRect(
            s.x * canvas.width,
            s.y * canvas.height,
            s.size,
            s.size
        );
    }
}

function resizeGameCanvas(){
    // Allow rendering at a chosen internal resolution while keeping CSS size fullscreen.
    // Only applied while in fullscreen.
    const desired = (document.fullscreenElement && window.snakeResolution && window.snakeResolution.w && window.snakeResolution.h)
        ? window.snakeResolution
        : null;

    canvas.width = desired ? desired.w : window.innerWidth;
    canvas.height = desired ? desired.h : window.innerHeight;
}

window.addEventListener("resize", () => {
    resizeGameCanvas();
    updateGrid();
});

const gridSize=25;
let tileSize;
let tilesX;
let tilesY;
let particles = [];
const PARTICLE_GRAVITY = 0.22; // px per frame^2 (@60fps)
const PARTICLE_FRICTION = 0.985;

function updateGrid(){
    // gridSize = how many tiles fit in the smaller dimension
    tileSize = Math.floor(Math.min(canvas.width, canvas.height) / gridSize);
    if(!Number.isFinite(tileSize) || tileSize <= 0) tileSize = 1;

    tilesX = Math.floor(canvas.width / tileSize);
    tilesY = Math.floor(canvas.height / tileSize);
}
resizeGameCanvas();
updateGrid();

function explodeSnake(){
    particles = [];

    (snake || []).forEach(seg=>{
        const cx = (seg.x + 0.5) * tileSize;
        const cy = (seg.y + 0.5) * tileSize;

        // More particles for head-ish segments to make the explosion feel punchier.
        const burst = 10;

        for(let i=0;i<burst;i++){
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() ** 0.35) * 8.5 + 1.0;
            const size = Math.random() * 2.8 + 1.4;
            const ttl = 35 + Math.floor(Math.random() * 25);
            const hue = (Math.random() * 60) + 20; // warm fire range

            particles.push({
                x: cx + (Math.random() - 0.5) * tileSize * 0.35,
                y: cy + (Math.random() - 0.5) * tileSize * 0.35,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (Math.random() * 2.2),
                size,
                hue,
                life: ttl,
                ttl
            });
        }
    });
}

let snake,direction,nextDirection,food;
let shrinkTimer=0;
let gameStarted=false;
let paused=false;
let lastTime = 0;
let tickRate = 120; // ms per move (pienempi = nopeampi)
let accumulator = 0;
let rafId = null;
let loopActive = false;

let score=0;
let highScore=localStorage.getItem("snakeHighScore")||0;
document.getElementById("highScore").textContent=highScore;

let snakeColor=localStorage.getItem("snakeColor")||"#00FF00";

const bgMusic=document.getElementById("bgMusic");

function resetGame(){

    // Ensure canvas + grid match current viewport (fullscreen / resize).
    resizeGameCanvas();
    updateGrid();

    snake = [{
        x: Math.floor(tilesX / 2),
        y: Math.floor(tilesY / 2)
    }];

    direction = {x:1,y:0};
    nextDirection = {x:1,y:0};

    spawnFood();

    score = 0;
    updateScore();

    accumulator = 0;
    lastTime = 0;
}

function spawnFood(){
    // Avoid spawning on the snake.
    const occupied = new Set((snake || []).map(s => `${s.x},${s.y}`));
    let x, y;
    let tries = 0;

    do{
        const minX = (tilesX > 2) ? 1 : 0;
        const maxX = (tilesX > 2) ? (tilesX - 2) : (tilesX - 1);
        const minY = (tilesY > 2) ? 1 : 0;
        const maxY = (tilesY > 2) ? (tilesY - 2) : (tilesY - 1);

        x = Math.floor(minX + Math.random() * (maxX - minX + 1));
        y = Math.floor(minY + Math.random() * (maxY - minY + 1));
        tries++;
        if(tries > 1000) break;
    }while(occupied.has(`${x},${y}`));

    food = { x, y };
}

function updateScore(){
    document.getElementById("score").textContent=score;
    if(score>highScore){
        highScore=score;
        localStorage.setItem("snakeHighScore",highScore);
        document.getElementById("highScore").textContent=highScore;
    }
}

function togglePause(){
    if(!gameStarted) return;
    paused = !paused;
    overlayEl.style.display = paused ? "flex" : "none";
}

function startGameLoop(){
    if(loopActive) return;
    loopActive = true;
    lastTime = 0;
    accumulator = 0;
    rafId = requestAnimationFrame(gameLoop);
}

function stopGameLoop(){
    loopActive = false;
    if(rafId !== null){
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    clearTimeout(respawnTimer);
    respawnTimer = null;
    isDying = false;
    lastTime = 0;
    accumulator = 0;
}

function update(){
    if(!gameStarted || paused || isDying) return;
    if(!snake || snake.length === 0) return;

    direction=nextDirection;

    const head={
        x:snake[0].x+direction.x,
        y:snake[0].y+direction.y
    };

    const willGrow = (head.x===food.x && head.y===food.y);

if(
    head.x < 0 ||
    head.x >= tilesX ||
    head.y < 0 ||
    head.y >= tilesY
){
    gameOver();
    return;
}

    // Self-collision: moving into the tail is allowed if we're not growing this tick.
    const bodyCheckCount = snake.length - (willGrow ? 0 : 1);
    for(let i=0;i<bodyCheckCount;i++){
        if(snake[i].x === head.x && snake[i].y === head.y){
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    if(willGrow){
        score++;
        updateScore();
        spawnFood();
    }else{
        snake.pop();
    }
}

function gameLoop(time){
    if(!loopActive) return;

    if(!lastTime) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;

    // Animate particles even during death/pause for smoother feel.
    const dt = Math.min(50, Math.max(0, delta)) / 16.6667; // scale to ~60fps steps
    particles.forEach(p=>{
        // gravity + drag
        p.vy += PARTICLE_GRAVITY * dt;
        p.vx *= Math.pow(PARTICLE_FRICTION, dt);
        p.vy *= Math.pow(PARTICLE_FRICTION, dt);

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        p.life -= dt;
    });
    particles = particles.filter(p=>p.life > 0);

    if(gameStarted && !paused && !isDying){
        accumulator += delta;

        // 🐍 snake liikkuu vain tietyin välein
        while(accumulator >= tickRate){
            update();
            accumulator -= tickRate;
        }
    }else{
        // Prevent "catch-up" after pause/death.
        accumulator = 0;
    }

    draw(); // piirretään aina (smooth)
    rafId = requestAnimationFrame(gameLoop);
}
