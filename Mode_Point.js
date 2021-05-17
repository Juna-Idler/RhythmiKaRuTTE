

(function Mode_Point(){


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

    const chars = line.querySelectorAll(".PointChar");

    if (currentCursorPos < 0)
        currentCursorPos = chars.length * 2 + 2 - 1;

    if (currentCursorPos === 0)
    {//行頭
        const head = line.querySelector(".PointHead");
        cursor.style.left =  head.offsetLeft + "px";
        cursor.style.top = "calc(" + (head.offsetTop + "px") + " + 1.8rem)";
    }
    else if (currentCursorPos >= chars.length * 2 + 2 - 1)
    {//行末
        const tail = line.querySelector(".PointTail");
        cursor.style.left =  tail.offsetLeft + "px";
        cursor.style.top = "calc(" + (tail.offsetTop + "px") + " + 1.8rem)";
    }
    else
    {//文字前後
        const text = chars[Math.floor((currentCursorPos - 1) / 2)];
        cursor.style.left = (currentCursorPos & 1) ? (text.offsetLeft) + "px"
                                               : (text.offsetLeft + text.offsetWidth - cursor.offsetWidth) + "px";
        cursor.style.top = "calc(" + (text.offsetTop + "px") + " + 1.8rem)";
    }
    line.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"})
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
function keydown(e)
{
    e.preventDefault();
    const line = list.children[currentLine];

    switch (e.code)
    {
        case "KeyA":case "ArrowLeft":
            if (currentCursorPos < 0)
                currentCursorPos = 0;
            else
            {
                const chars = line.querySelectorAll(".PointChar");
                if (chars.length * 2 + 1 < currentCursorPos)
                    currentCursorPos = chars.length * 2 + 1;
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
                const chars = line.querySelectorAll(".PointChar");
                if (currentCursorPos < 0)
                    currentCursorPos = 0;
                else if (chars.length * 2 + 1 < currentCursorPos)
                    currentCursorPos = chars.length * 2 + 1;
                if (++currentCursorPos > chars.length * 2 + 1)
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
                const chars = line.querySelectorAll(".PointChar");

                if (currentCursorPos < 0)
                    currentCursorPos = 0;
                else if (chars.length * 2 + 1 < currentCursorPos)
                    currentCursorPos = chars.length * 2 + 1;

                if (currentCursorPos === 0)
                {
                    if (e.ctrlKey)
                    {
                        if (line.firstElementChild.classList.toggle("UpPointBefore"))
                            line.firstElementChild.classList.remove("NotPointBefore");
                        line.firstElementChild.classList.add("PointBefore");
                    }
                    else
                    {
                        line.firstElementChild.classList.toggle("PointBefore");
                        line.firstElementChild.classList.toggle("NotPointBefore");
                    }
                }
                else if (currentCursorPos >= chars.length * 2 + 1)
                {
                    if (e.ctrlKey)
                    {
                        if (line.lastElementChild.classList.toggle("UpPointAfter"))
                            line.lastElementChild.classList.remove("NotPointAfter");
                        line.lastElementChild.classList.add("PointAfter");
                    }
                    else
                    {
                        line.lastElementChild.classList.toggle("PointAfter");
                        line.lastElementChild.classList.toggle("NotPointAfter");
                    }
                }
                else
                {
                    const text = chars[Math.floor((currentCursorPos - 1) / 2)];
                    if (currentCursorPos & 1)
                    {
                        if (e.ctrlKey)
                        {
                            if (text.classList.toggle("UpPointBefore"))
                                text.classList.remove("NotPointBefore");
                            text.classList.add("PointBefore");
                        }
                        else
                        {    
                            text.classList.toggle("PointBefore");
                            text.classList.toggle("NotPointBefore");
                        }
                    }
                    else
                    {
                        if (e.ctrlKey)
                        {
                            if (text.classList.toggle("UpPointAfter"))
                                text.classList.remove("NotPointAfter");
                            text.classList.add("PointAfter");
                        }
                        else
                        {    
                            text.classList.toggle("PointAfter");
                            text.classList.toggle("NotPointAfter");
                        }
                    }
                }
            }
        break;
        case "Delete":
        break;
    }
}

function before_option_classes(option)
{
    const ret = [];
    if (option.includes("p")) ret.push("PointBefore");
    if (option.includes("u")) ret.push("UpPointBefore");
    return ret;
}
function after_option_classes(option)
{
    const ret = [];
    if (option.includes("p")) ret.push("PointAfter");
    if (option.includes("u")) ret.push("UpPointAfter");
    return ret;
}


function Initialize()
{
    const lyrics = new RubyKaraokeLyricsContainer(textarea.value,grapheme_split);
    ruby_parent = lyrics.atRubyTag.ruby_parent;
    ruby_begin = lyrics.atRubyTag.ruby_begin;
    ruby_end = lyrics.atRubyTag.ruby_end;
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

        const linehead = document.createElement("span");
        linehead.classList.add("PointHead");
        linehead.dataset.start_time = line.start_time;
        if (line.start_option)
        {
            linehead.classList.add(...before_option_classes(line.start_option));
        }
        else {
            const before = (line.start_time < 0) ? "NotPointBefore" : "PointBefore";
            linehead.classList.add(before);
        }
        linehead.onclick = (e)=>{
            const li = e.currentTarget.parentElement;
            currentCursorPos = 0;
            for (currentLine = 0;currentLine < list.children.length;currentLine++)
                if (list.children[currentLine] === li)
                    break;
            MoveCursor();
        };
        li.appendChild(linehead);


        line.units.forEach(rkunit=>{
            if (rkunit.hasRuby)
            {
                const ruby = document.createElement("ruby");
                const rt = document.createElement("rt");
                rt.textContent = rkunit.base.text;

                const kunit = rkunit.ruby;
                for (let i = 0;i < kunit.text_array.length;i++)
                {
                    const text = document.createElement("span");
                    text.textContent = kunit.text_array[i];
                    text.classList.add("PointChar")
                    text.dataset.start_time = kunit.start_times[i];
                    text.dataset.end_time = kunit.end_times[i];

                    if (kunit.start_options[i])
                    {
                        text.classList.add(...before_option_classes(kunit.start_options[i]));
                    }
                    else
                    {
                        const before = (kunit.start_times[i] < 0) ? "NotPointBefore" : "PointBefore";
                        text.classList.add(before);
                    }
                    if (kunit.end_options[i])
                    {
                        text.classList.add(...after_option_classes(kunit.end_options[i]));
                    }
                    else
                    {
                        const after = (kunit.end_times[i] < 0) ? "NotPointAfter" : "PointAfter";
                        text.classList.add(after);
                    }
                    text.onclick = textOnClick;
                    ruby.appendChild(text);
                }
                ruby.appendChild(rt);
                li.appendChild(ruby);
            }
            else
            {
                const kunit = rkunit.base;
                for (let i = 0;i < kunit.text_array.length;i++)
                {
                    const text = document.createElement("span");
                    text.textContent = kunit.text_array[i];
                    text.classList.add("PointChar")
                    text.dataset.start_time = kunit.start_times[i];
                    text.dataset.end_time = kunit.end_times[i];

                    if (kunit.start_options[i])
                    {
                        text.classList.add(...before_option_classes(kunit.start_options[i]));
                    }
                    else
                    {
                        const before = (kunit.start_times[i] < 0) ? "NotPointBefore" : "PointBefore";
                        text.classList.add(before);
                    }
                    if (kunit.end_options[i])
                    {
                        text.classList.add(...after_option_classes(kunit.end_options[i]));
                    }
                    else
                    {
                        const after = (kunit.end_times[i] < 0) ? "NotPointAfter" : "PointAfter";
                        text.classList.add(after);
                    }

                    text.onclick = textOnClick;
                    li.appendChild(text);
                }
            }
        });
        const linetail = document.createElement("span");
        linetail.classList.add("PointTail");
        linetail.dataset.end_time = line.end_time;
        if (line.end_option)
        {
            linetail.classList.add(...after_option_classes(line.end_option));
        }
        else
        {
            const after = (line.end_time < 0) ? "NotPointAfter" : "PointAfter";
            linetail.classList.add(after);
        }
        linetail.onclick = (e)=>{
            const li = e.currentTarget.parentElement;
            currentCursorPos = -1;
            for (currentLine = 0;currentLine < list.children.length;currentLine++)
                if (list.children[currentLine] === li)
                    break;
            MoveCursor();
        };
        li.appendChild(linetail);

        list.appendChild(li);
    });

    currentLine = 0;
    MoveCursor();
    document.addEventListener("keydown",keydown,false);
}

function before_option(e)
{
    return (e.classList.contains("PointBefore") ? "p" : "") + (e.classList.contains("UpPointBefore") ? "u" : "");
}
function after_option(e)
{
    return (e.classList.contains("PointAfter") ? "p": "") + (e.classList.contains("UpPointAfter") ? "u" : "");
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
                            if (e.classList.contains("PointBefore"))
                            {
                                ruby_text += TimeTagElement.TimeString_option(e.dataset.start_time >= 0 ? e.dataset.start_time : TimeTagElement.MaxTime_ms,before_option(e));
                            }
                            ruby_text += e.textContent;
                            if (e.classList.contains("PointAfter"))
                            {
                                ruby_text += TimeTagElement.TimeString_option(e.dataset.end_time >= 0 ? e.dataset.end_time : TimeTagElement.MaxTime_ms,after_option(e));
                            }
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
                if (e.classList.contains("PointBefore"))
                {
                    text += TimeTagElement.TimeString_option(e.dataset.start_time >= 0 ? e.dataset.start_time : TimeTagElement.MaxTime_ms,before_option(e));
                }
                text += e.textContent;
                if (e.classList.contains("PointAfter"))
                {
                    text += TimeTagElement.TimeString_option(e.dataset.end_time >= 0 ? e.dataset.end_time : TimeTagElement.MaxTime_ms,after_option(e));
                }
            }
        }
        text += "\n";
    }
    textarea.value = text.slice(0,-1);    

    while (list.firstChild)
        list.firstChild.remove();
    document.removeEventListener("keydown",keydown,false);
}


function CheckBeforeOn(element,flag)
{
    if (flag)
    {
        element.classList.remove("UpPointBefore");
        element.classList.remove("NotPointBefore");
        element.classList.add("PointBefore");
    }
    else
    {
        element.classList.remove("UpPointBefore");
        element.classList.add("NotPointBefore");
        element.classList.remove("PointBefore");
    }
}
function CheckAfterOn(element,flag,up = false)
{
    if (flag)
    {
        element.classList.remove("NotPointAfter");
        element.classList.add("PointAfter");
        element.classList.toggle("UpPointAfter",up);
    }
    else
    {
        element.classList.remove("UpPointAfter");
        element.classList.add("NotPointAfter");
        element.classList.remove("PointAfter");
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

    for (let i = 0;i < list.children.length;i++)
    {
        const line = list.children[i];
        const chars = line.querySelectorAll(".PointChar");

        if (chars.length == 0)//空行
        {
            const flag = true;//空行にチェックするフラグ
            CheckBeforeOn(line.firstElementChild,flag);
            CheckAfterOn(line.lastElementChild,false);//行末は基本無し
            continue;
        }
        if (chars[0].textContent === '@' || chars[0].textContent === '[')
        {//行頭の@やタイムタグではない[は行ごと無視
            continue;
        }
        CheckBeforeOn(line.firstElementChild,false);//行頭も基本は無し
        CheckAfterOn(line.lastElementChild,false);//行末は基本無し
        
    //空白文字以外の行頭文字は問答無用でチェック
        if (!isWhiteSpace(chars[0].textContent))
            CheckBeforeOn(chars[0],true);

        CheckAfterOn(chars[0],false);//後ろは基本的に付けない

        for (let j = 1;j < chars.length;j++)
        {
            const char = chars[j];
            const pc = chars[j-1].textContent;

            if (isWhiteSpace( char.textContent ))
            {
                //空白前設定があれば
                CheckBeforeOn(char,false);
            }
            else if (isAlphabet(char.textContent) || isNumber( char.textContent ) || isASCIISymbol( char.textContent ))
            {
                if ( isAlphabet( pc ) || isNumber( pc ) || isASCIISymbol( pc ) )
                {
                    CheckBeforeOn(char,false);
                }
                else
                {
                    CheckBeforeOn(char,true);
                }
            }
            else
            {
                switch ( char.textContent )
                {
                case 'ゃ':case 'ゅ':case 'ょ':
                case 'ャ':case 'ュ':case 'ョ':
                case 'ぁ':case 'ぃ':case 'ぅ':case 'ぇ':case 'ぉ':
                case 'ァ':case 'ィ':case 'ゥ':case 'ェ':case 'ォ':
                case 'ー':case '～':
                    CheckBeforeOn(char,false);
                    break;
                case 'ん':
                    CheckBeforeOn(char,true);
                    break;
                case 'っ':
                    CheckBeforeOn(char,true);
                    break;
                default:
                    CheckBeforeOn(char,true);
                    break;
                }
            }
            CheckAfterOn(char,false);//後ろは基本的に付けない

        }
        if (!isWhiteSpace(chars[chars.length-1].textContent))
        {
            CheckAfterOn(chars[chars.length-1],true,true);
        }
    }
}

PointModeInitializer = {Initialize:Initialize,Terminalize:Terminalize};

}());

