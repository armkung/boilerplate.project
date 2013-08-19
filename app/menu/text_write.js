app.service("TextWriter", function($rootScope, Canvas, Input, DrawManager, Room) {
	var self = this;
	var cs = Canvas.canvas,
		txt = Input.input;

	var tools = {
		DRAG: 0,
		CLEAR: 1,
		TEXT: 2
	};
	var current, pos;

	this.Tools = tools;
	txt.bind('keydown', function(e) {
		if (e.keyCode == 13) {
			// DrawManager.setCurrent();
			DrawManager.drawText(Input.text, pos.x, pos.y);
			Input.hide();
			var obj = {
				text: Input.text,
				x: pos.x,
				y: pos.y
			};
			$rootScope.$emit('send_data', obj);
		}
	});

	this.draw = function(data) {
		DrawManager.drawText(data.text, data.x, data.y);
		if (current == tools.DRAG) {
			DrawManager.canDrag(true);
		}
	};
	this.setTool = function(tool) {
		current = tool;
		var onDown;
		switch (tool) {
			case tools.TEXT:
				onDown = function() {
					pos = Canvas.getPosition();
					Input.show(pos.x, pos.y);
				};
				DrawManager.canDrag(false);
				break;
			case tools.DRAG:
				onDown = function() {
					Input.hide();
				};
				DrawManager.canDrag(true);
				break;
			case tools.CLEAR:
				Canvas.clear();
				break;
		}
		cs.unbind();
		cs.bind("mousedown touchstart", onDown);
	};
});

app.controller('TextWriteCtrl', function($rootScope, $scope, $timeout, DataManager, Input, TextWriter) {
	$scope.tool = TextWriter.Tools.TEXT;
	var type = "text";
	DataManager.getData(type, function(data) {
		TextWriter.draw(data);
	});

	$scope.drag = function() {
		$scope.tool = $scope.tool == TextWriter.Tools.TEXT ? TextWriter.Tools.DRAG : TextWriter.Tools.TEXT;
	};
	$scope.animate = function() {

	};

	$scope.clear = function() {
		$scope.tool = TextWriter.Tools.CLEAR;
	};

	$scope.$watch('text', function() {
		Input.text = $scope.text;
	});
	$scope.$watch('tool', function() {
		TextWriter.setTool($scope.tool);
	});
	$rootScope.$on('send_data', function(e, data) {
		DataManager.setData(type, data);
	});
});