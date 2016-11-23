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

	this.getLength = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

	this.getAngle = function() {
	    return 90 - Math.atan2(this.y, this.x) / Math.PI * 180;
	};

	this.setAngle = function(angle) {
		var length = this.getLength();
		angle = angle / 180 * Math.PI;
		this.x = Math.sin(angle) * length;
		this.y = Math.cos(angle) * length;
	};

}

// ————————————————————————————————————————————————————————————
// LIMB
// ————————————————————————————————————————————————————————————
function Limb(x, y, angle, color) {
	this.color = color;
    this.x = x;
	this.y = y;
	this.originX = x;
	this.originY = y;
	this.vector = new Vector(2 + Math.random() * 10, 2 + Math.random() * 10);
    this.vector.setAngle(angle);
	this.life = 0;
    this.maxlife = 15 + Math.random() * 40;
    this.rnd = 5 * Math.random();
    this.dir = (Math.random() > 0.5) ? Number(1) : Number(-1);
    this.bent = Math.random() * 0.3;
    this.limbPoints = [];
    this.dead = false;
}

Limb.prototype.draw = function() {
	if (this.life <= this.maxlife) {
		var progress = (this.maxlife - this.life) / this.maxlife;
		var thickness = progress * 12 + 2;

		this.limbPoints.push({
			"point": new Point(this.x, this.y),
			"stroke": thickness
		});

	} else {
		this.limbPoints.shift();
		if (this.limbPoints.length <= 1) {
			this.dead = true;
		}
	}
	
	if (this.limbPoints.length < 2) return;

	for (var i = 1; i < this.limbPoints.length; i++) {
		var lp = this.limbPoints[i];
		ctx.beginPath();
		ctx.lineWidth = lp['stroke'];
		ctx.moveTo(this.limbPoints[i-1]['point'].x, this.limbPoints[i-1]['point'].y);
		ctx.lineTo(lp['point'].x, lp['point'].y);
		ctx.stroke();
	}

	this.life++;
	this.vector.setAngle( this.vector.getAngle() + this.dir * (this.life + this.rnd) * this.bent);
	this.x = this.x + this.vector.x;
	this.y = this.y + this.vector.y;
	
	// if ( this.life >= maxlife)
	// {
	// this.removeEventListener(Event.ENTER_FRAME,draw);
	// Plant.getInstance().createBloom(this.x + curX,this.y + curY,100,color);
	// TweenLite.delayedCall(3,limbDie);
	// }
	// if(getTimer() % 10 == 0)
	// {
	// Plant.getInstance().createLeaf(this.x + curX,this.y + curY,vector.getRotation(),50,color);
	// }


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
	this.color;
	this.limbCount = 0;
	
	// this.leafes:Sprite;
	// this.blooms:Sprite;
}

Plant.prototype.onMouseDown = function() {
	this.color = (this.color == "#000000") ? "#ffffff" : "#000000";

	this.x = mouseX;
	this.y = mouseY;

    this.trailPoints.push({
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

    this.trailPoints.push({
        "point": new Point(this.x, this.y),
        "draw": "line",
        "color": this.color,
        "time": Date.now()
    });

     if(Date.now() % 6 == 0)
     {
        this.createLimb();
     }
     // if(Date.now() % 3 == 0)
     // {
     //    this.createLeaf(curX,curY,_vector.getRotation(),100,_color);
     // }
}

Plant.prototype.createLimb = function(x, y, angle) {
	var limb = new Limb(this.x, this.y, this.vector.getAngle(), this.color);
	this.limbStorage.push(limb);

}

Plant.prototype.draw = function() {
	if (this.trailPoints.length == 0) return;

	var i;
     
    ctx.globalCompositeOperation = "normal";
	ctx.globalAlpha = 1;

	// move to start
	ctx.beginPath();
    ctx.moveTo(this.trailPoints[0]["point"].x, this.trailPoints[0]["point"].y);
	ctx.strokeStyle = this.trailPoints[0]["color"];
	ctx.lineWidth = 12;

    // draw trailpoints
    for (var i = 1; i < this.trailPoints.length; i++) {
    	var tp = this.trailPoints[i];

    	if (tp['time'] + this.lifeSpan >= Date.now()) {

    		if (tp['draw'] == 'move') {
    			ctx.stroke();
    			ctx.beginPath();
    			ctx.moveTo(tp['point'].x, tp['point'].y);
    			ctx.strokeStyle = tp["color"];
    		} else {
    			ctx.lineTo(tp['point'].x, tp['point'].y);
    			ctx.strokeStyle = tp["color"];
    		}
    		
    	}
    }
	ctx.stroke();

    // remove outdated trailpoints
	for (i = this.trailPoints.length - 1; i >= 0; i--) {
    	var tp = this.trailPoints[i];
    	if (tp['time'] + this.lifeSpan < Date.now()) {
    		this.trailPoints.splice(i, 1);
    	} 
    }

    // draw limbs
    for (i = this.limbStorage.length - 1; i >= 0; i--) {
    	var limb = this.limbStorage[i];
    	if (limb.dead) {
			this.limbStorage.splice(i, 1);
    	} else {
    		limb.draw()
    	}
    }

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

    plant.draw();
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





