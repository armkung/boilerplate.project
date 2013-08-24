app.directive("handWriter", function($rootScope, $timeout, DrawManager, DrawFactory, Input, Room, DataManager) {
	return {
		restrict: 'A',
		scope: {
			text: '@',
			tool: '@'
		},
		link: function($scope, $attrs, $element) {
			var typePos = "pos",
				typeText = "text";

			Input.init(function() {
				var obj = {
					text: $scope.text,
					x: pos.x,
					y: pos.y
				};
				text(obj);
				DataManager.setData(typeText, obj);
				Input.hide();
			});
			Input.hide();

			DrawManager.init($element.id);


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
					DrawManager.canGroupDrag(canDrag);
				}
			}

			function text(data, canDrag) {
				DrawManager.newGroup();
				DrawManager.setCurrent();
				DrawManager.drawText(data.text, data.x, data.y);
				if (canDrag) {
					DrawManager.canGroupDrag(canDrag);
				}
			}

			DataManager.getData(typePos, function(data) {
				draw(data, $scope.tool == DrawFactory.tools.DRAG);
			});
			DataManager.getData(typeText, function(data) {
				text(data, $scope.tool == DrawFactory.tools.DRAG);
			});
			DataManager.loadData(typePos, {
				room: Room.room
			}, function(data) {
				DrawFactory.setAnimate(data, draw);
			});


			DrawFactory.setText(function(data) {
				pos = data;
				Input.show(pos.x, pos.y);
				$rootScope.$apply();
			});
			DrawFactory.setDraw(function(pos) {
				draw(pos);
				DataManager.setData(typePos, pos);
			});
			$scope.$watch('tool', function() {
				Input.hide();
				DrawFactory.setTool($scope.tool);
			});
			$rootScope.$on('attr', function(e, attr) {
				var callback = {};
				callback.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
				callback.size = Math.floor(Math.random() * 10) + 4;
				DrawFactory.setAttr(attr, callback);
			});
		}
	};
});