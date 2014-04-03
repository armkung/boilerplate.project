app.directive("drawPad", ["$rootScope", "DrawManager", "DrawFactory", "Input", "Room", "DataManager",
	function($rootScope, DrawManager, DrawFactory, Input, Room, DataManager) {
		return {
			restrict: 'A',
			scope: {
				id: '@',
				text: '@',
				init: '=',
				send: '='
			},
			link: function(scope, iElement, iAttr) {
				var type = DataManager.types.POS;
				var id = scope.id;
				scope.$watch('id', function(newV, oldV) {
					id = scope.id;
					if (id != "") {

						DrawManager.init(id);
						DrawFactory.setTool(DrawFactory.tools.MODE);

						function sendData(obj) {
							if (scope.send) {
								obj.name = DrawManager.getName();
								DataManager.setData(type, obj);
							}
						}

						function setId(user) {
							var id;
							if (user) {
								var name = user.name;
								if (name != Room.user) {
									id = user.name;
								}
							}
							DrawManager.newGroup(id);
						}

						function setCurrent(user) {
							var id;
							if (user) {
								var name = user.name;
								if (name != Room.user) {
									id = user.name;

									if (Room.users.indexOf(id) == -1) {
										Room.users.push(name);
									}
								}
							}
							DrawManager.setCurrent(id);
						}

						function draw(data) {
							setCurrent(data.user);
							DrawManager.draw(data.data);
						}

						function line(data) {
							var pos = data.pos;
							setCurrent(data.user);

							DrawManager.setStrokeColor(pos.color);
							DrawManager.setStrokeSize(pos.size);
							return DrawManager.drawLine(pos.x, pos.y, pos.isSeed, pos.isUp);
						}

						function text(data) {
							var pos = data.pos;
							setCurrent(data.user);

							DrawManager.setFillColor(pos.color);
							DrawManager.setFontSize(pos.size);
							return DrawManager.drawText(pos.text, pos.x, pos.y);
						}

						function drag(data) {
							setCurrent(data.user);

							DrawManager.setCurrentPosition(data.n, data.data);
						}

						function remove(data) {
							setCurrent(data.user);

							DrawManager.remove(data.n);
						}

						function clear(data) {
							setCurrent();

							if (data.user) {
								var name = data.user.name;
								DrawManager.remove([name]);
								DrawManager.removeGroup(name);
								var index = Room.users.indexOf(name);
								if (index != -1) {
									Room.users.splice(name, 1);
								}
							}
						}

						var strokeColor, fillColor, strokeSize, fontSize;
						DataManager.getData(type, function(data) {

							function addData(data) {
								switch (data.type) {
									case DrawFactory.tools.DRAG_OBJECT:
										drag(data);
										break;
									case DrawFactory.tools.DELETE:
										remove(data);
										break;
									case DrawFactory.tools.CLEAR:
										clear(data);
										break;
									default:
										DrawManager.loadData(data.data);
								}
							}
							DrawManager.lazyUpdate(true);
							if (angular.isArray(data)) {
								angular.forEach(data, function(value, key) {
									setId(value.user);
									setCurrent(value.user);
									addData(value);
								});
								if (data.length > 0) {
									$rootScope.$broadcast('group');
								}
							} else {
								setId(data.user);
								setCurrent(data.user);
								addData(data);
								if (data) {
									$rootScope.$broadcast('group');
								}
							}
							if (scope.tool == DrawFactory.tools.DRAG_GROUP) {
								DrawManager.canGroupDrag(true);
							}
							DrawManager.update();
							DrawManager.lazyUpdate(false);
						});
						if (scope.init) {
							DataManager.initData(type, DrawManager.getName());
						}

						function drawText() {
							if (scope.text != "") {
								var obj = {};
								obj.pos = {
									text: scope.text,
									x: pos.x,
									y: pos.y
								};
								obj.type = DrawFactory.tools.TEXT;
								obj.pos.color = DrawManager.getFillColor();
								obj.pos.size = DrawManager.getFontSize();
								var data = text(obj);
								obj.data = DrawManager.toObject(data);
								sendData(obj);

								Input.hide();
								scope.text = ""
							}
						}
						Input.init(drawText);
						Input.hide();

						DrawFactory.setClear(function(data) {
							var obj = {};
							obj.type = DrawFactory.tools.CLEAR;
							clear(obj);
							sendData(obj);
						});
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
							obj.scale = DrawManager.getScale();
							obj.pos.color = DrawManager.getStrokeColor();
							obj.pos.size = DrawManager.getStrokeSize();

							draw(obj);
							obj.data = DrawManager.toObject(data);
							sendData(obj);
						});
						DrawFactory.setText(function(data) {
							if (data) {
								pos = data;
								Input.show(pos.x, pos.y);
								$rootScope.$apply();
							} else {
								drawText();
							}
						});
						DrawFactory.setLine(function(pos) {
							var obj = {};
							obj.pos = pos;
							obj.type = DrawFactory.tools.LINE;
							obj.pos.color = DrawManager.getStrokeColor();
							obj.pos.size = DrawManager.getStrokeSize();
							var data = line(obj);
							if (pos.isSeed || pos.isUp) {
								obj.data = DrawManager.toObject(data);
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
							DrawFactory.setAttr(obj.attr, obj.data);
						});
						var listener = $rootScope.$on("$stateChangeStart", function($currentRoute, $previousRoute) {
							DrawManager.saveData();
							listener();
						});
					}
				});
			}

		};
	}
]);