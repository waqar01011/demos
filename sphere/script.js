/**
 * A spherical visualization demo, using Javascript + HTML5 canvas.
 *
 * @author Jens Fischer
 * @link http://artofrawr.com/demos/sphere
 * @link https://github.com/artofrawr/demos/blob/master/sphere
 */

// canvas reference
var canvas = document.getElementById("sphere");
var ctx = canvas.getContext("2d");

// some measurements and math helpers
var pixelRatio = window.devicePixelRatio || 1;
var windowHalfX, windowHalfY;
var deg2Rad = Math.PI / 180;
var deg0 = 0 * deg2Rad;
var deg360 = 360 * deg2Rad;
var radiusSphere, radiusParticle;

// kinetic dragging
var isDragging = false;
var mouseX = 0, mouseY = 0;     // mouse position
var dMouseY = 0, dMouseX = 0;   // mouse direction
var origPosX, origPosY;         // keeping track of positions during drag
var prevPosX, prevPosY;         // keeping track of positions during drag
var origTime;                   // measuring time of dragging interaction

// sphere variables
var sphere;
var particleCount   = 800;      // total particle count to be drawn
var lineCount       = 1200;     // total number of connections drawn between particles
var accel           = 0.03;     // how fast the sphere accellerates during dragging
var speed           = 0.7;      // maximum speed with which the sphere can be dragged
var scaleSphere     = 0.7;      // sphere scale based on browser window
var scaleParticle   = 0.015;    // particle scale based on browser window
var depthScale      = 0.4;      // determines the change in scale of a particle at depth
var colors          = ['#30fbe7', '#367c62', '#3c7ddb'];


// ————————————————————————————————————————————————————————————
// MEASUREMENT CALCULATIONS
// ————————————————————————————————————————————————————————————

/**
 * Updates browser window measurements and sets canvas and sphere
 * dimensions accordingly.
 */
function updateMeasurements() {

    windowHalfX             = window.innerWidth * 0.5; 
    windowHalfY             = window.innerHeight * 0.5;

    canvas.width            = window.innerWidth * pixelRatio;
    canvas.height           = window.innerHeight * pixelRatio;
    canvas.style.width      = window.innerWidth + "px";
    canvas.style.height     = window.innerHeight + "px";

    radiusSphere            = Math.min(window.innerWidth, window.innerHeight) * scaleSphere * pixelRatio * 0.5;
    radiusParticle          = Math.min(window.innerWidth, window.innerHeight) * scaleParticle * pixelRatio * 0.5;

}



// ————————————————————————————————————————————————————————————
// SPHERE CLASS
// ————————————————————————————————————————————————————————————

/**
 * The main class of the sphere. 
 */
function Sphere() {
    this.createParticles();
    this.createConnections();
}

/**
 * Creates the sphere's particles and places them randomly.
 */
Sphere.prototype.createParticles = function() {
    this.particles = [];

    for ( var i = 0; i < particleCount; i++ ) {

        var particle = new Particle();

        var xPos = -radiusSphere + Math.random()*2*radiusSphere;
        var yPos = -radiusSphere + Math.random()*2*radiusSphere;
        var zPos = -radiusSphere + Math.random()*2*radiusSphere;

        var spherification = Number = Math.sqrt( xPos*xPos + yPos * yPos + zPos * zPos);
        particle.x = xPos / spherification * radiusSphere;
        particle.y = yPos / spherification * radiusSphere;
        particle.z = zPos / spherification * radiusSphere;

        this.particles.push(particle);
    }
}

/**
 * Creates connections between some of the particles.
 */
Sphere.prototype.createConnections = function() {
    this.connections = [];

    for (var i = 0; i < lineCount; i++){

        var p1 = this.particles[Math.floor(Math.random() * this.particles.length)]; 

        var p1x = p1.x;
        var p1y = p1.y;
        var p1z = p1.z;

        var curDist = -1;
        var p2;

        for (var e = 0; e < this.particles.length/5; e++) {
            var p = this.particles[e];
            var px = p.x;
            var py = p.y;
            var pz = p.z;
            var dist = p.getDistance(p1);
            
            if(dist == 0) continue;

            if(curDist == -1 || dist < curDist){
                p2 = p;   
                curDist = dist;     
            }
        }

        this.connections.push(new Connection(p1, p2)); 
    }  
}

/**
 * Sort the particles based on their position on the z-axis.
 */
Sphere.prototype.sortZ = function() {
    this.particles.sort(function(a, b) {
        return a.z - b.z;
    });
}

/**
 * Clears the canvas and redraws the sphere.
 */
Sphere.prototype.redraw = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw connections
    for (var i = 0; i < this.connections.length; i++ ) {
        var connection = this.connections[i];
        connection.draw();
    }

    // sort particles based on depth
    this.sortZ();

    // draw particles
    for (var i = 0; i < this.particles.length; i++ ) {
        var particle = this.particles[i];
        particle.draw();
    }
}

/**
 * Rotates the sphere.
 *
 * @param {Number} rxs Rotation sine of x-axis.
 * @param {Number} rys Rotation sine of y-axis.
 * @param {Number} rxc Rotation cosine of x-axis.
 * @param {Number} ryc Rotation cosine of y-axis.
 */
Sphere.prototype.rotate = function(rxs, rys, rxc, ryc) {
    
    // calculate new particle positions
    for (var i = 0; i < this.particles.length; i++ ) {
        this.particles[i].move(rxs, rys, rxc, ryc);
    }

}


// ————————————————————————————————————————————————————————————
// PARTICLE CLASS
// ————————————————————————————————————————————————————————————

/**
 * A class representing a single particle.
 */
function Particle() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.scale = 1;
    this.color = colors[Math.floor(Math.random() * colors.length)]; 
}

/**
 * Calculates the new particle's position based on the sphere's rotation.
 *
 * @param {Number} rxs Rotation sine of x-axis.
 * @param {Number} rys Rotation sine of y-axis.
 * @param {Number} rxc Rotation cosine of x-axis.
 * @param {Number} ryc Rotation cosine of y-axis.
 */
Particle.prototype.move = function(rxs, rys, rxc, ryc) {
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var extra = z * ryc - x * rys;

    x = z * rys + x * ryc;
    z = y * rxs + extra * rxc;
    y = y * rxc - extra * rxs;

    var spherification = Math.sqrt(x * x + y * y + z * z);

    this.x = x / spherification * radiusSphere;
    this.y = y / spherification * radiusSphere;
    this.z = z / spherification * radiusSphere;

    var zScale = this.z / radiusSphere;
    this.scale = 1 + zScale * depthScale;

}

/**
 * Draws the particle.
 */
Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x + windowHalfX * pixelRatio , this.y + windowHalfY * pixelRatio , radiusParticle * this.scale, deg0, deg360);
    ctx.fillStyle = this.color;
    ctx.fill();
}

/**
 * Calculates the distance to another particle.
 * 
 * @param {Particle} p2 The other particle.
 */
Particle.prototype.getDistance = function(p2) {
    return Math.sqrt( (p2.x - this.x) * (p2.x - this.x) + (p2.y - this.y) * (p2.y - this.y) + (p2.z - this.z) * (p2.z - this.z) );
}



// ————————————————————————————————————————————————————————————
// CONNECTION CLASS
// ————————————————————————————————————————————————————————————

/**
 * A class representing a connecting line between two particles.
 * 
 * @param {Particle} p1 The first particle.
 * @param {Particle} p2 The second particle.
 */
function Connection(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
}

/**
 * Draws the connecting line.
 */
Connection.prototype.draw = function() {
    ctx.beginPath();
    ctx.moveTo(this.p1.x + windowHalfX * pixelRatio, this.p1.y + windowHalfY * pixelRatio);
    ctx.lineTo(this.p2.x + windowHalfX * pixelRatio, this.p2.y + windowHalfY * pixelRatio);
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors[0];
    ctx.stroke();
}


// ————————————————————————————————————————————————————————————
// EVENT HANDLERS FOR KINETIC DRAGGING
// ————————————————————————————————————————————————————————————

/**
 * Gets called when the user moves the mouse.
 * @param {Object} e The event object.
 */
function onDocumentMouseMove(e) {
    e.preventDefault();

    if (e.touches && e.touches.length > 0) {
        mouseX = e.touches[0].clientX - windowHalfX;
        mouseY = e.touches[0].clientY - windowHalfY;
    }else {
        mouseX = e.clientX - windowHalfX;
        mouseY = e.clientY - windowHalfY;
    }
}

/**
 * Gets called when the user starts dragging.
 * @param {Object} e The event object.
 */
function onDragStart(e) {

    isDragging = true;

    if (e.touches && e.touches.length > 0) {
        mouseX = e.touches[0].clientX - windowHalfX;
        mouseY = e.touches[0].clientY - windowHalfY;
    } else {
        mouseX = e.clientX - windowHalfX;
        mouseY = e.clientY - windowHalfY;
    }
    
    origPosX = prevPosX = mouseX;
    origPosY = prevPosY = mouseY;
    origTime = Date.now();
}

/**
 * Gets called when the user stops dragging.
 * @param {Object} e The event object.
 */
function onDragEnd(e) {

    isDragging = false;
    var curPosX = mouseX;
    var curPosY = mouseY;
    var timeDiff = new Date().getTime() - origTime;
    var diffX = curPosX - origPosX;
    var diffY = curPosY - origPosY;
    dMouseY = diffX/timeDiff;
    dMouseX = diffY/timeDiff;                
}



// ————————————————————————————————————————————————————————————
// RENDER FUNCTION
// ————————————————————————————————————————————————————————————

/**
 * The main function that gets called continously to render the sphere.
 */
function render() {

    requestAnimationFrame( render );

    // if user is dragging the sphere,
    // keep track of mouse direction and position
    if (isDragging) {
        var curPosX = mouseX;
        var curPosY = mouseY;
        var diffX = curPosX - prevPosX;
        var diffY = curPosY - prevPosY;
        dMouseY = diffX * accel;
        dMouseX = diffY * accel;
        prevPosX = curPosX;
        prevPosY = curPosY;
    }
    
    // calculate sphere rotation
    var rx = (-dMouseX / speed) * deg2Rad;
    var ry = (dMouseY / speed) * deg2Rad;
    var rxs = Math.sin(rx);
    var rys = Math.sin(ry);
    var rxc = Math.cos(rx);
    var ryc = Math.cos(ry);

    // update the sphere based on rotation
    sphere.rotate(rxs, rys, rxc, ryc);
    sphere.redraw();

    // decelerate mouse values for kinetic drag effect
    dMouseX = dMouseX - (dMouseX * accel);
    dMouseY = dMouseY - (dMouseY * accel);
}



// ————————————————————————————————————————————————————————————
// START VISUALIZATION
// ————————————————————————————————————————————————————————————

// initially measure the browser window
updateMeasurements();

// add event listeners
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mousedown', onDragStart, false );
document.addEventListener( 'mouseup', onDragEnd, false );
document.addEventListener( 'touchmove', onDocumentMouseMove, false );
document.addEventListener( 'touchstart', onDragStart, false );
document.addEventListener( 'touchend', onDragEnd, false );

window.addEventListener( 'resize', updateMeasurements, false );

// create new sphere
sphere = new Sphere();

// start rendering
render();

// ————————————————————————————————————————————————————————————

