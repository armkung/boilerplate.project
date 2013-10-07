var app = angular.module('socket', ['templates-app',
	'templates-common', 'ngRoute', 'ui.router', 'restangular'
]);
var host = 'http://localhost:8080';
var ws = 'http://foaas.com';
app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider',
	function($routeProvider, $stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('login');
		$stateProvider.state('main', {
			url: "/main",
			templateUrl: 'main/template/main.tpl.html'
		}).state('login', {
			url: "/login",
			templateUrl: 'main/template/login.tpl.html',
			controller: 'LoginCtrl'
		}).state('main.draw', {
			url: '/draw',
			templateUrl: 'menu_left/template/hand_write.tpl.html',
			controller: 'HandWriteCtrl'
		}).state('main.drive', {
			url: '/drive',
			templateUrl: 'menu_left/template/drive.tpl.html',
			controller: 'DriveCtrl'
		}).state('main.home', {
			url: '/home',
			templateUrl: 'menu_left/template/home.tpl.html',
			controller: 'HomeCtrl'
		}).state('main.home.teacher', {
			url: '/teacher',
			templateUrl: 'menu_left/template/home_teacher.tpl.html',
			controller: 'RoomCtrl'
		}).state('main.home.student', {
			url: '/student',
			templateUrl: 'menu_left/template/home_student.tpl.html',
			controller: 'RoomCtrl'
		}).state('main.slide', {
			url: '/slide',
			templateUrl: 'menu_left/template/slide.tpl.html',
			controller: 'SlideCtrl'
		}).state('main.quiz', {
			url: '/quiz',
			templateUrl: 'menu_left/template/quiz.tpl.html',
			controller: 'QuizCtrl'
		});

	}
]).run(function($rootScope, $state, LoginManager) {
	// $rootScope.$on("$stateChangeStart", function($currentRoute, $previousRoute) {
	// 	var user = LoginManager.getUser();
	// 	if (!user) {
	// 		$state.go('login');
	// 	}
	// });
});

app.config(function(RestangularProvider) {
	RestangularProvider.setBaseUrl(ws);
});

app.factory('Socket', function($rootScope) {
	var socket = io.connect(host);
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
			POS: "pos"
		},
		setData: function(type, data) {
			if (data.pos) {
				data.pos.x /= Canvas.width;
				data.pos.y /= Canvas.height;
			}
			Socket.emit("send:" + type, data);
		},
		getData: function(type, callback) {
			Socket.remove("send:" + type);
			switch (type) {
				case "pos":
					Socket.on("send:" + type, function(data) {
						if (data.pos) {
							data.pos.x *= Canvas.width;
							data.pos.y *= Canvas.height;
						}
						callback(data);
					});
					break;
				case "slide":
					Socket.on("send:" + type, function(data) {

						callback(data);
					});
					break;
			}

		},
		loadData: function(type, data, callback) {
			Socket.remove("load:" + type);
			Socket.emit("load:" + type, data, function(data) {
				var obj = [];
				angular.forEach(data, function(data, key) {
					data.x *= Canvas.width;
					data.y *= Canvas.height;
					obj.push({
						pos: data
					});
				});
				callback(obj);
			});
		},
		removeData: function() {

		}
	};
});


app.service("Canvas", function($q) {
	var self = this;
	var stage;
	// this.names = {
	// 	DRAW: "draw",
	// 	MIRROR: "mirror"
	// }
	var obj = {
		// draw: {},
		// mirror: {},
		// test: {}
	};
	var id;
	var deferred = $q.defer();
	var canvas;
	// angular.forEach(obj, function(value, key) {
	// 	canvas = new fabric.Canvas(key);
	// 	canvas.selection = false;
	// 	obj[key] = canvas.getObjects();
	// });
	// this.id = self.names.DRAW;
	this.init = function(name) {
		id = name;
		deferred = $q.defer();
		// var id = self.id
		var parent = $('#' + id).parent();
		$('#' + id)[0].width = parent.width();
		$('#' + id)[0].height = parent.height();
		// canvas = new fabric.Canvas(id);
		canvas = new fabric.Canvas(id, {
			width: parent.width(),
			height: parent.height()
		});
		self.width = canvas.getWidth();
		self.height = canvas.getHeight();
		deferred.resolve(canvas);
	};
	this.getCanvas = function() {
		// var id = self.id
		// canvas = new fabric.Canvas(id);
		// canvas.selection = false;
		// if (id in obj) {
		// 	var children = obj[id].getObjects();
		// 	console.log(canvas)
		// 	angular.forEach(children, function(child, key) {
		// 		canvas.add(child);
		// 	});
		// } else {
		// 	obj[id] = canvas;
		// }
		// return canvas;
		if (canvas) {
			deferred.resolve(canvas);
		}
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