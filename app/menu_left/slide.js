app.directive('slide', function(DrawManager, SlideManager, DataManager) {
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
				changeSlide(SlideManager.url, SlideManager.index);
			});

			DataManager.getData(type, function(data) {
				SlideManager.url = data.url;
				SlideManager.index = data.index;
				changeSlide(data.url, data.index);
			});

			function changeSlide(url, index) {
				DrawManager.init(id + '-' + index);
				scope.url = url + index;

			}

		}
	};
});