/**
 * A Javascript + HTML5 canvas drawing demo.
 *
 * @author Jens Fischer
 * @link http://artofrawr.com/demos/flower
 * @link https://github.com/artofrawr/demos/blob/master/flower
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

// viz
var overlay, plant;
var svgs = {};
var trailPoints = [];
var trailBack = [];
var bloomStorage = [];
var leafStorage = [];
var limbStorage = [];


// ————————————————————————————————————————————————————————————
// SVGS
// ————————————————————————————————————————————————————————————

function loadSVG(id) {
    var url = id + ".svg";
    var request = new XMLHttpRequest();
    request.open("GET", url, true);

    request.onload = function () {

        var svgXml = request.response;
        
        // white
        var white = new Image();
        white.src = "data:image/svg+xml;charset=utf-8,"+svgXml;
        // black
        var blackSvgXml = svgXml.replace(/#ffffff/g,'#000000');
        var black = new Image();
        black.src = "data:image/svg+xml;charset=utf-8,"+blackSvgXml;

        // store images
        svgs[id] = {};
        svgs[id]['white'] = white;
        svgs[id]['black'] = black;
    }

    request.send();
}

loadSVG('leaf');
loadSVG('bloom1');
loadSVG('bloom2');



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

    this.getRotation = function() {
        return Math.atan2(this.y, this.x) / Math.PI * 180;
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
// LEAF
// ————————————————————————————————————————————————————————————

function Leaf(x, y, angle, color) {
    this.imgID = (Math.random() > 0.75) ? "bloom1" : "leaf";
    this.dead = false;
    this.img = (color == "#ffffff") ? svgs[this.imgID]['white'] : svgs[this.imgID]['black'];
    this.x = x;
    this.y = y;
    this.angle = angle + Math.random() * 90 * deg2Rad;
    this.scale = (Math.random() > 0.5) ? 1 : -1;

    this.life = 0;
    this.maxlife = 40 + Math.random() * 60;
}

Leaf.prototype.draw = function() {
    var progress = this.life / this.maxlife;

    if (progress >= 1) {
        this.dead = true;
        return;
    }

    var growth = 1;
    if (progress < 0.1) growth = progress / 0.1;
    if (progress > 0.6) growth = (1 - progress) / 0.4;

    var scaledWidth = this.img.width * growth;
    var scaledHeight = this.img.height * growth;
    var centerX = 0;
    var centerY = scaledHeight * 0.5;

    ctx.save(); 
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle); 
    ctx.scale(this.scale, 1);
    ctx.drawImage(this.img, -centerX, -centerY, scaledWidth, scaledHeight );
    ctx.restore();

    this.life++;
}

// ————————————————————————————————————————————————————————————
// BLOOM
// ————————————————————————————————————————————————————————————

function Bloom(x, y, angle, color) {
    this.dead = false;
    this.img = (color == "#ffffff") ? svgs['bloom2']['white'] : svgs['bloom2']['black'];
    this.x = x;
    this.y = y;
    this.angle = angle * deg2Rad;
    this.scale = (Math.random() > 0.5) ? 1 : -1;

    this.life = 0;
    this.maxlife = 40 + Math.random() * 60;
}

Bloom.prototype.draw = function() {
    var progress = this.life / this.maxlife;

    if (progress >= 1) {
        this.dead = true;
        return;
    }

    var growth = 1;
    if (progress < 0.2) growth = progress / 0.2;
    if (progress > 0.6) growth = (1 - progress) / 0.4;

    var scaledWidth = this.img.width * growth;
    var scaledHeight = this.img.height * growth;
    var centerX = 0;
    var centerY = scaledHeight;

    ctx.save(); 
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle); 
    ctx.scale(this.scale, 1);
    ctx.drawImage(this.img, -centerX, -centerY, scaledWidth, scaledHeight );
    ctx.restore();

    this.life++;
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
    this.angle = angle;
    this.vector = new Vector(2 + Math.random() * 10, 2 + Math.random() * 10);
    this.vector.setAngle(angle);
    this.life = 0;
    this.maxlife = 15 + Math.random() * 40;
    this.rnd = 5 * Math.random();
    this.dir = (Math.random() > 0.5) ? Number(1) : Number(-1);
    this.bent = Math.random() * 0.3;
    this.limbPoints = [];
    this.dead = false;
    
    this.bloomed = false;
    this.bloomDuration = 1000;
    this.bloomStarted;
}

Limb.prototype.draw = function() {

    // growing
    if (this.life <= this.maxlife) {
        var progress = (this.maxlife - this.life) / this.maxlife;
        var thickness = progress * 12 + 2;

        this.limbPoints.push({
            "point": new Point(this.x, this.y),
            "stroke": thickness
        });

        if(Date.now() % 10 == 0) {
            var leaf = new Leaf(this.x, this.y, this.vector.getRotation(), this.color);
            leafStorage.push(leaf);
        }
        
    // blooming
    } else if (!this.bloomStarted ||  this.bloomStarted + this.bloomDuration > Date.now()) {

        if (!this.bloomStarted) this.bloomStarted = Date.now();

        if (!this.bloomed) {
            var bloom = new Bloom(this.originX, this.originY, this.angle, this.color);
            bloomStorage.push(bloom);
            this.bloomed = true;
        }

    // dying
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
        ctx.strokeStyle = this.color;
        ctx.lineWidth = lp['stroke'];
        ctx.moveTo(this.limbPoints[i-1]['point'].x, this.limbPoints[i-1]['point'].y);
        ctx.lineTo(lp['point'].x, lp['point'].y);
        ctx.stroke();
    }

    this.life++;
    this.vector.setAngle( this.vector.getAngle() + this.dir * (this.life + this.rnd) * this.bent);
    this.x = this.x + this.vector.x;
    this.y = this.y + this.vector.y;
    
    
    

}

// ————————————————————————————————————————————————————————————
// PLANT
// ————————————————————————————————————————————————————————————

function Plant() {
    this.lifeSpan = 2000;
    this.speed = 0.25;
    this.points = 150;
    this.x = 0;
    this.y = 0;
    this.vector;
    this.color;
}

Plant.prototype.onMouseDown = function() {
    this.color = (this.color == "#000000") ? "#ffffff" : "#000000";

    this.x = mouseX;
    this.y = mouseY;

    trailPoints.push({
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

    trailPoints.push({
        "point": new Point(this.x, this.y),
        "draw": "line",
        "color": this.color,
        "time": Date.now()
    });

    if(Date.now() % 6 == 0) {
        var limb = new Limb(this.x, this.y, this.vector.getAngle(), this.color);
        limbStorage.push(limb);
    }

    if(Date.now() % 3 == 0)
    {
        var leaf = new Leaf(this.x, this.y, this.vector.getRotation(), this.color);
        leafStorage.push(leaf);
    }
}


Plant.prototype.draw = function() {
    

    var i;
     
    ctx.globalCompositeOperation = "normal";
    ctx.globalAlpha = 1;

    // main flower trail
    if (trailPoints.length > 0) {

        // move to start
        ctx.beginPath();
        ctx.moveTo(trailPoints[0]["point"].x, trailPoints[0]["point"].y);
        ctx.strokeStyle = trailPoints[0]["color"];
        ctx.lineWidth = 12;

        // draw trailpoints
        for (var i = 1; i < trailPoints.length; i++) {
            var tp = trailPoints[i];

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
        for (i = trailPoints.length - 1; i >= 0; i--) {
            var tp = trailPoints[i];
            if (tp['time'] + this.lifeSpan < Date.now()) {
                trailPoints.splice(i, 1);
            } 
        }
    }

    // limbs
    for (i = limbStorage.length - 1; i >= 0; i--) {
        var limb = limbStorage[i];
        if (limb.dead) {
            limbStorage.splice(i, 1);
        } else {
            limb.draw()
        }
    }

    // blooms
    for (i = bloomStorage.length - 1; i >= 0; i--) {
        var bloom = bloomStorage[i];
        if (bloom.dead) {
            bloomStorage.splice(i, 1);
        } else {
            bloom.draw()
        }
    }

    // leafs
    for (i = leafStorage.length - 1; i >= 0; i--) {
        var leaf = leafStorage[i];
        if (leaf.dead) {
            leafStorage.splice(i, 1);
        } else {
            leaf.draw()
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
    e.preventDefault();
    if (e.touches && e.touches.length > 0) {
        mouseX = e.touches[0].clientX * pixelRatio;
        mouseY = e.touches[0].clientY * pixelRatio;
    }else {
        mouseX = e.clientX * pixelRatio;
        mouseY = e.clientY * pixelRatio;
    }

}

/**
 * Gets called when the user starts dragging.
 * @param {Object} e The event object.
 */
function onDragStart(e) {
    e.preventDefault();
    isDragging = true;
    
    if (e.touches && e.touches.length > 0) {
        mouseX = e.touches[0].clientX * pixelRatio;
        mouseY = e.touches[0].clientY * pixelRatio;
    }else {
        mouseX = e.clientX * pixelRatio;
        mouseY = e.clientY * pixelRatio;
    }

    plant.onMouseDown();
}

/**
 * Gets called when the user stops dragging.
 * @param {Object} e The event object.
 */
function onDragEnd(e) {
    e.preventDefault();
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
document.addEventListener( 'touchmove', onDocumentMouseMove, false );
document.addEventListener( 'touchstart', onDragStart, false );
document.addEventListener( 'touchend', onDragEnd, false );
window.addEventListener( 'resize', updateMeasurements, false );

// start rendering
render();

// ————————————————————————————————————————————————————————————





