


document.getElementById("playBtn").onclick=()=>{
    mainMenu.style.display="none";
    scoreBoard.style.display="block";
    canvas.style.display="block";
    gameStarted=true;
    paused=false;
    resetGame();

    bgMusic.currentTime=0;
    bgMusic.play();

    requestAnimationFrame(gameLoop);
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
    canvas.style.display="none";
    mainMenu.style.display="flex";

    bgMusic.pause();
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