app.directive('menuLeft', function() {
	return {
		restrict: 'E',
		templateUrl: 'main/template/menu_left.tpl.html',
		controller: 'MenuLeftCtrl'
	};
});

app.directive('scrollBar', function() {
	return {
		restrict: 'AC',
		link: function(scope, iElement, iAttrs) {
			iElement.perfectScrollbar({
				
			});

			
			
		}
	};
});

app.directive('isVisible', ["$rootScope",
	function($rootScope) {
		return {
			restrict: 'AC',
			scope: {
				isVisible: '='
			},
			link: function(scope, iElement, iAttrs) {
				var display = iElement.css('display');
				scope.isVisible = display != 'none';
				$rootScope.$on('resize', function() {
					var display = iElement.css('display');
					scope.isVisible = display != 'none';
				});
			}
		};
	}
]);

app.directive('fitSize', function() {
	return {
		restrict: 'AC',
		link: function(scope, iElement, iAttrs) {
			$(iElement).width(iElement.parent().width());
			$(iElement).height(iElement.parent().height());
		}
	};
});

app.directive('reSize', ["$rootScope", "$window", "Canvas",
	function($rootScope, $window, Canvas) {
		return {
			restrict: 'AC',
			link: function(scope, iElement, iAttrs) {
				var mainSize = iElement.height();
				var init = {
					width: $window.innerWidth,
					height: $window.innerHeight
				};
				$rootScope.windowSize = {
					width: $window.innerWidth,
					height: $window.innerHeight
				};
				angular.element($window).bind('resize', function() {
					$rootScope.windowSize = {
						width: $window.innerWidth,
						height: $window.innerHeight
					};
					$rootScope.$apply('windowHeight');
				});
				$rootScope.$watch('windowSize', function(oldV, newV) {
					if (oldV != newV) {
						if ($rootScope.windowSize.width > init.width ||
							$rootScope.windowSize.height > init.height) {
							init = {
								width: $window.innerWidth,
								height: $window.innerHeight
							};
							mainSize = iElement.height();

							iElement.removeClass("position-absolute width-100");
							iElement.height('auto');

							Canvas.setSize($('.pad').width(), $('.pad').height());
							$rootScope.$broadcast('resize');
						} else {
							iElement.addClass("position-absolute width-100");
							iElement.height(mainSize);
						}
					}
				});
			}
		};
	}
]);