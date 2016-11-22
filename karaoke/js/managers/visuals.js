function VisualizationManager() {

    //////////////////////////////
    /* Public Variables */
    //////////////////////////////
    this.loaded = true;

    //////////////////////////////
    /* Private Variables */
    //////////////////////////////
    var posX = 0;

    // dimensions
    var dimensions = {
        width: 0,
        height: 0,
        halfY: 0,
        halfX: 0,
        xScale: 0.667,
        yScale: 0.667,
        mousePercX: 0.5,
        mousePercY: 0.5
    };

    // sound
    var volumeRange = 50;
    var pitchRange = 300;
    var volumes = [];

    var pitchesFuture = [];
    var pitchesPast = [];

    var oldPitch = 0;

    // Three.js Scene
    var clock, camera, scene, renderer, tanFOV, initialWindowHeight;

    // Elements
    var container;
    var bubbles;
    var curves;
    var glow;
    var grid;
    var snake;
    var sparkler;
    var stars;
    var trail;

    var oldPos = [];

    var touching = false;
    var songState = 0;
    var cameraChangeComplete = false;
    

    this.init = function() {

        

        // CREATE SCENE
        clock = new THREE.Clock();
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( 1473, 810 );
        document.body.appendChild( renderer.domElement );

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 30, 1473 / 810, 1, 2000 );
        camera.position.x = 0; 
        camera.position.y = 0; 
        camera.position.z = 1000; 
        camera.lookAt( scene.position );
        scene.add(camera);

        tanFOV = Math.tan( ( ( Math.PI / 180 ) * camera.fov / 2 ) );
        initialWindowHeight = 810;

        dimensions.width = window.innerWidth*dimensions.xScale;
        dimensions.height = window.innerHeight*dimensions.yScale;
        dimensions.halfX = 0.5*dimensions.width;
        dimensions.halfY = 0.5*dimensions.height;

        container = new THREE.Object3D();

        // -------------------------------------

        bubbles = new Bubbles();
        bubbles.init(container, dimensions);

        grid = new Grid();
        grid.init(container, dimensions);

        glow = new Glow();
        glow.init(container, dimensions);

        progressbar = new ProgressBar();
        progressbar.init(container, dimensions, false);

        stars = new Stars();
        stars.init(container, dimensions);

        sparkler = new Sparkler();
        sparkler.init(container, dimensions);
      
        snake = new Snake();
        snake.init(container, dimensions);

        curves = new Curves();
        curves.init(container, dimensions); 

        trail = new Trail();
        trail.init(container, dimensions);

        /*
        trail = new Trail();
        trail.init(container);*/

        // -------------------------------------

        container.y = 100;
        scene.add( container );

        window.addEventListener('resize', resizeCanvas, false);
        $(window).on('mousemove', onmove);
        window.addEventListener( 'touchstart', startouch, false );
        window.addEventListener( 'touchend', endtouch, false );
        window.addEventListener( 'touchmove', touch, false );

        resizeCanvas();
    }

    var endtouch = function(event){
        oldPos = [];
        touching = false;
    }
    var startouch = function(event){
        touching = true;
    }
    var touch = function(event){
        event.preventDefault();
        event.stopPropagation();

        var pX = event.touches[ 0 ].pageX;
        var pY = event.touches[ 0 ].pageY;

        if (oldPos.length > 0){
            var dX = (pX - oldPos[0]) / window.innerWidth;
            var dY = (pY - oldPos[1]) / window.innerHeight;
            
            dimensions.mousePercX += dX;
            dimensions.mousePercY += dY;   

        }
        oldPos = [pX, pY];
    }

    this.drawProgressBar = function(midiManager){
        progressbar.drawEvents(midiManager);
    }

    var onmove = function(e){
        if (touching == false){
            dimensions.mousePercX = event.pageX/window.innerWidth;
            dimensions.mousePercY = event.pageY/window.innerHeight;
        }
    }

    var resizeCanvas = function(){
        // ADJUST SCALE VARS
        dimensions.width = window.innerWidth*dimensions.xScale;
        dimensions.height = window.innerHeight*dimensions.yScale;
        dimensions.halfX = 0.5*dimensions.width;
        dimensions.halfY = 0.5*dimensions.height;

        // ADJUST CAMERA
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.fov = ( 360 / Math.PI ) * Math.atan( tanFOV * ( window.innerHeight / initialWindowHeight ) );
        camera.updateProjectionMatrix();
        camera.lookAt( scene.position );

        renderer.setSize( window.innerWidth, window.innerHeight );

        // resize elements
        bubbles.resize(dimensions);
        grid.resize(dimensions);
        glow.resize(dimensions);
        stars.resize(dimensions);
        sparkler.resize(dimensions);
        snake.resize(dimensions);
        curves.resize(dimensions);
        trail.resize(dimensions);

        // render
        renderer.render( scene, camera );
    }

    this.render = function(progress, volVoice, volMusic, freqs, pitches) {     

        posX -= 10;
        var pos = posX + 'px 0px';

        var delta = clock.getDelta(); 

        volumes.unshift(volVoice);
        if (volumes.length > 500){
            volumes.splice(199, 300);
        }

        pitchesFuture = pitches;
        
        var newPitch = oldPitch + (pitches[0].pitch - oldPitch)*0.1;
        oldPitch = newPitch;

        var active = (pitches[0].active == true) ? 1 : 0;

        //var newPitch = pitches[0].pitch;

        pitchesPast.unshift(newPitch);
        if (pitchesPast.length > 200){
            pitchesPast.splice(99, 100);
        }

        bubbles.update(volMusic, songState);
        stars.update();
        sparkler.update(delta, dimensions, songState);
        snake.update(pitchRange, pitchesFuture, volMusic);
        curves.update(pitchRange, pitchesPast, volumes);
        trail.update(dimensions, pitchRange, pitchesPast, volumes, songState, active);
        progressbar.update(progress);

        renderer.render( scene, camera );
    }

    var easeInOutSine = function (t, b, c, d) {
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    };
   


}