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
	// var canvas = Canvas.getCanvas();
	// Canvas.getCanvas().then(function(cs) {
	// 	canvas = cs;
	// });

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
		listener.draw = {
			onFinish: function(e) {
				draw(e.path);
			}
		};
	};
	this.setLine = function(line) {
		var isSeed = true,
			isDraw = false;
		listener.line = {
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
						obj.isSeed = true;
						isSeed = false;
					}
					line(obj);
				}
			},
			onUp: function(pos) {
				isDraw = false;
				var obj = {
					x: pos.x,
					y: pos.y
				};
				obj.isUp = true;
				line(obj);
			}
		};
	};
	this.setDragObject = function(drag) {
		var isMove = false,
			isScale = false,
			isRotate = false;
		var x1, y1, x2, y2;
		listener.dragObject = {
			onDown: function(pos, e) {
				var obj = e.target;
				if (obj) {
					x1 = obj.get("left");
					y1 = obj.get("top");
				}
			},
			onUp: function(pos, e) {
				var obj = e.target;
				if (obj) {
					var data = {};
					x2 = obj.get("left");
					y2 = obj.get("top");					
					if (isMove) {
						data.pos = {
							x: x2 - x1,
							y: y2 - y1
						};
					}
					if (isScale) {
						data.scale = {
							x: obj.get("scaleX"),
							y: obj.get("scaleY")
						};
						data.flip = {
							x: obj.get("flipX"),
							y: obj.get("flipY")
						};
					}
					if (isRotate) {
						data.angle = obj.get("angle");
					}

					drag(obj, data);
					x1 = x2;
					y1 = y2;
				}
				isMove = false;
				isScale = false;
				isRotate = false;
			},
			onMove: function(e) {
				isMove = true;
				// var obj = e.target;
				// if (obj) {
				// 	var data = {};
				// 	x2 = obj.get("left");
				// 	y2 = obj.get("top");
				// 	data.pos = {
				// 		x: x2 - x1,
				// 		y: y2 - y1
				// 	};
				// 	drag(obj, data);
				// 	x1 = x2;
				// 	y1 = y2;
				// }
			},
			onScale: function(e) {
				isScale = true;
				// var obj = e.target;
				// var data = {};
				// x2 = obj.get("left");
				// y2 = obj.get("top");
				// data.pos = {
				// 	x: x2 - x1,
				// 	y: y2 - y1
				// };
				// data.scale = {
				// 	x: obj.get("scaleX"),
				// 	y: obj.get("scaleY")
				// };
				// data.flip = {
				// 	x: obj.get("flipX"),
				// 	y: obj.get("flipY")
				// };
				// drag(obj, data);
				// x1 = x2;
				// y1 = y2;
			},
			onRotate: function(e) {
				isRotate = true;
				// var obj = e.target;
				// var data = {};
				// data.angle = obj.get("angle");
				// drag(obj, data);
			}

		};
	};

	this.setTool = function(tool) {
		unsetBind();
		switch (tool) {
			case self.tools.DRAW:
				// DrawManager.canDrag(false);
				// DrawManager.canGroupDrag(false);
				DrawManager.setDraw();
				setBind(listener.draw);
				break;
			case self.tools.LINE:
				// DrawManager.canDrag(false);
				// DrawManager.canGroupDrag(false);
				setBind(listener.line);
				break;
			case self.tools.TEXT:
				// DrawManager.canDrag(false);
				// DrawManager.canGroupDrag(false);
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
				break;
			case self.tools.DRAG_OBJECT:
				DrawManager.canGroupDrag(false);
				DrawManager.canDrag(true);

				setBind(listener.dragObject);
				// });
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

	function unsetBind() {
		DrawManager.removeDraw();
		Canvas.getCanvas().then(function(canvas) {
			canvas.off("mouse:down");
			canvas.off("mouse:move");
			canvas.off("mouse:up");
			canvas.off("path:created");
			canvas.off("object:moving");
			canvas.off("object:scaling");
			canvas.off("object:rotating");
			canvas.off("object:over");
			canvas.off("object:selected");
			canvas.off("selection:cleared");
		});
	}

	function setBind(callback, element) {
		if (callback) {
			Canvas.getCanvas().then(function(canvas) {

				var cs = canvas;
				if (callback.onDown) {
					cs.on("mouse:down", function(e) {
						callback.onDown(cs.getPointer(), e);
					});
				}
				if (callback.onMove) {
					cs.on("mouse:move", function(e) {
						callback.onMove(cs.getPointer(), e);
					});
				}
				if (callback.onUp) {
					cs.on("mouse:up", function(e) {
						callback.onUp(cs.getPointer(), e);
					});
				}
				if (callback.onFinish) {
					cs.on("path:created", function(e) {
						callback.onFinish(e);
					});
				}
				if (callback.onMove) {
					cs.on("object:moving", function(e) {
						callback.onMove(e);
					});
				}
				if (callback.onScale) {
					cs.on("object:scaling", function(e) {
						callback.onScale(e);
					});
				}
				if (callback.onRotate) {
					cs.on("object:rotating", function(e) {
						callback.onRotate(e);
					});
				}
				if (callback.onOver) {
					cs.on("object:over", function(e) {
						callback.onOver(e);
					});
				}
				if (callback.onSelect) {
					cs.on("object:selected", function(e) {
						callback.onSelect(e);
					});
				}
				if (callback.onUnSelect) {
					cs.on("selection:cleared", function(e) {
						callback.onUnSelect(e);
					});
				}
			});

		}
	}
});