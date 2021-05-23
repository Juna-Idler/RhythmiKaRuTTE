
(function Mode_Stamp(){

const list = document.getElementById("TagStampList");
const cursor = document.getElementById("TagStampCursor");

var currentLine = 0;
var currentTTPos = 0;

var ruby_parent;
var ruby_begin;
var ruby_end;

function Stamp_DrawWaveView()
{
    if (!waveViewer)
        return;

    const width  = canvas.width;
    const height = canvas.height;
    const nowpoint = Math.floor(width * 0.3)
    waveViewer.DrawCanvas(canvas,WaveViewTime - (nowpoint * 1000/Magnification),1000/Magnification);
    const ctx = canvas.getContext("2d");

    if (list.children.length > 0)
    {
        const view_start_ms = WaveViewTime - (nowpoint * 1000/Magnification);
        const view_end_ms = view_start_ms + (canvas.width * 1000/Magnification);

        ctx.font = canvas.height / 4 + "px sans-serif";
        ctx.textBaseline = "ideographic";

        if (currentLine >= list.children.length)
            currentLine = list.children.length - 1;
        const np = NextPoint(currentLine,-1);
        const pp = PrevPoint(currentLine,0);

        const line = list.children[currentLine];
        const sub_lines = [];
        if (np) sub_lines.push(list.children[np.line]);
        if (pp) sub_lines.push(list.children[pp.line]);


        const marks = line.querySelectorAll(".StampMarker");
        for (let i = 0;i < marks.length;i++)
        {
            const time = Number(marks[i].dataset.time);
            if (time >= 0 && time >= view_end_ms)
                break;
            if (time < 0)
                continue;
            ctx.fillStyle = i === currentTTPos ? "lime" : "red";
            const x = (time - view_start_ms) * Magnification/1000;

            ctx.fillRect(x,0,1,canvas.height);
            const next = marks[i].nextElementSibling;
            if (next && next.textContent && !marks[i].classList.contains("UpPoint") &&
                next.tagName.toLowerCase() !== "ruby")
            {
                ctx.fillStyle = "white";
                ctx.fillText(next.textContent, x + 1, canvas.height);
            }
        }
        sub_lines.forEach(l=>{
            const marks = l.querySelectorAll(".StampMarker");
            for (let i = 0;i < marks.length;i++)
            {
                const time = Number(marks[i].dataset.time);
                if (time >= 0 && time >= view_end_ms)
                    break;
                if (time < 0)
                    continue;
                ctx.fillStyle = "blue";
                const x = (time - view_start_ms) * Magnification/1000;
    
                ctx.fillRect(x,0,1,canvas.height);
                const next = marks[i].nextElementSibling;
                if (next && next.textContent && !marks[i].classList.contains("UpPoint") &&
                    next.tagName.toLowerCase() !== "ruby")
                {
                    ctx.fillStyle = "white";
                    ctx.fillText(next.textContent, x + 1, canvas.height);
                }
            }
        });

    }



    ctx.fillStyle = "white";
    ctx.fillRect(nowpoint,0,1,height);
}


function MoveCursor()
{
    if (list.children.length === 0)
        return;
    if (currentLine >= list.children.length)
        currentLine = list.children.length - 1;
    const line = list.children[currentLine];

    const marks = line.querySelectorAll(".StampMarker");
    if (marks.length === 0)
    {
        cursor.style.left = "0px";
        cursor.style.top = "calc(" + (line.offsetTop + "px") + " + 1.8rem)";
        line.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
        return;
    }

    if (currentTTPos < 0 || currentTTPos >= marks.length)
        currentTTPos = marks.length - 1;

    const mark = marks[currentTTPos];
    cursor.style.left = mark.offsetLeft + "px";
    cursor.style.top = "calc(" + (mark.offsetTop + "px") + " + 1.8rem)";
    line.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
}

function NextPoint(line,ttpos)
{
    const current_marks = list.children[line].querySelectorAll(".StampMarker");
    if (ttpos < 0)
        ttpos = current_marks.length - 1;
    if (ttpos + 1 >= current_marks.length)
    {
        for (let i = line + 1;i < list.children.length;i++)
        {
            const marks = list.children[i].querySelectorAll(".StampMarker");
            if (marks.length > 0)
            {
                return {line:i,ttpos:0};
            }
        }
        return null;
    }
    return {line:line,ttpos:ttpos + 1};
}
function PrevPoint(line,ttpos)
{
    if (ttpos - 1 < 0)
    {
        for (let i = line - 1;i >= 0;i--)
        {
            const marks = list.children[i].querySelectorAll(".StampMarker");
            if (marks.length > 0)
            {
                return {line:i,ttpos:marks.length - 1};
            }
        }
        return null;
    }
    return {line:line,ttpos:ttpos - 1};
}

function StepNext()
{
    const np = NextPoint(currentLine,currentTTPos);
    if (np !== null)
    {
        currentLine = np.line;
        currentTTPos = np.ttpos;
        return true;
    }
    return false;
}
function StepPrev()
{
    const pp = PrevPoint(currentLine,currentTTPos);
    if (pp !== null)
    {
        currentLine = pp.line;
        currentTTPos = pp.ttpos;
        return true;
    }
    return false;
}

function GetCurrentTime()
{
    const current_marks = list.children[currentLine].querySelectorAll(".StampMarker");
    if (0 <= currentTTPos && currentTTPos < current_marks.length)
    {
        return current_marks[currentTTPos].dataset.time;
    }
    return -1;
}

function keydown(e)
{
    e.preventDefault();

    switch (e.code)
    {
        case "KeyA":case "ArrowLeft":
            StepPrev();
            MoveCursor();
        break;
        case "KeyD":case "ArrowRight":
            StepNext();
            MoveCursor();
        break;
        case "KeyW":case "ArrowUp":
            if (--currentLine < 0)
                currentLine = 0;
            currentTTPos = 0;
            MoveCursor();
            {
            const time = GetCurrentTime();
            if (time >= 0) audio.currentTime = time /1000;
            }
        break;
        case "KeyS":case "ArrowDown":
            if (currentLine + 1 < list.children.length)
                currentLine++;
            currentTTPos = 0;
            MoveCursor();
            {
                const time = GetCurrentTime();
                if (time >= 0) audio.currentTime = time /1000;
            }
        break;
        case "Space":
        case "Enter":
            if (!e.repeat)
            {
                const line = list.children[currentLine];
                const marks = line.querySelectorAll(".StampMarker");

                if (currentTTPos < 0 || currentTTPos >= marks.length)
                    break;

                const mark = marks[currentTTPos];
                if (mark.classList.contains("UpPoint"))
                    break;

                mark.dataset.time = audio.currentTime * 1000;
                mark.title = TimeTagElement.TimeString(mark.dataset.time);
                StepNext();
                MoveCursor();
            }
        break;
        case "Delete":
        break;
        case "KeyZ":
            audio.currentTime = (audio.currentTime - 1 < 0) ? 0 : audio.currentTime - 1;
        break;
        case "KeyX":
            if (audio.paused)
                audio.play();
            else
                audio.pause();
        break;
        case "KeyC":
            audio.currentTime = audio.currentTime + 1;
        break;
    }
    DrawWaveView();
}
function keyup(e)
{
    e.preventDefault();

    switch (e.code)
    {
        case "Space":
        case "Enter":
            {
                const line = list.children[currentLine];
                const marks = line.querySelectorAll(".StampMarker");

                if (currentTTPos < 0 || currentTTPos >= marks.length)
                    break;

                const mark = marks[currentTTPos];
                if (!mark.classList.contains("UpPoint"))
                    break;
                mark.dataset.time = audio.currentTime * 1000;
                mark.title = TimeTagElement.TimeString(mark.dataset.time);
                StepNext();
                MoveCursor();
                DrawWaveView();
            }
        break;
    }
}

function append_marker(parent,ref_node,time,option)
{
    if (time >= 0)
    {
        const marker = document.createElement("span");
        marker.classList.add("StampMarker");
        if (option.includes("n"))
            marker.dataset.time = -1;
        else
            marker.dataset.time = time;
        marker.title = (marker.dataset.time < 0) ? "null" : TimeTagElement.TimeString(marker.dataset.time);
        if (option.includes("u"))
        {
            marker.classList.add("UpPoint");
            marker.textContent = "]";
        }
        else
            marker.textContent = "[";
        parent.insertBefore(marker,ref_node);
    }
}

function Initialize()
{
    const lyrics = CreateLyricsContainer(textarea.value);
    ruby_parent = lyrics.atRubyTag.ruby_parent;
    ruby_begin = lyrics.atRubyTag.ruby_begin;
    ruby_end = lyrics.atRubyTag.ruby_end;

    lyrics.lines.forEach(line=>{
        const li = document.createElement("li");
        li.classList.add("StampLine");
        li.onclick = (e)=>{
            const li = e.currentTarget;
            let i;
            for (i = 0;i < list.children.length;i++)
                if (list.children[i] === li)
                    break;
            currentLine = i;
            currentTTPos = 0;
            MoveCursor();
            DrawWaveView();
        };

        append_marker(li,null,line.start_time,line.start_option);
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
            let span = null;
            for (let i = 0;i < kunit.text_array.length;i++)
            {
                if (kunit.start_times[i] >= 0)
                {
                    if (span !== null)
                    {
                        parent_element.insertBefore(span,ref_node);
                    }
                    span = document.createElement("span");
                    span.classList.add("StampChar")
                    append_marker(parent_element,ref_node,kunit.start_times[i],kunit.start_options[i]);
                }
                else if (span === null)
                {
                    span = document.createElement("span");
                    span.classList.add("StampChar")
                }
                span.textContent += kunit.text_array[i];
                if (kunit.end_times[i] >= 0)
                {
                    parent_element.insertBefore(span,ref_node);
                    append_marker(parent_element,ref_node,kunit.end_times[i],kunit.end_options[i]);
                    span = null;
                }
            }
            if (span !== null)
            {
                parent_element.insertBefore(span,ref_node);
            }

        });
        append_marker(li,null,line.end_time,line.end_option);
        list.appendChild(li);
    });

    if (currentLine >= list.children.length)
        currentLine = list.children.length;
    document.addEventListener("keydown",keydown,false);
    document.addEventListener("keyup",keyup,false);
    MoveCursor();
    DrawWaveView = Stamp_DrawWaveView;
    DrawWaveView();
}

function serialize(e)
{
    if (e.classList.contains("StampMarker"))
    {
        const option = (e.classList.contains("UpPoint")) ? "up" : "p";
        if (e.dataset.time < 0)
            return TimeTagElement.TimeString_option(0,option + "n");
        return TimeTagElement.TimeString_option(e.dataset.time,option);
    }
    else if (e.classList.contains("StampChar"))
    {
        return e.textContent;
    }
    return "";
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
                    if (e.tagName.toLowerCase() === "rt")
                        parent_text = e.textContent;
                    else
                        ruby_text += serialize(e);
                }
                text += ruby_parent + parent_text + ruby_begin + ruby_text + ruby_end;
            }
            else
            {
                text += serialize(li.children[j]);
            }
        }
        text += "\n";
    }
    textarea.value = text.slice(0,-1);    

    while (list.firstChild)
        list.firstChild.remove();
    document.removeEventListener("keyup",keyup,false);
    document.removeEventListener("keydown",keydown,false);
    DrawWaveView = DefaultDrawWaveView;
}

StampModeInitializer = {Initialize:Initialize,Terminalize:Terminalize};

}());

