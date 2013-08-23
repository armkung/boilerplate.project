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
			var callback = {};
			var isSeed = true,
				isDraw = false;
			callback.draw = {
				onDown: function() {
					isDraw = true;
					isSeed = true;
				},
				onMove: function(pos) {
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
				},
				onUp: function() {
					isDraw = false;
					isSeed = true;
				}
			}
			callback.animate = {
				call: function() {
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
				}
			}

			$scope.$watch('tool', function(tool) {
				DrawManager.setTool(tool, callback);
			});
			$rootScope.$on('attr', function(e, attr) {
				var callback = {};
				callback.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
				DrawManager.setAttr(attr, callback);
			});
		}
	};
});

app.controller('HandWriteCtrl', function($scope, $rootScope, DrawManager) {

	$scope.tools = [];
	$scope.attrs = [];
	$scope.tool = DrawManager.tools.DRAW;
	angular.forEach(DrawManager.tools, function(value, key) {
		$scope.tools.push(value);
	});
	angular.forEach(DrawManager.attrs, function(value, key) {
		$scope.attrs.push(value);
	});
	$scope.changeTool = function(index) {
		$scope.tool = $scope.tools[index];
	}
	$scope.changeAttr = function(index) {
		$rootScope.$broadcast('attr', $scope.attrs[index]);
	}

});