app.controller('MainCtrl', function($scope, Room, Socket, Restangular) {
	$scope.user = String.fromCharCode(Math.random() * 26 + 97);
	$scope.room = "";
	Room.room = $scope.room;
	$scope.connect = function() {
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