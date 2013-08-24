app.directive("textWriter", function($rootScope, Input, DrawManager, DrawFactory, Room, DataManager) {
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
			DrawManager.init();
			function draw(data, canDrag) {
				DrawManager.drawText(data.text, data.x, data.y);
				if (canDrag) {
					DrawManager.canDrag(canDrag);
				}
			}

			DataManager.getData(type, function(data) {
				draw(data, $scope.tool == DrawFactory.tools.DRAG);
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

			DrawFactory.setText(function(data) {
				pos = data;
				Input.show(pos.x, pos.y);
			});
			DrawFactory.setDragObject(function() {
				Input.hide();
			});

			$scope.$watch('tool', function(tool) {
				DrawFactory.setTool(tool);
			});
			$rootScope.$on('attr', function(e, attr) {
				var callback = {};
				callback.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
				DrawFactory.setAttr(attr, callback);
			});
		}
	};
});