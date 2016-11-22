
function MidiManager(midiFile) {
	var _self = this;

	this.loaded = false;

	var file = midiFile;
	var midiFile = null

	// MIDI VARS
	var trackStates = [];
	var beatsPerMinute = 116;
	var ticksPerBeat;
	var channelCount = 16;
	var nextEventInfo;
	var finished = false;

	var events = [];
	var notes = [];

	var totalTicks = 0;

	var note_low = null;
	var note_high = null;
	var midiDuration;


	// ————————————————————————————————————————————————————————————
	// LOAD	
	// ————————————————————————————————————————————————————————————

	this.init = function(duration) {
		midiDuration = duration;

		loadRemote(file, function(data) {
			midiFile = MidiFile(data);
			afterLoad();
			console.log("midi load complete");
			_self.loaded = true;
		})
	};

	function loadRemote(path, callback) {
		var fetch = new XMLHttpRequest();
		fetch.open('GET', path);
		fetch.overrideMimeType("text/plain; charset=x-user-defined");
		fetch.onreadystatechange = function() {
			if(this.readyState == 4 && this.status == 200) {
				/* munge response into a binary string */
				var t = this.responseText || "" ;
				var ff = [];
				var mx = t.length;
				var scc= String.fromCharCode;
				for (var z = 0; z < mx; z++) {
					ff[z] = scc(t.charCodeAt(z) & 255);
				}
				callback(ff.join(""));
			}
		}
		fetch.send();
	}

	this.getPitchFor = function(perc){
		var pitch = 0.5;
		var isActive = false;

		for (var i = notes.length-1; i >= 0; i--){
	    	var oNote = notes[i];
	    	if( oNote.startPerc <= perc && oNote.endPerc >= perc){
	    		pitch = oNote.notePerc;
	    		isActive = true;
	    	}else if( oNote.startPerc >= perc){
	    		pitch = oNote.notePerc;
	    		isActive = false;
	    	}
	    }
    
	    return {
	    	pitch: pitch,
	    	active: isActive
	    };
	};

	function afterLoad(){
		ticksPerBeat = midiFile.header.ticksPerBeat;

		for (var i = 0; i < midiFile.tracks.length; i++) {
			trackStates[i] = {
				'nextEventIndex': 0,
				'ticksToNextEvent': (
					midiFile.tracks[i].length ?
						midiFile.tracks[i][0].deltaTime :
						null
				)
			};
		}

		while (finished == false){
			getNextEvent();
			if(nextEventInfo)handleEvent();
		}

		totalTicks = beatsPerMinute*(midiDuration/60)*ticksPerBeat;

		parseEventArray();
	}

	var parseEventArray = function() {
        var lastNote;
		var onEvt;

	    for (var i = 0; i < events.length; i++){
	    	var e = events[i];
	    	if(e.type == 'on'){
	    		onEvt = e;
                lastNote = e.note;
	    	}else{
                if (e.note == lastNote){
                    var nPerc = (e.note-note_low)/(note_high-note_low);
		    		notes.push({
		    		 	note: e.note,
		    		 	notePerc: nPerc,
		    		 	start: onEvt.ticks,
		    		 	startPerc: onEvt.ticks/totalTicks,
		    		 	end: e.ticks,
		    		 	endPerc: e.ticks/totalTicks
	    		    });
                }
	    	}
	    }

	};


	// ————————————————————————————————————————————————————————————
	// PARSE MIDI
	// ————————————————————————————————————————————————————————————

	this.getEvents = function(){
		return events;
	}

	this.getNoteLow = function(){
		return note_low;
	}

	this.getNoteHigh = function(){
		return note_high;
	}
	
	this.getTotalTicks = function(){
		return totalTicks;
	}	

	function getNextEvent() {
		var ticksToNextEvent = null;
		var nextEventTrack = null;
		var nextEventIndex = null;
		
		for (var i = 0; i < trackStates.length; i++) {
			if (
				trackStates[i].ticksToNextEvent != null
				&& (ticksToNextEvent == null || trackStates[i].ticksToNextEvent < ticksToNextEvent)
			) {
				ticksToNextEvent = trackStates[i].ticksToNextEvent;
				nextEventTrack = i;
				nextEventIndex = trackStates[i].nextEventIndex;
			}
		}

		if (nextEventTrack != null) {
			/* consume event from that track */
			var nextEvent = midiFile.tracks[nextEventTrack][nextEventIndex];
			var deltaTime = nextEvent.deltaTime;

			if (midiFile.tracks[nextEventTrack][nextEventIndex + 1]) {
				trackStates[nextEventTrack].ticksToNextEvent += midiFile.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
			} else {
				trackStates[nextEventTrack].ticksToNextEvent = null;
			}
			trackStates[nextEventTrack].nextEventIndex += 1;
			/* advance timings on all tracks by ticksToNextEvent */
			for (var i = 0; i < trackStates.length; i++) {
				if (trackStates[i].ticksToNextEvent != null) {
					trackStates[i].ticksToNextEvent -= ticksToNextEvent
				}
			}

			nextEventInfo = {
				'ticksToEvent': ticksToNextEvent,
				'event': nextEvent,
				'track': nextEventTrack
			}


			var beatsToNextEvent = ticksToNextEvent / ticksPerBeat;
			var secondsToNextEvent = beatsToNextEvent / (beatsPerMinute / 60);
		} else {
			nextEventInfo = null;
			finished = true;
		}
	}

	function handleEvent() {
		var event = nextEventInfo.event;
		totalTicks += nextEventInfo.ticksToEvent;

		switch (event.type) {
			case 'meta':
				switch (event.subtype) {
					case 'setTempo':
						beatsPerMinute = 60000000 / event.microsecondsPerBeat
				}
				break;

			case 'channel':
				switch (event.subtype) {
					case 'noteOn':
						if(!note_low || event.noteNumber < note_low)note_low = event.noteNumber;
						if(!note_high || event.noteNumber > note_high)note_high = event.noteNumber;

						events.push({type: 'on', note: event.noteNumber, ticks:totalTicks});
						break;
					case 'noteOff':
						events.push({type: 'off', note: event.noteNumber, ticks:totalTicks});
						break;
				}
				break;
		}
	}


}
