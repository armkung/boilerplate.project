var app = angular.module('socket', ['templates-app',
	'templates-common', 'restangular'
]);
var host = 'http://localhost:8080';
var ws = 'http://foaas.com';
app.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.when('/draw', {
			templateUrl: 'hand_write.tpl.html',
			controller: 'HandWriteCtrl'
		}).when('/home', {
			templateUrl: 'home.tpl.html',
			controller: 'HomeCtrl'
		}).otherwise({
			redirectTo: '/draw'
		});
	}
]);

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
		users: []
	};
});
app.factory("DataManager", function(Canvas, Socket) {

	return {
		setData: function(type, data) {
			data.pos.x /= Canvas.width;
			data.pos.y /= Canvas.height;
			Socket.emit("send:" + type, data);
		},
		getData: function(type, callback) {
			Socket.remove("send:" + type);
			Socket.on("send:" + type, function(data) {
				data.pos.x *= Canvas.width;
				data.pos.y *= Canvas.height;
				callback(data);
			});


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
		}
	};
});


app.service("Canvas", function($rootScope) {
	var self = this;
	var stage;
	var obj = {};
	this.init = function(id) {
		var cs = $("#" + id);
		var container = cs.parent();
		self.canvas = cs;
		self.width = container.width();
		self.height = container.height();
		stage = new Kinetic.Stage({
			container: id,
			width: self.width,
			height: self.height
		});
		return stage;
	};

	this.getPosition = function() {
		var mousePos = stage.getMousePosition();
		var touchPos = stage.getTouchPosition();
		if (mousePos && mousePos.x && mousePos.y) {
			return mousePos;
		} else if (touchPos && touchPos.x && touchPos.y) {
			return touchPos;
		}
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