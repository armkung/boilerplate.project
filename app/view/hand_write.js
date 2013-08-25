app.directive("handWriter", function($rootScope, $timeout, DrawManager, DrawFactory, Input, Room, DataManager) {
	return {
		restrict: 'A',
		scope: {
			text: '@',
			tool: '@'
		},
		link: function($scope, $attrs, $element) {
			var typePos = "pos";
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
				DrawManager.setStrokeSize(pos.size);
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
				DrawManager.setStrokeSize(pos.size);
				DrawManager.drawLine(pos.x, pos.y, pos.isSeed);

			}

			function text(data) {
				var pos = data.pos;
				DrawManager.newGroup();
				DrawManager.setCurrent();
				DrawManager.setFillColor(pos.color);
				DrawManager.setFontSize(pos.size);
				DrawManager.drawText(pos.text, pos.x, pos.y);
			}

			var strokeColor, fillColor, strokeSize, fontSize;
			DataManager.getData(typePos, function(data) {
				if (data.pos.isSeed) {
					strokeColor = DrawManager.getStrokeColor();
					fillColor = DrawManager.getFillColor();
					strokeSize = DrawManager.getStrokeSize();
					fontSize = DrawManager.getFontSize();
				}
				switch (data.type) {
					case DrawFactory.tools.DRAW:
						draw(data);
						break;
					case DrawFactory.tools.LINE:
						line(data);
						break;
					case DrawFactory.tools.TEXT:
						text(data);
						break;
				}
				if (data.pos.isUp) {
					DrawManager.setStrokeColor(strokeColor);
					DrawManager.setFillColor(fillColor);
					DrawManager.setStrokeSize(strokeSize);
					DrawManager.setFontSize(fontSize);
				}
				if ($scope.tool == DrawFactory.tools.DRAG) {
					DrawManager.canGroupDrag(canDrag);
				}
			});

			Input.init(function() {
				var obj = {};
				obj.pos = {
					text: $scope.text,
					x: pos.x,
					y: pos.y
				};
				obj.type = DrawFactory.tools.TEXT;
				obj.pos.color = DrawManager.getFillColor();
				obj.pos.size = DrawManager.getFontSize();
				obj.pos.isSeed = true;
				obj.pos.isUp = true;
				text(obj);
				DataManager.setData(typePos, obj);
			});
			Input.hide();

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
					obj.pos.color = DrawManager.getStrokeColor();
					obj.pos.size = DrawManager.getStrokeSize();
				}
				draw(obj);
				DataManager.setData(typePos, obj);
			});
			DrawFactory.setLine(function(pos) {
				var obj = {};
				obj.pos = pos;
				obj.type = DrawFactory.tools.LINE;
				if (pos.isSeed) {
					obj.pos.color = DrawManager.getStrokeColor();
					obj.pos.size = DrawManager.getStrokeSize();
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
				callback.strokeColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
				callback.fillColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
				callback.strokeSize = Math.floor(Math.random() * 10) + 4;
				callback.fontSize = Math.floor(Math.random() * 20) + 28;
				DrawFactory.setAttr(attr, callback);
			});
		}
	};
});