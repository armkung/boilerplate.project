app.controller('MenuCtrl', function($scope, Room, Socket, Restangular) {
	$scope.user = String.fromCharCode(Math.random() * 26 + 97);
	$scope.room = "";
	Room.room = $scope.room;
	$scope.list = function() {
		Socket.emit("list:room", {}, function(rooms) {
			$scope.rooms = rooms;
		});
	};
	$scope.list();
	$scope.connect = function() {
		Room.room = $scope.room;
		Socket.emit("connect:room", {
			room: $scope.room,
			user: $scope.user
		}, function(id) {

		});
	};
	$scope.create = function() {
		Room.room = $scope.room;
		Socket.emit("create:room", {
			room: $scope.room,
			user: $scope.user
		});
	};
	$scope.close = function() {
		Socket.emit("close:room");
	};
	$scope.disconnect = function() {
		Socket.disconnect();
	};

	// $scope.init();
});