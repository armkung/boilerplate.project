app.controller('QuizStudentCtrl', function($scope, QuizManager, DataManager) {
	// QuizManager.load().then(function(data) {
	// 	$('#slickQuiz').slickQuiz({
	// 		json: data,
	// 		skipStartButton: true
	// 	});
	// });
	QuizManager.load().then(function(quiz) {
		var type = DataManager.types.QUIZ;
		// var quiz = QuizManager.quiz;
		var index = 0,
			select = 0,
			n = quiz.length;
		$scope.isEnd = false;
		$scope.selected = false;
		$scope.next = function() {
			if (index != 0) {
				var obj = {};
				obj.question = index - 1;
				obj.answer = select;
				console.log(select)
				DataManager.setData(type, obj);
			}
			if (index < n) {
				$scope.question = quiz[index].question;
				$scope.answer = quiz[index].answer;
				index++;
			} else {
				$scope.isEnd = true;
			}
		}
		$scope.select = function(index) {
			select = index;
		}
		$scope.next(index);
	});
});
app.controller('QuizTeacherCtrl', function($scope, QuizManager, DataManager) {
	QuizManager.load().then(function(data) {
		var type = DataManager.types.QUIZ;
		$scope.quiz = [];
		angular.forEach(data, function(quiz, key) {
			var obj = {}
			obj.question = quiz.question;
			obj.answer = [];
			angular.forEach(quiz.answer, function(answer, key) {
				obj.answer.push({
					name: answer,
					n: 0
				})
			});
			$scope.quiz.push(obj);
		});

		DataManager.getData(type, function(data) {
			$scope.quiz[data.question].answer[data.answer].n += 1;
			console.log($scope.quiz);
		});
	});
});

app.controller('HandWriteCtrl', function($scope, $rootScope, DrawFactory, Canvas) {
	$scope.tools = [];
	$scope.attrs = [];
	$scope.isSend = true;
	angular.forEach(DrawFactory.tools, function(value, key) {
		$scope.tools.push(value);
	});
	angular.forEach(DrawFactory.attrs, function(value, key) {
		$scope.attrs.push(value);
	});
	$scope.checkSwipe = function(isHide) {
		if ($scope.tool == DrawFactory.tools.MODE) {
			$scope.isHide = isHide;
		}
	};
	$scope.changeTool = function(index) {
		$scope.tool = $scope.tools[index];
		$rootScope.$broadcast('tool', $scope.tool);
	};
	$scope.changeAttr = function(index) {
		$rootScope.$broadcast('attr', $scope.attrs[index]);
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
	$scope.checkSwipe = function(isHide) {
		if ($scope.tool == DrawFactory.tools.MODE) {
			$scope.isHide = isHide;
		}
	};

	$scope.tools = [];
	$scope.attrs = [];
	$scope.isSend = true;
	angular.forEach(DrawFactory.tools, function(value, key) {
		$scope.tools.push(value);
	});
	angular.forEach(DrawFactory.attrs, function(value, key) {
		$scope.attrs.push(value);
	});
	$scope.changeTool = function(index) {
		$scope.tool = $scope.tools[index];
		$rootScope.$broadcast('tool', $scope.tool);
		if ($scope.tool == DrawFactory.tools.MODE) {
			$scope.isShow = true;
		}
	};
	$scope.changeAttr = function(index) {
		$rootScope.$broadcast('attr', $scope.attrs[index]);
	};
});

app.controller('RoomCtrl', function($scope, Room, Socket, LoginManager) {
	// $scope.user = String.fromCharCode(Math.random() * 26 + 97);
	$scope.user = LoginManager.getUser();
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
	$scope.list();
	$scope.connect = function() {
		Room.room = $scope.room;
		Room.user = $scope.user.username;
		Socket.emit("connect:room", {
			room: $scope.room,
			user: $scope.user
		}, function(id) {

		});
	};
	$scope.create = function() {
		Room.room = $scope.room;
		Room.user = $scope.user.username;
		Socket.emit("create:room", {
			room: $scope.room,
			user: $scope.user,
		});
	};
	$scope.close = function() {
		Socket.emit("close:room", {}, function(emails) {
			console.log(emails);
		});
	};
	$scope.disconnect = function() {
		Socket.emit("leave:room");
		Socket.disconnect();
	};
	$scope.connect();
});