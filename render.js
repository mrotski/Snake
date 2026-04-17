function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // ⭐ TÄHDET TAUSTALLE
    drawStars(ctx, canvas);

    // 💥 PARTICLES
ctx.save();
ctx.globalCompositeOperation = "lighter";
ctx.shadowBlur = 12;
particles.forEach(p=>{
    const t = Math.max(0, Math.min(1, p.life / (p.ttl || 1)));
    const alpha = Math.pow(t, 1.6);
    const radius = (p.size || 2) * (1.1 + (1 - t) * 0.9);

    // Outer glow
    ctx.shadowColor = `hsla(${p.hue || 40}, 100%, 60%, ${alpha * 0.55})`;
    ctx.fillStyle = `hsla(${p.hue || 40}, 100%, 55%, ${alpha * 0.25})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Core ember
    ctx.shadowBlur = 18;
    ctx.shadowColor = `hsla(${p.hue || 40}, 100%, 70%, ${alpha * 0.85})`;
    ctx.fillStyle = `hsla(${p.hue || 40}, 100%, 65%, ${alpha * 0.85})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Hot center speck
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.35})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.8, radius * 0.35), 0, Math.PI * 2);
    ctx.fill();
});
ctx.restore();

    // FOOD
    ctx.fillStyle="cyan";
    ctx.fillRect(food.x*tileSize,food.y*tileSize,tileSize,tileSize);

    // SNAKE
    ctx.fillStyle=snakeColor;
    snake.forEach(seg=>{
        ctx.fillRect(seg.x*tileSize,seg.y*tileSize,tileSize,tileSize);
    });
}
