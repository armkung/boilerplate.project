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
		COLOR_STROKE: "Color",
		SIZE: "Size"
	};
	var event = {};
	this.action = event;
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
	};
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
			case self.attrs.COLOR_STROKE:
				DrawManager.setStrokeColor(callback.color);
				break;
			case self.attrs.SIZE:
				DrawManager.setSize(callback.size);
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
});