app.directive('slide', function($sce, $state, DrawManager, SlideManager, DataManager) {
	return {
		restrict: 'E',
		template: '<iframe id="slide" ng-src="{{url}}"></iframe>',
		scope: {

		},
		link: function(scope, iElement) {
			var id = 'mirror';
			var type = DataManager.types.SLIDE;
			SlideManager.init(function(){
				$state.go('main.drive');
			});
			DataManager.initData(type);
			scope.slide = SlideManager;

			scope.$watch('slide.index', function(newV, oldV) {
				DataManager.setData(type, {
					url: SlideManager.url,
					index: SlideManager.index
				});
				var name = id + "-";
				DrawManager.saveData(name + oldV);
				DrawManager.newObject(name + newV);
				changeSlide();
			});

			DataManager.getData(type, function(data) {
				SlideManager.url = data.url;
				SlideManager.index = data.index;
				changeSlide();
			});

			function changeSlide() {
				var url = SlideManager.url + SlideManager.index;
				scope.url = $sce.trustAsResourceUrl(url);
			}

		}
	};
});