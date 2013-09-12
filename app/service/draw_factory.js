app.service("DrawFactory", function(Canvas, DrawManager, $timeout) {
	var self = this;
	this.tools = {
		DRAG_GROUP: "Group Drag",
		DRAG_OBJECT: "Drag",
		CLEAR: "Clear",
		TEXT: "Text",
		DRAW: "Draw",
		LINE: "Line",
		ANIMATE: "Animate"
	};
	this.attrs = {
		COLOR_STROKE: "Line Color",
		COLOR_FILL: "Text Color",
		SIZE_STROKE: "Line Size",
		SIZE_FONT: "Text Size"
	};
	var listener = {};

	this.setAnimate = function(data, draw) {
		var delay = 10;
		var isDraw = false;
		listener.animate = {
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
		listener.text = {
			onDown: function(pos) {
				text(pos);
			}
		};
	};
	this.setDraw = function(draw) {
		var isSeed = true,
			isDraw = false,
			isUp = false;
		listener.draw = {
			onDown: function() {
				isDraw = true;
				isUp = false;
				isSeed = true;
			},
			onMove: function(pos) {
				if (isDraw || isUp) {
					var obj = {
						x: pos.x,
						y: pos.y
					};
					if (isSeed && !isUp) {
						obj.isSeed = isSeed;
					}
					if (isUp) {
						obj.isUp = isUp;
					}
					if (!isUp) {
						draw(obj);
					}
					isSeed = false;
					isUp = false;
				}
			},
			onUp: function() {
				isDraw = false;
				isSeed = true;
				isUp = true;
			}
		};
	};
	this.setLine = function(line) {
		var isSeed = true,
			isDraw = false,
			isUp = false;
		listener.line = {
			onDown: function() {
				isSeed = true;
				isDraw = true;
				isUp = false;
			},
			onMove: function(pos) {
				if (isDraw || isUp) {
					var obj = {
						x: pos.x,
						y: pos.y
					};
					if (isSeed && !isUp) {
						obj.isSeed = isSeed;
					}
					if (isUp) {
						obj.isUp = isUp;
					}
					line(obj);

					isSeed = false;
					isUp = false;
				}
			},
			onUp: function() {
				isDraw = false;
				isSeed = true;
				isUp = true;
			}
		};
	};
	this.setDragObject = function(drag) {
		listener.dragObject = {
			onDragEnd: function(data) {				
				drag(data);
			}
		};
	};
	// this.setDragGroup = function(drag) {
	// 	listener.dragGroup = {
	// 		onDragEnd: function(data) {				
	// 			drag(data);
	// 		}
	// 	};
	// };

	this.setTool = function(tool) {
		unsetBind();
		switch (tool) {
			case self.tools.DRAW:
				DrawManager.canDrag(false);
				DrawManager.canGroupDrag(false);
				setBind(listener.draw);
				break;
			case self.tools.LINE:
				DrawManager.canDrag(false);
				DrawManager.canGroupDrag(false);
				setBind(listener.line);
				break;
			case self.tools.TEXT:
				DrawManager.canDrag(false);
				DrawManager.canGroupDrag(false);
				setBind(listener.text);
				break;
			case self.tools.ANIMATE:
				if (listener.animate && listener.animate.call) {
					listener.animate.call();
				}
				setBind(listener.animate);
				break;
			case self.tools.DRAG_GROUP:
				DrawManager.canDrag(false);
				DrawManager.canGroupDrag(true);
				// var current = DrawManager.getCurrentGroup();
				// angular.forEach(current, function(group, key) {
				// 	setBind(listener.dragGroup, group);
				// });
				break;
			case self.tools.DRAG_OBJECT:
				DrawManager.canGroupDrag(false);
				DrawManager.canDrag(true);
				var current = DrawManager.getCurrentGroup();
				angular.forEach(current, function(obj, key) {
					setBind(listener.dragObject, obj);
				});
				break;
			case self.tools.CLEAR:
				DrawManager.clear();
				break;
		}
	};
	this.setAttr = function(attr, callback) {
		switch (attr) {
			case self.attrs.COLOR_STROKE:
				DrawManager.setStrokeColor(callback.strokeColor);
				break;
			case self.attrs.COLOR_FILL:
				DrawManager.setFillColor(callback.fillColor);
				break;
			case self.attrs.SIZE_STROKE:
				DrawManager.setStrokeSize(callback.strokeSize);
				break;
			case self.attrs.SIZE_FONT:
				DrawManager.setFontSize(callback.fontSize);
				break;
		}
	};
	function unsetBind(){
		var cs = Canvas.canvas;
		cs.unbind();
	}
	function setBind(callback, element) {
		if (callback) {
			var cs = Canvas.canvas;
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
			if (callback.onDragStart) {
				if (element) {
					var ele = element;
					ele.on("dragstart", function() {
						callback.onDragStart(this);
					});
				}
			}
			if (callback.onDragEnd) {
				if (element) {
					var ele = element;
					ele.off("dragend");
					ele.on("dragend", function() {
						callback.onDragEnd(this);
					});
				}
			}
		}
	}
});