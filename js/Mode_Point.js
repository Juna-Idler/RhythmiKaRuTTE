

(function Mode_Point(){

const TagPoint = document.getElementById("TagPoint");

TagPoint.innerHTML =`
<div id="TagPointListScroll">
<ol id="TagPointList">
</ol>
<div id="TagPointCursor">▲</div>
</div>
<div class="bottom_controls_area">
<label for="PointSettingSwitch"  id="PointSettingOpen" class="bottom_controls">Auto Pointing</label>
<label for="LinePointSettingSwitch"  id="LinePointSettingOpen" class="bottom_controls">Line Sync</label>
</div>
<input type="checkbox" id="PointSettingSwitch">
<div id="PointSettingOverlap">
<div id="PointSettingPanel">
<ul>
    <li><label><input type="checkbox" id="PointCheckん" checked>「ん」にチェック</label></li>
    <li><label><input type="checkbox" id="PointCheckっ" checked>「っ」にチェック</label></li>
    <li><label><input type="checkbox" id="PointCheckBlankLineHead">空行行頭にチェック （Mark "blank line" head）</label></li>
    <li><label><input type="checkbox" id="PointCheckLineTail" checked>行末文字の後ろにチェック （Mark after last letter of line）</label><label><input type="checkbox" id="PointCheckLineTail_keyup" checked>keyup</label></li>
    <li><label><input type="checkbox" id="PointCheckWordEnd">空白の前に文字があればチェック （Mark blank after letter）</label><label><input type="checkbox" id="PointCheckWordEnd_keyup" checked>keyup</label></li>
    <li><label><input type="checkbox" id="PointCheckAlphabetSyllables">Mark alphabet syllables</label></li>
</ul>
<button id="AutoPointing" type="button" class="bottom_controls">Start</button>
<label for="PointSettingSwitch" id="PointSettingClose" class="bottom_controls">×</label>
</div>
</div>

<input type="checkbox" id="LinePointSettingSwitch">
<div id="LinePointSettingOverlap">
<div id="LinePointSettingPanel">
<ul>
    <li><label><input type="checkbox" id="LinePointCheckBlankLineHead">空行にもチェック （Mark blank line）</label></li>
    <li><label><input type="checkbox" id="LinePointCheckLineTail">行末にもチェック （Mark end of line）</label><label><input type="checkbox" id="LinePointCheckLineTail_keyup">keyup</label></li>
</ul>
<button id="LineAutoPointing" type="button" class="bottom_controls">Start</button>
<label for="LinePointSettingSwitch" id="LinePointSettingClose" class="bottom_controls">×</label>
</div>
</div>

`;

const list = document.getElementById("TagPointList");
const cursor = document.getElementById("TagPointCursor");

var currentLine = 0;
var currentCursorPos = 0;

var ruby_parent;
var ruby_begin;
var ruby_end;

function MoveCursor()
{
    if (list.children.length === 0)
        return;
    if (currentLine >= list.children.length)
        currentLine = list.children.length - 1;
    const line = list.children[currentLine];

    const markers = line.querySelectorAll(".PointMarker");

    if (currentCursorPos < 0)
        currentCursorPos = markers.length - 1;

    const marker = currentCursorPos < markers.length ? markers[currentCursorPos] : markers[markers.length-1];
    cursor.style.left =  marker.offsetLeft + "px";
    cursor.style.top = "calc(" + (marker.offsetTop + "px") + " + 1.8rem)";

    line.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"})
}


function keydown(e)
{
    e.preventDefault();
    const line = list.children[currentLine];

    switch (e.code)
    {
        case "KeyA":case "ArrowLeft":
            {
                const markers = line.querySelectorAll(".PointMarker");
                if (currentCursorPos >= markers.length)
                    currentCursorPos = markers.length - 1;
            }
            if (--currentCursorPos < 0)
            {
                if (--currentLine < 0)
                {
                    currentLine = 0;
                    currentCursorPos = 0;
                }
            }
            MoveCursor();
        break;
        case "KeyD":case "ArrowRight":
            {
                const markers = line.querySelectorAll(".PointMarker");
                if (currentCursorPos < 0)
                    currentCursorPos = 0;
                else if (currentCursorPos >= markers.length)
                    currentCursorPos = markers.length - 1;
                if (++currentCursorPos >= markers.length)
                {
                    if (currentLine + 1 < list.children.length)
                    {
                        currentLine++;
                        currentCursorPos = 0;
                    }
                }
            }
            MoveCursor();
        break;
        case "KeyW":case "ArrowUp":
            if (--currentLine < 0)
                currentLine = 0;
            MoveCursor();
        break;
        case "KeyS":case "ArrowDown":
            if (currentLine + 1 < list.children.length)
                currentLine++;
            MoveCursor();
        break;

        case "Space":
        case "Enter":
            {
                const markers = line.querySelectorAll(".PointMarker");

                if (currentCursorPos < 0)
                    currentCursorPos = 0;
                else if (currentCursorPos >= markers.length)
                    currentCursorPos = markers.length - 1;

                if (e.ctrlKey)
                {
                    if (markers[currentCursorPos].classList.toggle("MarkUpPoint"))
                        markers[currentCursorPos].textContent = "]";
                    else
                        markers[currentCursorPos].textContent = "[";
                    markers[currentCursorPos].classList.add("MarkPoint");
                    markers[currentCursorPos].classList.remove("NotMarkPoint");
                }
                else
                {
                    markers[currentCursorPos].classList.toggle("MarkPoint");
                    markers[currentCursorPos].classList.toggle("NotMarkPoint");
                }
            }
        break;
        case "Delete":
        break;
    }
}

function textOnClick(e)
{
    let li = e.currentTarget.parentElement;
    while (li.tagName.toLowerCase() !== "li")
    {
        li = li.parentElement;
    }
    const chars = li.querySelectorAll(".PointChar");
    const rect = e.currentTarget.getBoundingClientRect();
    let after = (e.clientX - rect.left > rect.width / 2) ? 1 : 0;
    let i;
    for (i = 0;i < chars.length;i++)
        if (chars[i] === e.currentTarget)
            break;
    currentCursorPos = i * 2 + 1 + after;
    for (i = 0;i < list.children.length;i++)
        if (list.children[i] === li)
            break;
    currentLine = i;
    MoveCursor();
}

function marker_onlick(e){
    let li = e.currentTarget.parentElement;
    while (li.tagName.toLowerCase() !== "li") {
        li = li.parentElement;
    }
    const markers = li.querySelectorAll(".PointMarker");
    for (currentCursorPos = 0;currentCursorPos < markers.length;currentCursorPos++)
        if (markers[currentCursorPos] === e.currentTarget)
            break;
    for (currentLine = 0;currentLine < list.children.length;currentLine++)
        if (list.children[currentLine] === li)
            break;
    MoveCursor();
};

function create_pointmarker(time,option)
{
    const marker = document.createElement("span");
    marker.classList.add("PointMarker");
    marker.textContent= "[";
    marker.dataset.time = time;
    if (time < 0)
    {
        marker.classList.add("NotMarkPoint");
    }
    else
    {
        marker.classList.add("MarkPoint");
        if (option)
        {
            if (option.includes("u"))
            {
                marker.classList.add("MarkUpPoint");
                marker.textContent = "]";
            }
            if (option.includes("n"))
                marker.dataset.time = -1;
        }
    }
    marker.onclick = marker_onlick;
    marker.title = (marker.dataset.time < 0) ? "null" : TimeTagElement.TimeString(marker.dataset.time);
    return marker;
}

function Initialize(serialize)
{
    const lyrics = CreateLyricsContainer(serialize);
    ruby_parent = lyrics.atTag.ruby_parent;
    ruby_begin = lyrics.atTag.ruby_begin;
    ruby_end = lyrics.atTag.ruby_end;

    lyrics.lines.forEach(line=>{
        const li = document.createElement("li");
        li.classList.add("PointLine");
        li.onclick = (e)=>{
            const li = e.currentTarget;
            if (li !== e.target)
                return;
            if (e.offsetX + li.offsetLeft < li.firstElementChild.offsetLeft + li.firstElementChild.offsetWidth)//行頭
                currentCursorPos = 0;
            else if (e.offsetX + li.offsetLeft >= li.lastElementChild.offsetLeft)//行末
                currentCursorPos = -1;
            else//文字部分は文字単位のonclickに任せる
                return;
            let i;
            for (i = 0;i < list.children.length;i++)
                if (list.children[i] === li)
                    break;
            currentLine = i;
            MoveCursor();
        };
        const linehead = create_pointmarker(line.start_time,line.start_option);
        li.appendChild(linehead);

        line.units.forEach(rkunit=>{
            let parent_element = li;
            let ref_node = null;
            if (rkunit.hasRuby)
            {
                const ruby = document.createElement("ruby");
                const rt = document.createElement("rt");
                rt.textContent = rkunit.base_text;
                ruby.appendChild(rt);
                li.appendChild(ruby);
                parent_element = ruby;
                ref_node = rt;
            }
            const kunit = rkunit.phonetic;
            for (let i = 0;i < kunit.text_array.length;i++)
            {
                const frontmarker = create_pointmarker(kunit.start_times[i],kunit.start_options[i]);
                const rearmarker= create_pointmarker(kunit.end_times[i],kunit.end_options[i]);

                const text = document.createElement("span");
                text.textContent = kunit.text_array[i];
                text.classList.add("PointChar")
                text.onclick = textOnClick;

                parent_element.insertBefore(frontmarker,ref_node);
                parent_element.insertBefore(text,ref_node);
                parent_element.insertBefore(rearmarker,ref_node);
            }
        });
        const linetail = create_pointmarker(line.end_time,line.end_option);
        li.appendChild(linetail);

        list.appendChild(li);
    });

    if (currentLine >= list.children.length)
        currentLine = list.children.length;
    MoveCursor();
    document.addEventListener("keydown",keydown,false);
}

function option_string(e)
{
    return (e.classList.contains("MarkUpPoint") ? "u" : "") + (e.classList.contains("MarkPoint") ? "p" : "");
}

function Terminalize()
{
    let text = "";
    for (let i = 0; i < list.children.length;i++)
    {
        const li = list.children[i];
        for (let j = 0;j < li.children.length;j++)
        {
            if (li.children[j].tagName.toLowerCase() === "ruby")
            {
                const ruby = li.children[j];

                let parent_text = "";
                let ruby_text = "";
                for (let k = 0;k < ruby.children.length;k++)
                {
                    const e = ruby.children[k];
                    switch (e.tagName.toLowerCase())
                    {
                        case "span":
                            if (e.classList.contains("PointMarker"))
                            {
                                if (!e.classList.contains("NotMarkPoint"))
                                {
                                    if (e.dataset.time < 0)
                                        ruby_text += TimeTagElement.TimeString_option(TimeTagElement.MaxTime_ms,"n" + option_string(e));
                                    else
                                        ruby_text += TimeTagElement.TimeString_option(e.dataset.time,option_string(e));
                                }
                            }
                            else if (e.classList.contains("PointChar"))
                                ruby_text += e.textContent;
                            break;
                        case "rt":
                            parent_text += e.textContent;
                            break;
                    }
                }
                text += ruby_parent + parent_text + ruby_begin + ruby_text + ruby_end;
            }
            else
            {
                const e = li.children[j];
                if (e.classList.contains("PointMarker"))
                {
                    if (!e.classList.contains("NotMarkPoint"))
                    {
                        if (e.dataset.time < 0)
                            text += TimeTagElement.TimeString_option(TimeTagElement.MaxTime_ms,"n" + option_string(e));
                        else
                            text += TimeTagElement.TimeString_option(e.dataset.time,option_string(e));
                    }
                }
                else if (e.classList.contains("PointChar"))
                    text += e.textContent;
            }
        }
        text += "\n";
    }

    while (list.firstChild)
        list.firstChild.remove();
    document.removeEventListener("keydown",keydown,false);

    return text.slice(0,-1);
}


function CheckMarker(marker_element,flag,up = false)
{
    if (flag)
    {
        marker_element.classList.remove("NotMarkPoint");
        marker_element.classList.add("MarkPoint");
        if (marker_element.classList.toggle("MarkUpPoint",up))
            marker_element.textContent = "]";
        else
            marker_element.textContent = "[";
    }
    else
    {
        marker_element.classList.remove("MarkUpPoint");
        marker_element.classList.add("NotMarkPoint");
        marker_element.classList.remove("MarkPoint");
    }
}

function isWhiteSpace(c)
{
    return c.match(/^\s$/) !== null;
}
function isAlphabet(c)
{
    return c.match(/^[a-zA-Zａ-ｚＡ-Ｚ]$/) !== null;
}
function isASCIISymbol( c )
{
    return c.match(/^[!"#$%&'()\*\+\-\.,\/:;<=>?@\[\\\]^_`{|}~]$/) !== null;
}
function isNumber(c)
{
    return c.match(/^[0-9０-９]$/) !== null;
}

document.getElementById("AutoPointing").onclick = (e)=>{

    const checkん = document.getElementById("PointCheckん").checked;
    const checkっ = document.getElementById("PointCheckっ").checked;
    const checkBlankLineHead = document.getElementById("PointCheckBlankLineHead").checked;
    const checkLineTail = document.getElementById("PointCheckLineTail").checked;
    const checkLineTail_ku = document.getElementById("PointCheckLineTail_keyup").checked;
    const checkWordEnd = document.getElementById("PointCheckWordEnd").checked;
    const checkWordEnd_ku = document.getElementById("PointCheckWordEnd_keyup").checked;
    const checkAlphabetSyllables = document.getElementById("PointCheckAlphabetSyllables").checked;


    for (let i = 0;i < list.children.length;i++)
    {
        const line = list.children[i];
        const chars = line.querySelectorAll(".PointChar");
        const markers = line.querySelectorAll(".PointMarker");

        if (chars.length == 0)//空行
        {
            CheckMarker(markers[0],checkBlankLineHead);//空行行頭にチェック
            CheckMarker(markers[markers.length-1],false);//行末は基本無し
            continue;
        }
        if (chars[0].textContent === '@' || chars[0].textContent === '[')
        {//行頭の"@"や"["は行ごと無視
            continue;
        }
        CheckMarker(markers[0],false);
        CheckMarker(markers[markers.length-1],false);
    
    //空白文字以外の行頭文字は問答無用でチェック
        if (!isWhiteSpace(chars[0].textContent))
            CheckMarker(markers[1],true);

        CheckMarker(markers[2],false);//後ろは基本的に付けない

        for (let j = 1;j < chars.length;j++)
        {
            const char = chars[j].textContent;
            const before = markers[j * 2 + 1];
            const after = markers[j * 2 + 2];
            const pc = chars[j-1].textContent;

            if (isWhiteSpace( char ))
            {
                //空白の前に文字があればチェック
                CheckMarker(before,!isWhiteSpace(pc) && checkWordEnd,checkWordEnd_ku);
            }
            else if (isAlphabet(char) || isNumber( char ) || isASCIISymbol( char ))
            {
                if ( isAlphabet( pc ) || isNumber( pc ) || isASCIISymbol( pc ) ) {
                    CheckMarker(before,false);
                }
                else {
                    CheckMarker(before,true);
                }
            }
            else
            {
                switch ( char )
                {
                case 'ゃ':case 'ゅ':case 'ょ':
                case 'ャ':case 'ュ':case 'ョ':
                case 'ぁ':case 'ぃ':case 'ぅ':case 'ぇ':case 'ぉ':
                case 'ァ':case 'ィ':case 'ゥ':case 'ェ':case 'ォ':
                case 'ー':case '～':
                    CheckMarker(before,false);
                    break;
                case 'ん':
                    CheckMarker(before,checkん);
                    break;
                case 'っ':
                    CheckMarker(before,checkっ);
                    break;
                default:
                    CheckMarker(before,true);
                    break;
                }
            }
            CheckMarker(after,false);//後ろは基本的に付けない
        }
        if (!isWhiteSpace(chars[chars.length-1].textContent))
        {
            //行末文字の後ろにチェック
            CheckMarker(markers[chars.length * 2],checkLineTail,checkLineTail_ku);
        }

        if (checkAlphabetSyllables)
        {
            for (let j = 0;j < chars.length;j++)
            {
                if (chars[j].textContent.match(/^[a-zA-Z0-9]$/) != null || isASCIISymbol( chars[j].textContent ))
                {
                    let word= chars[j].textContent;
                    for (let k = j + 1;k < chars.length;k++)
                    {
                        if (chars[k].textContent.match(/^[a-zA-Z0-9]$/) != null || isASCIISymbol( chars[k].textContent ))
                        {
                            word += chars[k].textContent;
                            continue;
                        }
                        break;
                    }
                    const s = syllables(word);
                    if (s.length > 1)
                    {
                        let offset = s[0].length;
                        for (let l = 1;l < s.length;l++)
                        {
                            CheckMarker(markers[(j + offset) * 2 + 1],true);
                            offset += s[l].length;
                        }
                    }
                    j += word.length;
                }
            }
        }
    }
    document.getElementById("PointSettingSwitch").checked = false;
}

document.getElementById("LineAutoPointing").onclick = (e)=>{

    const checkBlankLineHead = document.getElementById("LinePointCheckBlankLineHead").checked;
    const checkLineTail = document.getElementById("LinePointCheckLineTail").checked;
    const checkLineTail_ku = document.getElementById("LinePointCheckLineTail_keyup").checked;


    for (let i = 0;i < list.children.length;i++)
    {
        const line = list.children[i];
        const chars = line.querySelectorAll(".PointChar");
        const markers = line.querySelectorAll(".PointMarker");


        if (chars.length == 0)//空行
        {
            CheckMarker(markers[0],checkBlankLineHead);//空行行頭にチェック
            CheckMarker(markers[markers.length-1],false);//空行行末は基本無し
            continue;
        }
        if (chars[0].textContent === '@' || chars[0].textContent === '[')
        {//行頭の"@"や"["は行ごと無視
            continue;
        }
        for (let j = 0;j < markers.length;j++)
        {
            CheckMarker(markers[j],false);  //全部削除
        }
        CheckMarker(markers[1],true);
        CheckMarker(markers[markers.length-2],checkLineTail,checkLineTail_ku);
    }
    document.getElementById("LinePointSettingSwitch").checked = false;
}


PointModeInitializer = {Initialize:Initialize,Terminalize:Terminalize};

}());

