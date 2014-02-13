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

app.controller('MenuLeftCtrl', ["$scope", "$sce", "$timeout", "$window", "Room", "LoginManager", "VoiceManager", "SlideManager", "host_node", "cfpLoadingBar",
	function($scope, $sce, $timeout, $window, Room, LoginManager, VoiceManager, SlideManager, host_node, cfpLoadingBar) {
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
		$scope.$watch(function() {
			return VoiceManager.isRecord();
		}, function(newV) {
			$scope.isRecord = newV;
		})
		$scope.record = function() {
			if (!$scope.isRecord) {
				VoiceManager.init();
				VoiceManager.start();
			} else {
				function dataURItoBlob(dataURI) {
					var byteString = atob(dataURI.split(',')[1]);
					var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
					var ab = new ArrayBuffer(byteString.length);
					var ia = new Uint8Array(ab);
					for (var i = 0; i < byteString.length; i++) {
						ia[i] = byteString.charCodeAt(i);
					}
					return new Blob([ab], {
						type: mimeString
					});
				}
				VoiceManager.stop(SlideManager.index);
				SlideManager.index++;
				cfpLoadingBar.start();
				$scope.$broadcast('save_slide', {
					type: 'image',
					n: SlideManager.index,
					callback: function(data, index) {
						var blob = dataURItoBlob(data);
						var form = new FormData();
						form.append(Room.room, blob, index + ".png");
						$.ajax({
							url: host_node,
							type: "POST",
							data: form,
							processData: false,
							contentType: false,
							success: function(response) {
								// console.log(response);
								cfpLoadingBar.complete();
							},
							error: function(jqXHR, textStatus, errorMessage) {
								console.log(errorMessage);
								cfpLoadingBar.complete();
							}
						});
					}
				});
			}
		};
	}
]);
app.controller('MainCtrl', ["$scope", "Canvas", "DrawManager", "SlideManager", "PDFService",
	function($scope, Canvas, DrawManager, SlideManager, PDFService) {
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
						PDFService.renderImage(pdf, n, function(data, index) {
							if (obj.callback) {
								obj.callback(data, index);
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