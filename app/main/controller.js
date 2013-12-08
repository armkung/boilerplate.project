app.controller('LoginCtrl', ["$scope", "$state", "GoogleService", "LoginManager",
	function($scope, $state, GoogleService, LoginManager) {
		GoogleService.load().then(function() {
			GoogleService.getUser().then(function(data) {
				

				LoginManager.login(data).then(function() {
					$scope.$dismiss();
					$state.go('main.home');
				});
			});
		});
	}
]);

app.controller('MenuLeftCtrl', ["$scope", "$sce", "$timeout", "$window", "Room", "LoginManager",
	function($scope, $sce, $timeout, $window, Room, LoginManager) {
		LoginManager.getUser().then(function(user) {
			$scope.userName = user.username;
		});
		$scope.room = Room;
		$scope.$watch('room.room', function() {
			$scope.roomName = Room.room;
		});
		$scope.logout = function() {
			$scope.url = $sce.trustAsResourceUrl("https://accounts.google.com/logout");
			$timeout(function() {
				$window.location.reload();
			}, 1000);
		};
	}
]);
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
		
		var types = {
			GROUP: "group",
			CHAT: "chat"
		};
		
		$rootScope.$on("$stateChangeSuccess", function($currentRoute, $previousRoute) {
			checkRoute();
		});
		$scope.setCurrent = function(index) {
			$scope.current = $scope.menus[index];
		};

		function checkRoute() {
			var route = $state.current.url;
			
			
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