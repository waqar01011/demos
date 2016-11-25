require('es6-shim');
var debug           = require('debug')('secondscreen');
var app             = require('express')();
var http            = require('http').Server(app);
var socketio        = require('socket.io')(http);

// ########################################################################
// ########################################################################

/**
 * A class, representing a connected client.
 */
var Client = function(socket) {
    this.socket = socket;
    this.id = server.getNewId();
    this.type = null;
    this.connection = null; 

    debug('new client: ' + this.id + ' (total clients: ' + (server.clients.length + 1) + ')');
    // let client know about assigned id
    this.socket.emit("newID", this.id);

    this.addEventListeners();
}

Client.prototype.addEventListeners = function() {
    this.socket.on('handshakeRequest', this.onHandShakeRequest.bind(this));
    this.socket.on('setType', this.onSetType.bind(this));
    this.socket.on('sendMessage', this.sendMessage.bind(this));
    this.socket.on('disconnect', this.onDisconnect.bind(this));
}

Client.prototype.onSetType = function(type) {
    debug("setType " + type);
    this.type = type;
}

Client.prototype.onHandShakeRequest = function(targetClientID) {
    // see if we can find the client with the specified id
    console.log(this.id + " trying to handshake with " + targetClientID);
    var targetClient = server.clients.find(function(client) { return client.id == targetClientID; });
    
    if (targetClient && targetClient.type == Client.TYPE.DESKTOP) {
        console.log('handshake success');
        this.handshake(targetClient);
        targetClient.handshake(this);
    } else {
        console.log('denying handshake');
        this.socket.emit('handshakeDenied');
    }
}

Client.prototype.handshake = function(client) {
    this.connection = client;
    this.socket.emit('handshake');
}

Client.prototype.handshakeEnd = function() {
    this.connection = null;
    this.socket.emit('handshakeEnd');
}

Client.prototype.onDisconnect = function() {
    debug("client disconnected: " + this.id);
    if (this.connection) this.connection.handshakeEnd();
    server.deleteClient(this);
}

Client.prototype.sendMessage = function(data) {
    console.log('sending message' + data);
    if (this.connection) this.connection.socket.emit('messageRecieved', data);
}

Client.TYPE = {
    DESKTOP: "desktop",
    MOBILE: "mobile"
}


// ########################################################################
// ########################################################################

var server = {

    port: 8001, 
    clients: [],

    /**
     * Sets up the socket server.
     */
    init: function() {

        // http endpoint to check if app is running
        app.get('/', function(req, res) {
            res.send('app status: running');
        });

        // start socket server
        http.listen( this.port , function(){
            debug('server started on port ' + this.port);
        }.bind(this));

        // listens for connections to the socket server 
        socketio.on('connection', function( socket ) {
            // create a new client class for each connected socket
            this.clients.push(new Client(socket));
        }.bind( this ) );

    },

    /**
     * Creates a new unique id, which will be used for the second screen handshake.
     */
    getNewId: function() {
        var newId;
        var isNew = false;
        while ( isNew == false ) { 
            newId = Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(1).toUpperCase(); 
            isNew = (this.clients.find(function(client) { return client.id == newId; }) == undefined);
        } 
        return newId;
    },

    /**
     * Removes a client from the reference array.
     */
    deleteClient: function(client) {
        var clientIndex = this.clients.indexOf( client );
        if (clientIndex !== -1) {
            this.clients.splice( clientIndex, 1 );
        }
    }
    
}

server.init();

// ########################################################################
// ########################################################################

