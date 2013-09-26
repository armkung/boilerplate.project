app.controller('MenuRightCtrl', function($scope, $rootScope, $location) {
	var menu = ["Chat", "Group"];

	checkRoute();
	$rootScope.$on("$stateChangeSuccess", function($currentRoute, $previousRoute) {
		checkRoute();
	});

	$scope.setCurrent = function(index) {
		$scope.current = $scope.menus[index];
	};

	function checkRoute() {
		var route = $location.path();
		if (route == "/draw") {
			$scope.menus = menu;
			$scope.current = "Group";
		} else {
			$scope.menus = [];
			$scope.current = "Chat";
		}
	}
})