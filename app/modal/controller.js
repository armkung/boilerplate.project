app.controller('DisplayCtrl', ["$scope", "$modalInstance",
	function($scope, $modalInstance) {
		$scope.url = "assets/emoticon/";
		$scope.items = ["1.gif", "2.gif", "3.gif"];
		$scope.selected = $scope.items[0];
		$scope.select = function(index) {
			$scope.selected = $scope.items[index];
			console.log($scope.selected);
		};
		$scope.ok = function() {
			$modalInstance.close($scope.url + $scope.selected);
		};
		$scope.close = function() {
			$modalInstance.dismiss('cancel');
		};
	}
]);

app.controller('AttrCtrl', ["$scope", "$rootScope", "$modalInstance", "selector", "DrawFactory",
	function($scope, $rootScope, $modalInstance, selector, DrawFactory) {
		function changeAlpha(opacity) {
			var hex = selector.color.replace('#', '');
			r = parseInt(hex.substring(0, 2), 16);
			g = parseInt(hex.substring(2, 4), 16);
			b = parseInt(hex.substring(4, 6), 16);

			result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
			return result;
		}
		$scope.selector = selector;

		var attrs = DrawFactory.attrs;
		$scope.$watch('selector.size', function() {
			$rootScope.$broadcast('attr', {
				attr: attrs.SIZE,
				data: selector.size
			});
		})
		$scope.$watch('selector.alpha', function() {
			$rootScope.$broadcast('attr', {
				attr: attrs.COLOR,
				data: changeAlpha(selector.alpha)
			});
		})
		$scope.$watch('selector.color', function() {
			$rootScope.$broadcast('attr', {
				attr: attrs.COLOR,
				data: changeAlpha(selector.alpha)
			});
		});
		$scope.close = function() {
			$modalInstance.close(selector);
		};
	}
]);

app.controller('DetailCtrl', ["$scope", "$modalInstance", "room", "index",
	function($scope, $modalInstance, room, index) {
		$scope.room = room;
		$scope.ok = function() {
			$modalInstance.close(index);
		};
		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};
	}
]);