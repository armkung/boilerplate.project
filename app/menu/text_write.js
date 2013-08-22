app.directive("textWriter", function(Input, DrawManager, Room, DataManager) {
	return {
		restrict: 'A',
		scope: {
			text: '@',
			tool: '@'
		},
		controller: function($scope, $attrs) {
			var type = "text";
			var txt = Input.input;
			var pos;

			function draw(data, canDrag) {
				DrawManager.drawText(data.text, data.x, data.y);
				if (canDrag) {
					DrawManager.canDrag(canDrag);
				}
			}

			DataManager.getData(type, function(data) {
				draw(data, $scope.tool == DrawManager.tools.DRAG);
			});

			txt.bind('keydown', function(e) {
				if (e.keyCode == 13) {
					var obj = {
						text: $scope.text,
						x: pos.x,
						y: pos.y
					};
					draw(obj);
					DataManager.setData(type, obj);
					Input.hide();
				}
			});

			$scope.$watch('tool', function() {
				var callback = {};
				switch ($scope.tool) {
					case DrawManager.tools.TEXT:
						callback.onDown = function(data) {
							pos = data;
							Input.show(pos.x, pos.y);
						};
						DrawManager.canDrag(false);
						DrawManager.setBind(callback);
						break;
					case DrawManager.tools.DRAG:
						callback.onDown = function() {
							Input.hide();
						};
						DrawManager.canDrag(true);
						DrawManager.setBind(callback);
						break;
					default:
						DrawManager.setEvent($scope.tool);
				}
			});

		}
	};
});

app.controller('TextWriteCtrl', function($scope, $timeout, DrawManager) {
	$scope.tool = DrawManager.tools.TEXT;

	$scope.drag = function() {
		$scope.tool = $scope.tool == DrawManager.tools.TEXT ? DrawManager.tools.DRAG : DrawManager.tools.TEXT;
	};
	$scope.animate = function() {

	};

	$scope.clear = function() {
		$scope.tool = DrawManager.tools.CLEAR;
	};
});