app.directive("drawPad", function($rootScope, $window, $timeout, DrawManager, DrawFactory, Input, Room, DataManager) {
	return {
		restrict: 'A',
		scope: {
			text: '@',
			send: '='
		},
		link: function(scope, iElement, iAttr) {
			var type = DataManager.types.POS;
			var id = iAttr.id;
			DrawManager.init(id);

			function sendData(obj) {
				console.log(scope.send)
				if (scope.send) {
					obj.name = DrawManager.getName();
					DataManager.setData(type, obj);
				}
			}

			function setCurrent(user) {
				var id, name;
				if (user) {
					name = user.name;
					if (name != Room.user) {
						id = user.id;
						if (Room.users.indexOf(id) == -1) {
							Room.users.push(name);
						}
					}
				}
				DrawManager.setCurrent(id);
			}

			function draw(data) {
				var pos = data.pos;
				var id = data.user ? data.user.id : undefined;
				DrawManager.newGroup(id);
				setCurrent(data.user);

				DrawManager.setStrokeColor(pos.color);
				DrawManager.setStrokeSize(pos.size);
				DrawManager.draw(data.data, pos.x, pos.y);
			}

			function line(data) {
				var pos = data.pos;
				var id = data.user ? data.user.id : undefined;
				DrawManager.newGroup(id);
				setCurrent(data.user);

				DrawManager.setStrokeColor(pos.color);
				DrawManager.setStrokeSize(pos.size);
				DrawManager.drawLine(pos.x, pos.y, pos.isSeed, pos.isUp);

			}

			function text(data) {
				var pos = data.pos;
				var id = data.user ? data.user.id : undefined;
				DrawManager.newGroup(id);
				setCurrent(data.user);

				DrawManager.setFillColor(pos.color);
				DrawManager.setFontSize(pos.size);
				DrawManager.drawText(pos.text, pos.x, pos.y);
			}

			function drag(data) {
				setCurrent(data.user);

				DrawManager.setCurrentPosition(data.n, data.data);
			}

			function remove(data) {
				setCurrent(data.user);

				DrawManager.remove(data.n);
			}

			var strokeColor, fillColor, strokeSize, fontSize;
			DataManager.getData(type, function(data) {
				if (data.name == DrawManager.getName()) {
					if (data.pos) {
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
						case DrawFactory.tools.DELETE:
							remove(data);
							break;
					}
					if (data.pos) {
						DrawManager.setStrokeColor(strokeColor);
						DrawManager.setFillColor(fillColor);
						DrawManager.setStrokeSize(strokeSize);
						DrawManager.setFontSize(fontSize);
					}
					if (scope.tool == DrawFactory.tools.DRAG_GROUP) {
						DrawManager.canGroupDrag(true);
					}
				}
			});
			DataManager.initData(type);

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
				text(obj);
				sendData(obj);
			});
			Input.hide();

			// DataManager.loadData(type, {
			// 	room: Room.room
			// }, function(data) {
			// 	DrawFactory.setAnimate(data, draw);
			// });
			DrawFactory.setDelete(function(data) {
				var obj = {};
				obj.type = DrawFactory.tools.DELETE;
				obj.n = DrawManager.getIndex(data);
				remove(obj);
				sendData(obj);
			});
			DrawFactory.setDragObject(function(data, attr) {
				var obj = {};
				obj.type = DrawFactory.tools.DRAG_OBJECT;
				obj.n = DrawManager.getIndex(data);
				obj.data = attr;
				sendData(obj);
			});
			DrawFactory.setDraw(function(data) {
				var obj = {};
				obj.pos = {
					x: data.get("left"),
					y: data.get("top")
				};
				obj.type = DrawFactory.tools.DRAW;
				obj.data = data;
				obj.pos.color = DrawManager.getStrokeColor();
				obj.pos.size = DrawManager.getStrokeSize();

				draw(obj);
				sendData(obj);
			});
			DrawFactory.setText(function(data) {
				pos = data;
				Input.show(pos.x, pos.y);
				$rootScope.$apply();
			});
			DrawFactory.setLine(function(pos) {
				var obj = {};
				obj.pos = pos;
				obj.type = DrawFactory.tools.LINE;
				obj.pos.color = DrawManager.getStrokeColor();
				obj.pos.size = DrawManager.getStrokeSize();

				line(obj);
				if (pos.isSeed || pos.isUp) {
					sendData(obj);
				}
			});

			$rootScope.$on('tool', function(e, tool) {
				scope.tool = tool;
				// if (scope.tool != null) {
				Input.hide();
				DrawFactory.setTool(tool);
				// 	scope.tool = null;
				// }
			});
			$rootScope.$on('attr', function(e, obj) {
				// var callback = {};
				// callback.strokeColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
				// callback.fillColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
				// callback.strokeSize = Math.floor(Math.random() * 10) + 4;
				// callback.fontSize = Math.floor(Math.random() * 20) + 28;
				DrawFactory.setAttr(obj.attr, obj.data);
			});
			$rootScope.$on("$stateChangeSuccess", function($currentRoute, $previousRoute) {
				DrawManager.saveData();
			});

		}
	};
});