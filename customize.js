const customOverlay=document.getElementById("customOverlay");
const previewCanvas=document.getElementById("previewCanvas");
const pctx=previewCanvas.getContext("2d");
const palette=document.getElementById("colorPalette");
const shapeRectBtn=document.getElementById("shapeRectBtn");
const shapeRoundBtn=document.getElementById("shapeRoundBtn");
const shapeRectPreview=document.getElementById("shapeRectPreview");
const shapeRoundPreview=document.getElementById("shapeRoundPreview");

const colorGroups = [

    { name: "Classic", colors: [
        "#00FF00", // Green
        "#FF0000", // Red
        "#0000FF", // Blue
        "#FFFF00", // Yellow
        "#00FFFF", // Cyan
        "#FF00FF"  // Magenta
    ]},

    { name: "Bright", colors: [
        "#FF6B6B", // Soft Red
        "#4D96FF", // Soft Blue
        "#6BCB77", // Soft Green
        "#FFD93D", // Warm Yellow
        "#FF8E3C", // Orange
        "#B983FF"  // Purple
    ]},

    { name: "Neon", colors: [
        "#39FF14", // Neon Green
        "#00E5FF", // Neon Cyan
        "#FF2ED1", // Neon Pink
        "#FF3131", // Neon Red
        "#FFF01F"  // Neon Yellow
    ]},

    { name: "Pastel", colors: [
        "#A8E6CF", // Mint
        "#FFD3B6", // Peach
        "#D5AAFF"  // Lavender
    ]},

    { name: "Extra", colors: [
        "#FFFFFF", // White
        "#AAAAAA", // Gray
        "#FFA500", // Orange Classic
        "#8A2BE2"  // Violet
    ]}

];

let activeGroupIndex = 0;
let previewRafId = null;

function findGroupIndexForColor(color){
    const idx = colorGroups.findIndex(g => g.colors.includes(color));
    return idx >= 0 ? idx : 0;
}

function renderColorMenu(){
    if(!palette) return;

    activeGroupIndex = findGroupIndexForColor(snakeColor);

    // The CSS expects #colorPalette to directly contain swatches (grid).
    // If we add wrappers for categories, we must override the container layout.
    palette.innerHTML = "";
    palette.style.display = "block";

    const categoryBar = document.createElement("div");
    categoryBar.style.display = "flex";
    categoryBar.style.flexWrap = "wrap";
    categoryBar.style.gap = "10px";
    categoryBar.style.marginBottom = "16px";

    const swatchGrid = document.createElement("div");
    swatchGrid.style.display = "grid";
    swatchGrid.style.gridTemplateColumns = "repeat(8, 40px)";
    swatchGrid.style.gap = "10px";
    swatchGrid.style.alignItems = "center";

    function renderSwatches(){
        swatchGrid.innerHTML = "";

        const group = colorGroups[activeGroupIndex] || colorGroups[0];
        if(!group) return;

        group.colors.forEach(color => {
            const swatch = document.createElement("div");
            swatch.className = "colorSwatch";
            swatch.style.backgroundColor = color;

            if(color.toLowerCase() === String(snakeColor).toLowerCase()){
                swatch.style.border = "2px solid white";
            }

            swatch.onclick = () => {
                snakeColor = color;
                localStorage.setItem("snakeColor", color);
                renderSwatches();
                drawPreview();
            };

            swatchGrid.appendChild(swatch);
        });
    }

    colorGroups.forEach((group, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = group.name;

        // Override the global button style to make these behave like tabs.
        btn.style.padding = "8px 12px";
        btn.style.fontSize = "14px";
        btn.style.borderRadius = "10px";
        btn.style.background = (index === activeGroupIndex) ? "#2a2a2a" : "#151515";
        btn.style.color = "white";
        btn.style.border = (index === activeGroupIndex) ? "2px solid white" : "2px solid #333";

        btn.onclick = () => {
            activeGroupIndex = index;

            // Update tab styles without re-creating everything.
            Array.from(categoryBar.children).forEach((child, i) => {
                const el = child;
                el.style.background = (i === activeGroupIndex) ? "#2a2a2a" : "#151515";
                el.style.border = (i === activeGroupIndex) ? "2px solid white" : "2px solid #333";
            });

            renderSwatches();
        };

        categoryBar.appendChild(btn);
    });

    palette.appendChild(categoryBar);
    palette.appendChild(swatchGrid);
    renderSwatches();
}

function drawShapePreview(canvas, shape){
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    const size = 18;
    const gap = 4;
    const blocks = 3;
    const totalW = blocks*size + (blocks-1)*gap;
    const x0 = Math.floor((canvas.width-totalW)/2);
    const y0 = Math.floor((canvas.height-size)/2);

    ctx.fillStyle = snakeColor;
    if(shape === "round"){
        const r = size*0.5;
        for(let i=0;i<blocks;i++){
            const cx = x0 + i*(size+gap) + r;
            const cy = y0 + r;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI*2);
            ctx.fill();
        }
    }else{
        for(let i=0;i<blocks;i++){
            ctx.fillRect(x0+i*(size+gap), y0, size, size);
        }
    }
}

function renderShapeMenu(){
    if(!shapeRectBtn || !shapeRoundBtn) return;

    const shape = (typeof snakeShape === "string") ? snakeShape : "rect";
    shapeRectBtn.classList.toggle("active", shape !== "round");
    shapeRoundBtn.classList.toggle("active", shape === "round");

    drawShapePreview(shapeRectPreview, "rect");
    drawShapePreview(shapeRoundPreview, "round");

    shapeRectBtn.onclick = () => {
        snakeShape = "rect";
        localStorage.setItem("snakeShape", snakeShape);
        renderShapeMenu();
        drawPreview();
    };

    shapeRoundBtn.onclick = () => {
        snakeShape = "round";
        localStorage.setItem("snakeShape", snakeShape);
        renderShapeMenu();
        drawPreview();
    };
}

function drawPreview(){
    pctx.clearRect(0,0,previewCanvas.width,previewCanvas.height);

    const size=28;
    const blocks=4;
    const totalW=size*blocks;
    const x0=Math.floor((previewCanvas.width-totalW)/2);
    const y0=Math.floor((previewCanvas.height-size)/2);

    pctx.fillStyle=snakeColor;
    const shape = (typeof snakeShape === "string") ? snakeShape : "rect";
    if(shape === "round"){
        const r = size*0.5;
        for(let i=0;i<blocks;i++){
            const cx = x0 + i*size + r;
            const cy = y0 + r;
            pctx.beginPath();
            pctx.arc(cx, cy, r, 0, Math.PI*2);
            pctx.fill();
        }
    }else{
        for(let i=0;i<blocks;i++){
            pctx.fillRect(x0+i*size,y0,size,size);
        }
    }
}

document.getElementById("customBtn").onclick=()=>{
    window.setMainMenuVisible ? window.setMainMenuVisible(false) : (mainMenu.style.display="none");
    window.setOverlayOpen ? window.setOverlayOpen(customOverlay, true) : customOverlay.classList.add("is-open");

    renderColorMenu();
    renderShapeMenu();
    window.updateMobileControlsVisibility?.();

    // Static preview: draw once on open, redraw on color change.
    drawPreview();
};

document.getElementById("closeCustom").onclick=()=>{
    window.setOverlayOpen ? window.setOverlayOpen(customOverlay, false) : customOverlay.classList.remove("is-open");
    window.setMainMenuVisible ? window.setMainMenuVisible(true) : (mainMenu.style.display="flex");
    window.updateMobileControlsVisibility?.();

    if(previewRafId !== null){
        cancelAnimationFrame(previewRafId);
        previewRafId = null;
    }
};

// Initial render (so it works if the overlay is opened via other logic).
renderColorMenu();
renderShapeMenu();
drawPreview();
