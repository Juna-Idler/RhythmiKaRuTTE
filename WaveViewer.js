
class WaveViewer
{
    constructor(audioBuffer)
    {
        this.ms_length = 0;
        this.minSampleSet = null;
        this.maxSampleSet = null;

        let mono;
        if (audioBuffer.numberOfChannels > 1)
        {
            mono = new Float32Array(audioBuffer.length);
            const l = audioBuffer.getChannelData(0);
            const r = audioBuffer.getChannelData(1);
            for (let i = 0; i < audioBuffer.length;i++)
            {
                mono[i] = (l[i] + r[i]) / 2;
            }
        }
        else if (audioBuffer.numberOfChannels > 0)
        {
            mono = audioBuffer.getChannelData(0);
        }
        this.ms_length = Math.floor(audioBuffer.duration * 1000);

        //Samples per Sec = 1000   0.001秒
        this.minSampleSet = new Float32Array(this.ms_length + 100);
        this.maxSampleSet = new Float32Array(this.ms_length + 100);
        const frequency = audioBuffer.sampleRate;
        let sample_pos = 0;

        for (let i = 0;i < this.ms_length - 1;i++)
        {
            let min = 1,max = -1;
            while (sample_pos < (i + 1) * frequency / 1000)
            {
                min = Math.min(mono[sample_pos],min);
                max = Math.max(mono[sample_pos],max);
                sample_pos++;
            }
            this.minSampleSet[i] = min;
            this.maxSampleSet[i] = max;
        }
        while (sample_pos < audioBuffer.length)
        {
            this.minSampleSet[this.ms_length-1] = Math.min(mono[sample_pos],this.minSampleSet[this.ms_length-1]);
            this.maxSampleSet[this.ms_length-1] = Math.max(mono[sample_pos],this.maxSampleSet[this.ms_length-1]);
            sample_pos++;
        }
    }
    static async Create(arrayBuffer)
    {
        const actx = new AudioContext();
        return new WaveViewer(await actx.decodeAudioData(arrayBuffer));
    }


    get isValid() {return this.ms_length != 0;}

    DrawCanvas(canvas,start_ms,ms_per_dot,lazy = false)
    {
        if (!this.isValid)
            return ;
        const ctx = canvas.getContext('2d');
        var width  = canvas.width;
        var height = canvas.height;
        ctx.clearRect(0,0,width,height);

        let x = 0;
        start_ms = start_ms | 0;
        if (start_ms +  ms_per_dot * width > this.ms_length)
        {
            width = ((this.ms_length - start_ms) / ms_per_dot) | 0;
        }
        if (start_ms < 0)
        {
            x = (-start_ms / ms_per_dot) | 0;
            start_ms = 0;
        }
        ctx.fillStyle = "gray";

        let sample_pos = start_ms;
        for (;x < width;x++)
        {
            let min = 1,max = -1;
            if (lazy)
            {
                min = this.minSampleSet[sample_pos];
                max = this.maxSampleSet[sample_pos];
                sample_pos += ms_per_dot;
            }
            else
                for (let i = 0;i < ms_per_dot;i++)
                {
                    min = Math.min(this.minSampleSet[sample_pos],min);
                    max = Math.max(this.maxSampleSet[sample_pos],max);
                    sample_pos++;
                }
            ctx.fillRect(x,min * height/2 + height/2,1,(max - min) * height/2);
        }

    }

}