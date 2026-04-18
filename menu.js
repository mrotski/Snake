const mainMenu = document.getElementById("mainMenu");
const scoreBoard = document.getElementById("scoreBoard");
const gameCanvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const settingsOverlay = document.getElementById("settingsOverlay");
const songsListEl = document.getElementById("songsList");
const fullscreenSettingsEl = document.getElementById("fullscreenSettings");
const customOverlayEl = document.getElementById("customOverlay");
const mobileControlsEl = document.getElementById("mobileControls");
const fontsListEl = document.getElementById("fontsList");
const resolutionListEl = document.getElementById("resolutionList");
const toastEl = document.getElementById("toast");

const isMobileUi =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(hover: none)").matches ||
    ("ontouchstart" in window) ||
    (navigator.maxTouchPoints > 0);

let selectedSong = localStorage.getItem("snakeSong") || "";
if(!selectedSong){
    const first = (window.SNAKE_SONGS || []).find(s => s && s.file && s.file !== "no_song.mp3");
    if(first && first.file) selectedSong = first.file;
}

let fullscreenPreference = localStorage.getItem("snakeFullscreenPreference") || "fullscreen"; // "fullscreen" | "windowed"
let fontPreference = localStorage.getItem("snakeFontPreference") || "default"; // "default" | "font_1" | "font_2"
let resolutionPreference = localStorage.getItem("snakeResolutionPreference") || "native"; // "native" | "WxH"

let toastTimer = null;

function showToast(message){
    if(!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.style.display = "block";
    toastTimer = setTimeout(() => {
        toastEl.style.display = "none";
    }, 2000);
}

function isElementVisible(el){
    if(!el) return false;
    return window.getComputedStyle(el).display !== "none";
}

function updateMobileControlsVisibility(){
    if(!mobileControlsEl) return;
    if(!isMobileUi){
        mobileControlsEl.style.display = "none";
        return;
    }

    const inGame =
        !!gameStarted &&
        isElementVisible(gameCanvas) &&
        !isElementVisible(mainMenu) &&
        !isElementVisible(settingsOverlay) &&
        !isElementVisible(customOverlayEl);

    mobileControlsEl.style.display = inGame ? "block" : "none";
}

window.updateMobileControlsVisibility = updateMobileControlsVisibility;

function exitGameFullscreen(){
    const exit =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen;

    if(typeof exit !== "function") return;
    if(!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) return;

    try{
        const p = exit.call(document);
        if(p && typeof p.catch === "function") p.catch(()=>{});
    }catch(_e){
        // ignore
    }
}

function formatSongTitle(file){
    if(!file) return "No song";
    const base = file.replace(/\.[^/.]+$/, "");
    return base.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function applyFontSelection(){
    let family = "Arial, sans-serif";
    if(fontPreference === "font_1") family = '"SnakeFont1", Arial, sans-serif';
    if(fontPreference === "font_2") family = '"SnakeFont2", Arial, sans-serif';
    document.documentElement.style.setProperty("--snake-font-family", family);
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

function renderFullscreenSettings(){
    if(!fullscreenSettingsEl) return;
    fullscreenSettingsEl.querySelectorAll?.(".fsOption")?.forEach(opt => {
        opt.classList.toggle("active", opt.dataset.fs === fullscreenPreference);
    });
}

function isFullscreenActive(){
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function applyResolutionSelection(){
    if(!isFullscreenActive()){
        window.snakeResolution = null;
        if(typeof resizeGameCanvas === "function") resizeGameCanvas();
        if(typeof updateGrid === "function") updateGrid();
        return;
    }

    if(resolutionPreference === "native"){
        window.snakeResolution = null;
    }else{
        const m = /^(\d{3,5})x(\d{3,5})$/.exec(resolutionPreference);
        if(m){
            window.snakeResolution = { w: Number(m[1]), h: Number(m[2]) };
        }else{
            window.snakeResolution = null;
        }
    }

    if(typeof resizeGameCanvas === "function") resizeGameCanvas();
    if(typeof updateGrid === "function") updateGrid();

    // Safety: if the current game objects don't fit after changing resolution, reset.
    try{
        if(gameStarted && Array.isArray(snake) && typeof tilesX === "number" && typeof tilesY === "number"){
            const out = snake.some(s => s.x < 0 || s.y < 0 || s.x >= tilesX || s.y >= tilesY);
            if(out && typeof resetGame === "function") resetGame();
        }
        if(typeof food === "object" && food && typeof tilesX === "number" && typeof tilesY === "number"){
            const foodOut = food.x < 0 || food.y < 0 || food.x >= tilesX || food.y >= tilesY;
            if(foodOut && typeof spawnFood === "function") spawnFood();
        }
    }catch(_e){
        // ignore
    }
}

function updateResolutionTabState(){
    const tabBtn = settingsOverlay?.querySelector?.('.settingsTab[data-tab="resolution"]');
    if(!tabBtn) return;

    const ok = isFullscreenActive();
    tabBtn.classList.toggle("disabled", !ok);
}

function renderFontsList(){
    if(!fontsListEl) return;

    const fonts = [
        { id: "default", title: "Default", meta: "System font" },
        { id: "font_1", title: "Font 1", meta: "fonts/font_1.ttf" },
        { id: "font_2", title: "Font 2", meta: "fonts/font_2.ttf" }
    ];

    fontsListEl.innerHTML = "";

    fonts.forEach(font => {
        const row = document.createElement("div");
        row.className = "settingsRow" + (font.id === fontPreference ? " active" : "");

        const left = document.createElement("div");
        const title = document.createElement("div");
        title.className = "settingsRowTitle";
        title.textContent = font.title;
        if(font.id === "font_1") title.style.fontFamily = '"SnakeFont1", Arial, sans-serif';
        if(font.id === "font_2") title.style.fontFamily = '"SnakeFont2", Arial, sans-serif';

        const meta = document.createElement("div");
        meta.className = "settingsRowMeta";
        meta.textContent = font.meta;

        left.appendChild(title);
        left.appendChild(meta);

        const pick = document.createElement("button");
        pick.type = "button";
        pick.className = "settingsRowPick";
        pick.textContent = (font.id === fontPreference) ? "Selected" : "Select";
        pick.disabled = (font.id === fontPreference);
        pick.onclick = () => {
            fontPreference = font.id;
            localStorage.setItem("snakeFontPreference", fontPreference);
            applyFontSelection();
            renderFontsList();
        };

        row.appendChild(left);
        row.appendChild(pick);
        fontsListEl.appendChild(row);
    });
}

function renderResolutionList(){
    if(!resolutionListEl) return;

    const options = [
        { id: "native", title: "Native", meta: "Use your screen resolution" },
        { id: "854x480", title: "480p", meta: "854×480" },
        { id: "1280x720", title: "720p", meta: "1280×720" },
        { id: "1600x900", title: "900p", meta: "1600×900" },
        { id: "1920x1080", title: "1080p", meta: "1920×1080" },
        { id: "2560x1440", title: "1440p", meta: "2560×1440" },
        { id: "3840x2160", title: "4K", meta: "3840×2160" }
    ];

    resolutionListEl.innerHTML = "";

    options.forEach(opt => {
        const row = document.createElement("div");
        row.className = "settingsRow" + (opt.id === resolutionPreference ? " active" : "");

        const left = document.createElement("div");
        const title = document.createElement("div");
        title.className = "settingsRowTitle";
        title.textContent = opt.title;

        const meta = document.createElement("div");
        meta.className = "settingsRowMeta";
        meta.textContent = opt.meta;

        left.appendChild(title);
        left.appendChild(meta);

        const pick = document.createElement("button");
        pick.type = "button";
        pick.className = "settingsRowPick";
        pick.textContent = (opt.id === resolutionPreference) ? "Selected" : "Select";
        pick.disabled = (opt.id === resolutionPreference);
        pick.onclick = () => {
            if(!isFullscreenActive()){
                showToast("Resolution can only be changed in fullscreen.");
                return;
            }

            resolutionPreference = opt.id;
            localStorage.setItem("snakeResolutionPreference", resolutionPreference);
            applyResolutionSelection();
            renderResolutionList();
        };

        row.appendChild(left);
        row.appendChild(pick);
        resolutionListEl.appendChild(row);
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
    if(tab === "fullscreen"){
        renderFullscreenSettings();
    }
    if(tab === "fonts"){
        renderFontsList();
    }
    if(tab === "resolution"){
        renderResolutionList();
    }
}

function requestGameFullscreen(){
    if(fullscreenPreference === "windowed") return;
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
    updateMobileControlsVisibility();
};

document.getElementById("settingsBtn").onclick = () => {
    mainMenu.style.display = "none";
    settingsOverlay.style.display = "flex";
    setActiveSettingsTab("songs");
    updateResolutionTabState();
    updateMobileControlsVisibility();
};

document.getElementById("closeSettings").onclick = () => {
    settingsOverlay.style.display = "none";
    mainMenu.style.display = "flex";
    updateMobileControlsVisibility();
};

settingsOverlay?.querySelectorAll?.(".settingsTab")?.forEach(btn => {
    btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if(tab === "resolution" && !isFullscreenActive()){
            showToast("Resolution is only available in fullscreen.");
            return;
        }
        setActiveSettingsTab(tab);
    });
});

fullscreenSettingsEl?.querySelectorAll?.(".fsOption")?.forEach(opt => {
    opt.addEventListener("click", () => {
        const pref = opt.dataset.fs;
        if(pref !== "fullscreen" && pref !== "windowed") return;

        fullscreenPreference = pref;
        localStorage.setItem("snakeFullscreenPreference", fullscreenPreference);
        renderFullscreenSettings();

        if(fullscreenPreference === "windowed"){
            exitGameFullscreen();
        }else{
            requestGameFullscreen();
        }
    });
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
    updateMobileControlsVisibility();
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
applyFontSelection();
applyResolutionSelection();
updateMobileControlsVisibility();
updateResolutionTabState();

document.addEventListener("fullscreenchange", () => {
    updateResolutionTabState();
    applyResolutionSelection();
});

document.addEventListener("webkitfullscreenchange", () => {
    updateResolutionTabState();
    applyResolutionSelection();
});
