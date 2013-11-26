var app = angular.module('socket', ['templates-app', 'templates-common',
	'ui.router', 'ui.bootstrap', 'ngGesture', 'chieffancypants.loadingBar',
	'colorpicker.module', 'highcharts-ng'
]);

app.constant('host_node', 'http://localhost:8080');
app.constant('host_drupal', 'http://science.kmutt.ac.th/drupal');

app.config(function(cfpLoadingBarProvider) {
	cfpLoadingBarProvider.includeSpinner = false;
});

app.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('main');
	$stateProvider.state('main', {
		url: "/main",
		templateUrl: 'main/template/main.tpl.html',
		controller: 'MainCtrl'
	}).state('main.draw', {
		url: '/draw',
		templateUrl: 'menu_left/template/draw_pad.tpl.html',
		controller: 'HandWriteCtrl'
	}).state('main.drive', {
		url: '/drive',
		templateUrl: 'menu_left/template/drive.tpl.html',
		controller: 'DriveCtrl'
	}).state('main.home', {
		url: '/home',
		controller: 'AccessCtrl'
	}).state('main.home_teacher', {
		url: '/home/teacher',
		templateUrl: 'menu_left/template/home_teacher.tpl.html',
		controller: 'HomeTeacherCtrl'
	}).state('main.home_student', {
		url: '/home/student',
		templateUrl: 'menu_left/template/home_student.tpl.html',
		controller: 'HomeStudentCtrl'
	}).state('main.slide', {
		url: '/slide',
		templateUrl: 'menu_left/template/slide_pad.tpl.html',
		controller: 'SlideCtrl'
	}).state('main.quiz', {
		url: '/quiz',
		controller: 'AccessCtrl'
	}).state('main.quiz_teacher', {
		url: '/quiz/teacher',
		templateUrl: 'menu_left/template/quiz_teacher.tpl.html',
		controller: 'QuizTeacherCtrl'
	}).state('main.quiz_student', {
		url: '/quiz/student',
		templateUrl: 'menu_left/template/quiz_student.tpl.html',
		controller: 'QuizStudentCtrl'
	});

}).run(function($rootScope, $modal, LoginManager) {
	$rootScope.$on("$stateChangeSuccess", function($currentRoute, $previousRoute) {
		if (LoginManager.hasLogin()) {
			$modal.open({
				templateUrl: 'main/template/login.tpl.html',
				controller: 'LoginCtrl'
			});
		}
	});
});

app.factory('Socket', function($rootScope, host_node) {
	var socket = io.connect(host_node);
	return {
		on: function(event, callback) {
			socket.on(event, function(data) {
				$rootScope.$apply(function() {
					callback(data);
				});
			});
		},
		emit: function(event, obj, callback) {
			socket.emit(event, obj, function(data) {
				if (callback) {
					$rootScope.$apply(function() {
						callback(data);
					});
				}
			});
		},
		disconnect: function() {
			socket.disconnect();
		},
		remove: function(event) {
			socket.removeAllListeners(event);
		}
	};
});
app.factory("Room", function() {
	return {
		room: "",
		users: [],
		groups: {}
	};
});
app.factory("DataManager", function(Canvas, Socket) {

	return {
		types: {
			POS: "pos",
			SLIDE: "slide",
			QUIZ: "quiz",
			MSG: "msg"
		},
		initData: function(type) {
			Socket.emit("init:" + type);
		},
		setData: function(type, data) {
			if (data && data.pos) {
				data.pos.x /= Canvas.width;
				data.pos.y /= Canvas.height;
			}
			Socket.emit("send:" + type, data);
		},
		getData: function(type, callback) {
			// angular.forEach(self.types, function(type, key){
			Socket.remove("send:" + type);
			// });
			switch (type) {
				case "pos":
					Socket.on("send:" + type, function(data) {
						if (data && data.pos) {
							data.pos.x *= Canvas.width;
							data.pos.y *= Canvas.height;
						}
						callback(data);
					});
					break;
				default:
					Socket.on("send:" + type, function(data) {

						callback(data);
					});
			}

		},
		loadData: function(type, data, callback) {
			// Socket.remove("load:" + type);
			// Socket.emit("load:" + type, data, function(data) {
			// 	var obj = [];
			// 	angular.forEach(data, function(data, key) {
			// 		data.x *= Canvas.width;
			// 		data.y *= Canvas.height;
			// 		obj.push({
			// 			pos: data
			// 		});
			// 	});
			// 	callback(obj);
			// });
		},
		removeData: function() {

		}
	};
});


app.service("Canvas", function($q) {
	var self = this;

	var deferred = $q.defer();
	var canvas;
	this.types = {
		DRAW: "draw",
		MIRROR: "mirror"
	};

	this.newCanvas = function(id, w, h) {
		$('#' + id)[0].width = w;
		$('#' + id)[0].height = h;
		return new fabric.Canvas(id, {
			width: w,
			height: h
		});
	};
	this.init = function(id) {
		deferred = $q.defer();
		var parent = $('.pad');
		canvas = self.newCanvas(id, parent.width(), parent.height());

		self.width = canvas.getWidth();
		self.height = canvas.getHeight();
		deferred.resolve(canvas);
	};
	this.getCanvas = function() {
		// if (canvas) {
		// 	deferred.resolve(canvas);
		// }
		return deferred.promise;
	};
});
app.service("Input", function() {
	var self = this;
	var txt;

	this.init = function(calback) {
		txt = $("#textbox");
		txt.bind('keydown', function(e) {
			if (e.keyCode == 13) {
				calback();
				self.hide();
			}
		});
	};
	this.hide = function() {
		txt.val("");
		txt.hide();
	};
	this.show = function(x, y) {
		txt.css({
			left: x,
			top: y
		});
		txt.show();
	};
});