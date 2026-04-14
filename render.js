function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // ⭐ TÄHDET TAUSTALLE
    drawStars(ctx, canvas);

    // FOOD
    ctx.fillStyle="cyan";
    ctx.fillRect(food.x*tileSize,food.y*tileSize,tileSize,tileSize);

    // SNAKE
    ctx.fillStyle=snakeColor;
    snake.forEach(seg=>{
        ctx.fillRect(seg.x*tileSize,seg.y*tileSize,tileSize,tileSize);
    });
}