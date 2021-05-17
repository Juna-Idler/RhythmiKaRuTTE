
(function Mode_Stamp(){

const list = document.getElementById("TagStampList");
const cursor = document.getElementById("TagStampCursor");

var currentLine = 0;
var currentTTPos = 0;

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

    const marks = line.querySelectorAll(".StampMarker");
    if (marks.length === 0)
    {
        cursor.style.left = "0px";
        cursor.style.top = "calc(" + (line.offsetTop + "px") + " + 1.8rem)";
        line.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
        return;
    }

    if (currentTTPos < 0)
        currentTTPos = marks.length - 1;

    const mark = marks[currentTTPos];
    cursor.style.left = mark.offsetLeft + "px";
    cursor.style.top = "calc(" + (mark.offsetTop + "px") + " + 1.8rem)";
    line.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
}

function StepNext()
{
    const current_marks = list.children[currentLine].querySelectorAll(".StampMarker");
    if (currentTTPos + 1 >= current_marks.length)
    {
        for (let i = currentLine + 1;i < list.children.length;i++)
        {
            const marks = list.children[i].querySelectorAll(".StampMarker");
            if (marks.length > 0)
            {
                currentLine = i;
                currentTTPos = 0;
                return true;
            }
        }
        return false;
    }
    currentTTPos++;
    return true;
}
function StepPrev()
{
    if (currentTTPos - 1 < 0)
    {
        for (let i = currentLine - 1;i >= 0;i--)
        {
            const marks = list.children[i].querySelectorAll(".StampMarker");
            if (marks.length > 0)
            {
                currentLine = i;
                currentTTPos = marks.length - 1;
                return true;
            }
        }
        return false;
    }
    currentTTPos--;
    return true;
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
        break;
        case "KeyS":case "ArrowDown":
            if (currentLine + 1 < list.children.length)
                currentLine++;
            currentTTPos = 0;
            MoveCursor();
        break;

        case "Space":
        case "Enter":
            {
                const line = list.children[currentLine];
                const marks = line.querySelectorAll(".StampMarker");

                if (currentTTPos < 0 || currentTTPos >= marks.length)
                    break;

                const mark = marks[currentTTPos];
                if (mark.classList.contains("UpPoint"))
                    break;

                mark.dataset.time = audio.currentTime * 1000;
                mark.title = TimeTagElement.TimeString(audio.currentTime * 1000);
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
                mark.title = TimeTagElement.TimeString(audio.currentTime * 1000);
                StepNext();
                MoveCursor();
            }
        break;
    }
}

function append_marker(parent,time,option)
{
    if (time >= 0)
    {
        const marker = document.createElement("span");
        marker.classList.add("StampMarker");
        marker.dataset.time = time;
        marker.title = TimeTagElement.TimeString(time);
        if (option.includes("u"))
        {
            marker.classList.add("UpPoint");
            marker.textContent = "]";
        }
        else
            marker.textContent = "[";
        parent.appendChild(marker);
    }
}

function Initialize()
{
    const lyrics = new RubyKaraokeLyricsContainer(textarea.value,grapheme_split);
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
        };

        append_marker(li,line.start_time,line.start_option);
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
                    text.classList.add("StampChar")

                    append_marker(ruby,kunit.start_times[i],kunit.start_options[i]);
                    ruby.appendChild(text);
                    append_marker(ruby,kunit.end_times[i],kunit.end_options[i]);
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
                    text.classList.add("StampChar")

                    append_marker(li,kunit.start_times[i],kunit.start_options[i]);
                    li.appendChild(text);
                    append_marker(li,kunit.end_times[i],kunit.end_options[i]);
                }
            }
        });
        append_marker(li,line.end_time,line.end_option);
        list.appendChild(li);
    });

    currentLine = 0;
    document.addEventListener("keydown",keydown,false);
    document.addEventListener("keyup",keyup,false);
    MoveCursor();
}

function serialize(e)
{
    if (e.classList.contains("StampMarker"))
    {
        const option = (e.classList.contains("UpPoint")) ? "pu" : "p";
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
}

StampModeInitializer = {Initialize:Initialize,Terminalize:Terminalize};

}());

