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
		}).when('/text', {
			templateUrl: 'text_write.tpl.html',
			controller: 'TextWriteCtrl'
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
			socket.removeListener(event);
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
	var obj = {};
	return {
		setData: function(type, data) {
			data.x /= Canvas.width;
			data.y /= Canvas.height;
			Socket.emit("send:" + type, data);
		},
		getData: function(type, callback) {
			// Socket.remove("send:" + type);
			if (!(type in obj)) {
				obj[type] = callback;
				Socket.on("send:" + type, function(data) {
					data.x *= Canvas.width;
					data.y *= Canvas.height;
					callback(data);
				});
			}

		},
		loadData: function(type, data, callback) {
			Socket.emit("load:" + type, data, function(data) {
				angular.forEach(data, function(data, key) {
					data.x *= Canvas.width;
					data.y *= Canvas.height;
				});
				callback(data);
			});
		}
	};
});


app.service("Canvas", function($rootScope) {
	var self = this;
	var stage;
	this.init = function() {
		var cs = $("#canvas");
		var container = cs.parent();
		self.canvas = cs;
		self.width = container.width();
		self.height = container.height();
		var old = stage;
		stage = new Kinetic.Stage({
			container: 'canvas',
			width: self.width,
			height: self.height
		});
		clone(old, stage);
		return stage;

		function clone(old, stage) {
			if (old) {
				var layers = old.getChildren();
				for (var i = 0; i < layers.length; i++) {
					stage.add(layers[i]);
				}
			}
		}
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
	var txt;

	this.init = function() {
		txt = $("#textbox")
		return txt;
	};
	this.clear = function() {
		txt.val("");
	};
	this.hide = function() {
		this.clear();
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