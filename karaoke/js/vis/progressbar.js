function ProgressBar(){

	var w = 500;
	var h = 40;

	var progressBar;
	var playHead;
    var isVisible;

	this.init = function(container, dimensions, visible ){
        isVisible = visible;

        if(isVisible){
    		progressBar = new THREE.Object3D();

    		var material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: false
            });

            
            var geometry;

            // TOP
            geometry =  new THREE.PlaneGeometry( w , 3 );
            var top = new THREE.Mesh( geometry, material );
            top.position.x = 0.5*w;
            progressBar.add( top );

            // LEFT
            geometry =  new THREE.PlaneGeometry( 3 , h );
            var left = new THREE.Mesh( geometry, material );
            left.position.y = 0 - 0.5*h;
            progressBar.add( left );

            // RIGHT
            geometry =  new THREE.PlaneGeometry( 3 , h );
            var right = new THREE.Mesh( geometry, material );
            right.position.x = w;
            right.position.y = 0 - 0.5*h;
            progressBar.add( right );        

            // BOTTOM
            geometry =  new THREE.PlaneGeometry( w , 3 );
            var bottom = new THREE.Mesh( geometry, material );
            bottom.position.y = -h;
            bottom.position.x = 0.5*w;
            progressBar.add( bottom );

    		// PLAYHEAD
            geometry =  new THREE.PlaneGeometry( 1 , h+12 );
            playHead = new THREE.Mesh( geometry, material );
            playHead.position.y = -0.5*h-2;
            playHead.position.x = 0.5*w;
            progressBar.add( playHead );


            progressBar.position.y = dimensions.halfY - 10;
            progressBar.position.x = dimensions.halfX - w - 20;
            progressBar.position.z = 10;

            container.add(progressBar);      
        }
	}

	this.drawEvents = function(midiManager) {
        if(isVisible){
            var lastNote;
    		var events = midiManager.getEvents();
    		var note_low = midiManager.getNoteLow();
    		var note_high = midiManager.getNoteHigh();
    		var total_ticks = midiManager.getTotalTicks();

    		var onEvt;

    	    for (var i = 0; i < events.length; i++){
    	    	var e = events[i];
    	    	if(e.type == 'on'){
    	    		onEvt = e;
                    lastNote = e.note;
    	    	}else{
                    if (e.note == lastNote){
                     var notePerc = (e.note-note_low)/(note_high-note_low);
    	    		 drawNote(onEvt, e, total_ticks, notePerc);
                    }
    	    	}
    	    }
        }
	}

	this.update = function (perc){
        if(isVisible){
		  playHead.position.x = w*perc;
        }
	}

	var drawNote = function(onEvent, offEvent, total_ticks, notePerc) {
		var onstart = onEvent.ticks/total_ticks * w;
		var offstart = offEvent.ticks/total_ticks * w;

		var width = offstart - onstart;
		var height = onEvent.note / 60;

		var material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: false
        });

		var geometry =  new THREE.PlaneGeometry( width , 2 );
        var note = new THREE.Mesh( geometry, material );
        note.position.y = -0.5*h - 10 + notePerc*20;
        note.position.x = 0 + onstart;

        progressBar.add( note );
	}	

}