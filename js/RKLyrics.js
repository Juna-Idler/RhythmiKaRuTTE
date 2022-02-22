
//編集用特殊パラメータ付与可能タイムタグ

class TimeTagElement
{
    static Create(text)
    {
        let match = text.match(/^\[(\d+):(\d+)[:.](\d+)(;[^\]]*)?\](.*)$/);
        if (match)
        {
            const second = parseFloat(match[2] + '.' + match[3]);
            const this_start_time = (match[1] * 60000 + second * 1000) | 0;
            return new TimeTagElement(this_start_time,match[5],match[4] == null ? "" : match[4]);
        }
        return new TimeTagElement(-1,text);
    }
    constructor(start_time,text,option = "")
    {
        this.text = text;
        this.start_time = start_time;
        this.option = option;
    }
    toString()
    {
        return TimeTagElement.TimeString_option(this.start_time,this.option) + this.text;
    }
    static TimeString(time_ms)
    {
        return time_ms < 0 ? "" : '[' + String(Math.floor(time_ms / 60000)).padStart(2,'0') +
                                  ':' + ('0' + (time_ms % 60000 / 1000).toFixed(2)).slice(-5) + ']';
    }
    static TimeString_option(time_ms,option)
    {
        return time_ms < 0 ? "" : '[' + String(Math.floor(time_ms / 60000)).padStart(2,'0') +
                                  ':' + ('0' + (time_ms % 60000 / 1000).toFixed(2)).slice(-5) +
                                  (option ? (";" + option) : "") + ']';
    }

    static get MaxTime_ms() {return (99 * 60 + 59) * 1000 + 990;}
}

//カラオケタイムタグ文字列
class KaraokeUnit
{
    constructor(text_array,start_times,end_times,start_options,end_options)
    {
        this.text_array = text_array;
        this.start_times = start_times;
        this.end_times = end_times;
        this.start_options = start_options;
        this.end_options = end_options;
    }

    static Create(text,split = Array.from)
    {
        const elements = KaraokeUnit.Parse(text);
        let text_length = 0;
        elements.forEach(e=>{text_length += e.text.length;});
        if (text_length === 0)
        {
            return new KaraokeUnit([""],[elements[0].start_time],[elements[elements.length-1].start_time],
                                        [elements[0].option],[elements[elements.length-1].option]);
        }

        const this_text_array = [];
        elements.forEach(e=>{
            const text_array = split(e.text);
            this_text_array.push(...text_array);
            e.text_length = text_array.length;
        });
        let start_times = new Array(this_text_array.length + 2).fill(-1);
        let end_times = new Array(this_text_array.length + 2).fill(-1);
        let start_options = new Array(this_text_array.length + 2).fill("");
        let end_options = new Array(this_text_array.length + 2).fill("");
        let text_pos = 1;
        for (let i = 0;i < elements.length;i++)
        {
            const e = elements[i];
            if (e.text_length > 0)
            {
                start_times[text_pos] = e.start_time;
                start_options[text_pos] = e.option;
            }
            else if (end_times[text_pos - 1] < 0)
            {
                end_times[text_pos - 1] = e.start_time;
                end_options[text_pos - 1] = e.option;
            }
            text_pos += e.text_length;
        }

        return new KaraokeUnit(this_text_array,start_times.slice(1,start_times.length-1),end_times.slice(1,end_times.length-1),
                                start_options.slice(1,start_options.length-1),end_options.slice(1,end_options.length-1));
    }
    get start_time(){return this.start_times[0];}
    get end_time(){return this.end_times[this.end_times.length-1];}
    get text(){return this.text_array.join("");}
    get start_option(){return this.start_options[0];}
    get end_option(){return this.end_options[this.end_options.length-1];}


    static Parse(text)
    {
        const elements = [];
        const head = text.match(/^\[(\d+):(\d+)[:.](\d+)(;[^\]]*)?\]/);
        if (head)
        {
            const ttelements = text.match(/\[\d+:\d+[:.]\d+(;[^\]]*)?\].*?((?=\[\d+:\d+[:.]\d+(;[^\]]*)?\])|$)/g);
            ttelements.forEach(tte => {elements.push(TimeTagElement.Create(tte));});
        }
        else
        {
            const ttelements = ("[00:00.00]" + text).match(/\[\d+:\d+[:.]\d+(;[^\]]*)?\].*?((?=\[\d+:\d+[:.]\d+(;[^\]]*)?\])|$)/g);
            ttelements.forEach(tte => {elements.push(TimeTagElement.Create(tte));});
            elements[0].start_time = -1;
        }
        return elements;
    }

    Complement()
    {
        for (let i = 0;i < this.text_array.length - 1;i++) {
            if (this.end_times[i] < 0 && this.start_times[i+1] >= 0) {
                this.end_times[i] = this.start_times[i+1];
                continue;
            }
            if (this.end_times[i] >= 0 && this.start_times[i+1] < 0)
                this.start_times[i+1] = this.end_times[i];
        }
    }
    getFirstTime()
    {
        for (let i = 0; i < this.text_array.length;i++)
        {
            if (this.start_times[i] >= 0)
            {
                return {count:i,time:this.start_times[i]};
            }
        }
        return {count:this.text_array.length,time:this.end_time};
    }
    getLastTime()
    {
        for (let i = this.text_array.length-1; i >= 0;i--)
        {
            if (this.end_times[i] >= 0)
            {
                return {count:this.text_array.length - i - 1,time:this.end_times[i]};
            }
        }
        return {count:this.text_array.length,time:this.start_time};
    }


}

//ルビ付き（かもしれない）カラオケタイムタグ付き文字列
class RubyKaraokeUnit
{
    constructor(phonetic_karaokeunit,base_text = null)
    {
        this.phonetic = phonetic_karaokeunit;
        this.base_text = base_text;
    }
    get start_time() {return this.phonetic.start_time;}
    get end_time() {return this.phonetic.end_time;}
    set start_time(time) {this.phonetic.start_times[0] = time;}
    set end_time(time) {this.phonetic.end_times[this.phonetic.end_times.length-1] = time;}

    get start_option() {return this.phonetic.start_option;}
    get end_option() {return this.phonetic.end_option;}

    get hasRuby() {return this.base_text !== null;}
    get noRuby() {return this.base_text === null;}

}

//====================================================================================================
//ここからしばらくルビ系クラス
//====================================================================================================

//ルビ付き（かもしれない）文字
class RubyUnit
{
    constructor(base,ruby = null)
    {
        this.base = base;
        this.ruby = ruby;
    }
    get hasRuby() {return this.ruby != null;}
    get noRuby() {return this.ruby == null;}
}

//エスケープコードは拾った
(function (w) {
    var reRegExp = /[\\^$.*+?()[\]{}|]/g,
        reHasRegExp = new RegExp(reRegExp.source);

    function escapeRegExp(string) {
        return (string && reHasRegExp.test(string))
            ? string.replace(reRegExp, '\\$&')
            : string;
    }

    w.escapeRegExp = escapeRegExp;
})(window);
    

//ルビ指定（だけじゃないけど）のためのテキスト内の@行処理
class AtTagContainer
{
    constructor(parent = "｜" ,begin = "《" ,end = "》")
    {
        this.ruby_parent = parent;
        this.ruby_begin = begin;
        this.ruby_end = end;

        this.offset = 0;//秒単位

        this.rubying = [];
    }
    LoadAtTag(lyricstext)
    {
        this.lines = [];
        lyricstext.split(/\r\n|\r|\n/).forEach(line => {
            const at = line.match(/^@([^=]+)=(.*)/);
            if (at)
            {
                const name = at[1].toLowerCase(),value = at[2];
                if (name == "ruby_parent")
                {
                    this.ruby_parent = value;
                }
                else if (name == "ruby_begin")
                {
                    this.ruby_begin = value;
                }
                else if (name == "ruby_end")
                {
                    this.ruby_end = value;
                }
                else if (name == "ruby_set")
                {
                    //ルビ指定にタグと紛らわしい[]を使わないとするなら一行で書ける @ruby_set=[｜][《][》]
                    const mat = value.match(/\[([^\[\]]+)\]\[([^\[\]]+)\]\[([^\[\]]+)\]/);
                    if (mat)
                    {
                        this.ruby_parent = mat[1];
                        this.ruby_begin = mat[2];
                        this.ruby_end = mat[3];
                    }
                }
                else if (name == "ruby")
                {//今回は使わないけど、一応読み込みだけはしておく
                    this.rubying.push(value);
                }
                else if (name == "offset")
                {
                    //@offsetはあったほうが地味に便利
                    this.offset = Number(value);
                    if (this.offset >= 10 || this.offset <= -10)
                        this.offset = this.offset / 1000;
                }
                else
                {//使う予定はないがとりあえず保存だけはしておく
                    this[name] = value;
                }
            }
            const offsettag = line.match(/^\[offset:([^\]]+)\]$/);
            if (offsettag)
            {
                //[]タグは知らんけど、[offset:ぐらいは読んでやってもいい
                    this.offset = Number(offsettag[1]);
                    if (this.offset >= 10 || this.offset <= -10)
                        this.offset = this.offset / 1000;
            }

        });
    }


    Translate(text)
    {
        let result = [];
        let target = text;
        const reg = new RegExp(escapeRegExp(this.ruby_parent) + "(.+?)" + escapeRegExp(this.ruby_begin) + "(.+?)" + escapeRegExp(this.ruby_end));
        do
        {
            const rubyblock = target.match(reg);
            if (rubyblock)
            {
                if (rubyblock.index > 0)
                {
                    result.push(new RubyUnit(target.substring(0,rubyblock.index)));
                }
                result.push(new RubyUnit(rubyblock[1],rubyblock[2]));
                target = target.substring(rubyblock.index + rubyblock[0].length);
            }
            else
            {
                result.push(new RubyUnit(target));
                break;
            }
        } while (target.length > 0);

        return result;
    }    
}


//====================================================================================================
//ここまでルビ系クラス
//====================================================================================================



class RubyKaraokeLyricsLine
{
    constructor(textline,atTag,split = Array.from)
    {
        if (textline[0] === '@')
        {
            this.units = [new RubyKaraokeUnit(KaraokeUnit.Create(textline,split),null)];
            this.start_time = this.end_time =  -1;
            this.start_option = this.end_option = "";
            return;
        }
        this.units = [];
        const ruby_units = atTag.Translate(textline);
        for (let i = 0; i < ruby_units.length;i++)
        {
            if (ruby_units[i].hasRuby)
            {
                this.units.push(new RubyKaraokeUnit(KaraokeUnit.Create(ruby_units[i].ruby,split),
                                                    KaraokeUnit.Create(ruby_units[i].base,split).text));
            }
            else
            {
                this.units.push(new RubyKaraokeUnit(KaraokeUnit.Create(ruby_units[i].base,split),null));
            }
        }
        for (let i = 0;i < this.units.length;i++)
        {
            if (this.units[i].phonetic.text === "")
            {
                if (i + 1 < this.units.length)
                {
                    if (this.units[i+1].start_time < 0)
                        this.units[i+1].start_time = this.units[i].start_time;
                }
                if (i - 1 >= 0 && this.units[i-1].end_time < 0)
                {
                    if (i === this.units.length - 1 || (i + 1 < this.units.length && this.units[i+1].start_time >= 0))
                    {
                        this.units[i-1].end_time = this.units[i].end_time;
                    }
                }
            }
        }
        this.units = this.units.filter(u=>u.phonetic.text !== "");


        const array = KaraokeUnit.Parse(textline);
        if (array[0].start_time >= 0 && (array[0].text === "" || array[0].text.indexOf(atTag.ruby_parent) == 0))
            this.start_time = array[0].start_time;
        else
            this.start_time = -1;

        if (array.length > 1 && array[array.length-1].text === "" &&
            (array[array.length-2].text === "" || array[array.length-2].text.lastIndexOf(atTag.ruby_end) == (array[array.length-2].text.length - atTag.ruby_end.length)))
            this.end_time = array[array.length-1].start_time;
        else
            this.end_time = -1;
        this.start_option = this.start_time >= 0 ? array[0].option : "";
        this.end_option = this.end_time >= 0 ? array[array.length-1].option : "";

    }
    Complement()
    {
        if (this.start_time < 0 || this.end_time < 0)
            return false;
        if (this.units.length === 0)
            return true;
        if (this.units[0].start_time < 0)
            this.units[0].start_time = this.start_time;
        if (this.units[this.units.length-1].end_time < 0)
            this.units[this.units.length-1].end_time = this.end_time;

        this.units.forEach(u=>u.phonetic.Complement());

        for (let i = 0;i < this.units.length - 1;i++)
        {
            if (this.units[i].end_time < 0 && this.units[i+1].start_time < 0)
            {
                const prev = this.units[i].phonetic.getLastTime();
                let nc = 0;
                let nt = 0;
                for (let j = i+1;j < this.units.length;j++)
                {
                    const next = this.units[j].phonetic.getFirstTime();
                    nc += next.count;
                    if (next.time >= 0)
                    {
                        nt = next.time;
                        break;
                    }
                }
                const divtime = (prev.time * nc + nt * prev.count) / (prev.count + nt);
                this.units[i].end_time = this.units[i+1].start_time = divtime;
            }
            else
            {
                if (this.units[i+1].start_time < 0)
                    this.units[i+1].start_time = this.units[i].end_time;
                else if (this.units[i].end_time < 0)
                    this.units[i].end_time = this.units[i+1].start_time;
            }
        }

    }
}

class RubyKaraokeLyricsContainer
{
    //厳密に書記素で分割したいなら、splitに文字列を取って文字配列を返す適当な関数を
    constructor(lyricstext,split = Array.from)
    {
        this.atTag = new AtTagContainer();
        this.atTag.LoadAtTag(lyricstext);

        this.lines = [];
        lyricstext.split(/\r\n|\r|\n/).forEach(line => {
            this.lines.push(new RubyKaraokeLyricsLine(line,this.atTag,split));
        });

    }
}


