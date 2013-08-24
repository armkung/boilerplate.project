app.directive("handWriter", function($rootScope, $timeout, DrawManager, DrawFactory, Room, DataManager) {
	return {
		restrict: 'A',
		scope: {
			tool: '@'
		},
		link: function($scope, $attrs) {
			var type = "pos";
			DrawManager.init("draw");
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
			// DataManager.loadData(type, {
			// 	room: Room.room
			// }, function(data) {
			// 	DrawFactory.setAnimate(data, draw);
			// });
			$scope.$watch('tool', function() {
				DrawFactory.setTool($scope.tool);
			});
			$rootScope.$on('attr', function(e, attr) {
				var callback = {};
				callback.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
				callback.size = Math.floor(Math.random()*10)+4;
				DrawFactory.setAttr(attr, callback);
			});
		}
	};
});