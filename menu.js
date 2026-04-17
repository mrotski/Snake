const mainMenu = document.getElementById("mainMenu");
const scoreBoard = document.getElementById("scoreBoard");
const gameCanvas = document.getElementById("game");
const overlay = document.getElementById("overlay");

function requestGameFullscreen(){
    if(document.fullscreenElement) return;

    const el = document.documentElement;
    const req =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.msRequestFullscreen;

    if(typeof req !== "function") return;

    try{
        const p = req.call(el, { navigationUI: "hide" });
        if(p && typeof p.catch === "function") p.catch(()=>{});
    }catch(_e){
        // ignore – most browsers require a user gesture
    }
}

// Best-effort: will usually be denied until the first user gesture.
setTimeout(requestGameFullscreen, 0);
document.addEventListener("pointerdown", requestGameFullscreen, { once: true });
document.addEventListener("keydown", requestGameFullscreen, { once: true });

document.getElementById("playBtn").onclick = () => {
    requestGameFullscreen();

    mainMenu.style.display = "none";
    scoreBoard.style.display = "block";
    gameCanvas.style.display="block";

    gameStarted = true;
    paused = false;
    overlay.style.display = "none";

    // ⭐ turvallinen kutsu
    if (typeof initStars === "function") {
        initStars();
    }

    resetGame();

    bgMusic.currentTime = 0;
    bgMusic.play();

    startGameLoop();
};


document.getElementById("quitBtn").onclick=()=>{
    window.close();
};

document.getElementById("resumeBtn").onclick=togglePause;

document.getElementById("menuBtn").onclick=()=>{
    paused=false;
    gameStarted=false;
    overlay.style.display="none";
    scoreBoard.style.display="none";
    gameCanvas.style.display="none";
    mainMenu.style.display="flex";

    bgMusic.pause();
    stopGameLoop();
};

const soundBtn = document.getElementById("soundBtn");

let soundOn = localStorage.getItem("snakeSound") !== "false";

updateSoundButton();

function updateSoundButton(){
    soundBtn.textContent = soundOn ? "Sound: ON" : "Sound: OFF";
}

soundBtn.onclick = () => {
    soundOn = !soundOn;
    localStorage.setItem("snakeSound", soundOn);

    if(soundOn){
        bgMusic.play();
    }else{
        bgMusic.pause();
    }

    updateSoundButton();
};
