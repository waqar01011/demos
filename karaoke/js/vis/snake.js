function Snake(){

    // snakes: ( [0] = outer /.../ [4] = inner)

    var SNAKE_HEIGHTS = [70, 50, 30, 10, 5];
    var SNAKE_COLORS = [ 0x3b1829, 0x691f31, 0xbb3234, 0xec6042, 0xffc7bb];

    var numSnakePoints = 30;
    var snakePoints = [];
    var snake_geometries = [];
    var snakes = [];
    var dimensions;
    var volumes = [];

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
                color: SNAKE_COLORS[s],
                wireframe: false
            });

            var geometry =  new THREE.PlaneGeometry( dimensions.halfX, SNAKE_HEIGHTS[s], numSnakePoints-1, 1 );
            geometry.dynamic = true;
            snake_geometries.push(geometry);

            var snake = new THREE.Mesh( geometry, material );
            snake.position.x = 0.5*dimensions.halfX;
            snake.position.z = 1+s;
            container.add( snake );
            snakes.push(snake);
        }
    } 

    this.resize = function(objDimensions){
        dimensions = objDimensions;

        for (var s = 0; s<snakes.length; s++){
            var snake = snakes[s];
            snake.position.x = 0.5*dimensions.halfX;
            snake.scale.x = dimensions.halfX/origHalfX;
        }
    }

    this.update = function(pitchRange, pitches, volume){

        volumes.unshift(volume);

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

        var count = 0;
        for ( var i = numSnakePoints-1;  i >= 0; i--) {
            var p = -0.5* pitchRange  + pitches[i].pitch*pitchRange;
            
            //var v = 1+0.6*volumes[count];
            var v = 1;
            //var v = volumes[count]*volumes[count];
            //if(v < 0.05)v=0;
            //if(v >= 0.05)v=1;
            
            var active = (pitches[i].active== true) ? 1 : 0;

            snake_5_geometry.vertices[ i ].y = snake_5_height*0.5*v + p;
            snake_5_geometry.vertices[ i+numSnakePoints ].y = 0 - snake_5_height*0.5*v + p;

            snake_4_geometry.vertices[ i ].y = snake_4_height*0.5*v + p;
            snake_4_geometry.vertices[ i+numSnakePoints ].y = 0 - snake_4_height*0.5*v + p;

            snake_3_geometry.vertices[ i ].y = snake_3_height*0.5*v + p;
            snake_3_geometry.vertices[ i+numSnakePoints ].y = 0 - snake_3_height*0.5*v + p;

            snake_2_geometry.vertices[ i ].y = snake_2_height*0.5*v + p;
            snake_2_geometry.vertices[ i+numSnakePoints ].y = 0 - snake_2_height*0.5*v + p;

            snake_1_geometry.vertices[ i ].y = snake_1_height*0.5*active*v + p;
            snake_1_geometry.vertices[ i+numSnakePoints ].y = 0 - snake_1_height*0.5*active*v + p;

            count++;
        }

        snake_5.geometry.verticesNeedUpdate = true;
        snake_4.geometry.verticesNeedUpdate = true;
        snake_3.geometry.verticesNeedUpdate = true;
        snake_2.geometry.verticesNeedUpdate = true;
        snake_1.geometry.verticesNeedUpdate = true;
    }
}