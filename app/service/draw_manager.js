app.service("DrawManager", function(Canvas) {
	var self = this;

	this.strokeColor = 'black';
	this.fillColor = 'white';
	this.strokeSize = 5;
	this.fontSize = 30;
	var drawOption = {
		color: 'black',
		width: 5
	};
	var lineOption = {
		stroke: 'black',
		strokeWidth: 5
	};
	var textOption = {
		fontSize: 30,
		fill: 'white'
	};

	var stage, layer, current;
	var line, text;
	var id;
	var groups = {};
	var canvas;
	this.init = function(name) {
		id = name.split("-")[0];
		Canvas.init(id)
		Canvas.getCanvas().then(function(cs) {
			canvas = cs;
			// self.newGroup();
		});
	};
	this.draw = function(data, x, y) {
		// Canvas.getCanvas().then(function(canvas) {
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
			// current.addWithUpdate(data);
			// canvas.remove(data);
			// self.disableMove(current);
		}
		canvas.renderAll();

		// });
	}
	this.disableMove = function(obj) {
		canvas.selection = false;
		obj.set('selectable', false);
		obj.set('hasControls', false);
		obj.set('hasBorders', false);
	};
	this.enableMove = function(obj) {
		canvas.selection = true;
		obj.set('selectable', true);
		obj.set('hasControls', true);
		obj.set('hasBorders', true);
	};
	// this.addGroup = function(){

	// };
	this.setDraw = function() {
		// Canvas.getCanvas().then(function(canvas) {
		canvas.isDrawingMode = true;
		canvas.freeDrawingBrush.color = drawOption.color;
		canvas.freeDrawingBrush.width = drawOption.width;
		// canvas.on("path:created", function(e) {
		// self.disableMove(e.path);
		// });
		// });
	};
	this.removeDraw = function() {
		// Canvas.getCanvas().then(function(canvas) {
		canvas.isDrawingMode = false;
		canvas.off("path:created");
		// });
	};

	this.drawLine = function(x, y, isSeed, isUp) {
		if (isSeed) {
			xPos = x;
			yPos = y;
		} else {
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
			if (isUp) {
				line = null;
			}
		}
	};

	this.drawText = function(txt, x, y) {
		var op = textOption;
		op.x = x;
		op.y = y;
		op.text = txt;
		text = new Kinetic.Text(op);
		current.add(text);
		layer.batchDraw();
	};

	this.setStrokeColor = function(color) {
		if (color) {
			self.strokeColor = color;
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

		// if (id) {
		// 	current = layer.get('#' + id)[0];
		// 	if (!current) {
		// 		self.newGroup(id);
		// 		current = layer.get('#' + id)[0];
		// 	}
		// } else {
		// 	current = layer.get('#')[0];
		// }
	};
	this.newGroup = function(id) {
		if (id) {
			if (!(id in groups)) {
				groups[id] = new fabric.Group();
				self.disableMove(groups[id]);
				canvas.add(groups[id]);
			}
		}
		// id = id ? id : '';
		// if (layer.get('#' + id).length == 0) {
		// 	groupOption.id = id;
		// 	var group = new Kinetic.Group(groupOption);
		// 	layer.add(group);
		// }
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
	this.setCurrentPosition = function(indexs, pos, scale, angle) {
		angular.forEach(indexs, function(index, key) {
			var obj = current.item(index);
			obj.set({
				"left": obj.get("left") + pos.x,
				"top": obj.get("top") + pos.y,
				"scaleX": scale.x,
				"scaleY": scale.y,
				"angle": angle
			});
		});
		canvas.renderAll();
		// var obj = current.getChildren()[n];
		// obj.setX(x);
		// obj.setY(y);
		// layer.batchDraw();
	};
	this.canDrag = function(canDrag) {
		// var objs = self.getCurrentGroup();
		// angular.forEach(objs, function(obj, key) {
		// 	obj.setDraggable(canDrag);
		// });
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
		// var groups = self.getGroup();
		// angular.forEach(groups, function(group, key) {
		// 	if (group.getId() != '') {
		// 		group.setDraggable(canDrag);
		// 	}
		// });
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
		// layer = new Kinetic.Layer();
		// stage.add(layer);
		// self.newGroup();
		// self.setCurrent();
	};

});