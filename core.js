const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

const gridSize=25;
const tileSize=24;
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
    food={
        x:Math.floor(Math.random()*gridSize),
        y:Math.floor(Math.random()*gridSize)
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

    if(head.x<0||head.y<0||head.x>=gridSize||head.y>=gridSize){

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