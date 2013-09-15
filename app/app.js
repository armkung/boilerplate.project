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
		}).when('/slide', {
			templateUrl: 'slide.tpl.html',
			controller: 'SlideCtrl'
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
						data.pos.x *= Canvas.width;
						data.pos.y *= Canvas.height;
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
	var deferred = $q.defer();
	var canvas;
	// angular.forEach(obj, function(value, key) {
	// 	canvas = new fabric.Canvas(key);
	// 	canvas.selection = false;
	// 	obj[key] = canvas.getObjects();
	// });
	// this.id = self.names.DRAW;
	this.init = function(id){
		deferred = $q.defer();
		// var id = self.id
		canvas = new fabric.Canvas(id);
		canvas.selection = false;
		if (id in obj) {
			var children = obj[id].getObjects();
			console.log(canvas)
			angular.forEach(children, function(child, key) {
				canvas.add(child);
			});
		} else {
			obj[id] = canvas;
		}
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
		if (canvas && !deferred.promise) {
			deferred.resolve(canvas);
		}
		return deferred.promise;
	};
	this.getCurrent = function() {
		if (stage && !deferred.promise) {
			deferred.resolve(stage);
		}
		return deferred.promise;
	}
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