function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="cyan";
    ctx.fillRect(food.x*tileSize,food.y*tileSize,tileSize,tileSize);

    ctx.fillStyle=snakeColor;
    snake.forEach(seg=>{
        ctx.fillRect(seg.x*tileSize,seg.y*tileSize,tileSize,tileSize);
    });
}