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
				angular.forEach(data, function(data, key) {
					data.x *= Canvas.width;
					data.y *= Canvas.height;
				});
				callback(data);
			});
		}
	};
});

app.service("DrawManager", function(Canvas) {
	var self = this;

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
	var stage = Canvas.getStage();
	var layer = new Kinetic.Layer();
	stage.add(layer);
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


});
app.service("DrawFactory", function(Canvas, DrawManager) {
	var self = this;
	this.tools = {
		DRAG_GROUP: "Group Drag",
		DRAG_OBJECT: "Drag",
		CLEAR: "Clear",
		TEXT: "Text",
		DRAW: "Draw",
		ANIMATE: "Animate"
	};
	this.attrs = {
		COLOR_LINE: "Line Color",
		COLOR_TEXT: "Text Color"
	};
	
	this.setTool = function(tool, callback) {
		switch (tool) {
			case self.tools.DRAW:
				DrawManager.canGroupDrag(false);
				self.setBind(callback.draw);
				break;
			case self.tools.TEXT:
				DrawManager.canDrag(false);
				self.setBind(callback.text);
				break;
			case self.tools.ANIMATE:
				if (callback.animate && callback.animate.call) {
					callback.animate.call();
				}
				self.setBind(callback.animate);
				break;
			case self.tools.DRAG_GROUP:
				if (callback.dragGroup && callback.dragGroup.call) {
					callback.dragGroup.call();
				}
				DrawManager.canGroupDrag(true);
				self.setBind(callback.dragGroup);
				break;
			case self.tools.DRAG_OBJECT:
				if (callback.dragObject && callback.dragObject.call) {
					callback.dragObject.call();
				}
				DrawManager.canDrag(true);
				self.setBind(callback.dragObject);
				break;
			case self.tools.CLEAR:
				layer.remove();
				layer = new Kinetic.Layer();
				stage.add(layer);
				break;

		}
	};
	this.setAttr = function(attr, callback) {
		switch (attr) {
			case self.attrs.COLOR_LINE:
				self.lineOption.stroke = callback.color;
				break;
			case self.attrs.COLOR_TEXT:
				self.textOption.fill = callback.color;
				break;
		}
	};
	this.setBind = function(callback) {
		var cs = Canvas.canvas;
		cs.unbind();
		if (callback) {
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
		}
	};
})
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
		controller: 'MenuCtrl'
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
			};
		}
	};
});