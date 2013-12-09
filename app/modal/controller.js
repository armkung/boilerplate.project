app.controller('SaveCtrl', ["$scope", "$modalInstance", "Room",
	function($scope, $modalInstance, Room) {
		$scope.input = {
			name: Room.room
		};
		$scope.ok = function() {
			$modalInstance.close($scope.input.name);
		};
		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};

	}
]);

app.controller('DisplayCtrl', ["$scope", "$modalInstance", "$http", "$rootScope",
	function($scope, $modalInstance, $http, $rootScope) {
		$scope.url = "assets/display/";
		$http.get($scope.url + 'index.json').then(function(data) {
			$scope.items = data.data.index;

			$scope.select = function(index) {
				$scope.selected = index;
				$scope.item = $scope.items[index];
			};
			$scope.ok = function() {
				$rootScope.displaySelected = $scope.selected;
				$modalInstance.close($scope.url + $scope.item);
			};
			$scope.close = function() {
				$modalInstance.dismiss('cancel');
			};

			if (angular.isUndefined($rootScope.displaySelected)) {
				$scope.select(0);
			}else{
				$scope.select($rootScope.displaySelected);
			}
		});
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