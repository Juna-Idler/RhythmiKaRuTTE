
const textarea = document.getElementById("TestText");

//今はクロームしか対応してないけどこれで書記素で分割出来るらしい
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
var lyrics = new RubyKaraokeLyricsContainer(textarea.value,grapheme_split);


const list = document.getElementById("TagPointList");
const cursor = document.getElementById("TagPointCursor");

var currentLine = 0;
var currentTTPos = 0;

function MoveCursor()
{
    if (list.children.length === 0)
        return;
    if (currentLine >= list.children.length)
        currentLine = list.children.length - 1;
    const line = list.children[currentLine];
    if (currentTTPos < 0 || currentTTPos >= line.children.length * 2 + 2)
        currentTTPos = line.children.length * 2 + 2 - 1;

    if (currentTTPos === 0)
    {
//行頭
        cursor.style.top = (line.offsetTop + 24) + "px";
        cursor.style.left = (line.offsetLeft - 8) + "px";
    }
    else if (currentTTPos === line.children.length * 2 + 2 - 1)
    {
//行末
        if (line.children.length === 0)
        {
            cursor.style.top = (line.offsetTop + 24) + "px";
            cursor.style.left = (line.offsetLeft + 8) + "px";
        }
        else
        {
            const text = line.children[line.children.length-1];
            cursor.style.top = (text.offsetTop + text.offsetHeight) + "px";
            cursor.style.left = (text.offsetLeft + text.offsetWidth - cursor.offsetWidth + 8) + "px";
        }
    }
    else
    {
        const text = line.children[Math.floor((currentTTPos - 1) / 2)];
        if (currentTTPos & 1)
        {
    //文字前
            cursor.style.top = (text.offsetTop + text.offsetHeight) + "px";
            cursor.style.left = (text.offsetLeft) + "px";
        }
        else
        {
    //文字後        
            cursor.style.top = (text.offsetTop + text.offsetHeight) + "px";
            cursor.style.left = (text.offsetLeft + text.offsetWidth - cursor.offsetWidth) + "px";
        }
    }
    line.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"})
}

lyrics.lines.forEach(line=>{

    const li = document.createElement("li");
    li.classList.add("PointLine");

    line.units.forEach(runit=>{
        const  kunit = runit.hasRuby ? runit.ruby : runit.base;
        for (let i = 0;i < kunit.text_array.length;i++)
        {
            const text = document.createElement("span");
            text.textContent = kunit.text_array[i];
            text.classList.add("PointChar")
            text.dataset.start_time = kunit.start_times[i];
            text.dataset.end_time = kunit.end_times[i];
            li.appendChild(text);

        }
    });

    list.appendChild(li);
});

currentLine = 3;
MoveCursor();

//querySelector
//querySelectorAll

function onMouseClick(e)
{
}

function keydown(e)
{
    e.preventDefault();
    const line = list.children[currentLine];

    switch (e.code)
    {
        case "KeyA":case "ArrowLeft":
            if (currentTTPos < 0)
                currentTTPos = 0;
            else if (line.children.length * 2 + 2 <= currentTTPos)
                currentTTPos = line.children.length * 2 + 2;
            if (--currentTTPos < 0)
            {
                if (--currentLine < 0)
                {
                    currentLine = 0;
                    currentTTPos = 0;
                }
            }
            MoveCursor();
        break;
        case "KeyD":case "ArrowRight":
            if (currentTTPos < 0)
                currentTTPos = 0;
            else if (line.children.length * 2 + 2 <= currentTTPos)
                currentTTPos = line.children.length * 2 + 1;

            if (++currentTTPos >= line.children.length * 2 + 2)
            {
                if (currentLine + 1 < list.children.length)
                {
                    currentLine++;
                    currentTTPos = 0;
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
        break;
        case "Delete":
        break;
    }
}

document.addEventListener("keydown",keydown,false);


