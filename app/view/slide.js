app.directive('slide', function($compile, $http,DrawManager) {
	return {
		restrict: 'E',
<<<<<<< Updated upstream
		template: '<iframe id="slide" ng-src="{{url}}"></iframe>',
=======
		template: '<div ng-bind-html-unsafe="slide"></div>',
>>>>>>> Stashed changes
		scope: {
			url: '@'
		},
		link: function(scope, iElement, DataManager, SlideManager) {
			scope.$watch('url', function() {
				if (scope.url) {
<<<<<<< Updated upstream
					console.log($('#slide'));
				}
			});
			$('#slide').load(function() {
				scope.slide = this;
				console.log($('#slide').contents());
				scope.$apply();
			})

=======
					scope.slide  = '<iframe id="slide" src="'+scope.url+'"></iframe>';
				}
			});
			$('#slide').load(function() {
				// scope.slide = this;
				console.log($('#slide').contents());
				scope.$apply();
			})
			scope.load = function(){
				alert("aaa")
			}
>>>>>>> Stashed changes
			// $scope.$apply();
			// console.log($("iframe"));
			// var type = DataManager.types.POS;
			// DataManager.getData(type, function(data) {
			// 	$scope.current = data;
			// })


		}
	};
});