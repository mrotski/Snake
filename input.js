document.addEventListener("keydown",e=>{

    if(!gameStarted)return;

    if(e.key==="Escape"){
        togglePause();
        return;
    }

    if(paused)return;

    let newDir=null;

    if(e.key==="ArrowUp"||e.key==="w")newDir={x:0,y:-1};
    if(e.key==="ArrowDown"||e.key==="s")newDir={x:0,y:1};
    if(e.key==="ArrowLeft"||e.key==="a")newDir={x:-1,y:0};
    if(e.key==="ArrowRight"||e.key==="d")newDir={x:1,y:0};

    if(newDir)nextDirection=newDir;

});

function handleDirectionInput(newDir) {
    if (!gameStarted) return;
    if (paused) return;

    if (newDir) nextDirection = newDir;
}

function handlePauseInput(){
    if(!gameStarted) return;
    togglePause();
}

document.querySelector(".up")?.addEventListener("touchstart", () => {
    handleDirectionInput({ x: 0, y: -1 });
});

document.querySelector(".down")?.addEventListener("touchstart", () => {
    handleDirectionInput({ x: 0, y: 1 });
});

document.querySelector(".left")?.addEventListener("touchstart", () => {
    handleDirectionInput({ x: -1, y: 0 });
});

document.querySelector(".right")?.addEventListener("touchstart", () => {
    handleDirectionInput({ x: 1, y: 0 });
});

document.querySelector(".esc")?.addEventListener("touchstart", () => {
    handlePauseInput();
});

document.querySelectorAll(".ctrl").forEach(btn => {
    btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
    });
});

document.querySelector(".up")?.addEventListener("mousedown", () => {
    handleDirectionInput({ x: 0, y: -1 });
});

document.querySelector(".down")?.addEventListener("mousedown", () => {
    handleDirectionInput({ x: 0, y: 1 });
});

document.querySelector(".left")?.addEventListener("mousedown", () => {
    handleDirectionInput({ x: -1, y: 0 });
});

document.querySelector(".right")?.addEventListener("mousedown", () => {
    handleDirectionInput({ x: 1, y: 0 });
});

document.querySelector(".esc")?.addEventListener("mousedown", () => {
    handlePauseInput();
});

// Mobile controls visibility is managed by menu/UI state (in-game only).
const isMobile = window.matchMedia("(pointer: coarse)").matches;
