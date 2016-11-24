var SecondScreenDemo = function() {

    this.server = (window.location.hostname == "localhost") ?  "http://localhost:8001" : "http://devserver.artofrawr.com:8001";
    this.socket = null;

    this.id = null;

    this.connect();
}

/**
 *  Loads socket.io from the server.
 */
SecondScreenDemo.prototype.connect = function() {
    var socketIo = document.createElement('script');
    
    socketIo.onload = function(){
        // connect socket.io to server
        this.socket = io.connect(this.server);
        // create event listeners
        this.addEventListeners();
    }.bind(this);

    socketIo.onerror = function(){
        this.onConnectError();
    }.bind(this);

    socketIo.src = this.server  + "/socket.io/socket.io.js";
    document.body.appendChild(socketIo);
}

/**
 * Connects to node.
 */
SecondScreenDemo.prototype.addEventListeners = function() {

    this.socket.on('connect', this.onConnect.bind(this));       
    this.socket.on('newID', this.onID.bind(this));       

}
 
/**
 * After a successful connection, let the socket know that we're a desktop client.
 */   
SecondScreenDemo.prototype.onConnect = function() {
    console.log('connected');
    this.socket.emit('setType', "desktop");
}
      
/**
 * We just go an ID assigned.
 */   
SecondScreenDemo.prototype.onID = function(id) {
    console.log('we got an id:', id);
    this.id = id;
    document.getElementById("handshakeID").innerHTML = id;
}