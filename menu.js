const mainMenu = document.getElementById("mainMenu");
const scoreBoard = document.getElementById("scoreBoard");
const gameCanvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const settingsOverlay = document.getElementById("settingsOverlay");
const songsListEl = document.getElementById("songsList");

let selectedSong = localStorage.getItem("snakeSong") || "";
if(!selectedSong){
    const first = (window.SNAKE_SONGS || []).find(s => s && s.file && s.file !== "no_song.mp3");
    if(first && first.file) selectedSong = first.file;
}

function formatSongTitle(file){
    if(!file) return "No song";
    const base = file.replace(/\.[^/.]+$/, "");
    return base.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function applySongSelection(){
    if(!selectedSong){
        if(soundOn){
            const p = bgMusic.play();
            if(p && typeof p.catch === "function") p.catch(()=>{});
        }
        return;
    }

    // Empty or explicit no-song disables music.
    if(selectedSong === "no_song.mp3"){
        bgMusic.pause();
        bgMusic.removeAttribute("src");
        bgMusic.load();
        return;
    }

    const nextSrc = `songs/${selectedSong}`;
    if(bgMusic.getAttribute("src") !== nextSrc){
        bgMusic.setAttribute("src", nextSrc);
        bgMusic.load();
    }

    if(soundOn){
        const p = bgMusic.play();
        if(p && typeof p.catch === "function") p.catch(()=>{});
    }
}

function renderSongsList(){
    if(!songsListEl) return;

    const songs = (window.SNAKE_SONGS || [])
        .filter(s => s && typeof s.file === "string")
        .map(s => ({
            file: s.file,
            title: s.title || formatSongTitle(s.file)
        }));

    // Always offer "No song" even if missing from the list.
    if(!songs.some(s => s.file === "no_song.mp3")){
        songs.unshift({ file: "no_song.mp3", title: "No song" });
    }

    songsListEl.innerHTML = "";

    songs.forEach(song => {
        const row = document.createElement("div");
        row.className = "songRow" + (song.file === selectedSong ? " active" : "");

        const left = document.createElement("div");
        const title = document.createElement("div");
        title.className = "songTitle";
        title.textContent = song.title;

        const meta = document.createElement("div");
        meta.className = "songMeta";
        meta.textContent = song.file === "no_song.mp3" ? "Disables background music" : `songs/${song.file}`;

        left.appendChild(title);
        left.appendChild(meta);

        const pick = document.createElement("button");
        pick.type = "button";
        pick.className = "songPick";
        pick.textContent = (song.file === selectedSong) ? "Selected" : "Select";
        pick.disabled = (song.file === selectedSong);

        pick.onclick = () => {
            selectedSong = song.file;
            localStorage.setItem("snakeSong", selectedSong);
            applySongSelection();
            renderSongsList();
        };

        row.appendChild(left);
        row.appendChild(pick);
        songsListEl.appendChild(row);
    });
}

function setActiveSettingsTab(tab){
    const tabs = settingsOverlay?.querySelectorAll?.(".settingsTab") || [];
    const panels = settingsOverlay?.querySelectorAll?.(".settingsPanel") || [];

    tabs.forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
    panels.forEach(panel => {
        panel.style.display = (panel.dataset.panel === tab) ? "block" : "none";
    });

    if(tab === "songs"){
        renderSongsList();
    }
}

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

    applySongSelection();
    if(bgMusic.getAttribute("src")){
        bgMusic.currentTime = 0;
    }

    startGameLoop();
};

document.getElementById("settingsBtn").onclick = () => {
    mainMenu.style.display = "none";
    settingsOverlay.style.display = "flex";
    setActiveSettingsTab("songs");
};

document.getElementById("closeSettings").onclick = () => {
    settingsOverlay.style.display = "none";
    mainMenu.style.display = "flex";
};

settingsOverlay?.querySelectorAll?.(".settingsTab")?.forEach(btn => {
    btn.addEventListener("click", () => setActiveSettingsTab(btn.dataset.tab));
});


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
    soundBtn.textContent = soundOn ? "mute" : "unmute";
}

soundBtn.onclick = () => {
    soundOn = !soundOn;
    localStorage.setItem("snakeSound", soundOn);

    if(soundOn){
        applySongSelection();
    }else{
        bgMusic.pause();
    }

    updateSoundButton();
};

// Initial setup (for saved selection).
applySongSelection();
