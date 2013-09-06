app.directive('slide', function(DrawManager, SlideManager) {
	return {
		restrict: 'E',
		template: '<iframe id="slide" ng-src="{{url}}"></iframe>',
		scope: {

		},
		link: function(scope, iElement) {
			DrawManager.init('mirror');
			SlideManager.init();
			scope.slide = SlideManager;
			scope.$watch('slide.url', function() {
				console.log(SlideManager.url)
				scope.url = SlideManager.url + SlideManager.index;
			});
			scope.$watch('slide.index', function() {
				scope.url = SlideManager.url + SlideManager.index;
				console.log(scope.url)
			});
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