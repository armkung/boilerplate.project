app.directive('slide', function($sce, $state, DrawManager, SlideManager, DataManager) {
	return {
		restrict: 'E',
		template: '<iframe id="slide" ng-src="{{url}}"></iframe>',
		scope: {

		},
		link: function(scope, iElement, iAttr) {
			var id = iAttr.id;
			var type = DataManager.types.SLIDE;
			scope.slide = SlideManager;

			DataManager.getData(type, function(data) {
				if (data) {
					SlideManager.setSlide(data.slide, data.index);
					changeSlide();
				} else {
					if (angular.isUndefined(SlideManager.slide) &&
						angular.isUndefined(SlideManager.index)) {
						$state.go('main.drive');
					}
				}
			});
			DataManager.initData(type);

			scope.$watch('slide.index', function(newV, oldV) {
				if (!angular.isUndefined(SlideManager.slide) &&
					!angular.isUndefined(SlideManager.index)) {
					var name = id + "-";
					DataManager.setData(type, {
						slide: SlideManager.slide,
						index: SlideManager.index
					});
					DataManager.initData(DataManager.types.POS);
					
					if(oldV){
						DrawManager.saveData(name + oldV);
					}
					DrawManager.newObject(name + newV);

					changeSlide();
					$state.go('main.slide');
				}
			});

			function changeSlide() {
				var url = SlideManager.getUrl();
				if (url) {
					scope.url = $sce.trustAsResourceUrl(url);
				}
			}

		}
	};
});