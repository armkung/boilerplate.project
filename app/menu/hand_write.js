app.directive("handWriter", function($rootScope, $timeout, DrawManager, Room, DataManager) {
	return {
		restrict: 'A',
		scope: {
			tool: '@'
		},
		link: function($scope, $attrs) {
			var type = "pos";

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

			var isSeed = true,
				isDraw = false;
			$rootScope.$on('tool', function(e, tool) {
				var callback = {};
				switch (tool) {
					case DrawManager.tools.DRAW:
						callback.onDown = function() {
							isDraw = true;
							isSeed = true;
						};

						callback.onMove = function(pos) {
							if (isDraw) {
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

						callback.onUp = function() {
							isDraw = false;
							isSeed = true;
						};
						DrawManager.canGroupDrag(false);
						break;
					case DrawManager.tools.DRAG:
						DrawManager.canGroupDrag(true);
						break;
					case DrawManager.tools.ANIMATE:
						if (!isDraw) {
							var delay = 10;
							isDraw = true;
							DataManager.loadData(type, {
								room: Room.room
							}, function(data) {
								var i = 0;
								(function animate() {
									if (i < data.length) {
										var pos = data[i];
										draw(pos);
										$timeout(animate, delay);
										i++;
									} else {
										isDraw = false;
									}
								})();
							});
						}
						break;
					default:
						DrawManager.setEvent(tool, callback);
				}
				DrawManager.setBind(callback);
			});
			$rootScope.$broadcast('tool', DrawManager.tools.DRAW);
		}
	};
});

app.controller('HandWriteCtrl', function($scope, $rootScope, DrawManager) {

	$scope.tools = [];
	angular.forEach(DrawManager.tools, function(value, key) {
		$scope.tools.push(value);
	});
	$scope.changeTool = function(index) {
		$rootScope.$broadcast('tool', $scope.tools[index]);
	}
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

});