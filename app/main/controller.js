app.controller('LoginCtrl', function($scope, $state, GoogleService) {
	GoogleService.load().then(function() {
		GoogleService.getUser(function(data) {
			console.log(data);
		});

		GoogleService.listFile(function(data) {
			console.log(data);
		});

		$state.go('main.home');
	});
});
app.controller('MenuRightCtrl', function($scope, $rootScope, $state) {
	var menu = ["Chat", "Group"];

	checkRoute();
	$rootScope.$on("$stateChangeSuccess", function($currentRoute, $previousRoute) {
		checkRoute();
	});

	$scope.setCurrent = function(index) {
		$scope.current = $scope.menus[index];
	};

	function checkRoute() {
		var route = $state.current.url;
		if (route == "/draw") {
			$scope.menus = menu;
			$scope.current = "Group";
		} else {
			$scope.menus = [];
			$scope.current = "Chat";
		}
	}
});