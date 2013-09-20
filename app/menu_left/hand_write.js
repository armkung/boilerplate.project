app.directive("handWriter", function($rootScope, $timeout, DrawManager, DrawFactory, Input, Room, DataManager) {
	return {
		restrict: 'A',
		scope: {
			text: '@',
			tool: '@'
		},
		link: function(scope, iElement, iAttr) {
			var typePos = "pos";
			var id = iAttr.id;
			DrawManager.init(id);

			function addGroup(id) {
				if (id && Room.users.indexOf(id) == -1) {
					Room.users.push(id);
					DrawManager.newGroup(id);
				}
			}

			function draw(data) {
				var id = data.id;
				addGroup(id)
				DrawManager.setCurrent(id)

				var pos = data.pos;
				DrawManager.draw(data.data, pos.x, pos.y);

				// var pos = data.pos;
				// if (data.id) {
				// 	addGroup(data.id);
				// }
				// if (pos.isSeed) {
				// 	DrawManager.setCurrent(data.id);
				// }
				// DrawManager.setStrokeColor(pos.color);
				// DrawManager.setStrokeSize(pos.size);
				// DrawManager.drawBrush(pos.x, pos.y, pos.isSeed);
			}

			function line(data) {
				var id = data.id;
				addGroup(id);
				DrawManager.setCurrent(id);

				// DrawManager.setStrokeColor(pos.color);
				// DrawManager.setStrokeSize(pos.size);
				var pos = data.pos;
				DrawManager.drawLine(pos.x, pos.y, pos.isSeed, pos.isUp);

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
				DrawManager.setCurrent(data.id);
				DrawManager.setCurrentPosition(data.n, data.data);
			}

			var strokeColor, fillColor, strokeSize, fontSize;
			DataManager.getData(typePos, function(data) {
				if (data.pos && data.pos.isSeed) {
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
				if (data.pos && data.pos.isUp) {
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

			DrawFactory.setDragObject(function(data, attr) {
				var obj = {};
				obj.type = DrawFactory.tools.DRAG_OBJECT;
				obj.n = DrawManager.getIndex(data);
				obj.data = attr;
				DataManager.setData(typePos, obj);
			});
			DrawFactory.setDraw(function(data) {
				var obj = {};
				obj.pos = {
					x: data.get("left"),
					y: data.get("top")
				};
				// obj.pos.isSeed = true;
				obj.type = DrawFactory.tools.DRAW;
				obj.data = data;
				draw(obj);
				DataManager.setData(typePos, obj);
			});
			DrawFactory.setLine(function(pos) {
				var obj = {};
				obj.pos = pos;
				obj.type = DrawFactory.tools.LINE;
				// if (pos.isSeed) {
				// 	obj.pos.color = DrawManager.getStrokeColor();
				// 	obj.pos.size = DrawManager.getStrokeSize();
				// }
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