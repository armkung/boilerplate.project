app.service("DrawManager", function(Canvas) {
	var self = this;

	this.lineOption = {
		points: [0, 0, 0, 0],
		stroke: 'white',
		strokeWidth: 5,
		lineCap: 'round',
		lineJoin: 'round'
	};
	this.textOption = {
		fontSize: 30,
		fill: 'white'
	};
	this.groupOption = {

	};

	var stage, layer, current;
	var line, text;

	this.init = function() {
		Canvas.init();
		stage = Canvas.getStage();
		layer = new Kinetic.Layer();
		stage.add(layer);
		current = layer;
	};
	this.initBrush = function(x, y) {
		line = new Kinetic.Line(self.lineOption);
		line.getPoints()[0].x = x;
		line.getPoints()[0].y = y;
		line.getPoints()[1].x = x;
		line.getPoints()[1].y = y;
		current.add(line);
	};
	this.drawBrush = function(x, y, isSeed) {
		if (!isSeed) {
			line.getPoints()[1].x = x;
			line.getPoints()[1].y = y;
			layer.batchDraw();
		}
		self.initBrush(x, y);
	};

	this.drawText = function(txt, x, y) {
		var op = self.textOption;
		op.x = x;
		op.y = y;
		op.text = txt;
		text = new Kinetic.Text(op);
		layer.add(text);
		layer.batchDraw();
	};

	this.setCurrent = function(id) {
		if (id) {
			current = layer.get('#' + id)[0];
		} else {
			var child = layer.get('#');
			var n = child.length;
			current = child[n - 1];
		}
	};
	this.newGroup = function(id) {
		self.groupOption.id = id ? id : '';
		group = new Kinetic.Group(self.groupOption);
		layer.add(group);
	};
	this.canDrag = function(canDrag) {
		var objs = current.getChildren();
		angular.forEach(objs, function(obj, key) {
			obj.setDraggable(canDrag);
		});
	};
	this.canGroupDrag = function(canDrag) {
		var groups = layer.get('Group');
		angular.forEach(groups, function(group, key) {
			group.setDraggable(canDrag);
		});
	};
	this.clear = function() {
		layer.remove();
		layer = new Kinetic.Layer();
		stage.add(layer);
	};

});