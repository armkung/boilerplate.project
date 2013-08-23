app.directive("handWriter", function($rootScope, $timeout, DrawManager, DrawFactory, Room, DataManager) {
	return {
		restrict: 'A',
		scope: {
			tool: '@'
		},
		link: function($scope, $attrs) {
			var type = "pos";

			DataManager.getData(type, function(data) {
				draw(data, $scope.tool == DrawFactory.tools.DRAG);
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

			DrawFactory.setDraw(function(pos) {
				draw(pos);
				DataManager.setData(type, pos);
			});
			DataManager.loadData(type, {
				room: Room.room
			}, function(data) {
				DrawFactory.setAnimate(data, draw);
			});

			$scope.$watch('tool', function(tool) {
				DrawFactory.setTool(tool);
			});
			$rootScope.$on('attr', function(e, attr) {
				var callback = {};
				callback.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
				DrawFactory.setAttr(attr, callback);
			});
		}
	};
});

app.controller('HandWriteCtrl', function($scope, $rootScope, DrawFactory) {

	$scope.tools = [];
	$scope.attrs = [];
	$scope.tool = DrawFactory.tools.DRAW;
	angular.forEach(DrawFactory.tools, function(value, key) {
		$scope.tools.push(value);
	});
	angular.forEach(DrawFactory.attrs, function(value, key) {
		$scope.attrs.push(value);
	});
	$scope.changeTool = function(index) {
		$scope.tool = $scope.tools[index];
	};
	$scope.changeAttr = function(index) {
		$rootScope.$broadcast('attr', $scope.attrs[index]);
	};

});