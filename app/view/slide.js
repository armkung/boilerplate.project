app.directive('slide', function($compile, $http,DrawManager) {
	return {
		restrict: 'E',
		template: '<iframe id="slide" ng-src="{{url}}"></iframe>',
		scope: {
			url: '@'
		},
		link: function(scope, iElement, DataManager, SlideManager) {
			// scope.$watch('url', function() {
			// 	if (scope.url) {
			// 		console.log($('#slide'));
			// 	}
			// });
			// $('#slide').load(function() {
			// 	scope.slide = this;
			// 	console.log($('#slide').contents());
			// 	scope.$apply();
			// })

			// $scope.$apply();
			// console.log($("iframe"));
			// var type = DataManager.types.POS;
			// DataManager.getData(type, function(data) {
			// 	$scope.current = data;
			// })


		}
	};
});