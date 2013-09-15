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
	var obj = {}, index;

	var canvas;
	this.init = function(id) {
		Canvas.init(id.split("-")[0])
		Canvas.getCanvas().then(function(cs) {
			canvas = cs;
		});
	};
	this.disableMove = function(obj) {
		obj.hasControls = false
		obj.selectable = false;
	}
	this.setDraw = function() {
		Canvas.getCanvas().then(function(cs) {
			canvas.isDrawingMode = true;
			canvas.freeDrawingBrush.color = drawOption.color;
			canvas.freeDrawingBrush.width = drawOption.width;
			canvas.on("path:created", function(e) {
				self.disableMove(e.path);
			});
		});
	}
	this.initLine = function(x, y, isSeed) {
		line = new fabric.Line([x, y, x, y], lineOption);
		self.disableMove(line);
		canvas.add(line);
	};
	this.drawLine = function(x, y, isSeed) {
		if (isSeed) {
			self.initLine(x, y, isSeed);
		} else {
			line.set("x2", x);
			line.set("y2", y);
			canvas.renderAll();
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
		id = id ? id : '';
		if (layer.get('#' + id).length == 0) {
			groupOption.id = id;
			var group = new Kinetic.Group(groupOption);
			layer.add(group);
		}
	};
	this.getGroup = function() {
		return layer.getChildren();
	};
	this.getCurrentGroup = function(id) {
		id = id ? id : '';
		return layer.get('#' + id)[0].getChildren();
	};
	this.setCurrentPosition = function(n, x, y) {
		var obj = current.getChildren()[n];
		obj.setX(x);
		obj.setY(y);
		layer.batchDraw();
	};
	this.canDrag = function(canDrag) {
		// var objs = self.getCurrentGroup();
		// angular.forEach(objs, function(obj, key) {
		// 	obj.setDraggable(canDrag);
		// });
	};
	this.canGroupDrag = function(canDrag) {
		// var groups = self.getGroup();
		// angular.forEach(groups, function(group, key) {
		// 	if (group.getId() != '') {
		// 		group.setDraggable(canDrag);
		// 	}
		// });
	};
	this.clear = function() {
		layer.remove();
		delete obj[index];
		self.init(index);
		// layer = new Kinetic.Layer();
		// stage.add(layer);
		// self.newGroup();
		// self.setCurrent();
	};

});