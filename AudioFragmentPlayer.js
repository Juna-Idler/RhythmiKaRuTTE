
class AudioFragmentPlayer
{
    constructor()
    {
        this.context = new AudioContext();
        this.audioBuffer = null;
        this.only = null;
    }

    async load(arrayBuffer)
    {
        this.audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    }
    async loadFile(file)
    {
        await this.load( await file.arrayBuffer());
    }

    get isLoaded() {return this.audioBuffer !== null;}

    play(start_sec,duration)
    {
        if (!this.isLoaded)
            return;
        const source = this.context.createBufferSource();
        source.buffer = this.audioBuffer;
        source.connect(this.context.destination);
        source.start(this.context.currentTime,start_sec,duration);
        source.onended = (e)=>{
            source.disconnect();
            source.buffer = null;
        };
    }
    
    playOnly(start_sec,duration)
    {
        if (!this.isLoaded)
            return;
        if (this.only !== null)
        {
            this.only.stop();
            this.only = null;
        }
        const source = this.context.createBufferSource();
        source.buffer = this.audioBuffer;
        source.connect(this.context.destination);
        source.start(this.context.currentTime,start_sec,duration);
        this.only = source;
        source.onended = (e)=>{
            source.disconnect();
            source.buffer = null;
        };
    }

}
