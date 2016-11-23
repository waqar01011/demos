/**
 * A spherical visualization demo, using Javascript + HTML5 canvas.
 *
 * @author Jens Fischer
 * @link http://artofrawr.com/demos/sphere
 * @link https://github.com/artofrawr/demos/blob/master/sphere
 */

// canvas reference
var canvas = document.getElementById("flower");
var ctx = canvas.getContext("2d");

// user interaction
var isDragging = false;
var mouseX = 0, mouseY = 0;

// some measurements and math helpers
var pixelRatio = window.devicePixelRatio || 1;
var windowHalfX, windowHalfY;
var deg2Rad = Math.PI / 180;

var overlay, plant;

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
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function Vector(x, y) {
	this.x = x;
	this.y = y;
}

// ————————————————————————————————————————————————————————————
// PLANT
// ————————————————————————————————————————————————————————————
function Plant() {
	this.lifeSpan = 1000;
	this.trail;
	this.speed = 0.25;
	this.points = 150;
	this.trailPoints = [];
	this.trailBack = [];
	this.bloomStorage = [];
	this.leaveStorage = [];
	this.limbStorage = [];

	this.x = 0;
	this.y = 0;
	this.vector;
	this.color = "#000000";
	this.limbCount = 0;
	
	// this.leafes:Sprite;
	// this.blooms:Sprite;
}

Plant.prototype.onMouseDown = function() {
	this.color = (this.color == "#000000") ? "#ffffff" : "#000000";

	this.x = mouseX;
	this.y = mouseY;

    this.trailPoints.unshift({
        "point": new Point(this.x, this.y),
        "draw": "move",
        "color": this.color,
        "time": Date.now()
    });
}

Plant.prototype.move = function() {
	this.vector = new Vector(mouseX - this.x, mouseY - this.y);
    this.x = this.x + this.speed * this.vector.x;
    this.y = this.y + this.speed * this.vector.y;

    this.trailPoints.unshift({
        "point": new Point(this.x, this.y),
        "draw": "line",
        "color": this.color,
        "time": Date.now()
    });


    this.drawTrail();

     // if(getTimer() % 6 == 0)
     // {
     //    createLimb(curX,curY,_vector.getAngle());
     // }
     // if(getTimer() % 3 == 0)
     // {
     //    createLeaf(curX,curY,_vector.getRotation(),100,_color);
     // }
}

Plant.prototype.drawTrail = function() {
	var i;
     
    ctx.globalCompositeOperation = "normal";
	ctx.globalAlpha = 1;

	// move to start
    ctx.moveTo(this.trailPoints[0]["point"].x, this.trailPoints[0]["point"].y);
	ctx.strokeStyle = this.trailPoints[0]["color"];
	ctx.lineWidth = 12;

    // draw trailpoints
    for (var i = 1; i < this.trailPoints.length; i++) {
    	var tp = this.trailPoints[i];

    	if (tp['time'] + this.lifeSpan >= Date.now()) {

    		if (tp['draw'] == 'move') {
    			ctx.moveTo(tp['point'].x, tp['point'].y);
    			ctx.strokeStyle = tp["color"];
    		} else {
    			ctx.lineTo(tp['point'].x, tp['point'].y);
    			ctx.strokeStyle = tp["color"];
    			ctx.stroke();
    		}
    		
    	} else {
    		console.log("outdated");
    	}
    }

 //    	)
 //    // remove outdated trailpoints
	// for (i = this.trailPoints.length - 1; i >= 0; i--) {
 //    	var tp = this.trailPoints[i];
 //    	if (tp['time'] + this.lifeSpan < Date.now()) {
 //    		this.trailPoints.splice(i, 1);
 //    	} 
 //    }

}

// ————————————————————————————————————————————————————————————
// OVERLAY
// ————————————————————————————————————————————————————————————

function Overlay() {
	this.loaded = false;
	this.img = new Image;
	this.img.onload = function(){
	  this.loaded = true;
	}.bind(this);
	this.img.src = 'overlay.jpg';
}

Overlay.prototype.draw = function () {
	if (!this.loaded) return;
	ctx.globalCompositeOperation = "multiply";
	ctx.globalAlpha = 0.5;
	ctx.drawImage(this.img,0,0, canvas.width, canvas.height); // Or at whatever offset you like
}


// ————————————————————————————————————————————————————————————
// RENDER FUNCTION
// ————————————————————————————————————————————————————————————

/**
 * The main function that gets called continously to render the demo.
 */
function render() {

    requestAnimationFrame( render );

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isDragging) {
    	plant.move();
    }

    overlay.draw();
   
}

// ————————————————————————————————————————————————————————————
// EVENT HANDLERS FOR KINETIC DRAGGING
// ————————————————————————————————————————————————————————————

/**
 * Gets called when the user moves the mouse.
 * @param {Object} e The event object.
 */
function onDocumentMouseMove(e) {
    mouseX = e.clientX * pixelRatio;
    mouseY = e.clientY * pixelRatio;
}

/**
 * Gets called when the user starts dragging.
 * @param {Object} e The event object.
 */
function onDragStart(e) {
    isDragging = true;
    plant.onMouseDown();
}

/**
 * Gets called when the user stops dragging.
 * @param {Object} e The event object.
 */
function onDragEnd(e) {
    isDragging = false;               
}


// ————————————————————————————————————————————————————————————
// START DEMO
// ————————————————————————————————————————————————————————————

// initially measure the browser window
updateMeasurements();

// instantiate visualization classes
plant = new Plant();
overlay = new Overlay();

// add event listeners
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mousedown', onDragStart, false );
document.addEventListener( 'mouseup', onDragEnd, false );
window.addEventListener( 'resize', updateMeasurements, false );

// start rendering
render();

// ————————————————————————————————————————————————————————————





