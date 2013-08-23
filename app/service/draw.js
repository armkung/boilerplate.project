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
	var stage = Canvas.getStage();
	var layer = new Kinetic.Layer();
	stage.add(layer);
	var current = layer;

	var line, text;

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
	}

});
app.service("DrawFactory", function(Canvas, DrawManager, $timeout) {
	var self = this;
	this.tools = {
		DRAG_GROUP: "Group Drag",
		DRAG_OBJECT: "Drag",
		CLEAR: "Clear",
		TEXT: "Text",
		DRAW: "Draw",
		ANIMATE: "Animate"
	};
	this.attrs = {
		COLOR_LINE: "Line Color",
		COLOR_TEXT: "Text Color"
	};
	var event = {};
	this.setDraw = function(draw) {
		var isSeed = true,
			isDraw = false;
		event.draw = {
			onDown: function() {
				isDraw = true;
				isSeed = true;
			},
			onMove: function(pos) {
				if (isDraw) {
					var obj = {
						x: pos.x,
						y: pos.y
					};
					if (isSeed) {
						obj.isSeed = isSeed;
					}
					isSeed = false;
					draw(obj);
				}
			},
			onUp: function() {
				isDraw = false;
				isSeed = true;
			}
		};
	}
	this.setAnimate = function(data, draw) {
		var delay = 10;
		var isDraw = false;
		event.animate = {
			call: function() {
				if (!isDraw) {
					isDraw = true;
					var i = 0;
					(function animate() {
						if (i < data.length) {
							var pos = data[i];
							draw(pos);
							$timeout(animate, delay);
							i++;
						} else {
							isDraw = false;
						}
					})();

				}
			}
		};
	};
	this.setText = function(text) {
		event.text = {
			onDown: function(data) {
				text(data);
			}
		};
	};
	this.setDragObject = function(drag) {
		event.dragObject = {
			call: function() {
				drag();
			}
		};
	};
	this.setDragGroup = function(drag) {
		event.dragGroup = {
			call: function() {
				drag();
			}
		};
	};

	this.setTool = function(tool) {
		switch (tool) {
			case self.tools.DRAW:
				DrawManager.canGroupDrag(false);
				self.setBind(event.draw);
				break;
			case self.tools.TEXT:
				DrawManager.canDrag(false);
				self.setBind(event.text);
				break;
			case self.tools.ANIMATE:
				if (event.animate && event.animate.call) {
					event.animate.call();
				}
				self.setBind(event.animate);
				break;
			case self.tools.DRAG_GROUP:
				if (event.dragGroup && event.dragGroup.call) {
					event.dragGroup.call();
				}
				DrawManager.canGroupDrag(true);
				self.setBind(event.dragGroup);
				break;
			case self.tools.DRAG_OBJECT:
				if (event.dragObject && event.dragObject.call) {
					event.dragObject.call();
				}
				DrawManager.canDrag(true);
				self.setBind(event.dragObject);
				break;
			case self.tools.CLEAR:
				DrawManager.clear();
				break;
		}
	};
	this.setAttr = function(attr, callback) {
		switch (attr) {
			case self.attrs.COLOR_LINE:
				DrawManager.lineOption.stroke = callback.color;
				break;
			case self.attrs.COLOR_TEXT:
				DrawManager.textOption.fill = callback.color;
				break;
		}
	};
	this.setBind = function(callback) {
		var cs = Canvas.canvas;
		cs.unbind();
		if (callback) {
			if (callback.onDown) {
				cs.bind("mousedown touchstart", function() {
					callback.onDown(Canvas.getPosition());
				});
			}
			if (callback.onMove) {
				cs.bind("mousemove touchmove", function() {
					callback.onMove(Canvas.getPosition());
				});
			}
			if (callback.onUp) {
				cs.bind("mouseup touchend touchcancel", function() {
					callback.onUp(Canvas.getPosition());
				});
			}
		}
	};
})