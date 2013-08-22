var app = angular.module('socket', ['restangular']);
var host = 'http://localhost:8080';
var ws = 'http://foaas.com';
app.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.when('/draw', {
			templateUrl: 'hand_write.html',
			controller: 'HandWriteCtrl'
		}).when('/text', {
			templateUrl: 'text_write.html',
			controller: 'TextWriteCtrl'
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
			data.x /= Canvas.width;
			data.y /= Canvas.height;
			Socket.emit("send:" + type, data);
		},
		getData: function(type, callback) {
			Socket.on("send:" + type, function(data) {
				data.x *= Canvas.width;
				data.y *= Canvas.height;
				callback(data);
			});
		},
		loadData: function(type, data, callback) {
			Socket.emit("load:" + type, data, function(data) {
				data.x *= Canvas.width;
				data.y *= Canvas.height;
				callback(data);
			});
		}
	};
});

app.service("DrawManager", function(Canvas) {
	var self = this;
	this.tools = {
		DRAG: "Drag",
		CLEAR: "Clear",
		TEXT: "Text",
		DRAW: "Draw",
		COLOR: "Color"
	};
	this.lineOption = {
		points: [0, 0, 0, 0],
		stroke: 'white',
		strokeWidth: 5,
		lineCap: 'round',
		lineJoin: 'round'
	};
	this.textOption = {
		fontSize: 30,
		fill: 'white'
	};
	this.groupOption = {

	};

	var layer = Canvas.getLayer(self.groupOption);
	var current = layer;

	var line, text;
	this.initBrush = function(x, y) {
		line = new Kinetic.Line(self.lineOption);
		line.getPoints()[0].x = x;
		line.getPoints()[0].y = y;
		line.getPoints()[1].x = x;
		line.getPoints()[1].y = y;
		current.add(line);
	};
	this.drawBrush = function(x, y, isSeed) {
		if (!isSeed) {
			line.getPoints()[1].x = x;
			line.getPoints()[1].y = y;
			layer.batchDraw();
		}
		self.initBrush(x, y);
	};

	this.drawText = function(txt, x, y) {
		var op = self.textOption;
		op.x = x;
		op.y = y;
		op.text = txt;
		text = new Kinetic.Text(op);
		layer.add(text);
		layer.batchDraw();
	};

	this.setCurrent = function(id) {
		if (id) {
			current = layer.get('#' + id)[0];
		} else {
			var child = layer.get('#');
			var n = child.length;
			current = child[n - 1];
		}
	};
	this.newGroup = function(id) {
		self.groupOption.id = id ? id : '';
		group = new Kinetic.Group(self.groupOption);
		layer.add(group);
	};
	this.canDrag = function(canDrag) {
		var objs = current.getChildren();
		angular.forEach(objs, function(obj, key) {
			obj.setDraggable(canDrag);
		});
	};
	this.canGroupDrag = function(canDrag) {
		var groups = layer.get('Group');
		angular.forEach(groups, function(group, key) {
			group.setDraggable(canDrag);
		});
	};

	this.setEvent = function(tool) {
		switch (tool) {
			case self.tools.CLEAR:
				Canvas.clear();
				break;
			case self.tools.COLOR:
				var color = '#' + Math.floor(Math.random() * 16777215).toString(16);
				self.lineOption.stroke = color;
				self.textOption.fill = color;
				break;
		}
	};

	this.setBind = function(callback) {
		var cs = Canvas.canvas;
		cs.unbind();
		if (callback.onDown) {
			cs.bind("mousedown touchstart", function() {
				callback.onDown(Canvas.getPosition());
			});
		}
		if (callback.onMove) {
			cs.bind("mousemove touchmove", function() {
				callback.onMove(Canvas.getPosition());
			});
		}
		if (callback.onUp) {
			cs.bind("mouseup touchend touchcancel", function() {
				callback.onUp(Canvas.getPosition());
			});
		}
	};
});
app.service("Canvas", function($rootScope) {
	var self = this;
	var cs = $("#canvas");
	var container = cs.parent();
	this.canvas = cs;
	this.width = container.width();
	this.height = container.height();

	var stage = new Kinetic.Stage({
		container: 'canvas',
		width: self.width,
		height: self.height
	});

	var layer = new Kinetic.Layer();
	stage.add(layer);

	this.getLayer = function() {
		return layer;
	};
	this.getStage = function() {
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
	this.clear = function() {
		layer.remove();
		layer = new Kinetic.Layer();
		stage.add(layer);
	};

});
app.service("Input", function() {
	var txt = $("#textbox");

	this.input = txt;
	this.text = txt.val();
	this.position = function(x, y) {
		txt.css({
			"left": x,
			"top": y
		});
	};
	this.clear = function() {
		txt.val("");
	};
	this.hide = function() {
		this.clear();
		txt.css({
			"display": "none"
		});
	};
	this.show = function(x, y) {
		txt.css({
			"left": x,
			"top": y,
			"display": "inline"
		});
	};
	this.hide();
});

app.directive('chat', function() {
	return {
		restrict: 'E',
		templateUrl: 'chat.html',
		controller: 'ChatCtrl'
	};
});

app.directive('menu', function() {
	return {
		restrict: 'E',
		templateUrl: 'menu.html',
		controller: 'MainCtrl'
	};
});

app.directive('emoticon', function() {
	return {
		restrict: 'E',
		templateUrl: 'emoticon.html',
		scope: {
			emotion: '='
		},
		controller: function($scope) {
			$scope.url = "assets/emoticon/";
			$scope.emotions = [];
			for (var i = 1; i <= 9; i++) {
				$scope.emotions.push(i + ".gif");
			}
			$scope.select = function(index) {
				$scope.emotion = $scope.url + $scope.emotions[index];
			}
		}
	};
});