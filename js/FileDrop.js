(function FilesDrop(){
    var droparea = document.createElement("div")
        
        function showDroparea(){
            droparea.style.cssText = "all: initial;\
                                      position: fixed;\
                                      top:0;left:0;\
                                      z-index: 1000;\
                                      width: 100%;\
                                      height: 100%;\
                                      box-sizing: border-box;\
                                      display: block;\
                                      border: 8px dashed #333333;\
                                      background-color:rgba(0,0,0,0.5);"
        }
        
        function hideDroparea(){
            droparea.style.cssText = "all: initial;\
                                      position: fixed;\
                                      top:0;left:0;\
                                      z-index: 1000;\
                                      width: 100%;\
                                      height: 100%;\
                                      box-sizing: border-box;\
                                      display: none;";
        }
        
        droparea.ondragleave = e => {
            e.preventDefault();
            hideDroparea();
        };
        
        window.addEventListener("dragover", e => e.preventDefault(), false)
        window.addEventListener("dragenter", e => {
            e.preventDefault();
            showDroparea();
        }, false);
        window.addEventListener("drop", e => {
            e.preventDefault();
            hideDroparea();
    
            DropFiles(e.dataTransfer.files);
        }, false);
        
        document.body.appendChild(droparea);
    
    
    function DropFiles(files)
    {
        let audioread = false;
        let textread = false;
        for (let i = 0;i < files.length;i++)
        {
            const file = files[i]
            if (file.type.indexOf("audio/") == 0)
            {
                console.log("drop audio file:" + file.name);
                if (audioread)
                    continue;
                audio.src = window.URL.createObjectURL(file);
                const ctx = canvas.getContext("2d");
                ctx.font = canvas.height / 2 + "px sans-serif";
                ctx.fillStyle = "white";
                ctx.fillText("Now Loading...", 0, canvas.height * 3 / 4);
                audioread = true;
                audioFilename = file.name;
    
                if (fragmentPlayer === null)
                    fragmentPlayer  = new AudioFragmentPlayer();
                fragmentPlayer.loadFile(file).then(()=>{
                    waveViewer = new WaveViewer(fragmentPlayer.audioBuffer);
                    WaveViewTime = 0;
                    playbackRate.value = 1;
                    DrawWaveView();
                });
            }
            else if (file.type.indexOf("text/") == 0 || file.name.match(/\.(lrc|kra)$/i))
            {
                console.log("drop text file:" + file.name);
                const editmode = document.getElementById( 'TabEdit' ).checked;
                if (editmode && !textread)
                {
                    file.text().then(text=>{
                        textarea.value = text;
                    })
                    textread = true;
                }
            }
            else
            {
                console.log("ignore drop file:" + file.name);
            }
        }
    }
})();
    