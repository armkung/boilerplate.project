app.service("HandWriter", function($rootScope, Canvas, DrawManager, Room) {
	var self = this;
	var cs = Canvas.canvas;
	var isSeed = true,
		isDraw = false;

	var tools = {
		DRAG: 0,
		CLEAR: 1,
		DRAW: 2
	};
	var current;

	this.Tools = tools;
	this.draw = function(data) {
		if (data.id) {
			if (Room.users.indexOf(data.id) == -1) {
				Room.users.push(data.id);
				DrawManager.newGroup(data.id);
			}
		} else {
			if (data.isSeed) {
				DrawManager.newGroup();
			}
		}

		DrawManager.setCurrent(data.id);
		DrawManager.drawBrush(data.x, data.y, data.isSeed);
		if (current == tools.DRAG) {
			DrawManager.canGroupDrag(true);
		}
	};

	this.setTool = function(tool) {
		var onDown, onMove, onUp;
		current = tool;
		switch (tool) {
			case tools.DRAW:

				onDown = function() {
					isDraw = true;
					isSeed = true;
				};

				onMove = function() {
					if (isDraw) {
						var pos = Canvas.getPosition();
						var obj = {
							x: pos.x,
							y: pos.y
						};
						if (isSeed) {
							obj.isSeed = isSeed;
						}
						self.draw(obj);
						$rootScope.$emit('send_data', obj);
						isSeed = false;
					}
				};

				onUp = function() {
					isDraw = false;
					isSeed = true;
				};
				DrawManager.canGroupDrag(false);
				break;
			case tools.DRAG:
				DrawManager.canGroupDrag(true);
				break;
			case tools.CLEAR:
				Canvas.clear();
				break;
		}
		cs.unbind();
		cs.bind("mousedown touchstart", onDown);
		cs.bind("mousemove touchmove", onMove);
		cs.bind("mouseup touchend touchcancel", onUp);
	};
});

app.controller('HandWriteCtrl', function($rootScope, $scope, $timeout, DataManager, Room, HandWriter) {
	var type = "pos";
	DataManager.getData(type, function(data) {
		HandWriter.draw(data);
	});

	$scope.tool = HandWriter.Tools.DRAW;
	$scope.animate = function() {
		var delay = 10;
		DataManager.loadData(type, {
			room: Room.room
		}, function(data) {
			var i = 0;

			function draw() {
				if (i < data.length) {
					var pos = data[i];
					HandWriter.draw(pos);
					$timeout(draw, delay);
					i++;
				}
			}
			draw();
		});
	};
	$scope.drag = function() {
		$scope.tool = $scope.tool == HandWriter.Tools.DRAW ? HandWriter.Tools.DRAG : HandWriter.Tools.DRAW;
	};
	$scope.clear = function() {
		$scope.tool = HandWriter.Tools.CLEAR;
	};

	$scope.$watch('tool', function() {
		HandWriter.setTool($scope.tool);
	});
	$rootScope.$on('send_data', function(e, data) {
		DataManager.setData(type, data);
	});
});