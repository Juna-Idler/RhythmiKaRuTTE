(function TTTester(){

const list = document.getElementById('TestLyricsView');

const activeline_fadeout_time = "0.5s";
var time_offset = 0;

function Tick(timestamp)
{
    const now = ((audio.currentTime - time_offset) < 0 ? 0 : (audio.currentTime - time_offset)) * 1000;

    const lines = list.querySelectorAll("li");
    for (let i = 0;i < lines.length;i++)
    {
        if (lines[i].dataset.start_time <= now && now < lines[i].dataset.end_time)
        {
            const activeline = lines[i];
            if (activeline.classList.contains("KaraokeStanbyLine"))
            {
                activeline.classList.replace("KaraokeStanbyLine","KaraokeActiveLine");
                activeline.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
            const chars = activeline.querySelectorAll("span");
            for (let j = 0;j < chars.length;j++)
            {
                const activechar = chars[j];
                if (!activechar.classList.contains("KaraokeActiveWord"))
                {
                    activechar.style.transitionProperty = "color , text-shadow";
                    let d = activechar.dataset.end_time - activechar.dataset.start_time;
                    activechar.style.transitionDuration = d + "ms";
                    let delay = activechar.dataset.start_time - now;
                    if (delay < 0) delay = 0;
                    activechar.style.transitionDelay = delay + "ms";
                    activechar.classList.add("KaraokeActiveWord");
                }
            }
            }
        }
        else
        {
            const stanbyline = lines[i];
            if (stanbyline.classList.contains("KaraokeActiveLine"))
            {
                const chars = stanbyline.querySelectorAll("span");
                chars.forEach(char =>{
                    char.style.transitionDelay = "0ms";
                    char.style.transitionDuration = activeline_fadeout_time;
                    char.classList.remove("KaraokeActiveWord");
                });
                stanbyline.classList.replace("KaraokeActiveLine","KaraokeStanbyLine");
            }

        }

    }

    if (!audio.paused)
        window.requestAnimationFrame(Tick);
}

function onPlay()
{
    window.requestAnimationFrame(Tick);
}
function onTimeupdate()
{
    Tick();
}

var text_data;
function Initialize(serialize)
{
    text_data = serialize;
    const lyrics = CreateLyricsContainer(serialize);
    time_offset = lyrics.atTag.offset;

    const lines = lyrics.lines.filter(line =>{
        if (line.start_time >= 0) return true;
        if (line.units.length > 0 && line.units[0].start_time >= 0) return true;
        return false;
    });
    lines.push(new RubyKaraokeLyricsLine("[99:59.99] ",lyrics.atTag));

    for (let i = 0; i < lines.length-1;i++)
    {
        if (lines[i].start_time < 0)
            lines[i].start_time = lines[i].units[0].start_time;
        if (lines[i].end_time < 0)
        {
            let next_time = lines[i+1].start_time;
            if (next_time < 0)
                next_time = lines[i+1].units[0].start_time;
            lines[i].end_time = (lines[i].units.length > 0) ? Math.max(lines[i].units[lines[i].units.length-1].end_time,next_time) : next_time;
        }
        lines[i].Complement();
    }

    lines.forEach(line => {
        let li = document.createElement("li");
        li.classList.add("KaraokeLine","KaraokeStanbyLine");
        li.dataset.start_time = line.start_time;
        li.dataset.end_time = line.end_time;

        line.units.forEach(rkunit=>{
            let parent_element = li;
            if (rkunit.hasRuby)
            {
                const ruby = document.createElement("ruby");
                const rt = document.createElement("rt");
                const base = document.createElement("span");
                base.textContent = rkunit.base_text;
                base.dataset.start_time = rkunit.start_time;
                base.dataset.end_time = rkunit.end_time;
                ruby.appendChild(base);
                ruby.appendChild(rt);
                li.appendChild(ruby);

                parent_element = rt;
            }
            const kunit = rkunit.phonetic;
            let span = null;
            for (let i = 0;i < kunit.text_array.length;i++)
            {
                if (kunit.start_times[i] >= 0)
                {
                    if (span !== null)
                    {
                        span.dataset.end_time = kunit.start_times[i];
                        parent_element.appendChild(span);
                    }
                    span = document.createElement("span");
                    span.dataset.start_time = kunit.start_times[i];
                }
                span.textContent += kunit.text_array[i];
                if (kunit.end_times[i] >= 0)
                {
                    span.dataset.end_time = kunit.end_times[i];
                    parent_element.appendChild(span);
                    span = null;
                }
            }
            if (span !== null)
            {
                span.dataset.end_time = kunit.end_time;
                parent_element.appendChild(span);
            }
            
        });
        list.appendChild(li);
    });

    const li = document.createElement("li");
    li.dataset.start_time = 99 * 60000 + 59990;
    list.appendChild(li);

    audio.addEventListener("play",onPlay);
    audio.addEventListener("timeupdate",onTimeupdate);
}
function Terminalize()
{
    while (list.firstChild)
        list.firstChild.remove();

    audio.removeEventListener("play",onPlay);
    audio.removeEventListener("timeupdate",onTimeupdate);

    return text_data;
}
TestModeInitializer = {Initialize:Initialize,Terminalize:Terminalize};

}());
