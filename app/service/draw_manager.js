app.service("DrawManager", function(Canvas, $rootScope) {
	var self = this;

	this.strokeColor = 'black';
	this.fillColor = 'black';
	this.strokeSize = 5;
	this.fontSize = 30;
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

	var line, text;
	var id;
	var obj = {};
	var groups = {};
	var canvas, current;
	this.init = function(name) {
		id = name;
		Canvas.init(id.split("-")[0]);
		Canvas.getCanvas().then(function(cs) {
			canvas = cs;
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
			self.newObject(id);
		});
	};
	this.newObject = function(name) {
		canvas.clear();
		if (name in obj) {
			var children = obj[name];
			angular.forEach(children, function(child, key) {
				canvas.add(child);
			});
			canvas.renderAll();
		}
	}
	this.saveData = function(name) {
		name = name ? name : id;
		obj[name] = canvas.getObjects().slice(0);
	}
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
		obj.set('hasBorders', true);
		// obj.set('hasControls', true);
		// obj.set('hasRotatingPoint', false);
	};
	this.draw = function(data, x, y) {
		if (current instanceof fabric.Group) {
			var paths = [];
			angular.forEach(data.path, function(value, key) {
				paths.push(value.join(" "));
			});
			paths = paths.join(" ");
			var path = new fabric.Path(paths);
			path.set({
				left: x,
				top: y,
				fill: null,
				stroke: data.stroke,
				strokeWidth: data.strokeWidth,
				strokeLineCap: data.strokeLineCap,
				strokeLineJoin: data.strokeLineJoin
			});
			current.addWithUpdate(path);

			self.disableMove(path);
		} else {
			self.disableMove(data);
		}
		canvas.renderAll();
	}
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
		if (isSeed) {
			xPos = x;
			yPos = y;
		} else {
			if (xPos && yPos) {
				current.remove(line);
				line = new fabric.Line([xPos, yPos, x, y], lineOption);
				if (current instanceof fabric.Group) {
					current.addWithUpdate(line)
				} else {
					current.add(line);
				}
				self.disableMove(line);
				canvas.calcOffset();
				canvas.renderAll();
			}
			if (isUp) {
				line = null;
				xPos = null;
				yPos = null;
			}
		}
	};

	this.drawText = function(txt, x, y) {
		text = new fabric.Text(txt, textOption);
		text.set({
			"left": x + text.getWidth() / 2,
			"top": y
		});
		if (current instanceof fabric.Group) {
			current.addWithUpdate(text);
		} else {
			current.add(text);
		}
		self.disableMove(text);
		canvas.calcOffset();
		canvas.renderAll();
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
			self.fontSize = size;
			textOption.fontSize = size;
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
				self.disableMove(groups[id]);
				canvas.add(groups[id]);
			}
		}
	};
	this.getIndex = function(obj) {
		var index = [];
		if (obj instanceof fabric.Group) {
			obj.forEachObject(function(obj) {
				index.push(canvas.getObjects().indexOf(obj));

			});
		} else {
			index.push(canvas.getObjects().indexOf(obj));
		}
		return index
	}
	this.getCurrentGroup = function(id) {
		// id = id ? id : '';
		// return layer.get('#' + id)[0].getChildren();
	};
	this.setCurrentPosition = function(indexs, data) {
		// var objMin, min = {};
		// var objs = [];
		angular.forEach(current.getObjects(), function(obj, key) {
			if (indexs.indexOf(key) != -1) {
				if (data.pos) {
					obj.set({
						"left": obj.get("left") + data.pos.x,
						"top": obj.get("top") + data.pos.y,
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
			}
		});
		// adjustPosition();
		canvas.renderAll();

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
		// 		// current.addWithUpdate(obj);
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
		angular.forEach(canvas.getObjects(), function(obj, key) {
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
		angular.forEach(canvas.getObjects(), function(obj, key) {
			if (obj instanceof fabric.Group) {
				if (canDrag) {
					self.enableMove(obj);
				} else {
					self.disableMove(obj);
				}
			}

		});
	};
	this.clear = function() {
		canvas.clear();
		Canvas.removeId(id)
		self.init(id);
	};


});