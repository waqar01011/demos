/**
 * A web audio api + webGL demo.
 *
 * @author Jens Fischer
 * @link http://artofrawr.com/demos/karaoke
 * @link https://github.com/artofrawr/demos/blob/master/karaoke
 */


// ————————————————————————————————————————————————————————————
// CHECK FOR DEPENDENCIES
// ————————————————————————————————————————————————————————————

$(document).ready(function() {

	if (Detector.checkDependencies() == true){
		
		Detector.audiocontext = new window.AudioCtx();
		new Karaoke();
		
	}else{

		if (!window.AudioCtx){
			alert("Dependency not met: Audio API");
		}

		if (!Detector.webgl){
			alert("Dependency not met: WebGL");
		}
	}
});


// ————————————————————————————————————————————————————————————
// MAIN 
// ————————————————————————————————————————————————————————————

function Karaoke() {

	// instantiate classes that handle different aspects of the demo
	this.loaderDisplay = new LoaderDisplay();
	this.visManager = new VisualizationManager();
	this.midiManager = new MidiManager('sounds/lucky_vocals.mid');
	this.soundManager = new SoundManager(['sounds/lucky_shorter_intro_music.mp3', 'sounds/lucky_shorter_intro_vocals.mp3']);

	// track progress of demo
	this.oldProgress;
	this.progressPerTick;
	this.ticks = 0;

	// add classes that are loading assets to loader display
	this.loaderDisplay.addLoader(this.midiManager, 'Midi');
	this.loaderDisplay.addLoader(this.soundManager, 'Music');
	this.loaderDisplay.addLoader(this.visManager, 'Visualization');
	this.loaderDisplay.start();
	$('.loader').on('complete', this.onLoadComplete.bind(this) );

	// LOAD ASSETS
	this.midiManager.init(70);
	this.soundManager.init();
	this.visManager.init();

}

Karaoke.soundPitch = 1;

Karaoke.prototype.onLoadComplete = function(){
	$('a.active').on('click', this.start.bind(this) );
}

Karaoke.prototype.start = function() {
	console.log('START');
	this.visManager.drawProgressBar(this.midiManager);
	this.loaderDisplay.animateOut();
	this.soundManager.start();
	this.render();
}


Karaoke.prototype.render = function() {

    requestAnimationFrame( this.render.bind(this) );

    // calculate current progress of song
	var progress = this.soundManager.getProgress();

	if(progress >= 1){
		window.location.reload();
	}

    this.ticks++;
	progressPerTick = progress/this.ticks;


	// get future pitches for next 30 ticks
	var pitches = [];
	for (var tick = 0; tick <= 30; tick++){
    	var pitch = this.midiManager.getPitchFor( progress+progressPerTick*tick-2*progressPerTick );
    	pitches.push(pitch);
	}

	// get volumes and frequencies
    var i, sum, max, vol;
	var soundData = this.soundManager.getByteFrequencyData();

	// voice volume
	sum = 0;
	max = 0;
    for (i = 0; i < soundData.voice.length; i++){
      vol = soundData.voice[i];
      if(vol>max)max=vol;
      sum += vol
    }
    var volVoice = (sum/soundData.voice.length)/max;

    // music volume
    sum = 0;
	max = 0;
    for (i = 0; i < soundData.music.length; i++){
      vol = soundData.music[i];
      if(vol>max)max=vol;
      sum += vol
    }
    var volMusic = (sum/soundData.music.length)/max;

    // frequency
    var freqs = soundData.music;

    // render visualization
    this.visManager.render(progress, volVoice, volMusic, freqs, pitches); 

}

