/*
*   Developer: Aazib Safi Patoli
*   15-Feb-2017
*/

var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'assets')));
// app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
// app.use(express.methodOverride());
// app.use(app.router);

// development only
if (app.get('env') == 'development') {
  app.use(express.errorHandler());
}

var urlHandle = function (socketIO,database) {

  app.use(function(req, res, next){
    res.io = socketIO.getIO();
    next();
  });

  app.get('/', function (req, res) {
      res.send("<h1>Enter into your Chat Room</h1><h3><a>E.g: http://"+req.get('host')+"/{Chat Room Name Here}</a></h3>");
  });

  app.get('/:roomName', function (req, res) {

      roomName = req.params.roomName;
      console.log("roomName: "+roomName);

      if(roomName == ''){
        console.log("No Page Found");
        res.send("<h1>Enter into your Chat Room</h1><h3>E.g: http://192.168.14.94:3000/trump</h3>");
      }
      else{
        
        if(database.getDBstatus()){

          console.log("Routing to chatView.html");
          res.render('chatView.html');

          database.createCollection(roomName);

          database.getAllMessages(roomName, function(pastMessages){

            if(pastMessages) {
              console.log('allPastMessages: '+ pastMessages);

              var data = { 'pastMessages': pastMessages,'roomName': roomName };
              socketIO.emit('pastMessages', data);
            }
            else {
              console.log("pastMessages Not Available");
            }
          });
        }
        else{
          res.send("Database Error. Please Try Again");
        }
      }
  });

  app.post('/pushData', function (req, res) {

    database.createCollection(req.body.roomName);
    var status = database.saveMessage(req.body.chatMessage);

    if(typeof status !== 'boolean'){
      console.log("DB Saved Success");

      res.io.sockets.in(req.body.roomName).emit('receiveMessage', req.body.chatMessage,req.body.clientID);

      res.send(req.body.chatMessage);
    }
    else
      console.log("DB Saved Failed");
  });

}

module.exports = { app: app, urlHandle: urlHandle };