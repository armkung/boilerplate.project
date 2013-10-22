app.controller('DriveCtrl', function($scope, GoogleService, SlideManager, Canvas, PDFService) {
	GoogleService.load().then(function() {
		GoogleService.listFile().then(function(data) {
			console.log(data);
			$scope.datas = data;
		});
	});
	$scope.select = function(index) {
		var id = $scope.datas[index].id;
		SlideManager.setSlide(id);
		console.log(id);
		$scope.id = id;
	};
	$scope.share = function() {
		GoogleService.shareFile(id).then(function(data) {
			console.log(data);
		});
	};
	$scope.save = function() {
		var name = "test";
		var type = "png";
		Canvas.getCanvas().then(function(cs) {

			if ($scope.id) {
				console.log($scope.id);
				GoogleService.getFile($scope.id).then(function(data) {
					PDFService.load(data.exportLinks['application/pdf']).then(function(page) {
						var tmp = page.getViewport(1);
						var w = cs.getWidth(),
							h = cs.getHeight();
						var scale = w < h ? w / tmp.width : h / tmp.height;
						console.log(scale)
						var view = page.getViewport(scale);
						var canvas = $('#pdf')[0];
						var ctx = canvas.getContext('2d');
						canvas.width = view.width;
						canvas.height = view.height;

						var renderContext = {
							canvasContext: ctx,
							viewport: view
						};
						page.render(renderContext).then(function() {
							fabric.Image.fromURL(canvas.toDataURL(), function(img) {
								cs.add(img);
								img.center();
								img.setCoords();
								cs.sendToBack(img);
								cs.renderAll();

								// var data = cs.toDataURL({
								// 	format: type
								// });
								// var obj = {};
								// obj.type = "image/" + type;
								// obj.data = data.split(",")[1];
								// obj.fileName = name;
								// GoogleService.insertFile(obj);
							});
						});

					});
				});

			}
		});
	};
});

app.controller('QuizCtrl', function($scope, QuizManager) {
	QuizManager.load().then(function(data) {
		$('#slickQuiz').slickQuiz({
			json: data,
			skipStartButton: true
		});
	});
	// $('#slickQuiz').slickQuiz({
	// 	json: QuizManager.quizJSON,
	// 	skipStartButton: true
	// });
});

app.controller('HandWriteCtrl', function($scope, $rootScope, DrawFactory, Canvas) {
	$scope.tools = [];
	$scope.attrs = [];
	$scope.isSend = true;
	$scope.tool = DrawFactory.tools.DRAW;
	angular.forEach(DrawFactory.tools, function(value, key) {
		$scope.tools.push(value);
	});
	angular.forEach(DrawFactory.attrs, function(value, key) {
		$scope.attrs.push(value);
	});
	$scope.changeTool = function(index) {
		$scope.tool = $scope.tools[index];
	};
	$scope.changeAttr = function(index) {
		$rootScope.$broadcast('attr', $scope.attrs[index]);
	};
});

app.controller('SlideCtrl', function($scope, $rootScope, DrawFactory, SlideManager) {
	$scope.nextIndex = function() {
		SlideManager.next();
	};
	$scope.prevIndex = function() {
		SlideManager.prev();
	};
	$scope.save = function() {
		html2canvas($('body'), {
			onrendered: function(canvas) {
				$('body').append(canvas);
				console.log(canvas)
			}
		});
	};
	$scope.tools = [];
	$scope.attrs = [];
	$scope.isSend = true;
	$scope.tool = DrawFactory.tools.DRAW;
	angular.forEach(DrawFactory.tools, function(value, key) {
		$scope.tools.push(value);
	});
	angular.forEach(DrawFactory.attrs, function(value, key) {
		$scope.attrs.push(value);
	});
	$scope.changeTool = function(index) {
		$scope.tool = $scope.tools[index];
	};
	$scope.changeAttr = function(index) {
		$rootScope.$broadcast('attr', $scope.attrs[index]);
	};
});

app.controller('HomeCtrl', function($state, LoginManager) {
	LoginManager.isTeacher(function() {
		$state.go('main.home.teacher');
	});
	LoginManager.isStudent(function() {
		$state.go('main.home.student');
	});
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