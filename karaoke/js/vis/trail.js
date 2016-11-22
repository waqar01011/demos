function Trail(){

    // snakes: ( [0] = outer /.../ [4] = inner)

    var SNAKE_HEIGHTS_SMALL = [30, 20, 10, 5, 3];
    var SNAKE_HEIGHTS = [70, 50, 30, 10, 5];
    var SNAKE_COLORS = [ 0x3b1829, 0x691f31, 0xbb3234, 0xec6042, 0xffc7bb];
    

    var color_5_norm = [59/255, 24/255, 41/255];
    var color_5_off = [12/255, 5/255, 8/255];

    var color_4_norm = [105/255, 31/255, 49/255];
    var color_4_off = [21/255, 6/255, 10/255];

    var color_3_norm = [187/255, 57/255, 52/255];
    var color_3_off = [37/255, 10/255, 10/255];

    var color_2_norm = [236/255, 96/255, 66/255];
    var color_2_off = [47/255, 19/255, 13/255];

    var color_1_norm = [255/255, 199/255, 187/255];
    var color_1_off = [51/255, 40/255, 37/255];


    var numSnakePoints = 60;
    var snakePoints = [];
    var snake_geometries = [];
    var snakes = [];
    var dimensions;

    var positions = [];
    var accuracies = [];
    var actives = [];
    var pitchesTop = [];
    var pitchesBot = [];

    var origHalfX;

    this.init = function(container, objDimensions){
        dimensions = objDimensions;
        origHalfX = dimensions.halfX;

        // CREATE SNAKE POINTS
        var step = Math.ceil(dimensions.halfX/numSnakePoints);
        for (var i = numSnakePoints; i >= 0; i--) {
            snakePoints.push(step*i);
        }

        // generate snakes
        for (var s = 0; s<5; s++) {
            var material = new THREE.MeshBasicMaterial({
                vertexColors: THREE.FaceColors,
                wireframe: false
            });
            material.dynamic = true;

            var geometry =  new THREE.PlaneGeometry( dimensions.halfX, SNAKE_HEIGHTS_SMALL[s], numSnakePoints-1, 1 );
            geometry.dynamic = true;
            snake_geometries.push(geometry);
            geometry.dynamic = true;

            var snake = new THREE.Mesh( geometry, material );
            snake.position.x = -0.5*dimensions.halfX;
            snake.position.z = 1+s;
            container.add( snake );
            snakes.push(snake);
            snake.dynamic = true;
        }

        this.update(dimensions, 0, [], []);
    } 

    this.resize = function(objDimensions){
        dimensions = objDimensions;

        for (var s = 0; s<snakes.length; s++){
            var snake = snakes[s];
            snake.position.x = -0.5*dimensions.halfX;
            snake.scale.x = dimensions.halfX/origHalfX;
        }
    }

    this.update = function(objDimensions, pitchRange, pitchesPast, volumes, songState, active){
    	dimensions = objDimensions;
        actives.unshift(active);
        var currentY, targetY, accuracy, accuracyPitch;

        if( songState == 0){
        	currentY = dimensions.halfY - dimensions.height * dimensions.mousePercY;
        	targetY = -0.5* pitchRange  + pitchesPast[0]*pitchRange;
        	accuracy = Math.sqrt( (currentY-targetY) * (currentY-targetY) );
            accuracies.unshift((currentY-targetY)/dimensions.halfY);
            accuracyPitch = 1 + 0.2*((currentY-targetY)/dimensions.halfY);
        }else{
            currentY = dimensions.halfX - dimensions.width * dimensions.mousePercX;
            targetY = -0.5* pitchRange  + pitchesPast[0]*pitchRange;
            accuracy = Math.sqrt( (currentY-targetY) * (currentY-targetY) );
            accuracies.unshift((currentY-targetY)/dimensions.halfY);
            accuracyPitch = 1 + 0.2*((currentY-targetY)/dimensions.halfX);
        }


        if (accuracy > 30){
            Karaoke.soundPitch = accuracyPitch;
            render(pitchRange, volumes, songState);
        }else{
            Karaoke.soundPitch = 1;
			render(pitchRange, volumes, songState);    		
    	}
    }

    var render = function(pitchRange, volumes, songState, active){
    	var snake_5_geometry = snake_geometries[0];
        var snake_4_geometry = snake_geometries[1];
        var snake_3_geometry = snake_geometries[2];
        var snake_2_geometry = snake_geometries[3];
        var snake_1_geometry = snake_geometries[4];        

        var snake_5 = snakes[0];
        var snake_4 = snakes[1];
        var snake_3 = snakes[2];
        var snake_2 = snakes[3];
        var snake_1 = snakes[4];

        var snake_5_height = SNAKE_HEIGHTS[0];
        var snake_4_height = SNAKE_HEIGHTS[1];
        var snake_3_height = SNAKE_HEIGHTS[2];
        var snake_2_height = SNAKE_HEIGHTS[3];
        var snake_1_height = SNAKE_HEIGHTS[4];


       	var snake_5_height_small = SNAKE_HEIGHTS_SMALL[0];
        var snake_4_height_small = SNAKE_HEIGHTS_SMALL[1];
        var snake_3_height_small = SNAKE_HEIGHTS_SMALL[2];
        var snake_2_height_small = SNAKE_HEIGHTS_SMALL[3];
        var snake_1_height_small = SNAKE_HEIGHTS_SMALL[4];

    	var count = 0;
    	var tempcount = 0;

        var multis_5 = 6;
        var multis_4 = 5;
        var multis_3 = 4;
        var multis_2 = 2;
        var multis_1 = 1;

        var newposition;

        if(songState == 0){
            newposition = dimensions.halfY - dimensions.height * dimensions.mousePercY;
        }else{
            newposition = (dimensions.halfY - dimensions.height * dimensions.mousePercX)  * (dimensions.width/dimensions.height);
        }

        
        var pitchMultTop;
        var pitchMultBot;
        
        if( Karaoke.soundPitch >= 0.9 && Karaoke.soundPitch <= 1.1){
            pitchMultTop = 1;
            pitchMultBot = 1;
        }else{
            pitchMultTop = (Karaoke.soundPitch <= 0.9) ? (Karaoke.soundPitch-0.5)/0.5*0.3 :  (1.5 - Karaoke.soundPitch)/0.5*0.5;
            pitchMultBot = (Karaoke.soundPitch >= 1.1) ? (1.5 - Karaoke.soundPitch)/0.5*0.3:  (Karaoke.soundPitch-0.5)/0.5 *0.5;
        }

        positions.unshift(newposition);
        pitchesTop.unshift(pitchMultTop);
        pitchesBot.unshift(pitchMultBot);


        var count = 0;
        for ( var i = numSnakePoints-1;  i >= 0; i--) {
            
            var p = positions[count];
            var pMultiTop = pitchesTop[count];
            var pMultiBot = pitchesBot[count];

            var easeMult = 1;
            if(count<10){
                easeMult = easeInOutSine(count, 0, 1, 10);
            }

            var newY;
            var tween = 0.1;

            // SNAKE 5
            newY = snake_5_height*0.5 + volumes[count]*multis_5*easeMult*40;
            if(!newY || newY < snake_5_height_small){
            	newY = snake_5_height_small*0.5;
            }

            oldY1 = snake_5_geometry.vertices[ i ].y;
            oldY2 = snake_5_geometry.vertices[ i+numSnakePoints ].y;

            snake_5_geometry.vertices[ i ].y = p + newY * pMultiTop;
            snake_5_geometry.vertices[ i+numSnakePoints ].y = p - newY * pMultiBot;


            // SNAKE 4
            newY = snake_4_height*0.5 + volumes[count]*multis_4*easeMult*40;
            if(!newY  || newY < snake_4_height_small){
            	newY = snake_4_height_small*0.5;
            }

            oldY1 = snake_4_geometry.vertices[ i ].y;
            oldY2 = snake_4_geometry.vertices[ i+numSnakePoints ].y;

            snake_4_geometry.vertices[ i ].y = p + newY * pMultiTop;
            snake_4_geometry.vertices[ i+numSnakePoints ].y = p - newY * pMultiBot;

            
            // SNAKE 3
            newY = snake_3_height*0.5 + volumes[count]*multis_3*easeMult*40;
            if(!newY || newY < snake_3_height_small){
            	newY = snake_3_height_small*0.5;
            }

            oldY1 = snake_3_geometry.vertices[ i ].y;
            oldY2 = snake_3_geometry.vertices[ i+numSnakePoints ].y;

            snake_3_geometry.vertices[ i ].y = p + newY * pMultiTop;
            snake_3_geometry.vertices[ i+numSnakePoints ].y =  p - newY * pMultiBot;


            // SNAKE 2
            newY = snake_2_height*0.5 + volumes[count]*multis_2*easeMult*40;
            if(!newY || newY < snake_2_height_small){
            	newY = snake_2_height_small*0.5;
            }

            oldY1 = snake_2_geometry.vertices[ i ].y;
            oldY2 = snake_2_geometry.vertices[ i+numSnakePoints ].y;

            snake_2_geometry.vertices[ i ].y = p + newY * pMultiTop;
            snake_2_geometry.vertices[ i+numSnakePoints ].y = p - newY * pMultiBot;

			
			// SNAKE 1
            newY = snake_1_height*0.5 + volumes[count]*multis_1*easeMult*40;
            if(!newY || newY < snake_1_height_small){
            	newY = snake_1_height_small*0.5;
            }

            oldY1 = snake_1_geometry.vertices[ i ].y;
            oldY2 = snake_1_geometry.vertices[ i+numSnakePoints ].y;


            snake_1_geometry.vertices[ i ].y = p + newY * pMultiTop *  actives[count];
            snake_1_geometry.vertices[ i+numSnakePoints ].y = p - newY * pMultiBot * actives[count];

            count++;
        }

        var f;
        for (var i = 0; i < snake_5_geometry.faces.length; i++) {

            var accuracy = Math.sqrt( accuracies[59-i] * accuracies[59-i]);

            var c5 = [
                color_5_norm[0] + (color_5_off[0] - color_5_norm[0])*accuracy,
                color_5_norm[1] + (color_5_off[1] - color_5_norm[1])*accuracy,
                color_5_norm[2] + (color_5_off[2] - color_5_norm[2])*accuracy
            ];
            var c4 = [
                color_4_norm[0] + (color_4_off[0] - color_4_norm[0])*accuracy,
                color_4_norm[1] + (color_4_off[1] - color_4_norm[1])*accuracy,
                color_4_norm[2] + (color_4_off[2] - color_4_norm[2])*accuracy
            ];
            var c3 = [
                color_3_norm[0] + (color_3_off[0] - color_3_norm[0])*accuracy,
                color_3_norm[1] + (color_3_off[1] - color_3_norm[1])*accuracy,
                color_3_norm[2] + (color_3_off[2] - color_3_norm[2])*accuracy
            ];
            var c2 = [
                color_2_norm[0] + (color_2_off[0] - color_2_norm[0])*accuracy,
                color_2_norm[1] + (color_2_off[1] - color_2_norm[1])*accuracy,
                color_2_norm[2] + (color_2_off[2] - color_2_norm[2])*accuracy
            ];
            var c1 = [
                color_1_norm[0] + (color_1_off[0] - color_1_norm[0])*accuracy,
                color_1_norm[1] + (color_1_off[1] - color_1_norm[1])*accuracy,
                color_1_norm[2] + (color_1_off[2] - color_1_norm[2])*accuracy
            ];

            f = snake_5_geometry.faces[i];
            f.color.setRGB(c5[0], c5[1], c5[2]); // CHANGED

            f = snake_4_geometry.faces[i];
            f.color.setRGB(c4[0], c4[1], c4[2]); // CHANGED

            f = snake_3_geometry.faces[i];
            f.color.setRGB(c3[0], c3[1], c3[2]); // CHANGED

            f = snake_2_geometry.faces[i];
            f.color.setRGB(c2[0], c2[1], c2[2]); // CHANGED

            f = snake_1_geometry.faces[i];
            f.color.setRGB(c1[0], c1[1], c1[2]); // CHANGED
        }
        
        

        

        snake_5.geometry.verticesNeedUpdate = true;
        snake_4.geometry.verticesNeedUpdate = true;
        snake_3.geometry.verticesNeedUpdate = true;
        snake_2.geometry.verticesNeedUpdate = true;
        snake_1.geometry.verticesNeedUpdate = true;

        snake_5.geometry.colorsNeedUpdate = true;
        snake_4.geometry.colorsNeedUpdate = true;
        snake_3.geometry.colorsNeedUpdate = true;
        snake_2.geometry.colorsNeedUpdate = true;
        snake_1.geometry.colorsNeedUpdate = true;

        snake_5.needsUpdate = true;
        snake_4.needsUpdate = true;
        snake_3.needsUpdate = true;
        snake_2.needsUpdate = true;
        snake_1.needsUpdate = true;

    }

    var easeInOutSine = function (t, b, c, d) {
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    };
}