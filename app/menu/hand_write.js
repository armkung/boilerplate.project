app.directive("handWriter", function(Canvas, DrawManager, Room, DataManager) {
	return {
		restrict: 'A',
		scope: {
			tool: '@'
		},
		controller: function($scope, $attrs) {
			var type = "pos";
			var cs = Canvas.canvas;

			DataManager.getData(type, function(data) {
				draw(data, $scope.tool == DrawManager.tools.DRAG);
			});

			function draw(data, canDrag) {
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
				if (canDrag) {
					DrawManager.canGroupDrag(true);
				}
			}

			$scope.$watch('tool', function() {
				var onDown, onMove, onUp;
				var isSeed = true,
					isDraw = false;

				cs.unbind();
				switch ($scope.tool) {
					case DrawManager.tools.DRAW:

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
								isSeed = false;
								draw(obj);
								DataManager.setData(type, obj);
							}
						};

						onUp = function() {
							isDraw = false;
							isSeed = true;
						};
						DrawManager.canGroupDrag(false);

						cs.bind("mousedown touchstart", onDown);
						cs.bind("mousemove touchmove", onMove);
						cs.bind("mouseup touchend touchcancel", onUp);
						break;
					case DrawManager.tools.DRAG:
						DrawManager.canGroupDrag(true);

						break;
					case DrawManager.tools.CLEAR:
						Canvas.clear();
						break;
				}
			});
		}
	};
});

app.controller('HandWriteCtrl', function($scope, $timeout, DrawManager) {

	$scope.tool = DrawManager.tools.DRAW;
	$scope.animate = function() {
		// var delay = 10;
		// DataManager.loadData(type, {
		// 	room: Room.room
		// }, function(data) {
		// 	var i = 0;

		// 	function draw() {
		// 		if (i < data.length) {
		// 			var pos = data[i];
		// 			HandWriter.draw(pos);
		// 			$timeout(draw, delay);
		// 			i++;
		// 		}
		// 	}
		// 	draw();
		// });
	};
	$scope.drag = function() {
		$scope.tool = $scope.tool == DrawManager.tools.DRAW ? DrawManager.tools.DRAG : DrawManager.tools.DRAW;
	};
	$scope.clear = function() {
		$scope.tool = DrawManager.tools.CLEAR;
	};

});