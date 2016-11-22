function Grid(){
	var lineHor = [];
    var lineVer;
    var dimensions;


	this.init = function(container, objDimensions){
		dimensions = objDimensions;

        var geometry, material;

        for (var i = 0; i< 9; i++){

            geometry = new THREE.Geometry();
            for (var s = 0; s<200; s++){
                geometry.vertices.push( new THREE.Vector3 ( s*5, 0, 0 ) );
                
            }

            material = new THREE.LineDashedMaterial( { 
                linewidth: 1, 
                color: 0x691f31,
                dashSize: 50,
                gapSize: 50
            } );

            var line = new THREE.Line( geometry, material, THREE.LinePieces );
            line.scale.x = dimensions.width/1000;
            line.position.x = 0-dimensions.halfX;
            line.position.y = -90 + i*20;
            container.add( line );
            lineHor.push( line );
        }

        geometry = new THREE.Geometry();
        for (var s = 0; s<100; s++){
            geometry.vertices.push( new THREE.Vector3 ( 0, s*10, 0 ) );
                
        }

        material = new THREE.LineDashedMaterial( { 
            linewidth: 1, 
            color: 0x691f31,
            dashSize: 5,
            gapSize: 5
        } );

        lineVer = new THREE.Line( geometry, material, THREE.LinePieces );
        lineVer.scale.y = dimensions.height/1000;
        lineVer.position.y = 0-dimensions.halfY;
        container.add( lineVer );
    }

    this.resize = function(objDimensions){
    	dimensions = objDimensions;

    	 // RESIZE ELEMENTS
        var i;

        // grid lines
        for (i = 0; i < lineHor.length; i++) {
            var line = lineHor[i];
            line.scale.x = dimensions.width/1000;
            line.position.x = (-2.5*line.scale.x)-dimensions.halfX;
        }
        lineVer.scale.y = dimensions.height/1000;
        lineVer.position.y = 0-dimensions.halfY;
    }

    
}