app.controller('HandWriteCtrl', function($scope, $rootScope, DrawFactory) {
	$scope.tools = [];
	$scope.attrs = [];
	$scope.tool = DrawFactory.tools.DRAW;
	angular.forEach(DrawFactory.tools, function(value, key) {
		$scope.tools.push(value);
	});
	angular.forEach(DrawFactory.attrs, function(value, key) {
		$scope.attrs.push(value);
	});
	$scope.changeTool = function(index) {
		$scope.tool = $scope.tools[index];
	};
	$scope.changeAttr = function(index) {
		$rootScope.$broadcast('attr', $scope.attrs[index]);
	};

});

app.controller('TextWriteCtrl', function($scope, $rootScope, DrawFactory) {
	$scope.tools = [];
	$scope.attrs = [];
	$scope.tool = DrawFactory.tools.TEXT;
	angular.forEach(DrawFactory.tools, function(value, key) {
		$scope.tools.push(value);
	});
	angular.forEach(DrawFactory.attrs, function(value, key) {
		$scope.attrs.push(value);
	});
	$scope.changeTool = function(index) {
		$scope.tool = $scope.tools[index];
	};
	$scope.changeAttr = function(index) {
		$rootScope.$broadcast('attr', $scope.attrs[index]);
	};
});

app.controller('HomeCtrl', function($scope, Room, Socket, Restangular) {
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

	// $scope.connect();
});