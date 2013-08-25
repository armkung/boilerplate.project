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
				var obj = {};
				obj.pos = {
					text: $scope.text,
					x: pos.x,
					y: pos.y
				};
				text(obj);
				DataManager.setData(typeText, obj);
			});
			Input.hide();

			DrawManager.init($element.id);


			function draw(data) {
				var pos = data.pos;
				if (data.id) {
					if (Room.users.indexOf(data.id) == -1) {
						Room.users.push(data.id);
						DrawManager.newGroup(data.id);
					}
				} else {
					if (pos.isSeed) {
						DrawManager.newGroup();
					}
				}
				DrawManager.setCurrent(data.id);
				DrawManager.setStrokeColor(pos.color);
				DrawManager.setSize(pos.size);
				DrawManager.drawBrush(pos.x, pos.y, pos.isSeed);
			}

			function line(data) {
				var pos = data.pos;
				if (data.id) {
					if (Room.users.indexOf(data.id) == -1) {
						Room.users.push(data.id);
						DrawManager.newGroup(data.id);
					}
				} else {
					if (pos.isSeed) {
						DrawManager.newGroup();
					}
				}
				DrawManager.setCurrent(data.id);
				DrawManager.setStrokeColor(pos.color);
				DrawManager.setSize(pos.size);
				DrawManager.drawLine(pos.x, pos.y, pos.isSeed);

			}

			function text(data) {
				DrawManager.newGroup();
				DrawManager.setCurrent();
				DrawManager.drawText(data.pos.text, data.pos.x, data.pos.y);
			}

			DataManager.getData(typePos, function(data) {
				switch (data.type) {
					case DrawFactory.tools.DRAW:
						draw(data);
						break;
					case DrawFactory.tools.LINE:
						line(data);
						break;
				}
				if ($scope.tool == DrawFactory.tools.DRAG) {
					DrawManager.canGroupDrag(canDrag);
				}
			});
			DataManager.getData(typeText, function(data) {
				text(data);
				if ($scope.tool == DrawFactory.tools.DRAG) {
					DrawManager.canGroupDrag(canDrag);
				}
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
				var obj = {};
				obj.pos = pos;
				obj.type = DrawFactory.tools.DRAW;
				if (pos.isSeed) {
					obj.pos.color = DrawManager.lineOption.stroke;
					obj.pos.size = DrawManager.lineOption.strokeWidth;
				}
				draw(obj);
				DataManager.setData(typePos, obj);
			});
			DrawFactory.setLine(function(pos) {
				var obj = {};
				obj.pos = pos;
				obj.type = DrawFactory.tools.LINE;
				if (pos.isSeed) {
					obj.pos.color = DrawManager.lineOption.stroke;
					obj.pos.size = DrawManager.lineOption.strokeWidth;
				}
				line(obj);
				if (pos.isSeed || pos.isUp) {
					DataManager.setData(typePos, obj);
				}
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