app.directive('slide', function($rootScope, DrawManager, SlideManager, DataManager) {
	return {
		restrict: 'E',
		template: '<iframe id="slide" ng-src="{{url}}"></iframe>',
		scope: {

		},
		link: function(scope, iElement) {
			var id = 'mirror';
			var type = 'slide';
			SlideManager.init();
			scope.slide = SlideManager;

			scope.$watch('slide.index', function() {
				DataManager.setData(type, {
					url: SlideManager.url,
					index: SlideManager.index
				});
				changeSlide();
			});

			DataManager.getData(type, function(data) {
				SlideManager.url = data.url;
				SlideManager.index = data.index;
				changeSlide();
			});

			function changeSlide() {
				var name = id + "-" + SlideManager.getIndex();
				DrawManager.init(name);

				scope.url = SlideManager.url + SlideManager.index;

			}

		}
	};
});