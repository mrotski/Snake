const customOverlay=document.getElementById("customOverlay");
const previewCanvas=document.getElementById("previewCanvas");
const pctx=previewCanvas.getContext("2d");
const palette=document.getElementById("colorPalette");

const colors=[
"#00FF00","#FF0000","#0000FF","#FFFF00","#FF00FF","#00FFFF",
"#FFA500","#FF69B4","#8A2BE2","#00FA9A","#DC143C","#1E90FF",
"#FFD700","#ADFF2F","#FF4500","#7FFF00","#40E0D0","#FF1493",
"#B22222","#00CED1","#9400D3","#FF8C00","#32CD32","#4682B4"
];

colors.forEach(color=>{
    const div=document.createElement("div");
    div.className="colorSwatch";
    div.style.background=color;
    div.onclick=()=>{
        snakeColor=color;
        localStorage.setItem("snakeColor",color);
    };
    palette.appendChild(div);
});

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
    requestAnimationFrame(drawPreview);
}

document.getElementById("customBtn").onclick=()=>{
    mainMenu.style.display="none";
    customOverlay.style.display="flex";
    drawPreview();
};

document.getElementById("closeCustom").onclick=()=>{
    customOverlay.style.display="none";
    mainMenu.style.display="flex";
};