
function SoundManager(fileList) {

    this.loaded = false;
    this.isPlaying = false;
    this.files = fileList;

    this.duration;
    this.startedOn;
    this.analyzer_music = null;
    this.analyzerNode_music = null;  
    this.analyzer_voice = null;
    this.analyzerNode_voice = null;
    
    this.audioCtx = Detector.audiocontext;
    this.audio_instrumental = null;
    this.audio_vocal = null;

    this.thingy;

}


/**
 * Load files.
 */
SoundManager.prototype.init = function(){

    // spectrum analyzer
    this.analyzerNode_music = this.audioCtx.createScriptProcessor(2048, 1, 1);
    this.analyzerNode_music.connect(this.audioCtx.destination); 

    this.analyzerNode_voice = this.audioCtx.createScriptProcessor(2048, 1, 1);
    this.analyzerNode_voice.connect(this.audioCtx.destination);

    this.analyser_music = this.audioCtx.createAnalyser();
    this.analyser_music.smoothingTimeConstant = 0.3;
    this.analyser_music.fftSize = 512; 

    this.analyser_voice = this.audioCtx.createAnalyser();
    this.analyser_voice.smoothingTimeConstant = 0.3;
    this.analyser_voice.fftSize = 512;

    // pitch processor
    this.thingy = this.audioCtx.createScriptProcessor(8192, 1, 1);
    this.thingy.onaudioprocess = function(ev) {
        var inp = ev.inputBuffer.getChannelData(0); 
        var out = ev.outputBuffer.getChannelData(0);
        var a;
        var s;
        var l = inp.length;
        for (var i = 0; i < l; i++) {
                a = Math.floor( i * Karaoke.soundPitch );
                if(a >= l) {
                    a = l-(a-l)-1;
                }
                s = inp[a];
                out[i] = s;
        }
    }

    // load audio buffers
    var bufferLoader = new BufferLoader(this.audioCtx, this.files, function (bufferList) {
            
            this.audio_instrumental = this.audioCtx.createBufferSource();
            this.audio_instrumental.buffer = bufferList[0];
            this.audio_instrumental.loop = true;
            
            
            this.audio_vocal = this.audioCtx.createBufferSource();
            this.audio_vocal.buffer = bufferList[1];
            this.audio_vocal.loop = true;
            

            this.duration = bufferList[0].duration * 1000;


            this.audio_vocal.connect(this.analyser_voice);
            this.analyser_voice.connect(this.analyzerNode_voice);
            this.audio_instrumental.connect(this.analyser_music);
            this.analyser_music.connect(this.analyzerNode_music);

            this.audio_vocal.connect(this.thingy);  

            this.thingy.connect(this.audioCtx.destination);  
            this.audio_instrumental.connect(this.audioCtx.destination);  

            this.loaded = true;

        }.bind(this)
    );

    bufferLoader.load();
};


/**
 * Start sound playback.
 */
SoundManager.prototype.start = function() {

    this.isPlaying = true;
    this.audio_instrumental.start(0);
    this.audio_vocal.start(0);

    var d = new Date();
    this.startedOn = d.getTime();
}

/**
 * Get sound progress.
 */
SoundManager.prototype.getProgress = function(){
    var d = new Date();
    var currentMs = d.getTime();
    return (currentMs-this.startedOn)/this.duration;
}

/**
 * Get byte frequency data for music and vocals.
 */
SoundManager.prototype.getByteFrequencyData = function(){
    var array_music =  new Uint8Array(this.analyser_music.frequencyBinCount);
    this.analyser_music.getByteFrequencyData(array_music);    

    var array_voice =  new Uint8Array(this.analyser_voice.frequencyBinCount);
    this.analyser_voice.getByteFrequencyData(array_voice);
    
    return {
        voice: array_voice,
        music: array_music
    };
}