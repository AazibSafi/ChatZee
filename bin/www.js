/*
*   Developer: Aazib Safi Patoli
*   15-Feb-2017
*/
var debug = require('debug')('www:server');
var http = require('http');

var socketIO = require('../handlers/socket');
var database = require('../handlers/model');

require("../app.js").urlHandle(socketIO,database);
var app = require("../app.js").app;


// All Environments
var port = normalizePort(process.env.PORT || 3000);
app.set('port', port);

var server = http.createServer(app);

// Server Listening
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


// Database Connection
// var dbStatus = 
database.connect();
// database.setDBstatus(dbStatus);

// Socket Connection
socketIO.init(server);
socketIO.logs(false);

// Normalize a port into a number, string, or false.
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port))
    return val;

  if (port >= 0)
    return port;

  return false;
}

// Event listener for HTTP server "error" event.
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Event listener for HTTP server "listening" event.
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}