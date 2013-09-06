app.directive('slide', function(DrawManager, SlideManager) {
	return {
		restrict: 'E',
		template: '<iframe id="slide" ng-src="{{url}}"></iframe>',
		scope: {

		},
		link: function(scope, iElement) {
			var id = 'mirror';
			SlideManager.init();
			scope.slide = SlideManager;

			scope.$watch('slide.index', function() {
				DrawManager.init(id + '-' + SlideManager.index);
				scope.url = SlideManager.url + SlideManager.index;
			});

		}
	};
});