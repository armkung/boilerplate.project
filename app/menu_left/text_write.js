app.directive("textWriter", function($rootScope, Input, DrawManager, DrawFactory, Room, DataManager) {
	return {
		restrict: 'A',
		scope: {
			text: '@',
			tool: '@'
		},
		link: function($scope, $attrs, $element) {
			var type = "text";
			var txt = Input.init();
			var pos;
			DrawManager.init($element.id);

			function draw(data, canDrag) {
				DrawManager.newGroup();
				DrawManager.setCurrent();
				DrawManager.drawText(data.text, data.x, data.y);
				if (canDrag) {
					DrawManager.canDrag(canDrag);
				}
			}

			DataManager.getData(type, function(data) {
				draw(data, $scope.tool == DrawFactory.tools.DRAG);
			});

			Input.hide();
			// $scope.input.isShow = false;
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
				// $scope.input.isShow = true;
				Input.show(pos.x, pos.y);
				$rootScope.$apply();
			});
			DrawFactory.setDragObject(function() {
				$scope.input.isShow = false;
			});

			$scope.$watch('tool', function() {
				DrawFactory.setTool($scope.tool);
			});
			$rootScope.$on('attr', function(e, attr) {
				var callback = {};
				callback.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
				callback.size = Math.floor(Math.random() * 10) + 4;
				DrawFactory.setAttr(attr, callback);
			});
		}
	};
});