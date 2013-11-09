app.controller('LoginCtrl', function($scope, $state, $modalInstance, GoogleService, LoginManager) {
	GoogleService.load().then(function() {
		GoogleService.getUser().then(function(data) {
			// console.log(data);

			LoginManager.login(data).then(function() {
<<<<<<< HEAD
				$modalInstance.dismiss('cancel');
=======
				$scope.$dismiss();
>>>>>>> group
				$state.go('main.home');
			});
		});
	});
});
<<<<<<< HEAD
app.controller('MenuLeftCtrl', function($scope, $sce, LoginManager) {
=======
app.controller('MenuLeftCtrl', function($scope, $sce, $timeout, $window, LoginManager) {
>>>>>>> group
	LoginManager.getUser().then(function(user) {
		$scope.name = user.username;
	});
	$scope.logout = function() {
		$scope.url = $sce.trustAsResourceUrl("https://accounts.google.com/logout");
<<<<<<< HEAD
=======
		$timeout(function() {
			$window.location.reload();
		}, 1000);
>>>>>>> group
	};
});
app.controller('MainCtrl', function($scope, $state, $rootScope, DrawFactory) {
	var isSwipe = true;
	$scope.isShow = false;
	$scope.checkSwipe = function(isShow) {
		if (isSwipe) {
			$scope.isShow = isShow;
		}
	};
	$rootScope.$on('tool', function(e, tool) {
		isSwipe = tool == DrawFactory.tools.MODE;
	});
});
app.controller('AccessCtrl', function($state, LoginManager) {
	var route = $state.current.name;
	LoginManager.getUser().then(function(user) {
		var access = LoginManager.getAccess();
		$state.go(route + "_" + access);
	});
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