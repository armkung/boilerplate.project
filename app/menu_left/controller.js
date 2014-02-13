app.controller('QuizStudentCtrl', ["$scope", "$rootScope", "QuizManager", "DataManager",
	function($scope, $rootScope, QuizManager, DataManager) {
		var type = DataManager.types.QUIZ;
		if (angular.isUndefined($rootScope.isEnd)) {
			$rootScope.isEnd = false;
		}
		DataManager.getData(type, function(data) {
			// $scope.chartConfig.title.text = $scope.quiz[data.question].question;
			if (data && (data.node != QuizManager.node || !$rootScope.isEnd)) {
				if (data.node != QuizManager.node) {
					$rootScope.index = 0;
					$rootScope.isEnd = false;
				}
				QuizManager.node = data.node;
				QuizManager.load().then(function(quiz) {
					// var quiz = QuizManager.quiz;
					var index = $rootScope.index,
						select = 0,
						n = quiz.length;
					$scope.selected = false;
					$scope.next = function() {
						if (index !== 0) {
							var obj = {};
							obj.question = index - 1;
							obj.answer = select;
							// console.log(select);
							DataManager.setData(type, obj);
							$rootScope.index++;
						}
						if (index < n) {
							$scope.index = index + 1;
							$scope.question = quiz[index].question;
							$scope.answer = quiz[index].answer;
							index++;
						} else {
							$rootScope.isEnd = true;
						}
					};
					$scope.select = function(index) {
						select = index;
					};
					$scope.next($rootScope.index);
				});
			}
		});

		DataManager.initData(type);
	}
]);
app.controller('QuizTeacherCtrl', ["$scope", "QuizManager", "DataManager",
	function($scope, QuizManager, DataManager) {
		var type = DataManager.types.QUIZ;
		if (angular.isDefined(QuizManager.node)) {
			DataManager.setData(type, {
				node: QuizManager.node
			});
			QuizManager.load().then(function(data) {
				// var data = QuizManager.quiz;
				$scope.current = 0;
				$scope.quiz = [];
				angular.forEach(data, function(quiz, key) {
					var obj = {};
					obj.question = quiz.question;
					obj.answer = {
						name: [],
						data: []
					};
					angular.forEach(quiz.answer, function(answer, key) {
						obj.answer.name.push(answer);
						obj.answer.data.push(0);
					});
					QuizManager.setMaxChoice(obj.answer.data.length);
					$scope.quiz.push(obj);
				});
				$scope.chartConfig = QuizManager.chartConfig;
				DataManager.getData(type, function(data) {
					// $scope.chartConfig.title.text = $scope.quiz[data.question].question;
					var series = $scope.quiz[data.question].answer.data;
					series[data.answer]++;
					if (data.question == $scope.current) {
						$scope.chartConfig.series[0].data = series;
					}
				});

				$scope.changeIndex = function(index) {
					$scope.current = index;
					var quiz = $scope.quiz[index];
					$scope.chartConfig.title.text = quiz.question;
					$scope.chartConfig.series[0].data = quiz.answer.data;
				};
				$scope.changeIndex(0);
			});
		}
	}
]);
app.controller('DriveCtrl', ["$scope", "$modal", "cfpLoadingBar", "Room", "LoginManager", "DrawManager", "Canvas", "SlideManager", "PDFService", "GoogleService",
	function($scope, $modal, cfpLoadingBar, Room, LoginManager, DrawManager, Canvas, SlideManager, PDFService, GoogleService) {
		LoginManager.getUser().then(function(user) {
			$scope.hasQuiz = LoginManager.getAccess() == LoginManager.level.TEACHER;

			function loadCanvas(name) {
				var id = "data";
				var cs = Canvas.newCanvas(id, Canvas.width, Canvas.height);
				DrawManager.getObject(cs, name);
				return cs;
			}

			$scope.showDialog = function() {
				var modal = $modal.open({
					templateUrl: 'modal/template/save.tpl.html',
					controller: 'SaveCtrl'
				});
				return modal.result;
			};
			$scope.saveDraw = function() {
				$scope.showDialog().then(function(name) {
					cfpLoadingBar.start();

					var type = "image/png";
					// name = name + "-Draw";

					var cs = loadCanvas(Canvas.types.DRAW);
					cs.setBackgroundColor('white');

					var data = cs.toDataURL({
						format: type.split("/")
					});

					var obj = {};
					obj.type = type;
					obj.data = data.split(",")[1];
					obj.fileName = name;
					GoogleService.insertFile(obj).then(function(data) {
						cfpLoadingBar.complete();
					});
				});

			};
			$scope.saveSlide = function() {
				Canvas.getCanvas().then(function() {
					$scope.showDialog().then(function(name) {
						cfpLoadingBar.start();
						// name = name + "-Slide";
						var id = SlideManager.slide;
						if (id) {
							$scope.$emit('save_slide', {
								type: 'pdf',
								callback: function(data) {
									var obj = {};
									obj.type = "application/pdf";
									obj.data = data.split(",")[1];
									obj.fileName = name;
									GoogleService.insertFile(obj).then(function(data) {
										cfpLoadingBar.complete();
									});
								}
							});

						}
					});
				});
			};
		});
	}
]);
app.controller('HandWriteCtrl', ["$scope", "$rootScope", "DrawFactory", "Canvas",
	function($scope, $rootScope, DrawFactory, Canvas) {
		$scope.isSend = true;
		$scope.hideTool = false;
		$scope.showMenu = false;
		$scope.checkToolSwipe = function(hideTool) {
			if ($scope.tool == DrawFactory.tools.MODE) {
				$scope.hideTool = hideTool;
			}
		};
		$scope.checkMenuSwipe = function(showMenu) {
			if ($scope.tool == DrawFactory.tools.MODE) {
				$scope.showMenu = showMenu;
			}
		};
	}
]);

app.controller('SlideCtrl', ["$scope", "$rootScope", "LoginManager", "GoogleService", "DrawFactory", "SlideManager", "VoiceManager",
	function($scope, $rootScope, LoginManager, GoogleService, DrawFactory, SlideManager, VoiceManager) {
		LoginManager.getUser().then(function(user) {
			$scope.isSend = LoginManager.getAccess() == LoginManager.level.TEACHER;
			$scope.isStart = true;
			$scope.isEnd = false;
			$scope.id = "mirror-" + SlideManager.index;

			$scope.nextIndex = function(isSwipe) {
				if ($scope.tool == DrawFactory.tools.MODE || isSwipe) {
					VoiceManager.stop(SlideManager.index);
					VoiceManager.start();
					SlideManager.next();
					$scope.isStart = SlideManager.isStart();
					$scope.isEnd = SlideManager.isEnd();
					// VoiceManager.playback();
				}
			};
			$scope.prevIndex = function(isSwipe) {
				if (!VoiceManager.isRecord() && ($scope.tool == DrawFactory.tools.MODE || isSwipe)) {
					SlideManager.prev();
					$scope.isStart = SlideManager.isStart();
					$scope.isEnd = SlideManager.isEnd();
				}
			};
			$scope.slide = SlideManager;
			$scope.$watch('slide.slide', function(oldV, newV) {
				var id = SlideManager.slide;
				if (angular.isDefined(id)) {
					GoogleService.shareFile(id, user.email).then(function(data) {});
				}
			})

			$scope.hideTool = false;
			$scope.showMenu = false;
			$scope.checkToolSwipe = function(hideTool) {
				if ($scope.tool == DrawFactory.tools.MODE) {
					$scope.hideTool = hideTool;
				}
			};
			$scope.checkMenuSwipe = function(showMenu) {
				if ($scope.tool == DrawFactory.tools.MODE) {
					$scope.showMenu = showMenu;
				}
			};
			$rootScope.$on('tool', function(e, tool) {
				if (tool == DrawFactory.tools.MODE) {
					$scope.isShow = true;
				} else {
					$scope.isShow = false;
				}
			});
		});
	}
]);

app.controller('HomeTeacherCtrl', ["$scope", "$modal", "$rootScope", "Room", "Socket", "LoginManager",
	function($scope, $modal, $rootScope, Room, Socket, LoginManager) {
		LoginManager.getUser().then(function(user) {
			if (angular.isUndefined($rootScope.room)) {
				$rootScope.room = {
					name: "",
					display: "",
					description: ""
				};
			}
			$scope.user = user;
			$scope.room = $rootScope.room;

			Socket.on("leave:room", function(user) {
				var index = Room.users.indexOf(user);
				if (index != -1) {
					Room.users.splice(index, 1);
				}
			});
			$scope.create = function() {
				if ($scope.room.name != "" && $scope.room.display != "") {
					Room.room = $scope.room.name;
					Room.user = $scope.user.username;
					Socket.emit("create:room", {
						room: {
							name: $scope.room.name,
							owner: $scope.user.username,
							display: $scope.room.display,
							description: $scope.room.description
						},
						user: $scope.user
					});
				} else {
					alert("Input Room name");
				}
			};
			$scope.close = function() {
				Socket.emit("close:room", {}, function(emails) {
					console.log(emails);
				});
			};
			$scope.selectDisplay = function() {
				var modal = $modal.open({
					templateUrl: 'modal/template/display.tpl.html',
					controller: 'DisplayCtrl'
				});
				modal.result.then(function(url) {
					console.log()
					$scope.room.display = url;
				});
			};

		});
	}
]);

app.controller('HomeStudentCtrl', ["$scope", "$rootScope", "$modal", "Room", "Socket", "LoginManager",
	function($scope, $rootScope, $modal, Room, Socket, LoginManager) {
		LoginManager.getUser().then(function(user) {

			$scope.user = user;

			Socket.on("leave:room", function(user) {
				var index = Room.users.indexOf(user);
				if (index != -1) {
					Room.users.splice(index, 1);
				}
			});
			$rootScope.$watch('selected', function() {
				$rootScope.roomSelected = $scope.selected;
			});
			// $scope.select = function(index) {
			// 	$rootScope.roomSelected = index;
			// 	$scope.room = $scope.rooms[index];
			// };
			$scope.list = function() {
				Socket.emit("list:room", {}, function(rooms) {
					$scope.rooms = rooms;
				});
			};
			$scope.connect = function() {
				if ($scope.room.name != "") {
					Socket.emit("connect:room", {
						exit: Room.room,
						room: $scope.room,
						user: $scope.user
					}, function(id) {

					});
					Room.room = $scope.room.name;
					Room.user = $scope.user.username;
				} else {
					alert("Input Room name");
				}
			};
			$scope.disconnect = function() {
				Socket.emit("disconnect:room");
				Socket.disconnect();
			};
			$scope.showDetail = function(index) {
				var modal = $modal.open({
					templateUrl: 'modal/template/detail.tpl.html',
					resolve: {
						room: function() {
							return $scope.rooms[index];
						},
						index: function() {
							return index;
						}
					},
					controller: 'DetailCtrl'
				});
				modal.result.then(function(index) {
					$scope.selected = index;
					$scope.room = $scope.rooms[index];
					$scope.connect();
				});
			};
			$scope.list();
		});

	}
]);