app.directive("handWriter", function($rootScope, $timeout, DrawManager, DrawFactory, Input, Room, DataManager) {
	return {
		restrict: 'A',
		scope: {
			text: '@',
			tool: '@'
		},
		link: function(scope, iAttr, iElement) {
			var typePos = "pos";
			DrawManager.init(iElement.id);

			function addGroup(id) {
				if (Room.users.indexOf(id) == -1) {
					Room.users.push(id);
					DrawManager.newGroup(id);
				}
			}

			function draw(data) {
				var pos = data.pos;
				if (data.id) {
					addGroup(data.id);
				}
				if (pos.isSeed) {
					DrawManager.setCurrent(data.id);
				}
				DrawManager.setStrokeColor(pos.color);
				DrawManager.setStrokeSize(pos.size);
				DrawManager.drawBrush(pos.x, pos.y, pos.isSeed);
			}

			function line(data) {
				var pos = data.pos;
				if (data.id) {
					addGroup(data.id);
				}
				if (pos.isSeed) {
					DrawManager.setCurrent(data.id);
				}
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

			function drag(data) {
				var pos = data.pos;
				if (data.id) {
					addGroup(data.id);
				}
				DrawManager.setCurrent(data.id);
				DrawManager.setCurrentPosition(data.n, pos.x, pos.y);
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
					case DrawFactory.tools.DRAG_OBJECT:
						drag(data);
						break;
				}
				if (data.pos.isUp) {
					DrawManager.setStrokeColor(strokeColor);
					DrawManager.setFillColor(fillColor);
					DrawManager.setStrokeSize(strokeSize);
					DrawManager.setFontSize(fontSize);
				}
				if (scope.tool == DrawFactory.tools.DRAG_GROUP) {
					DrawManager.canGroupDrag(true);
				}
			});

			Input.init(function() {
				var obj = {};
				obj.pos = {
					text: scope.text,
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

			DrawFactory.setDragObject(function(data) {
				var obj = {};
				obj.pos = data.getPosition();
				obj.n = data.getId();
				obj.type = DrawFactory.tools.DRAG_OBJECT;
				DataManager.setData(typePos, obj);
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

			scope.$watch('tool', function() {
				Input.hide();
				DrawFactory.setTool(scope.tool);
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