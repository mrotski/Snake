const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const stars = [];
const STAR_COUNT = 80;

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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {
    resizeGameCanvas();
    updateGrid();
});

const gridSize=25;
let tileSize;
let tilesX;
let tilesY;

function updateGrid(){
    const base = 25; // mitä isompi = isommat ruudut

    tileSize = Math.floor(Math.min(
        canvas.width / base,
        canvas.height / base
    ));

    tilesX = Math.floor(canvas.width / tileSize);
    tilesY = Math.floor(canvas.height / tileSize);
}
resizeGameCanvas();
updateGrid();
canvas.width=gridSize*tileSize;
canvas.height=gridSize*tileSize;

let snake,direction,nextDirection,food;
let shrinkTimer=0;
let gameStarted=false;
let paused=false;

let score=0;
let highScore=localStorage.getItem("snakeHighScore")||0;
document.getElementById("highScore").textContent=highScore;

let snakeColor=localStorage.getItem("snakeColor")||"#00FF00";

const bgMusic=document.getElementById("bgMusic");

const speed=6;
let lastTime=0;
let accumulator=0;

function resetGame(){
    snake=[{x:12,y:12},{x:11,y:12},{x:10,y:12}];
    direction={x:1,y:0};
    nextDirection={x:1,y:0};
    spawnFood();
    score=0;
    updateScore();
    shrinkTimer=0;
}

function spawnFood(){
    food = {
        x: Math.floor(Math.random() * tilesX),
        y: Math.floor(Math.random() * tilesY)
    };
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
    paused=!paused;
    document.getElementById("overlay").style.display=paused?"flex":"none";
}

function update(){

    if(snake.length===0)return;

    direction=nextDirection;

    const head={
        x:snake[0].x+direction.x,
        y:snake[0].y+direction.y
    };

    if(head.x < 0 || head.x >= tilesX || head.y < 0 || head.y >= tilesY){
        gameOver();

        shrinkTimer++;

        if(shrinkTimer%2===0&&snake.length>0){
            snake.pop();
        }

        if(snake.length===0){
            setTimeout(()=>resetGame(),200);
        }

        return;

    }else{
        shrinkTimer=0;
    }

    snake.unshift(head);

    if(head.x===food.x&&head.y===food.y){
        score++;
        updateScore();
        spawnFood();
    }else{
        snake.pop();
    }
}

function gameLoop(timestamp){
    if(!gameStarted)return;
    requestAnimationFrame(gameLoop);

    if(paused){
        lastTime=timestamp;
        return;
    }

    if(!lastTime)lastTime=timestamp;
    const delta=(timestamp-lastTime)/1000;
    lastTime=timestamp;
    accumulator+=delta;

    const step=1/speed;
    while(accumulator>=step){
        update();
        accumulator-=step;
    }

    draw();
}