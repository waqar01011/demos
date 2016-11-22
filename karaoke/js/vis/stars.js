function Stars(){
	// Starfield
    var numStars = 300;
    var stars = [];
    var starSpeed = [];

    var dimensions;

	this.init = function(container, objDimensions){
		dimensions = objDimensions;

        for (var i = 0; i < numStars; i++){
            var material = new THREE.MeshBasicMaterial({
                color: 0x8d4300,
                wireframe: false,
                transparent: true
            });

            material.opacity = 0.4 + Math.random()*0.4;

            var geometry =  new THREE.PlaneGeometry( 2 , 2 );

            var star = new THREE.Mesh( geometry, material );
            star.position.x = -dimensions.halfX + Math.random()*dimensions.width;
            star.position.y = -dimensions.halfY + Math.random()*dimensions.height;
            star.position.z = 0;
            container.add( star );

            starSpeed.push(material.opacity)
            stars.push(star);
        }
    }

    this.resize = function(objDimensions){
        dimensions = objDimensions;
    }

    this.update = function(){
    	// move stars
        for (b = 0; b<stars.length; b++){
            var star = stars[b];
            var speed = starSpeed[b]*3;
            star.position.x -= speed;
            if(star.position.x < 0-dimensions.halfX-speed){
                star.position.x = dimensions.halfX;
            } 
        }

    }

}