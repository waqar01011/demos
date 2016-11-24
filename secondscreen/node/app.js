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
    this.connections = []; 

    debug('new client: ' + this.id);
    // let client know about assigned id
    this.socket.emit("newID", this.id);

    this.addEventListeners();
}

Client.prototype.addEventListeners = function() {
    this.socket.on('handshakeRequest', this.onHandShakeRequest.bind(this));
    this.socket.on('setType', this.onSetType.bind(this));
    this.socket.on('disconnect', this.onDisconnect.bind(this));
}

Client.prototype.onHandShakeRequest = function(targetClientID) {

}

Client.prototype.onSetType = function(type) {
    debug("setType " + type);
}

Client.prototype.onDisconnect = function() {
    debug("client disconnected: " + this.id);
    
    this.connections.forEach(function(connection) {
        connection.emit('handshakeDisconnect', this.id);
    });

    server.deleteClient(this);
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

