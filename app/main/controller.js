app.controller('LoginCtrl', function($scope, $state, GoogleService, LoginManager) {
	GoogleService.load().then(function() {
		GoogleService.getUser().then(function(data) {
			console.log(data);

			LoginManager.login(data).then(function() {
				$state.go('main');
			});
		});
	});
});
app.controller('MainCtrl', function($scope, $state, LoginManager) {
	LoginManager.isTeacher(function() {
		$scope.access = 'teacher';
	});
	LoginManager.isStudent(function() {
		$scope.access = 'student';
	});
	$state.go('main.home_' + $scope.access);
	console.log($scope.access)
});
app.controller('MenuRightCtrl', function($scope, $rootScope, $state) {
	// var menu = ["Chat", "Group"];
	var types = {
		GROUP: "group",
		CHAT: "chat"
	}
	// checkRoute();
	$rootScope.$on("$stateChangeSuccess", function($currentRoute, $previousRoute) {
		checkRoute();
	});
	$scope.setCurrent = function(index) {
		$scope.current = $scope.menus[index];
	};

	function checkRoute() {
		var route = $state.current.url;
		// $scope.isHide = route == "/home/teacher" || route == "/home/student";
		switch (route) {
			case "/draw":
				$scope.current = types.GROUP;
				break;
			default:
				$scope.current = types.CHAT;
		}
	}
});