app.controller('LoginCtrl', ["$scope", "$state", "GoogleService", "LoginManager",
	function($scope, $state, GoogleService, LoginManager) {
		GoogleService.load().then(function() {
			GoogleService.getUser().then(function(data) {
				// console.log(data);

				LoginManager.login(data).then(function() {
					$scope.$dismiss();
					$state.go('main.home');
				});
			});
		});
	}
]);

app.controller('MenuLeftCtrl', ["$scope", "$sce", "$timeout", "$window", "Room", "LoginManager", "VoiceManager",
	function($scope, $sce, $timeout, $window, Room, LoginManager, VoiceManager) {
		LoginManager.getUser().then(function(user) {
			$scope.userName = user.username;
			$scope.isTeacher = LoginManager.isTeacher();
		});
		$scope.room = Room;
		$scope.$watch('room.room', function() {
			$scope.roomName = Room.room;
		})
		$scope.logout = function() {
			$scope.url = $sce.trustAsResourceUrl("https://accounts.google.com/logout");
			$timeout(function() {
				$window.location.reload();
			}, 1000);
		};
		$scope.record = function() {
			VoiceManager.init();
			VoiceManager.start();
		};
	}
]);
app.controller('MainCtrl', function($scope, $state, $rootScope, DrawFactory) {
	// var isSwipe = true;
	// $scope.isShow = false;
	// $scope.checkSwipe = function(isShow) {
	// 	if (isSwipe) {
	// 		$scope.isShow = isShow;
	// 	}
	// };
	// $rootScope.$on('tool', function(e, tool) {
	// 	isSwipe = tool == DrawFactory.tools.MODE;
	// });
});
app.controller('AccessCtrl', ["$state", "LoginManager",
	function($state, LoginManager) {
		var route = $state.current.name;
		LoginManager.getUser().then(function(user) {
			var access = LoginManager.getAccess();
			$state.go(route + "_" + access);
		});
	}
]);
app.controller('MenuRightCtrl', ["$scope", "$rootScope", "$state",
	function($scope, $rootScope, $state) {
		// var menu = ["Chat", "Group"];
		var types = {
			GROUP: "group",
			CHAT: "chat"
		};
		// checkRoute();
		$rootScope.$on("$stateChangeSuccess", function($currentRoute, $previousRoute) {
			checkRoute();
		});
		$scope.setCurrent = function(index) {
			$scope.current = $scope.menus[index];
		};

		function checkRoute() {
			var route = $state.current.url;
			console.log(route)
			// $scope.isHide = route == "/home/teacher" || route == "/home/student";
			switch (route) {
				case "/draw":
					$scope.current = types.GROUP;
					break;
				default:
					$scope.current = types.CHAT;
			}
		}
	}
]);