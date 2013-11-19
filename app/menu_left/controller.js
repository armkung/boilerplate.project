app.controller('QuizStudentCtrl', function($scope, QuizManager, DataManager) {
	// QuizManager.load().then(function(quiz) {
	var quiz = QuizManager.quiz;
	var type = DataManager.types.QUIZ;
	var index = 0,
		select = 0,
		n = quiz.length;
	$scope.isEnd = false;
	$scope.selected = false;
	$scope.next = function() {
		if (index !== 0) {
			var obj = {};
			obj.question = index - 1;
			obj.answer = select;
			console.log(select);
			DataManager.setData(type, obj);
		}
		if (index < n) {
			$scope.question = quiz[index].question;
			$scope.answer = quiz[index].answer;
			index++;
		} else {
			$scope.isEnd = true;
		}
	};
	$scope.select = function(index) {
		select = index;
	};
	$scope.next(index);
	// });
});
app.controller('QuizTeacherCtrl', function($scope, QuizManager, DataManager) {
	$scope.chartConfig = QuizManager.chartConfig;
	console.log($scope.chartConfig)


	// QuizManager.load().then(function(data) {
	var data = QuizManager.quiz;
	var type = DataManager.types.QUIZ;
	var current = 0;
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
		$scope.quiz.push(obj);
	});
	console.log($scope.quiz)

	DataManager.getData(type, function(data) {
		// $scope.chartConfig.title.text = $scope.quiz[data.question].question;
		var series = $scope.quiz[data.question].answer.data;
		series[data.answer]++;
		if (data.question == current) {
			$scope.chartConfig.series[0].data = series;
		}
	});

	$scope.changeIndex = function(index) {
		current = index;
		var quiz = $scope.quiz[index];
		$scope.chartConfig.title.text = quiz.question;
		$scope.chartConfig.series[0].data = quiz.answer.data;
	};
	$scope.changeIndex(0);
	// });
});

app.controller('HandWriteCtrl', function($scope, $rootScope, DrawFactory, Canvas) {
	$scope.isSend = true;
	$scope.hideTool = false;
	$scope.hideMenu = true;
	$scope.checkToolSwipe = function(hideTool) {
		if ($scope.tool == DrawFactory.tools.MODE) {
			$scope.hideTool = hideTool;
		}
	};
	$scope.checkMenuSwipe = function(hideMenu) {
		if ($scope.tool == DrawFactory.tools.MODE) {
			$scope.hideMenu = hideMenu;
		}
	};
});

app.controller('SlideCtrl', function($scope, $rootScope, DrawFactory, SlideManager) {
	$scope.isStart = true;
	$scope.isEnd = false;
	$scope.nextIndex = function(isSwipe) {
		if ($scope.tool == DrawFactory.tools.MODE || isSwipe) {
			SlideManager.next();
			$scope.isStart = SlideManager.isStart();
			$scope.isEnd = SlideManager.isEnd();
		}
	};
	$scope.prevIndex = function(isSwipe) {
		if ($scope.tool == DrawFactory.tools.MODE || isSwipe) {
			SlideManager.prev();
			$scope.isStart = SlideManager.isStart();
			$scope.isEnd = SlideManager.isEnd();
		}
	};
	$scope.isSend = true;
	$scope.hideTool = false;
	$scope.hideMenu = true;
	$scope.checkToolSwipe = function(hideTool) {
		if ($scope.tool == DrawFactory.tools.MODE) {
			$scope.hideTool = hideTool;
		}
	};
	$scope.checkMenuSwipe = function(hideMenu) {
		if ($scope.tool == DrawFactory.tools.MODE) {
			$scope.hideMenu = hideMenu;
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

app.controller('HomeTeacherCtrl', function($scope, Room, Socket, LoginManager) {
	LoginManager.getUser().then(function(user) {
		$scope.user = user;
		$scope.room = "";
		Room.room = $scope.room;
		$scope.display = "";

		Socket.on("leave:room", function(user) {
			var index = Room.users.indexOf(user);
			if (index != -1) {
				Room.users.splice(index, 1);
			}
		});
		$scope.create = function() {
			if ($scope.room != "") {
				Room.room = $scope.room;
				Room.user = $scope.user.username;
				Socket.emit("create:room", {
					room: $scope.room,
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

	});
});
app.controller('HomeStudentCtrl', function($scope, Room, Socket, LoginManager) {
	LoginManager.getUser().then(function(user) {
		// $scope.user = String.fromCharCode(Math.random() * 26 + 97);
		$scope.user = user;
		$scope.room = "";
		Room.room = $scope.room;

		Socket.on("leave:room", function(user) {
			var index = Room.users.indexOf(user);
			if (index != -1) {
				Room.users.splice(index, 1);
			}
		});
		$scope.list = function() {
			Socket.emit("list:room", {}, function(rooms) {
				$scope.rooms = rooms;
			});
		};
		$scope.connect = function() {
			if ($scope.room != "") {
				Room.room = $scope.room;
				Room.user = $scope.user.username;
				Socket.emit("connect:room", {
					room: $scope.room,
					user: $scope.user
				}, function(id) {

				});
			} else {
				alert("Input Room name");
			}
		};
		$scope.disconnect = function() {
			Socket.emit("leave:room");
			Socket.disconnect();
		};
		$scope.list();

		$scope.room = "public";
		$scope.connect();
	});
});