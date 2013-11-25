app.directive('slidePad', function($q, $sce, $state, cfpLoadingBar, DrawManager, SlideManager, DataManager) {
	return {
		restrict: 'E',
		template: '<iframe id="slide" ng-src="{{url}}"></iframe>',
		scope: {
			send: '='
		},
		link: function(scope, iElement, iAttr) {
			var id = "mirror";
			var type = DataManager.types.SLIDE;
			cfpLoadingBar.start();


			scope.slide = SlideManager;
			// var deferred;
			// if (angular.isUndefined(SlideManager.slide) && angular.isUndefined(SlideManager.max)) {
			// 	deferred = $q.defer();
			// 	SlideManager.setMax(deferred);
			// }
			DataManager.getData(type, function(data) {
				if (data) {
					SlideManager.setSlide(data.slide, data.index);
					changeSlide();
					if (data.max) {
						SlideManager.max = data.max;
					}

				} else {
					if (angular.isUndefined(SlideManager.slide)) {
						$state.go('main.drive');
					}
				}
			});
			DataManager.initData(type);

			SlideManager.getMax().then(function(max) {
				SlideManager.max = max;
				DataManager.setData(type, {
					slide: SlideManager.slide,
					index: SlideManager.index,
					max: SlideManager.max
				});
			});

			iElement.find('iframe').bind('load', function() {
				cfpLoadingBar.complete();
			});

			scope.$watch('slide.index', function(newV, oldV) {
				if (angular.isDefined(SlideManager.slide) && angular.isDefined(SlideManager.index)) {
					if (scope.send) {
						DataManager.setData(type, {
							slide: SlideManager.slide,
							index: SlideManager.index
						});
					}
					DataManager.initData(DataManager.types.POS);

					var name = id + "-";
					if (oldV) {
						DrawManager.saveData(name + oldV);
					}
					if (newV) {
						DrawManager.newObject(name + newV);
					}

					changeSlide();
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