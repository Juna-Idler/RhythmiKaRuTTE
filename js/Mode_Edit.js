
(function Mode_Edit(){
const TextEdit = document.getElementById("TextEdit");
TextEdit.innerHTML =`
<textarea id="TextArea" spellcheck="false"></textarea>
<div class="bottom_controls_area">
    <label for="EditOutputSwitch"  id="EditOutputOpen" class="bottom_controls">Output</label>
    <label><input type="checkbox" id="AutoSave" class="bottom_controls">Auto Save</label>
</div>
`;

const overlap_switch = document.createElement("input");
overlap_switch.type = "checkbox";
overlap_switch.id = "EditOutputSwitch";

const overlap = document.createElement("div");
overlap.id = "EditOutputOverlap";
overlap.innerHTML = `
<textarea id="EditOutputText" spellcheck="false"></textarea>
<div  id="EditOutputBottom">
    <div class="flex_v">
        <div>
            <label><input type="radio" id="EditOutputStandard" name="output_tag_type" checked>Karaoke</label>
            <label><input type="radio" id="EditOutputHeadTag" name="output_tag_type">Line Head</label>
            <label><input type="radio" id="EditOutputNoTag" name="output_tag_type">Remove</label>
        </div>
        <div>
            <label><input type="radio" id="EditOutputWithRuby" name="output_ruby_type" checked>ルビ有り</label>
            <label><input type="radio" id="EditOutputNoRuby" name="output_ruby_type">ルビ無し</label>
            <label><input type="radio" id="EditOutputPhonetic" name="output_ruby_type">読みのみ</label>
        </div>
    </div>
    <div class="flex_h">
        <button id="Download" class="bottom_controls">Download</button>
        <label for="EditOutputSwitch" id="EditOutputClose" class="bottom_controls">Back</label>
    </div>
</div>
`;

const parent = TextEdit.parentElement;
parent.insertBefore(overlap_switch,TextEdit);
parent.insertBefore(overlap,TextEdit);


const textarea = document.getElementById("TextArea");
const outputtext = document.getElementById("EditOutputText");
var lyrics;

document.getElementById("EditOutputOpen").onclick = (e)=>{
    lyrics = CreateLyricsContainer(textarea.value);
    onchange();
};

function onchange()
{
    if (standard_radio.checked)
    {
        standard();
    }
    else if (headtag_radio.checked)
    {
        headtag();
    }
    else if (notag_radio.checked)
    {
        notag();
    }
}


const standard_radio = document.getElementById("EditOutputStandard");
const headtag_radio = document.getElementById("EditOutputHeadTag");
const notag_radio = document.getElementById("EditOutputNoTag");
const withruby_radio = document.getElementById("EditOutputWithRuby");
const noruby_radio = document.getElementById("EditOutputNoRuby");
const phonetic_radio = document.getElementById("EditOutputPhonetic");

standard_radio.onclick = headtag_radio.onclick = notag_radio.onclick =
withruby_radio.onclick = noruby_radio.onclick = phonetic_radio.onclick = onchange;

function standard()
{
    outputtext.value = "";
    const ruby = withruby_radio.checked;
    const noruby = noruby_radio.checked;

    const ruby_parent = lyrics.atTag.ruby_parent;
    const ruby_begin = lyrics.atTag.ruby_begin;
    const ruby_end = lyrics.atTag.ruby_end;

    let output = "";
    lyrics.lines.forEach(line=>{
        if (line.start_time >= 0 && line.start_time < TimeTagElement.MaxTime_ms)
        {
            const tt = TimeTagElement.TimeString(line.start_time);
            //ルビがあると行頭にタグが来ないので重ねる
            if (line.units.length > 0 && line.units[0].hasRuby && ruby)
                output += tt;
            output += tt;
        }
        else
        {
            //ルビがあると行頭にタグが来ないのでルビのタグを行頭に持ってくる
            if (line.units.length > 0 && line.units[0].hasRuby && ruby)
                output += TimeTagElement.TimeString(line.units[0].start_time);
        }
        line.units.forEach(rkunit=>{
            let phonetic = "";
            const kunit = rkunit.phonetic;
            for (let i = 0;i < kunit.text_array.length;i++)
            {
                if (kunit.start_times[i] >= 0 && kunit.start_times[i] < TimeTagElement.MaxTime_ms)
                    phonetic += TimeTagElement.TimeString(kunit.start_times[i]);
                phonetic += kunit.text_array[i];
                if (kunit.end_times[i] >= 0 && kunit.end_times[i] < TimeTagElement.MaxTime_ms)
                    phonetic += TimeTagElement.TimeString(kunit.end_times[i]);
            }
            if (ruby)
            {
                
                output += rkunit.hasRuby ? (ruby_parent + TimeTagElement.TimeString(rkunit.start_time) + rkunit.base_text + TimeTagElement.TimeString(rkunit.end_time) + ruby_begin + phonetic + ruby_end) : phonetic;
            }
            else
            {
                output += (rkunit.hasRuby && noruby) ? (TimeTagElement.TimeString(rkunit.start_time) + rkunit.base_text + TimeTagElement.TimeString(rkunit.end_time)) : phonetic;
            }
        });
        if (line.end_time >= 0 && line.end_time < TimeTagElement.MaxTime_ms)
        {
            const tt = TimeTagElement.TimeString(line.end_time);
            //ルビがあると行末にタグが来ないので重ねる
            if (line.units.length > 0 && line.units[line.units.length-1].hasRuby && ruby)
                output += tt;
            output += tt;
        }
        output += "\n";
    });
    outputtext.value = output.slice(0,-1);
}

function headtag()
{
    outputtext.value = "";
    const ruby = withruby_radio.checked;
    const noruby = noruby_radio.checked;

    const ruby_parent = lyrics.atTag.ruby_parent;
    const ruby_begin = lyrics.atTag.ruby_begin;
    const ruby_end = lyrics.atTag.ruby_end;

    let output = "";
    lyrics.lines.forEach(line=>{
        if (line.start_time >= 0 && line.start_time < TimeTagElement.MaxTime_ms)
            output += TimeTagElement.TimeString(line.start_time);
        else if (line.units.length > 0)
            output += TimeTagElement.TimeString(line.units[0].start_time);

        line.units.forEach(rkunit=>{
            const phonetic = rkunit.phonetic.text_array.join("");
            if (ruby)
                output += rkunit.hasRuby ? (ruby_parent + rkunit.base_text + ruby_begin + phonetic + ruby_end) : phonetic;
            else
                output += (rkunit.hasRuby && noruby) ? rkunit.base_text : phonetic;
        });
        output += "\n";
    });
    outputtext.value = output.slice(0,-1);
}


function notag()
{
    outputtext.value = "";
    const ruby = withruby_radio.checked;
    const noruby = noruby_radio.checked;

    const ruby_parent = lyrics.atTag.ruby_parent;
    const ruby_begin = lyrics.atTag.ruby_begin;
    const ruby_end = lyrics.atTag.ruby_end;

    let output = "";
    lyrics.lines.forEach(line=>{
        line.units.forEach(rkunit=>{
            const phonetic = rkunit.phonetic.text_array.join("");
            if (ruby)
                output += rkunit.hasRuby ? (ruby_parent + rkunit.base_text + ruby_begin + phonetic + ruby_end) : phonetic;
            else
                output += (rkunit.hasRuby && noruby) ? rkunit.base_text : phonetic;

        });
        output += "\n";
    });
    outputtext.value = output.slice(0,-1);
}


(function LrcDownload(){
    document.getElementById('Download').addEventListener('click', (e)=>{
        e.preventDefault();
        const text = document.getElementById('EditOutputText').value;
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]),text], {type: 'text/plain'});
//        const blob = new Blob([text], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);

        const now = new Date();
        const y = now.getFullYear();
        const m = ('00' + (now.getMonth()+1)).slice(-2);
        const d = ('00' + now.getDate()).slice(-2);
        const h = ('00' + now.getHours()).slice(-2);
        const mi = ('00' + (now.getMinutes()+1)).slice(-2);

        if (audioFilename !== "")
        {
            const period = audioFilename.lastIndexOf(".");
            if (period <= 0)
                a.download = audioFilename + ".kra";
            else
                a.download = audioFilename.substring(0,period) + ".kra";
        }
        else
            a.download = y + "-" + m + d + "-" + h + mi + '.kra';
        a.href = url;

//    if (window.confirm('Download:"' + a.download + '"' ))
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });
}());



function Initialize(serialize)
{
    textarea.value = serialize;
}
function Terminalize()
{
    return textarea.value;
}
EditModeInitializer = {Initialize:Initialize,Terminalize:Terminalize};


}());
