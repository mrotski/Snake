const customOverlay=document.getElementById("customOverlay");
const previewCanvas=document.getElementById("previewCanvas");
const pctx=previewCanvas.getContext("2d");
const palette=document.getElementById("colorPalette");

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

let previewAngle=0;

function drawPreview(){
    pctx.clearRect(0,0,previewCanvas.width,previewCanvas.height);

    const centerX=previewCanvas.width/2;
    const centerY=previewCanvas.height/2;
    const radius=50;
    const size=28;

    for(let i=0;i<4;i++){
        const angle=previewAngle-i*0.3;
        const x=centerX+Math.cos(angle)*radius;
        const y=centerY+Math.sin(angle)*radius;

        pctx.fillStyle=snakeColor;
        pctx.fillRect(x-size/2,y-size/2,size,size);
    }

    previewAngle+=0.05;
    previewRafId = requestAnimationFrame(drawPreview);
}

document.getElementById("customBtn").onclick=()=>{
    mainMenu.style.display="none";
    customOverlay.style.display="flex";

    renderColorMenu();

    if(previewRafId === null){
        drawPreview();
    }
};

document.getElementById("closeCustom").onclick=()=>{
    customOverlay.style.display="none";
    mainMenu.style.display="flex";

    if(previewRafId !== null){
        cancelAnimationFrame(previewRafId);
        previewRafId = null;
    }
};

// Initial render (so it works if the overlay is opened via other logic).
renderColorMenu();
