
const textarea = document.getElementById("TestText");

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

    const chars = line.querySelectorAll(".PointChar");

    if (currentTTPos < 0)
        currentTTPos = chars.length * 2 + 2 - 1;

    if (currentTTPos === 0)
    {//行頭
        const head = line.querySelector(".PointHead");
        cursor.style.left =  head.offsetLeft + "px";
        cursor.style.top = "calc(" + (head.offsetTop + "px") + " + 1.4rem)";
    }
    else if (currentTTPos >= chars.length * 2 + 2 - 1)
    {//行末
        const tail = line.querySelector(".PointTail");
        cursor.style.left =  tail.offsetLeft + "px";
        cursor.style.top = "calc(" + (tail.offsetTop + "px") + " + 1.4rem)";
    }
    else
    {//文字前後
        const text = chars[Math.floor((currentTTPos - 1) / 2)];
        cursor.style.left = (currentTTPos & 1) ? (text.offsetLeft) + "px"
                                               : (text.offsetLeft + text.offsetWidth - cursor.offsetWidth) + "px";
        cursor.style.top = "calc(" + (text.offsetTop + "px") + " + 1.4rem)";
    }
    line.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"})
}

lyrics.lines.forEach(line=>{

    const li = document.createElement("li");
    li.classList.add("PointLine");
    li.onclick = (e)=>{
        const li = e.currentTarget;
        if (li !== e.target)
            return;
        if (e.offsetX + li.offsetLeft < li.firstElementChild.offsetLeft + li.firstElementChild.offsetWidth)//行頭
            currentTTPos = 0;
        else if (e.offsetX + li.offsetLeft >= li.lastElementChild.offsetLeft)//行末
            currentTTPos = li.children.length * 2 + 1;
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
    linehead.textContent = "[";
    const before = (line.start_time < 0) ? "NotPointBefore" : "PointBefore";
    linehead.classList.add(before);
    linehead.onclick = (e)=>{
        const li = e.currentTarget.parentElement;
        currentTTPos = 0;
        for (currentLine = 0;currentLine < list.children.length;currentLine++)
            if (list.children[currentLine] === li)
                break;
        MoveCursor();
    };
    li.appendChild(linehead);


    line.units.forEach(runit=>{
        const  kunit = runit.hasRuby ? runit.ruby : runit.base;
        for (let i = 0;i < kunit.text_array.length;i++)
        {
            const text = document.createElement("span");
            text.textContent = kunit.text_array[i];
            text.classList.add("PointChar")
            text.dataset.start_time = kunit.start_times[i];
            text.dataset.end_time = kunit.end_times[i];

            const before = (kunit.start_times[i] < 0) ? "NotPointBefore" : "PointBefore";
            text.classList.add(before);
            const after = (kunit.end_times[i] < 0) ? "NotPointAfter" : "PointAfter";
            text.classList.add(after);

            text.onclick = (e)=>{
                const li = e.currentTarget.parentElement;
                const chars = li.querySelectorAll(".PointChar");

                let i;
                for (i = 0;i < chars.length;i++)
                    if (chars[i] === e.currentTarget)
                        break;
                const rect = e.currentTarget.getBoundingClientRect();
                let after = (e.clientX - rect.left > rect.width / 2) ? 1 : 0;
                currentTTPos = i * 2 + 1 + after;
                for (i = 0;i < list.children.length;i++)
                    if (list.children[i] === li)
                        break;
                currentLine = i;
                MoveCursor();
            };
            li.appendChild(text);
        }
    });
    const linetail = document.createElement("span");
    linetail.classList.add("PointTail");
    linetail.dataset.end_time = line.end_time;
    linetail.textContent = "]";
    const after = (line.end_time < 0) ? "NotPointAfter" : "PointAfter";
    linetail.classList.add(after);
    linetail.onclick = (e)=>{
        const li = e.currentTarget.parentElement;
        currentTTPos = -1;
        for (currentLine = 0;currentLine < list.children.length;currentLine++)
            if (list.children[currentLine] === li)
                break;
        MoveCursor();
    };
    li.appendChild(linetail);

    list.appendChild(li);
});

currentLine = 3;
MoveCursor();

//querySelector
//querySelectorAll



function keydown(e)
{
    e.preventDefault();
    const line = list.children[currentLine];

    switch (e.code)
    {
        case "KeyA":case "ArrowLeft":
            if (currentTTPos < 0)
                currentTTPos = 0;
            else
            {
                const chars = line.querySelectorAll(".PointChar");
                if (chars.length * 2 + 1 < currentTTPos)
                    currentTTPos = chars.length * 2 + 1;
            }
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
            {
                const chars = line.querySelectorAll(".PointChar");
                if (currentTTPos < 0)
                    currentTTPos = 0;
                else if (chars.length * 2 + 1 < currentTTPos)
                    currentTTPos = chars.length * 2 + 1;
                if (++currentTTPos > chars.length * 2 + 1)
                {
                    if (currentLine + 1 < list.children.length)
                    {
                        currentLine++;
                        currentTTPos = 0;
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

                if (currentTTPos < 0)
                    currentTTPos = 0;
                else if (chars.length * 2 + 1 < currentTTPos)
                    currentTTPos = chars.length * 2 + 1;

                if (currentTTPos === 0)
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
                else if (currentTTPos >= chars.length * 2 + 1)
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
                    const text = chars[Math.floor((currentTTPos - 1) / 2)];
                    if (currentTTPos & 1)
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

document.addEventListener("keydown",keydown,false);


