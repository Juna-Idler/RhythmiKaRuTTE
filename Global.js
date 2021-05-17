
const textarea = document.getElementById("TextArea");
const audio = document.getElementById("AudioPlayer");
const canvas = document.getElementById( 'WaveCanvas' );
const magnification_selector = document.getElementById('MagnificationSelector');
const playbackRate = document.getElementById('PlaybackRate');


var audioFilename = "";
var waveViewer;
var Magnification = Number(magnification_selector.value);
var WaveViewTime = 0;
var fragmentPlayer = null;


(function AudioEvent(){

    function Tick(timestamp)
    {
        WaveViewTime = audio.currentTime * 1000;
        DrawWaveView();
        if (!audio.paused)
            window.requestAnimationFrame(Tick);
    }
    audio.addEventListener("timeupdate",()=>{
        WaveViewTime = audio.currentTime * 1000;
        DrawWaveView();
    });
    audio.addEventListener("play",()=>{
        window.requestAnimationFrame(Tick);
    });
    audio.addEventListener("pause", ()=>{
    });
    audio.addEventListener("ended",()=>{
    });

    magnification_selector.oninput = (e)=>{
        Magnification = Number(magnification_selector.value);
        DrawWaveView();
    };

    playbackRate.oninput = (e)=>{
        audio.playbackRate = playbackRate.value;
        const text = document.getElementById('PlaybackRateText');
        text.textContent = "再生速度 ×" + (audio.playbackRate).toFixed(2);
    }

}());


function DrawWaveView()
{
    if (!waveViewer)
        return;

    const width  = canvas.width;
    const height = canvas.height;
    const nowpoint = Math.floor(width * 0.3)
    waveViewer.DrawCanvas(canvas,WaveViewTime - (nowpoint * 1000/Magnification),1000/Magnification);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(nowpoint,0,1,height);
}



(function CanvasResize(){
    const container = document.getElementById( 'WaveDisplay' );
    var queue = null;
    const wait = 300;

    //これがない（＝CSS指定のresizeで一度リサイズしない）と、何故かwindowのリサイズの度に7pxずつ増えていく
    container.style.height = container.offsetHeight + "px";

    setCanvasSize();

    window.addEventListener( 'resize', function() {
        clearTimeout( queue );
        queue = setTimeout(function() {setCanvasSize();}, wait );
    }, false );

    const observer = new MutationObserver(() => {
        clearTimeout( queue );
        queue = setTimeout(function() {
            setCanvasSize();
        }, wait );
    });
    observer.observe(container, {
        attriblutes: true,
        attributeFilter: ["style"]
    });
    // Canvasサイズをコンテナの100%に 
    function setCanvasSize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width,canvas.height);

        DrawWaveView();
    }
}());


//今（何時の？）はクロームしか対応してないらしいけどこれで書記素で分割出来るらしい
const segmenter = new Intl.Segmenter("ja", {granularity: "grapheme"});
function grapheme_split(text)
{
    const segments = segmenter.segment(text);
    const array = [];
    for(const seg of segments) {
        array.push(seg.segment);
    }
    return array;
}

var EditModeInitializer;
var PointModeInitializer;
var StampModeInitializer;

(function ModeShifter(){

const tab_edit = document.getElementById("TabEdit");
const tab_point = document.getElementById("TabPoint");
const tab_stamp = document.getElementById("TabStamp");

var LastMode = "edit";

function TabChange(e)
{
    switch (LastMode)
    {
        case "edit":
            if (tab_edit.checked) return;
            EditModeInitializer.Terminalize();
        break;
        case "point":
            if (tab_point.checked) return;
            PointModeInitializer.Terminalize();
        break;
        case "stamp":
            if (tab_stamp.checked) return;
            StampModeInitializer.Terminalize();
        break;
    }
    if (tab_edit.checked)
    {
        EditModeInitializer.Initialize();
        LastMode = "edit";
    }
    else if (tab_point.checked)
    {
        PointModeInitializer.Initialize();
        LastMode = "point";
    }
    else if (tab_stamp.checked)
    {
        StampModeInitializer.Initialize();
        LastMode = "stamp";
    }
}

tab_edit.addEventListener("change",TabChange);
tab_point.addEventListener("change",TabChange);
tab_stamp.addEventListener("change",TabChange);

}());

(function Mode_Edit(){

    function Initialize()
    {
    }
    function Terminalize()
    {

    }
    EditModeInitializer = {Initialize:Initialize,Terminalize:Terminalize};
}());
