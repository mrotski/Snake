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