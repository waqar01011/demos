
// -----------------------------------------------------------
// Connect to Socket.io
// -----------------------------------------------------------
var server = (window.location.hostname == "localhost") ?  "http://localhost:8001" : "http://devserver.artofrawr.com:8001";
var socketIo = document.createElement('script');

socketIo.onload = function(){
    new Demo(io.connect(server));
}.bind(this);

socketIo.onerror = function(){
    alert("There was an error connecting to the socket server.");
};

socketIo.src = server  + "/socket.io/socket.io.js";
document.body.appendChild(socketIo);


// -----------------------------------------------------------
// Second Screen Demo: Mobile
// -----------------------------------------------------------
/**
 * Demo class constructor.
 * @param {Socket} socket The socket.io instance.
 */
function Demo(socket) {
    this.socket = socket;

    // dom elements on the page that this script will interact with
    this.elLoader = document.getElementById("loading");
    this.elDisconnected = document.getElementById("disconnected");
    this.elWarning = document.getElementById("warning");
    this.elInputID = document.getElementById("inputID");
    this.elButtonConnect = document.getElementById("buttonConnect");
    this.elButtonPlay = document.getElementById("buttonPlay");
    this.elButtonPause = document.getElementById("buttonPause");
    this.elButtonRestart = document.getElementById("buttonRestart");
    this.elButtonDisconnect = document.getElementById("buttonDisconnect");
    this.elConnected = document.getElementById("connected");
    this.elTime = document.getElementById("time");

    // event listeners
    this.socket.on('connect', this.onConnect.bind(this));
    this.socket.on('handshakeDenied', this.onHandshakeDenied.bind(this));
    this.socket.on('handshake', this.onHandshake.bind(this));
    this.socket.on('messageRecieved', this.onMessageReceived.bind(this));
    this.elButtonConnect.addEventListener("click", this.onHandshakeRequest.bind(this));  
    
    this.elButtonPlay.addEventListener("click", function() {
        this.sendMessage({type: "play", value: true});
    }.bind(this));  

    this.elButtonPause.addEventListener("click", function() {
        this.sendMessage({type: "play", value: false});
    }.bind(this));  

}

/**
 * After a successful connection, let the socket know that we're a mobile client.
 * We'll also switch the display from loading to the device id form.
 */   
Demo.prototype.onConnect = function() {
    console.log('connected');
    this.socket.emit('setType', "mobile");
    // hide loading
    this.elLoader.style.display = "none";
    this.elDisconnected.style.display = "block";
}

/**
 * Request a handshake with the specified device id.
 */   
Demo.prototype.onHandshakeRequest = function(e) {
    e.preventDefault();
    var id = this.elInputID.value;
    if (id.trim() == "") {
        alert("Please enter the id of the device you're trying to connect to.");
        return;
    }

    console.log('requesting handshake with', id);
    this.socket.emit('handshakeRequest', id);
}

/**
 * If the specified id was wrong, or something else failed, the
 * handshake request will be denied. In that case a warning will be displayed.
 */
Demo.prototype.onHandshakeDenied = function() {
    this.elWarning.style.display = "block";
}

/**
 * Handshake was a success and we can now communicate with the other device.
 */
Demo.prototype.onHandshake = function() {
    console.log("handshake success");
    this.elWarning.style.display = "none";
    this.elDisconnected.style.display = "none";
    this.elConnected.style.display = "block";
}

Demo.prototype.sendMessage = function(data) {
    this.socket.emit('sendMessage', JSON.stringify(data));
}

Demo.prototype.onMessageReceived = function(data) {
    data = JSON.parse(data);
    console.log("received message:", data);

    if (data.type == "time") {
        // convert seconds to m:ss, e.g. 63 -> 1:03
        var strTime = Math.floor(data.value / 60) + ":" + String("00" + Math.floor( data.value - Math.floor(data.value/60)*60)).slice(-2);
        this.elTime.innerHTML = strTime;
    }
}
