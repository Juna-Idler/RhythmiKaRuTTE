
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

//フォーカスがあるとアローキーで操作が発生してしまう
//が、こうするとクロームの場合、縦…のメニューボタンが効かなくなる
    audio.addEventListener("focus",()=>{audio.blur()});

}());


function DefaultDrawWaveView()
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
var DrawWaveView = DefaultDrawWaveView;

var SetDefaultCanvasMouseEvent;
(function WaveViewerMouseEvent(){
    var x;
    var playing;
    canvas.ondragstart = (e)=>{return false;}

    function onMouseMove(e) {
        WaveViewTime -=  (e.pageX - x) * (1000 / Magnification);
        if (WaveViewTime < 0)
            WaveViewTime = 0;
        x = e.pageX;
        DrawWaveView();
    }
    function onMouseUp(e){
        audio.currentTime = WaveViewTime / 1000;
        if (playing)
            audio.play();
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);
    }   
    
    function onMouseDown(e){
        playing = !audio.paused;
        audio.pause();
        x = e.pageX;
        document.addEventListener("mousemove",onMouseMove, false);
        document.addEventListener("mouseup",onMouseUp, false);
    }

    SetDefaultCanvasMouseEvent = (enable)=>{
        if (enable)
        {
            canvas.addEventListener("mousedown",onMouseDown, false);
        }
        else
        {
            canvas.removeEventListener("mousedown",onMouseDown,false);
        }

    };
    SetDefaultCanvasMouseEvent(true);

}());



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


var CreateLyricsContainer;
(function(){
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
CreateLyricsContainer = (text)=>{
    return new RubyKaraokeLyricsContainer(text,grapheme_split);
}

}());



var EditModeInitializer;
var PointModeInitializer;
var StampModeInitializer;
var TestModeInitializer;

(function ModeShifter(){

const tab_edit = document.getElementById("TabEdit");
const tab_point = document.getElementById("TabPoint");
const tab_stamp = document.getElementById("TabStamp");
const tab_test = document.getElementById("TabTest");

var LastMode = "edit";

function TabChange(e)
{
    let serialize = "";
    switch (LastMode)
    {
        case "edit":
            if (tab_edit.checked) return;
            serialize = EditModeInitializer.Terminalize();
        break;
        case "point":
            if (tab_point.checked) return;
            serialize = PointModeInitializer.Terminalize();
        break;
        case "stamp":
            if (tab_stamp.checked) return;
            serialize = StampModeInitializer.Terminalize();
        break;
        case "test":
            if (tab_test.checked) return;
            serialize = TestModeInitializer.Terminalize();
        break;
    }

    if (document.getElementById("AutoSave").checked)
    {
        localStorage.setItem("RhythmiKaRuTTE_as_Karaokelyrics",serialize);
        localStorage.setItem("RhythmiKaRuTTE_as_enable","true");
    }
    else
    {
        localStorage.removeItem("RhythmiKaRuTTE_as_enable");
        const aslyrics = localStorage.getItem("RhythmiKaRuTTE_as_Karaokelyrics");
        if (aslyrics !== null && aslyrics === "")
            localStorage.removeItem("RhythmiKaRuTTE_as_Karaokelyrics");
    }

    if (tab_edit.checked)
    {
        EditModeInitializer.Initialize(serialize);
        LastMode = "edit";
    }
    else if (tab_point.checked)
    {
        PointModeInitializer.Initialize(serialize);
        LastMode = "point";
    }
    else if (tab_stamp.checked)
    {
        StampModeInitializer.Initialize(serialize);
        LastMode = "stamp";
    }
    else if (tab_test.checked)
    {
        TestModeInitializer.Initialize(serialize);
        LastMode = "test";
    }
    DrawWaveView();
}

window.addEventListener("load",e=>
{
    const aslyrics = localStorage.getItem("RhythmiKaRuTTE_as_Karaokelyrics");
    if (aslyrics !== null) EditModeInitializer.Initialize(aslyrics);
    if (localStorage.getItem("RhythmiKaRuTTE_as_enable"))
        document.getElementById("AutoSave").checked = true;
});



tab_edit.addEventListener("change",TabChange);
tab_point.addEventListener("change",TabChange);
tab_stamp.addEventListener("change",TabChange);
tab_test.addEventListener("change",TabChange);

}());

