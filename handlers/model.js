/*
*   Developer: Aazib Safi Patoli
*   15-Feb-2017
*/
function modelHandler() {

	var mongoose = require('mongoose');
	var dbName = 'chatZeeDB';
	var host = "localhost"; 	// Server IP
	var mongoDB_URL = "mongodb://"+host+"/"+dbName;
	var Message = null;
	var dbConnected = null;

	var chatMessageSchema = new mongoose.Schema({
		username: String,
		message: String
	});

	return {
		connect: function(){
			return mongoose.connect(mongoDB_URL, function (err, db) {
				if(err){
					console.error('MongoDB Connection Failed.');
					dbConnected = false;
					return false;
				}
				else{
					console.log('MongoDB Connection Successful.');
					dbConnected = true;
					return true;
				}
			});
		},
		createCollection: function(collectionName){
			chatMessageSchema.set('collection', collectionName);
			Message = mongoose.model(collectionName, chatMessageSchema);
		},
		getAllMessages: function(data,callback){
			Message.find(function (err, allMessages) {
		      if (err) {
		        return console.error(err);
		      }
		      callback(allMessages);
		    })
		},
		findMessage: function(data){
			Message.find(data,function (err, selectedMessage) {
		      if (err) {
		        return console.error(err)
		      };
		      return selectedMessage;
		    })
		},
		saveMessage: function(data){
			
			var message = new Message ({
				username: data.username,
				message : data.message
			});

			message.save(function (err, saved) {
				if (err) {
					console.log('Error saving to database');
					return false;
				}
				else {
					console.log("SAVED: "+saved);
					return saved;
				}
			});
		},
		getMessage: function(){
			return Message;
		},
		setDBstatus: function(status){
			dbConnected = status;
		},
		getDBstatus: function(){
			return dbConnected;
		}
	}
}

module.exports = modelHandler();