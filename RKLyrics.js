class TimeTagElement
{
    static Create(text)
    {
        let match = text.match(/^\[(\d+):(\d+)[:.](\d+)\](.*)$/);
        if (match)
        {
            const second = parseFloat(match[2] + '.' + match[3]);
            const this_start_time = (match[1] * 60000 + second * 1000) | 0;
            return new TimeTagElement(this_start_time,match[4]);
        }
        return new TimeTagElement(-1,text);
    }
    constructor(start_time,text)
    {
        this.text = text;
        this.start_time = start_time;
    }
    toString()
    {
        return TimeTagElement.TimeString(this.start_time) + this.text;
    }
    static TimeString(time_ms)
    {
        return time_ms < 0 ? "" : '[' + String(Math.floor(time_ms / 60000)).padStart(2,'0') +
                                  ':' + ('0' + (time_ms % 60000 / 1000).toFixed(2)).slice(-5) + ']';
    }
}

//カラオケタイムタグ文字列
class KaraokeUnit
{
    constructor(text_array,start_times,end_times)
    {
        this.text_array = text_array;
        this.start_times = start_times;
        this.end_times = end_times;
    }

    static Create(text,split)
    {
        const elements = KaraokeUnit.Parse(text);
        const this_text_array = [];
        elements.forEach(e=>{
            const text_array = split(e.text);
            this_text_array.push(...text_array);
            e.text_length = text_array.length;
        });
        
        let start_times = new Array(this_text_array.length + 2).fill(-1);
        let end_times = new Array(this_text_array.length + 2).fill(-1);
        let text_pos = 1;
        for (let i = 0;i < elements.length;i++)
        {
            const e = elements[i];
            if (e.text_length > 0)
                start_times[text_pos] = e.start_time;
            else if (end_times[text_pos - 1] < 0)
                end_times[text_pos - 1] = e.start_time;

            text_pos += e.text_length;
        }

        return new KaraokeUnit(this_text_array,start_times.slice(1,start_times.length-1),end_times.slice(1,end_times.length-1));
    }
    get start_time(){return this.start_times[0];}
    get end_time(){return this.end_times[this.end_times.length-1];}

    static Parse(text)
    {
        const elements = [];
        const head = text.match(/^\[(\d+):(\d+)[:.](\d+)\]/);
        if (head)
        {
            const ttelements = text.match(/\[\d+:\d+[:.]\d+\].*?((?=\[\d+:\d+[:.]\d+\])|$)/g);
            ttelements.forEach(tte => {elements.push(TimeTagElement.Create(tte));});
        }
        else
        {
            const ttelements = ("[00:00.00]" + text).match(/\[\d+:\d+[:.]\d+\].*?((?=\[\d+:\d+[:.]\d+\])|$)/g);
            ttelements.forEach(tte => {elements.push(TimeTagElement.Create(tte));});
            elements[0].start_time = -1;
        }
        return elements;
    }
}

//ルビ付き（かもしれない）カラオケタイムタグ付き文字列
class RubyKaraokeUnit
{
    constructor(base_karaokeunit,ruby_karaokeunit = null)
    {
        this.base = base_karaokeunit;
        this.ruby = ruby_karaokeunit;
        if (this.noRuby)
        {
            this.start_time = this.base.start_time;
            this.end_time = this.base.end_time;
        }
        else
        {
            if (this.base.start_time < 0 && this.ruby.start_time < 0)
                this.Start_time = -1;
            else if (this.base.start_time >= 0 && this.ruby.start_time >= 0)
            {
                this.start_time = Math.min(this.base.start_time,this.ruby.start_time);
            }
            else
            {
                this.start_time = Math.max(this.base.start_time,this.ruby.start_time);
                this.base.start_times[0] = this.ruby.start_times[0] = this.start_time;
            }
            this.end_time = Math.max(this.base.end_time,this.ruby.end_time);
            this.base.end_times[this.base.end_times.length-1] = this.base.end_time < 0 ? this.end_time : this.base.end_time;
            this.ruby.end_times[this.ruby.end_times.length-1] = this.ruby.end_time < 0 ? this.end_time : this.ruby.end_time;
        }
    }

    get hasRuby() {return this.ruby !== null;}
    get noRuby() {return this.ruby === null;}

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
    

//ルビ指定のためのテキスト内の@行処理
class AtRubyTag
{
    constructor(parent = "｜" ,begin = "《" ,end = "》")
    {
        this.ruby_parent = parent;
        this.ruby_begin = begin;
        this.ruby_end = end;

        this.rubying = [];
    }
    LoadAtRubyTag(lyricstext)
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
    constructor(textline,atrubytag,split)
    {
        this.units = [];
        const ruby_units = atrubytag.Translate(textline);
        for (let i = 0; i < ruby_units.length;i++)
        {
            this.units.push(
                new RubyKaraokeUnit(
                    KaraokeUnit.Create(ruby_units[i].base,split),
                    ruby_units[i].hasRuby ? KaraokeUnit.Create(ruby_units[i].ruby,split) : null));
        }
        const array = KaraokeUnit.Parse(textline);
        this.start_time =  (array[0].start_time >= 0 && array[0].text === "") ? array[0].start_time : -1;
        this.end_time = (array.length > 1 && array[array.length-1].text === "" && array[array.length-2].text === "") ?
                        array[array.length-1].start_time : -1;
    }
}

class RubyKaraokeLyricsContainer
{
    //厳密に書記素で分割したいなら、splitに文字列を取って文字配列を返す適当な関数を
    constructor(lyricstext,split = Array.from)
    {
        this.atRubyTag = new AtRubyTag();
        this.atRubyTag.LoadAtRubyTag(lyricstext);

        this.lines = [];
        lyricstext.split(/\r\n|\r|\n/).forEach(line => {
            this.lines.push(new RubyKaraokeLyricsLine(line,this.atRubyTag,split));
        });

    }
}


