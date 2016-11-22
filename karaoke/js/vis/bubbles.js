function Bubbles(){
	// Lens Flare Bubbles
    var numBubbles = 50;
    var bubbles = [];
    var bubblesSpeed = [];
    var dimensions;
    var colors = [ 0x3b1829, 0x691f31, 0xbb3234, 0xec6042];

    this.init = function(container, objDimensions){

    	dimensions = objDimensions;

        for (var i = 0; i < numBubbles; i++){
            var material = new THREE.MeshBasicMaterial({
                color: colors[Math.round(Math.random()*(colors.length-1))],
                wireframe: false,
                transparent: true
            });

            material.opacity = 0.2 + Math.random()*0.6;

            var w = Math.random()*10+5;
            var geometry =  new THREE.CircleGeometry( w , 15 );
            var bubble = new THREE.Mesh( geometry, material );
            bubble.position.x = -dimensions.halfX + Math.random()*dimensions.width;
            bubble.position.y = -dimensions.halfY + Math.random()*dimensions.height;
            bubble.position.z = Math.random()*100;
            container.add( bubble );

            bubblesSpeed.push(w)
            bubbles.push(bubble);
        }
    }

    this.update = function(volMusic, songState){
    	var b, speed;
        // move bubbles
        for (b = 0; b<bubbles.length; b++){
            var bubble = bubbles[b];
            var speed = bubblesSpeed[b]*0.75;
            bubble.position.x -= speed;
            bubble.scale.x = bubble.scale.y = bubble.scale.z = 1+2*volMusic; 
            if(bubble.position.x < 0-dimensions.halfX-speed){
                bubble.position.x = dimensions.halfX;
            } 

            if(songState == 1){
                bubble.rotation.x = -25 * (Math.PI/180);
                bubble.rotation.y = -25 * (Math.PI/180);
            }
        }
    }


    this.resize = function(objDimensions){
        dimensions = objDimensions;
    }

}