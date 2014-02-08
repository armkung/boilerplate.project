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

app.controller('MenuLeftCtrl', ["$scope", "$sce", "$timeout", "$window", "Room", "LoginManager", "VoiceManager", "SlideManager", "PDFService", "Canvas", "DrawManager",
	function($scope, $sce, $timeout, $window, Room, LoginManager, VoiceManager, SlideManager, PDFService, Canvas, DrawManager) {
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
		$scope.isRecord = false;
		$scope.record = function() {
			$scope.isRecord = !$scope.isRecord;
			if ($scope.isRecord) {
				VoiceManager.init();
				VoiceManager.start();
			} else {
				$scope.$broadcast('save_slide', {
					type: 'image',
					callback: function(data) {
						console.log(data);
					}
				});
			}
		};
	}
]);
app.controller('MainCtrl', function($scope, Canvas, DrawManager, SlideManager, PDFService) {
	function loadCanvas(name) {
		var id = "data";
		var cs = Canvas.newCanvas(id, Canvas.width, Canvas.height);
		DrawManager.getObject(cs, name);
		return cs;
	}
	$scope.$on('save_slide', function(e, obj) {
		var id = SlideManager.slide;
		if (id) {
			PDFService.getPdf(id).then(function(pdf) {

				var n = obj.n || pdf.pdfInfo.numPages;
				var mirrors = [];
				for (var i = 1; i <= n; i++) {
					var cs = loadCanvas(Canvas.types.MIRROR + "-" + i);
					mirrors.push(cs);
				}

				PDFService.init(mirrors);
				if (obj.type == 'image') {
					PDFService.renderImage(pdf, n, function(data) {
						if (obj.callback) {
							obj.callback(data);
						}
					});
				} else {
					PDFService.renderPdf(pdf, n).then(function(data) {
						if (obj.callback) {
							obj.callback(data);
						}
					});
				}
			});
		}
	});
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