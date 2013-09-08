app.service("DrawManager", function(Canvas) {
	var self = this;

	this.strokeColor = 'white';
	this.fillColor = 'white';
	this.strokeSize = 5;
	this.fontSize = 30;
	var lineOption = {
		points: [0, 0, 0, 0],
		stroke: 'white',
		strokeWidth: 5,
		lineCap: 'round',
		lineJoin: 'round'
	};
	var textOption = {
		fontSize: 30,
		fill: 'white'
	};
	var groupOption = {

	};

	var stage, layer, current;
	var line, text;
	var obj = {};
	this.init = function(id) {
		stage = Canvas.init(id.split("-")[0]);
		if (id in obj) {
			layer = obj[id];
		} else {
			layer = new Kinetic.Layer();
			obj[id] = layer;
		}
		self.newGroup();
		self.setCurrent();
		stage.add(layer);
	};
	this.initBrush = function(x, y, isSeed) {
		line = new Kinetic.Line(lineOption);
		line.getPoints()[0].x = x;
		line.getPoints()[0].y = y;
		line.getPoints()[1].x = x;
		line.getPoints()[1].y = y;
		if (isSeed) {
			groupOption.id = self.getCurrentGroup().length;
			group = new Kinetic.Group(groupOption);
			current.add(group);
		}
		group.add(line);
		// current.add(line);
	};
	this.drawBrush = function(x, y, isSeed) {
		if (!isSeed) {
			line.getPoints()[1].x = x;
			line.getPoints()[1].y = y;
			layer.batchDraw();
		}
		self.initBrush(x, y, isSeed);
	};

	this.initLine = function(x, y) {
		line = new Kinetic.Line(lineOption);
		line.getPoints()[0].x = x;
		line.getPoints()[0].y = y;
		line.getPoints()[1].x = x;
		line.getPoints()[1].y = y;
		layer.batchDraw();
		current.add(line);
	};
	this.drawLine = function(x, y, isSeed) {
		if (isSeed) {
			self.initLine(x, y);
		} else {
			line.getPoints()[1].x = x;
			line.getPoints()[1].y = y;
			layer.batchDraw();
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

	this.setCurrent = function(id) {
		if (id) {
			current = layer.get('#' + id)[0];
			if (!current) {
				self.newGroup(id);
				current = layer.get('#' + id)[0];
			}
		} else {
			var child = layer.get('#');
			var n = child.length;
			current = child[n - 1];
		}

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
	this.newGroup = function(id) {
		groupOption.id = id ? id : '';
		group = new Kinetic.Group(groupOption);
		layer.add(group);
	};
	this.getGroup = function() {
		return layer.get('Group');
	};
	this.getCurrentGroup = function(id) {
		return layer.get('#' + id);
	};
	this.canDrag = function(canDrag) {
		var objs = current.getChildren();
		angular.forEach(objs, function(obj, key) {
			obj.setDraggable(canDrag);
		});
	};
	this.canGroupDrag = function(canDrag) {
		// var groups = current.get('Group');
		// angular.forEach(groups, function(group, key) {
		current.setDraggable(canDrag);
		// });
	};
	this.clear = function() {
		layer.remove();
		layer = new Kinetic.Layer();
		stage.add(layer);
	};

});