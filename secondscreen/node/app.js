var app             = require('express')();
var http            = require('http').Server(app);
var socketio        = require('socket.io')(http);


// ########################################################################
// ########################################################################

var server = {

    /**
     * Setup the server.
     */
    init: function() {

        // http endpoint to check if app is running
        app.get('/', function(req, res) {
            res.send('app status: running');
        });

        // start socket server
        http.listen( 8001 , function(){
            console.log('server started on 8001');
        });

        // listens for connections to the socket server
        socketio.on('connection', function( socket ) {
            console.log('connection', socket)
        }.bind( this ) );

    }  

};

// ########################################################################
// ########################################################################

server.init();