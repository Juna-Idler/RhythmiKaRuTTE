const textarea = document.getElementById("TextArea");

//今はクロームしか対応してないらしいけどこれで書記素で分割出来るらしい
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
(function Mode_Stamp(){

    function Initialize()
    {
    }
    function Terminalize()
    {

    }
    StampModeInitializer = {Initialize:Initialize,Terminalize:Terminalize};
}());
