app.controller('MenuRightCtrl', function($scope, $rootScope, $location) {
	$rootScope.$on("$routeChangeStart", function($currentRoute, $previousRoute) {
		var route = $location.path();
		if (route == "/draw") {
			$scope.menus = ["Chat", "Group"];
			$scope.current = "Group";
		} else {
			$scope.menus = [];
			$scope.current = "Chat";
		}
	});

	$scope.setCurrent = function(index){
		$scope.current = $scope.menus[index];
	};
})