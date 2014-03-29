app.service("DrawManager", ["Canvas", "$rootScope",
	function(Canvas, $rootScope) {
		var self = this;

		var scaleFont = 20;
		this.strokeColor = 'black';
		this.fillColor = 'black';
		this.strokeSize = 5;
		this.fontSize = 5;

		var drawOption = {
			color: self.strokeColor,
			width: self.strokeSize
		};
		var lineOption = {
			stroke: self.strokeColor,
			strokeWidth: self.strokeSize
		};
		var textOption = {
			fontSize: self.fontSize,
			fill: self.fillColor
		};

		var obj = {};
		var line, text;
		var id, groups;
		var canvas, current;
		// var n;

		function setId(obj) {
			// var n = canvas.getObjects().indexOf(obj);
			var n = 0;
			angular.forEach(current.getObjects(), function(child, key) {
				if (!(child instanceof fabric.Group)) {
					if (child == obj) {
						return;
					} else {
						n++;
					}
				}
			});
			obj.set({
				"id": n
			});
		}
		this.setSize = function(w, h) {
			canvas.setWidth(w);
			canvas.setHeight(h);
			canvas.renderAll();
			Canvas.setSize(w, h)
		}
		this.setCursor = function(css) {
			canvas.defaultCursor = css;
		}
		this.loadData = function(data) {
			function setObject(obj) {
				self.disableMove(obj);
				obj.set({
					id: data.id
					// 	originX: 'center',
					// 	originY: 'center'
				});
				if (current instanceof fabric.Group) {
					self.enableMove(current);
					current.addWithUpdate(obj);
				} else {
					current.add(obj);
				}
			}
			// console.log(data);
			var object = data;
			if (object && object.type) {
				var klass = fabric.util.getKlass(object.type);
				if (klass.async) {
					klass.fromObject(object, function(obj) {
						setObject(obj);
					});
				} else {
					var obj = klass.fromObject(object);
					setObject(obj);
				}
			}
		}
		this.toObject = function(obj) {
			obj.toObject = (function(toObject) {
				return function() {
					return fabric.util.object.extend(toObject.call(this), {
						id: this.id,
						canvasWidth: canvas.getWidth(),
						canvasHeight: canvas.getHeight()
					});
				};
			})(obj.toObject);
			return obj.toObject();
		}
		this.lazyUpdate = function(isLazy) {
			canvas.renderOnAddRemove = !isLazy;
		}
		this.update = function() {
			canvas.renderAll();
		}
		this.clearAll = function() {
			group = {};
			obj = {};
			n = 0;
		}
		this.getName = function() {
			return id;
		};
		this.getScale = function() {
			return {
				x: Canvas.width,
				y: Canvas.height
			};
		}
		this.init = function(name) {
			canvas = Canvas.init(name);
			// Canvas.init(name);
			// Canvas.getCanvas().then(function(cs) {
			// 	canvas = cs;
			canvas.selection = false;
			canvas.defaultCursor = "crosshair";
			canvas.on("object:selected", function(e) {
				var obj = e.target;
				obj.set('hasControls', true);
				obj.set('hasRotatingPoint', true);
			});
			canvas.on("selection:created", function(e) {
				var obj = e.target;
				obj.set('hasControls', false);
				obj.set('hasRotatingPoint', false);
			});
			self.newObject(name);
			// });
		};
		this.newObject = function(name) {
			id = name;
			groups = {};
			n = 0;
			canvas.clear();
			if (name in obj) {
				var children = obj[name];
				angular.forEach(children, function(child, key) {
					if (!(child instanceof fabric.Group)) {
						canvas.add(child);
					}
				});
				canvas.renderAll();
			}
		};
		this.getObject = function(cs, name) {
			// cs.clear();
			if (name in obj) {
				var children = obj[name];
				angular.forEach(children, function(child, key) {
					cs.add(child);
				});
				cs.renderAll();
			}
		};
		this.saveData = function(name) {
			name = name ? name : id;
			if (name) {
				obj[name] = canvas.getObjects().slice(0);
			}
		};
		this.disableMove = function(obj) {
			canvas.selection = false;
			obj.set('selectable', false);
			obj.set('hasControls', false);
			obj.set('hasBorders', false);
			obj.set('hasRotatingPoint', false);
		};
		this.enableMove = function(obj) {
			canvas.selection = true;
			obj.set('selectable', true);
			obj.set('hasRotatingPoint', true);
			obj.set('hasBorders', true);
			if (!(obj instanceof fabric.Group)) {
				obj.set('hasControls', true);
			}
		};
		this.remove = function(indexs) {
			angular.forEach(indexs, function(index, key) {
				current.forEachObject(function(obj) {
					// if (!(obj instanceof fabric.Group)) {
					if (obj.get("id") == index) {
						current.remove(obj);
						return;
					}
					// }
				});
			});
			canvas.renderAll();
		};
		this.draw = function(data) {
			setId(data);
			// canvas.renderAll();
		};
		this.setDraw = function() {
			canvas.isDrawingMode = true;
			angular.forEach(drawOption, function(value, key) {
				canvas.freeDrawingBrush[key] = value;
			});
		};
		this.removeDraw = function() {
			canvas.isDrawingMode = false;
			canvas.off("path:created");
		};

		this.drawLine = function(x, y, isSeed, isUp) {
			var result;
			if (isSeed) {
				xPos = x;
				yPos = y;
			} else {
				if (xPos && yPos) {
					current.remove(line);
					line = new fabric.Line([xPos, yPos, x, y], lineOption);
					// line.set({
					// 	originX: 'center',
					// 	originY: 'center'
					// });
					if (current instanceof fabric.Group) {
						current.addWithUpdate(line);
					} else {
						current.add(line);
					}
					setId(line);
					self.disableMove(line);
					// canvas.calcOffset();
					canvas.renderAll();
					result = line;
				}
				if (isUp) {
					line = null;
					xPos = null;
					yPos = null;
				}
			}
			return result;
		};

		this.drawText = function(txt, x, y) {
			text = new fabric.Text(txt, textOption);
			text.set({
				"left": x + text.getWidth() / 2,
				"top": y
			});
			if (current instanceof fabric.Group) {
				current.add(text);
			} else {
				current.add(text);
			}
			setId(text);
			self.disableMove(text);
			canvas.calcOffset();
			canvas.renderAll();
			return text;
		};

		this.setStrokeColor = function(color) {
			if (color) {
				self.strokeColor = color;
				canvas.freeDrawingBrush.color = color;
				drawOption.color = color;
				lineOption.stroke = color;
			}
		};
		this.setFillColor = function(color) {
			if (color) {
				self.fillColor = color;
				textOption.fill = color;
			}
		};
		this.setStrokeSize = function(size) {
			if (size) {
				self.strokeSize = size;
				canvas.freeDrawingBrush.width = size;
				drawOption.width = size;
				lineOption.strokeWidth = size;
			}
		};
		this.setFontSize = function(size) {
			if (size) {
				textOption.fontSize = scaleFont + size;
				self.fontSize = size;
			}
		};
		this.getStrokeColor = function() {
			return self.strokeColor;
		};
		this.getFillColor = function() {
			return self.fillColor;
		};
		this.getStrokeSize = function() {
			return self.strokeSize;
		};
		this.getFontSize = function() {
			return self.fontSize;
		};

		this.setCurrent = function(id) {
			if (id) {
				current = groups[id];
			} else {
				current = canvas;
			}
		};
		this.newGroup = function(id) {
			if (id) {
				if (!(id in groups)) {
					groups[id] = new fabric.Group();

					// groups[id].on("object:moving", function(e) {
					// 	groups[id].set({
					// 		"moveX": e.target.getLeft() - groups[id].get("initX"),
					// 		"moveY": e.target.getTop() - groups[id].get("initY")
					// 	});
					// });
					groups[id].set({
						originX: 'center',
						originY: 'center',
						"id": id
					});
					self.disableMove(groups[id]);
					canvas.add(groups[id]);
				}
			}
		};
		this.getFromId = function(id) {
			var n;
			canvas.forEachObject(function(obj) {
				if (obj.get("id") == id) {
					n = canvas.getObjects().indexOf(obj);
					return;
				}
			});
			return n;
		}
		this.getIndex = function(obj) {
			var index = [];

			if (obj instanceof fabric.Group) {
				obj.forEachObject(function(obj) {
					index.push(obj.get("id"));
				});
			} else {
				index.push(obj.get("id"));
			}
			return index;
		};
		this.getCurrentGroup = function(id) {
			// id = id ? id : '';
			// return layer.get('#' + id)[0].getChildren();
		};
		this.setCurrentPosition = function(indexs, data) {
			// var objMin, min = {};
			// var objs = [];
			// console.log(indexs)
			if (current instanceof fabric.Group) {
				angular.forEach(indexs, function(index, key) {
					angular.forEach(current.getObjects(), function(obj, key) {
						if (obj.get("id") == index) {
							if (data.pos) {
								obj.set({
									"left": obj.get("left") + data.pos.x,
									"top": obj.get("top") + data.pos.y
								});
							}
							if (data.scale || data.flip) {
								// var center = obj.getCenterPoint();
								// obj.translateToOriginPoint(center, scale.point.x, scale.point.y);
								obj.set({
									"scaleX": data.scale.x,
									"scaleY": data.scale.y,
									"flipX": data.flip.x,
									"flipY": data.flip.y
								});
							}
							if (data.angle) {
								obj.set({
									"angle": data.angle
								});
							}
							return;
						}
					});
				});
				// adjustPosition();
				canvas.calcOffset();
				canvas.renderAll();
			}
			// function adjustPosition() {
			// 	var x = objMin.get("left");
			// 	var y = objMin.get("top");
			// 	current.set({
			// 		"left": x,
			// 		"top": y
			// 	});
			// 	angular.forEach(current.getObjects(), function(obj, key) {
			// 		var dx = obj.get("left") - x;
			// 		var dy = obj.get("top") - y;
			// 		console.log(x+" "+y)
			// 		console.log(obj.get("left")+" "+obj.get("top"))
			// 		obj.set({
			// 			"left": dx,
			// 			"top": dy
			// 		});
			// 		// current.add(obj);
			// 		// canvas.calcOffset();
			// 		// canvas.renderAll();
			// 	})
			// }

			// function findMinPosition(obj) {
			// 	var x = obj.get("left");
			// 	var y = obj.get("top");
			// 	if ((!min.x && !min.y) || (min.x > x && min.y > y)) {
			// 		min.x = x;
			// 		min.y = y;
			// 		objMin = obj.clone();
			// 	}

			// }
		};
		this.canDrag = function(canDrag) {
			canvas.forEachObject(function(obj) {
				if (!(obj instanceof fabric.Group)) {
					if (canDrag) {
						self.enableMove(obj);
					} else {
						self.disableMove(obj);
					}
				}

			});
		};
		this.canGroupDrag = function(canDrag) {
			canvas.forEachObject(function(obj) {
				if (obj instanceof fabric.Group) {
					if (canDrag) {
						self.enableMove(obj);
					} else {
						self.disableMove(obj);
					}
				}

			});
		};
		this.clear = function(id) {
			// canvas.clear();
			// Canvas.removeId(id)		
			// self.init(id);

			canvas.forEachObject(function(obj) {
				if (!(obj instanceof fabric.Group)) {
					canvas.remove(obj);
				}
			});
			canvas.renderAll();
			n = 0;
		};
		this.removeGroup = function(id) {
			delete groups[id];
		}
	}
]);