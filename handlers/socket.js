/*
*   Developer: Aazib Safi Patoli
*   15-Feb-2017
*/
function socketHandler() {

	var socketio = require('socket.io');
	var io = null;
	var queueEventFire = [];

	function eventsfire(triggerEvent,data) {
		this.triggerEvent = triggerEvent;
		this.data = data;
	}

	function executeQueueEvents(socket){
		// Send PastMessages of ChatRoom to Client
	    while(queueEventFire.length > 0){
	    	var obj = queueEventFire.pop();

	    	// For PastMessages only
	    	if(obj.data.roomName){
	    		socket.emit(obj.triggerEvent,obj.data.pastMessages);

	    		console.log("Firing an event:"
	    			+"triggerEvent: "+obj.triggerEvent
	    			+" , room: "+obj.data.room
	    			// +" , pastMessages: "+obj.data.pastMessages
	    			);
	    	}
	    	else{
	    		socket.emit(obj.triggerEvent,obj.data);

	    		console.log("Firing an event:"
	    			+"triggerEvent: "+obj.triggerEvent
	    			+" , data: "+obj.data
	    			);
	    	}
	    }
	}

	return {
		init: function(server){
			io = socketio.listen(server);
			
			// handle incoming connections from clients
			io.on('connection', function (socket) {
				
			    console.log('Socket Client connected');

			    executeQueueEvents(socket);

			    socket.on('id',function(data){
			    	console.log("socket.id: "+socket.id);
					data(socket.id);
				});

			    socket.on('joinRoom', function(room) {
			    	
	        		socket.join(room);

	        		socket.emit('setRoomName', room);
	    		});

	    		socket.on('test',function(){
	    			console.log("ID--> "+socket.id);
	    		})

	    		socket.on('typing',function (room,istyping){3
	    			console.log( room + " istyping: "+ istyping + "\nID: " + socket.id);
			    	socket.broadcast.to(room).emit('typing',istyping);
				});

	    		socket.on('disconnect', function () {
			        console.log('Socket Client disconnected');
			    });

			});

			return "Socket initialized";
		},
		getIO: function() {
			return io;
		},
		logs: function(flag) {
			if(!flag)
				io.set('log level', 1); // reduce logging
		},
		emit: function(triggerEvent,data) {
			queueEventFire.push(new eventsfire(triggerEvent,data));
		}
	}
}

module.exports = socketHandler();