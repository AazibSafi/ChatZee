var app = angular.module('myApp', ['ngMaterial']);

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

app.factory('MessageCreator', ['$http', function ($http){
	return {
		postMessage: function (collection, callback) {
			$http.post('/pushData', collection)
				.success(function(data, status){
					callback(data, false);
				})
				.error(function(data, status) {
					callback(data, true);
				});
		}
	}
}]);

app.service('ToastController',function ($mdToast) { 
      return {
      	showWelcomeText: function(text,delayTime) {
	      $mdToast.show(
	         $mdToast.simple()
	            .textContent(text)
	            .hideDelay(delayTime)
	            .position('bottom right')
	      );
	   	}
	  }
});

app.controller('ChatCtrl', function ($scope, MessageCreator,ToastController) {
	$scope.userName = '';
	$scope.message = '';
	$scope.filterText = '';
	$scope.messages = [];
	$scope.roomName = "default";
	$scope.clientID = -1;
	$scope.typingStatus='';

	var MsjType = {
		'self'  : 'selfMessages',
		'other' : 'otherMessages'
	};

	var room = window.location.pathname.split('/')[1];

	var socket = io.connect();

	ToastController.showWelcomeText("Thank you For Joining '"+room+"' ChatRoom ",5000);

	socket.emit('id', function(id){
		$scope.clientID = id;
		console.log("$scope.clientID: "+$scope.clientID);
	});

	socket.emit('joinRoom', room);
	
	socket.on('receiveMessage', function (data,id){

		if(id == $scope.clientID)
			data.type = MsjType.self;
		else
			data.type =  MsjType.other;

		console.log("data: "+data.type);

		$scope.messages.unshift(data);
		$scope.$apply();
	});

	//load previous messages from chat
	socket.on('pastMessages', function (data) {
		for (var i = data.length - 1; i >= 0; i--)
			data[i].type =  MsjType.other;
		
		$scope.messages = data.reverse();
		// data.forEach(function (message) {
		// 	$scope.messages.unshift(message);
		// })`
		$scope.$apply();
	});

	socket.on('setRoomName', function(data) {
		$scope.roomName = data;
		$scope.$apply();
	});

	socket.on('typing',function (istyping){
		if(istyping)
			$scope.typingStatus = 'Someone is typing....';
    	else
    		$scope.typingStatus = '';

    	$scope.$apply();
	});

	$scope.$watch('message', function() {
        console.log('hey, message has changed ! \"' + $scope.message + '\"');

        if($scope.message == '')
        	socket.emit('typing',$scope.roomName,false);
        else
        	socket.emit('typing',$scope.roomName,true);
    });

	//send a message to the server
	$scope.sendMessage = function () {
		if ($scope.userName == '') {
			window.alert('Choose a username');
			return;
		}

		if (!($scope.message=='')) {
			var chatMessage = {
				'username' : $scope.userName,
				'message' : $scope.message
			};

			var collection = { "chatMessage" : chatMessage
								, "roomName" : $scope.roomName
								, "clientID" : $scope.clientID };

			MessageCreator.postMessage(collection, function (result, error) {
				if (error) {
					window.alert('\nError saving to DB');
					return;
				}
				$scope.message = '';
			});
		}
	};

});