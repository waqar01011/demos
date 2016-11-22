function Curves(){
	var numCurvePoints = 60;
	var curvePoints = [];
	// CURVES( [0] = outer /.../ [4] = inner)

	var CURVE_HEIGHTS = [70, 50, 30, 10, 5];
	var CURVE_COLORS = [ 0x241921, 0x3b1829, 0x691f31, 0xbb3234, 0xec6042];
    
	var curve_geometries_up = [];
	var curves_up = [];    
	var curve_geometries_down = [];
	var curves_down = [];

	var dimensions;

	
	this.init = function(container, objDimensions){
		
		dimensions = objDimensions;

        // CREATE CURVE POINTS
        curvePoints = [];
        var step = Math.ceil(dimensions.halfX/numCurvePoints);
        for (var i = 0; i < numCurvePoints; i++) {
            curvePoints.push(0 - step*i);
        }

        // generate curves
        for (var s = 0; s<5; s++) {

            var material = new THREE.LineBasicMaterial({
                color: CURVE_COLORS[s]
            });

            var geometry, line, c;

            // UPPER
            geometry = new THREE.Geometry();
            for (c = 0; c < numCurvePoints; c++){
                geometry.vertices.push(new THREE.Vector3(curvePoints[c], 0.5*CURVE_HEIGHTS[s], 1));
            }
            geometry.dynamic = true;

            line = new THREE.Line(geometry, material);

            container.add( line );

            curve_geometries_up.push(geometry);
            curves_up.push(line);

            // LOWER
            geometry = new THREE.Geometry();
            for (c = 0; c < numCurvePoints; c++){
                geometry.vertices.push(new THREE.Vector3(curvePoints[c], -0.5*CURVE_HEIGHTS[s], 1));
            }
            geometry.dynamic = true;

            line = new THREE.Line(geometry, material);

            container.add( line );

            curve_geometries_down.push(geometry);
            curves_down.push(line);

        }
    }	


    this.resize = function(objDimensions){
        dimensions = objDimensions;

        // CREATE CURVE POINTS
        curvePoints = [];
        var step = Math.ceil(dimensions.halfX/numCurvePoints);
        for (var i = 0; i < numCurvePoints; i++) {
            curvePoints.push(0 - step*i);
        }

        // REDRAW LINES
        var count = 0;
        var tempcount = 0;

        for (var c = 0; c < curves_up.length; c++){
            var curve_up = curves_up[c];
            var curve_geometry_up = curve_geometries_up[c];
            var curve_down = curves_down[c];
            var curve_geometry_down = curve_geometries_down[c];

            for ( var i = 0;  i < numCurvePoints; i++) {
                curve_geometry_up.vertices[ i ].x = curvePoints[count];
                curve_geometry_down.vertices[ i ].x = curvePoints[count];
                count++;
            }

            curve_up.geometry.verticesNeedUpdate = true;
            curve_down.geometry.verticesNeedUpdate = true;
            count = tempcount;
        }
    }

    this.update = function(pitchRange, pitches, volumes) {

    	var count = 0;

    	var tempcount = 0;

        for (var c = 0; c < curves_up.length; c++){
            var curve_up = curves_up[c];
            var curve_geometry_up = curve_geometries_up[c];
            var curve_down = curves_down[c];
            var curve_geometry_down = curve_geometries_down[c];

            var multiFreq;
            var multiVol;

            switch(c){
                case 0:
                    multiFreq = 4;
                    multiVol = 6;
                    break;
                case 1:
                    multiFreq = 3;
                    multiVol = 5;
                    break;
                case 2:
                    multiFreq = 2;
                    multiVol = 4;
                    break;
                case 3:
                    multiFreq = 1;
                    multiVol = 2;
                    break;
                case 4:
                    multiFreq = 0;
                    multiVol = 1;
                    break;

            }


            for ( var i = 0;  i < numCurvePoints; i++) {
                var p = -0.5* pitchRange  + pitches[count]*pitchRange;
                
                var easeMult = 1;
                if(i<10){
                    easeMult = easeInOutSine(i, 0, 1, 10);
                }

                curve_geometry_up.vertices[ i ].y = CURVE_HEIGHTS[c]*0.5 + p + volumes[i]*multiVol*easeMult*40;
                curve_geometry_down.vertices[ i ].y = 0 - CURVE_HEIGHTS[c]*0.5 + p - volumes[i]*multiVol*easeMult*40;
                count++;
            }

            curve_up.geometry.verticesNeedUpdate = true;
            curve_down.geometry.verticesNeedUpdate = true;

            count = tempcount;
        }
    }

    var easeInOutSine = function (t, b, c, d) {
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    };
}