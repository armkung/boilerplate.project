app.directive("textWriter", function($rootScope, Input, DrawManager, Room, DataManager) {
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


			var callback = {};
			callback.text = {
				onDown: function(data) {
					pos = data;
					Input.show(pos.x, pos.y);
				}
			};
			callback.dragObject = {
				call: function() {
					Input.hide();
				}
			};

			$scope.$watch('tool', function(tool) {
				DrawManager.setTool(tool, callback);
			});
			$rootScope.$on('attr', function(e, attr) {
				var callback = {};
				callback.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
				DrawManager.setAttr(attr, callback);
			});
		}
	};
});

app.controller('TextWriteCtrl', function($scope, $rootScope, DrawManager) {
	$scope.tools = [];
	$scope.attrs = [];
	$scope.tool = DrawManager.tools.TEXT;
	angular.forEach(DrawManager.tools, function(value, key) {
		$scope.tools.push(value);
	});
	angular.forEach(DrawManager.attrs, function(value, key) {
		$scope.attrs.push(value);
	});
	$scope.changeTool = function(index) {
		$scope.tool = $scope.tools[index];
	};
	$scope.changeAttr = function(index) {
		$rootScope.$broadcast('attr', $scope.attrs[index]);
	};
});